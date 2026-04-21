package keeper

import (
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/margin/types"
)

type Keeper struct {
	storeKey   storetypes.StoreKey
	cdc        codec.BinaryCodec
	oracle     types.OracleKeeper
	funding    types.FundingKeeper
	position   types.PositionKeeper
	settlement types.SettlementKeeper
	params     types.Params
}

func NewKeeper(
	cdc codec.BinaryCodec,
	key storetypes.StoreKey,
	oracle types.OracleKeeper,
	funding types.FundingKeeper,
	position types.PositionKeeper,
	settlement types.SettlementKeeper,
) Keeper {
	return Keeper{
		storeKey: key, cdc: cdc,
		oracle: oracle, funding: funding,
		position: position, settlement: settlement,
		params: types.DefaultParams(),
	}
}

// ── Account management ───────────────────────────────────────────────────────

func (k Keeper) GetAccount(ctx sdk.Context, addr string) types.Account {
	store := ctx.KVStore(k.storeKey)
	bz    := store.Get([]byte("account:" + addr))
	if bz == nil {
		return types.Account{
			Address:       addr,
			Collateral:    math.LegacyZeroDec(),
			UnrealizedPnL: math.LegacyZeroDec(),
			FundingPnL:    math.LegacyZeroDec(),
			MarginUsed:    math.LegacyZeroDec(),
		}
	}
	var acc types.Account
	k.cdc.MustUnmarshal(bz, &acc)
	return acc
}

func (k Keeper) SetAccount(ctx sdk.Context, acc types.Account) {
	store  := ctx.KVStore(k.storeKey)
	bz    := k.cdc.MustMarshal(&acc)
	store.Set([]byte("account:"+acc.Address), bz)
}

func (k Keeper) GetParams() types.Params { return k.params }

// ── Deposits / Withdrawals ───────────────────────────────────────────────────

func (k Keeper) Deposit(ctx sdk.Context, addr string, amount math.LegacyDec) error {
	if amount.IsNegative() || amount.IsZero() {
		return types.ErrInvalidAmount
	}
	acc := k.GetAccount(ctx, addr)
	acc.Collateral = acc.Collateral.Add(amount)
	k.SetAccount(ctx, acc)
	return nil
}

func (k Keeper) Withdraw(ctx sdk.Context, addr string, amount math.LegacyDec) error {
	if amount.IsNegative() || amount.IsZero() {
		return types.ErrInvalidAmount
	}
	acc := k.GetAccount(ctx, addr)
	if acc.Collateral.LT(amount) {
		return types.ErrInsufficientCollateral
	}
	acc.Collateral = acc.Collateral.Sub(amount)
	k.SetAccount(ctx, acc)

	ratio, err := k.HealthRatio(ctx, addr)
	if err != nil {
		return err
	}
	if ratio.LT(math.LegacyOneDec()) {
		return types.ErrWithdrawalBreachesMargin
	}
	return nil
}

// ── Risk calculations ────────────────────────────────────────────────────────

func (k Keeper) Equity(ctx sdk.Context, addr string) (math.LegacyDec, error) {
	acc := k.GetAccount(ctx, addr)
	unrealizedPnL, err := k.computeUnrealizedPnL(ctx, addr)
	if err != nil {
		return math.LegacyZeroDec(), err
	}
	fundingPnL, err := k.computeFundingPnL(ctx, addr)
	if err != nil {
		return math.LegacyZeroDec(), err
	}
	return acc.Collateral.Add(unrealizedPnL).Add(fundingPnL), nil
}

func (k Keeper) MaintenanceMarginRequired(ctx sdk.Context, addr string) (math.LegacyDec, error) {
	positions := k.position.GetPositions(ctx, addr)
	total     := math.LegacyZeroDec()
	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return math.LegacyZeroDec(), err
		}
		notional := pos.Size.Abs().Mul(markPrice)
		total     = total.Add(notional.Mul(k.params.MaintenanceMarginRatio))
	}
	return total, nil
}

func (k Keeper) InitialMarginRequired(ctx sdk.Context, addr string) (math.LegacyDec, error) {
	positions := k.position.GetPositions(ctx, addr)
	total     := math.LegacyZeroDec()
	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return math.LegacyZeroDec(), err
		}
		notional := pos.Size.Abs().Mul(markPrice)
		total     = total.Add(notional.Mul(k.params.InitialMarginRatio))
	}
	return total, nil
}

// HealthRatio = Equity / MaintenanceMarginRequired
func (k Keeper) HealthRatio(ctx sdk.Context, addr string) (math.LegacyDec, error) {
	equity, err := k.Equity(ctx, addr)
	if err != nil {
		return math.LegacyZeroDec(), err
	}
	mmr, err := k.MaintenanceMarginRequired(ctx, addr)
	if err != nil {
		return math.LegacyZeroDec(), err
	}
	if mmr.IsZero() {
		return math.LegacyNewDec(1_000_000), nil
	}
	return equity.Quo(mmr), nil
}

func (k Keeper) IsLiquidatable(ctx sdk.Context, addr string) (bool, error) {
	ratio, err := k.HealthRatio(ctx, addr)
	if err != nil {
		return false, err
	}
	return ratio.LT(math.LegacyOneDec()), nil
}

// ── EndBlock scanner ─────────────────────────────────────────────────────────

func (k Keeper) EndBlock(ctx sdk.Context) {
	store  := ctx.KVStore(k.storeKey)
	prefix := []byte("account:")
	iter   := store.Iterator(prefix, append(prefix, 0xff))
	defer iter.Close()

	for ; iter.Valid(); iter.Next() {
		var acc types.Account
		k.cdc.MustUnmarshal(iter.Value(), &acc)

		liquidatable, err := k.IsLiquidatable(ctx, acc.Address)
		if err != nil {
			ctx.Logger().Error("margin EndBlock: IsLiquidatable error", "addr", acc.Address, "err", err)
			continue
		}
		if liquidatable {
			if err := k.executeLiquidation(ctx, acc.Address); err != nil {
				ctx.Logger().Error("margin EndBlock: liquidation error", "addr", acc.Address, "err", err)
			}
		}
	}
}

// ── Internal helpers ─────────────────────────────────────────────────────────

func (k Keeper) computeUnrealizedPnL(ctx sdk.Context, addr string) (math.LegacyDec, error) {
	positions := k.position.GetPositions(ctx, addr)
	total     := math.LegacyZeroDec()
	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return math.LegacyZeroDec(), err
		}
		// Long: (mark - entry) * size  |  Short: (entry - mark) * |size|
		total = total.Add(markPrice.Sub(pos.AvgEntryPrice).Mul(pos.Size))
	}
	return total, nil
}

func (k Keeper) computeFundingPnL(ctx sdk.Context, addr string) (math.LegacyDec, error) {
	positions := k.position.GetPositions(ctx, addr)
	total     := math.LegacyZeroDec()
	for _, pos := range positions {
		cum, err := k.funding.GetCumulativeFunding(ctx, pos.MarketID, addr)
		if err != nil {
			return math.LegacyZeroDec(), err
		}
		total = total.Sub(cum.Mul(pos.Size))
	}
	return total, nil
}

func (k Keeper) executeLiquidation(ctx sdk.Context, addr string) error {
	positions   := k.position.GetPositions(ctx, addr)
	partialRate := k.params.PartialLiquidationRate
	penalty     := k.params.LiquidationPenaltyMin
	acc         := k.GetAccount(ctx, addr)

	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return err
		}
		notional      := pos.Size.Abs().Mul(markPrice).Mul(partialRate)
		penaltyAmount := notional.Mul(penalty)

		acc.Collateral = acc.Collateral.Sub(penaltyAmount)
		if acc.Collateral.IsNegative() {
			acc.Collateral = math.LegacyZeroDec()
		}
	}
	k.SetAccount(ctx, acc)
	return nil
}