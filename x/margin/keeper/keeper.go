package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	storetypes "cosmossdk.io/store/types"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/margin/types"
)

type Keeper struct {
	storeKey storetypes.StoreKey
	cdc      codec.BinaryCodec

	oracle     types.OracleKeeper
	funding    types.FundingKeeper
	position   types.PositionKeeper
	settlement types.SettlementKeeper

	params types.Params
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
		storeKey:   key,
		cdc:        cdc,
		oracle:     oracle,
		funding:    funding,
		position:   position,
		settlement: settlement,
		params:     types.DefaultParams(),
	}
}

// -------------------------
// Account management
// -------------------------

func (k Keeper) GetAccount(ctx sdk.Context, addr string) types.Account {
	store := ctx.KVStore(k.storeKey)
	key := []byte("account:" + addr)
	bz := store.Get(key)
	if bz == nil {
		return types.Account{
			Address:       addr,
			Collateral:    sdk.ZeroDec(),
			UnrealizedPnL: sdk.ZeroDec(),
			FundingPnL:    sdk.ZeroDec(),
			MarginUsed:    sdk.ZeroDec(),
		}
	}
	var acc types.Account
	k.cdc.MustUnmarshal(bz, &acc)
	return acc
}

func (k Keeper) SetAccount(ctx sdk.Context, acc types.Account) {
	store := ctx.KVStore(k.storeKey)
	key := []byte("account:" + acc.Address)
	bz := k.cdc.MustMarshal(&acc)
	store.Set(key, bz)
}

// Deposit adds collateral to an account.
func (k Keeper) Deposit(ctx sdk.Context, addr string, amount sdk.Dec) error {
	if amount.IsNegative() || amount.IsZero() {
		return types.ErrInvalidAmount
	}
	acc := k.GetAccount(ctx, addr)
	acc.Collateral = acc.Collateral.Add(amount)
	k.SetAccount(ctx, acc)
	return nil
}

// Withdraw removes collateral, checking that remaining margin is sufficient.
func (k Keeper) Withdraw(ctx sdk.Context, addr string, amount sdk.Dec) error {
	if amount.IsNegative() || amount.IsZero() {
		return types.ErrInvalidAmount
	}
	acc := k.GetAccount(ctx, addr)
	if acc.Collateral.LT(amount) {
		return types.ErrInsufficientCollateral
	}
	acc.Collateral = acc.Collateral.Sub(amount)
	k.SetAccount(ctx, acc)

	// Re-check health after withdrawal
	ratio, err := k.HealthRatio(ctx, addr)
	if err != nil {
		return err
	}
	if ratio.LT(sdk.OneDec()) {
		return types.ErrWithdrawalBreachesMargin
	}
	return nil
}

// -------------------------
// Risk calculations
// -------------------------

// Equity = Collateral + UnrealizedPnL + FundingPnL
func (k Keeper) Equity(ctx sdk.Context, addr string) (sdk.Dec, error) {
	acc := k.GetAccount(ctx, addr)

	unrealizedPnL, err := k.computeUnrealizedPnL(ctx, addr)
	if err != nil {
		return sdk.ZeroDec(), err
	}

	fundingPnL, err := k.computeFundingPnL(ctx, addr)
	if err != nil {
		return sdk.ZeroDec(), err
	}

	equity := acc.Collateral.Add(unrealizedPnL).Add(fundingPnL)
	return equity, nil
}

// MaintenanceMarginRequired = sum over positions of |size| * markPrice * MMR
func (k Keeper) MaintenanceMarginRequired(ctx sdk.Context, addr string) (sdk.Dec, error) {
	positions := k.position.GetPositions(ctx, addr)
	mmr := k.params.MaintenanceMarginRatio
	total := sdk.ZeroDec()

	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return sdk.ZeroDec(), err
		}
		notional := pos.Size.Abs().Mul(markPrice)
		total = total.Add(notional.Mul(mmr))
	}
	return total, nil
}

// InitialMarginRequired = sum over positions of |size| * markPrice * IMR
func (k Keeper) InitialMarginRequired(ctx sdk.Context, addr string) (sdk.Dec, error) {
	positions := k.position.GetPositions(ctx, addr)
	imr := k.params.InitialMarginRatio
	total := sdk.ZeroDec()

	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return sdk.ZeroDec(), err
		}
		notional := pos.Size.Abs().Mul(markPrice)
		total = total.Add(notional.Mul(imr))
	}
	return total, nil
}

// HealthRatio = Equity / MaintenanceMarginRequired
// Returns sdk.MaxDec if MMR == 0 (no open positions).
func (k Keeper) HealthRatio(ctx sdk.Context, addr string) (sdk.Dec, error) {
	equity, err := k.Equity(ctx, addr)
	if err != nil {
		return sdk.ZeroDec(), err
	}

	mmr, err := k.MaintenanceMarginRequired(ctx, addr)
	if err != nil {
		return sdk.ZeroDec(), err
	}

	if mmr.IsZero() {
		// No open positions — account is fully healthy
		return sdk.NewDec(1_000_000), nil
	}

	return equity.Quo(mmr), nil
}

// IsLiquidatable returns true when HealthRatio < 1.
func (k Keeper) IsLiquidatable(ctx sdk.Context, addr string) (bool, error) {
	ratio, err := k.HealthRatio(ctx, addr)
	if err != nil {
		return false, err
	}
	return ratio.LT(sdk.OneDec()), nil
}

// -------------------------
// EndBlock: scan all accounts
// -------------------------

func (k Keeper) EndBlock(ctx sdk.Context) {
	store := ctx.KVStore(k.storeKey)
	prefix := []byte("account:")
	iter := storetypes.KVStorePrefixIterator(store, prefix)
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

// -------------------------
// Internal helpers
// -------------------------

func (k Keeper) computeUnrealizedPnL(ctx sdk.Context, addr string) (sdk.Dec, error) {
	positions := k.position.GetPositions(ctx, addr)
	total := sdk.ZeroDec()

	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return sdk.ZeroDec(), err
		}
		// Long: (markPrice - entryPrice) * size
		// Short: (entryPrice - markPrice) * |size|
		pnl := markPrice.Sub(pos.EntryPrice).Mul(pos.Size)
		total = total.Add(pnl)
	}
	return total, nil
}

func (k Keeper) computeFundingPnL(ctx sdk.Context, addr string) (sdk.Dec, error) {
	positions := k.position.GetPositions(ctx, addr)
	total := sdk.ZeroDec()

	for _, pos := range positions {
		cum, err := k.funding.GetCumulativeFunding(ctx, pos.MarketID, addr)
		if err != nil {
			return sdk.ZeroDec(), err
		}
		// Funding debited for longs, credited for shorts
		total = total.Sub(cum.Mul(pos.Size))
	}
	return total, nil
}

func (k Keeper) executeLiquidation(ctx sdk.Context, addr string) error {
	positions := k.position.GetPositions(ctx, addr)
	partialRate := k.params.PartialLiquidationRate
	penalty := k.params.LiquidationPenaltyMin

	acc := k.GetAccount(ctx, addr)

	for _, pos := range positions {
		markPrice, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return err
		}

		// Reduce position by PartialLiquidationRate
		reduceSize := pos.Size.Mul(partialRate)
		notional := reduceSize.Abs().Mul(markPrice)
		penaltyAmount := notional.Mul(penalty)

		// Deduct penalty from collateral
		acc.Collateral = acc.Collateral.Sub(penaltyAmount)
		if acc.Collateral.IsNegative() {
			acc.Collateral = sdk.ZeroDec()
		}
	}

	k.SetAccount(ctx, acc)
	return nil
}