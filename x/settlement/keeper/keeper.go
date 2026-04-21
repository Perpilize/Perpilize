package keeper

import (
	"encoding/binary"
	"errors"

	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/settlement/types"
)

type Keeper struct {
	storeKey storetypes.StoreKey
	cdc      codec.BinaryCodec
	position types.PositionKeeper
	funding  types.FundingKeeper
	margin   types.MarginKeeper
	params   types.Params
}

func NewKeeper(
	cdc codec.BinaryCodec,
	key storetypes.StoreKey,
	position types.PositionKeeper,
	funding types.FundingKeeper,
	params types.Params,
) Keeper {
	return Keeper{storeKey: key, cdc: cdc, position: position, funding: funding, params: params}
}

// SetMarginKeeper is called post-construction to break the import cycle.
func (k *Keeper) SetMarginKeeper(mk types.MarginKeeper) { k.margin = mk }

// ── MsgSettleMatchedOrders ───────────────────────────────────────────────────

func (k Keeper) SettleMatchedOrders(ctx sdk.Context, matcher string, trades []types.MatchedTrade) (uint64, error) {
	if matcher != k.params.AuthorizedMatcherAddress {
		return 0, types.ErrUnauthorizedMatcher
	}
	for _, trade := range trades {
		if err := k.settleSingleTrade(ctx, trade); err != nil {
			return 0, err
		}
	}
	return k.incrementBatchID(ctx), nil
}

// ── ExecuteTrade (called by precompile) ──────────────────────────────────────

func (k Keeper) ExecuteTrade(ctx sdk.Context, addr, marketID string, size, price math.LegacyDec) error {
	if size.IsZero() {
		return errors.New("trade size cannot be zero")
	}

	cumFunding, err := k.funding.GetCumulativeFunding(ctx, marketID, addr)
	if err != nil {
		return err
	}

	notional       := size.Abs().Mul(price)
	requiredMargin := notional.Mul(k.params.InitialMarginRatio)

	if k.margin != nil {
		if err := k.margin.DeductMargin(ctx, addr, requiredMargin); err != nil {
			return err
		}
	}

	return k.position.OpenPosition(ctx, addr, marketID, size, price, requiredMargin, cumFunding)
}

// ── Internal ─────────────────────────────────────────────────────────────────

func (k Keeper) settleSingleTrade(ctx sdk.Context, trade types.MatchedTrade) error {
	makerSize := trade.Size
	takerSize := trade.Size
	if trade.IsTakerLong {
		makerSize = trade.Size.Neg()
	} else {
		takerSize = trade.Size.Neg()
	}

	if err := k.ExecuteTrade(ctx, trade.MakerAddress, trade.MarketID, makerSize, trade.ExecutionPrice); err != nil {
		return err
	}
	if err := k.ExecuteTrade(ctx, trade.TakerAddress, trade.MarketID, takerSize, trade.ExecutionPrice); err != nil {
		return err
	}

	makerFee := trade.ExecutionPrice.Mul(trade.Size).Mul(k.params.MakerFeeRate)
	takerFee := trade.ExecutionPrice.Mul(trade.Size).Mul(k.params.TakerFeeRate)
	ctx.Logger().Info("fees collected",
		"market", trade.MarketID,
		"maker_fee", makerFee.String(),
		"taker_fee", takerFee.String(),
	)
	return nil
}

func (k Keeper) incrementBatchID(ctx sdk.Context) uint64 {
	store := ctx.KVStore(k.storeKey)
	key   := []byte("batch_id")
	bz    := store.Get(key)
	var id uint64
	if bz != nil {
		id = binary.BigEndian.Uint64(bz)
	}
	id++
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, id)
	store.Set(key, buf)
	return id
}