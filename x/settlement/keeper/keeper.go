package keeper

import (
	"errors"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/settlement/types"
)

type Keeper struct {
	storeKey sdk.StoreKey
	cdc      codec.BinaryCodec

	position types.PositionKeeper
	funding  types.FundingKeeper
	margin   types.MarginKeeper

	params types.Params

	// batchCounter is persisted in KV store
}

func NewKeeper(
	cdc codec.BinaryCodec,
	key sdk.StoreKey,
	position types.PositionKeeper,
	funding types.FundingKeeper,
	params types.Params,
) Keeper {
	return Keeper{
		storeKey: key,
		cdc:      cdc,
		position: position,
		funding:  funding,
		params:   params,
	}
}

// SetMarginKeeper breaks the import cycle: margin imports settlement, so
// settlement cannot import margin. The app wires this after construction.
func (k *Keeper) SetMarginKeeper(mk types.MarginKeeper) {
	k.margin = mk
}

// -------------------------
// MsgSettleMatchedOrders handler
// -------------------------

// SettleMatchedOrders processes a batch of off-chain matched trades.
// Only the authorized matcher may call this.
func (k Keeper) SettleMatchedOrders(ctx sdk.Context, matcher string, trades []types.MatchedTrade) (uint64, error) {
	if matcher != k.params.AuthorizedMatcherAddress {
		return 0, types.ErrUnauthorizedMatcher
	}

	for _, trade := range trades {
		if err := k.settleSingleTrade(ctx, trade); err != nil {
			return 0, err
		}
	}

	batchID := k.incrementBatchID(ctx)
	return batchID, nil
}

// -------------------------
// ExecuteTrade (called by precompile)
// -------------------------

// ExecuteTrade is the low-level entry point used by the settlement precompile.
// Implements settlement/types.SettlementKeeper for the margin module.
func (k Keeper) ExecuteTrade(ctx sdk.Context, addr, marketID string, size, price sdk.Dec) error {
	if size.IsZero() {
		return errors.New("trade size cannot be zero")
	}

	// Fetch current cumulative funding index for this position
	cumFunding, err := k.funding.GetCumulativeFunding(ctx, marketID, addr)
	if err != nil {
		return err
	}

	// Compute required margin for this trade
	notional := size.Abs().Mul(price)
	imr := k.params.InitialMarginRatio
	requiredMargin := notional.Mul(imr)

	// Deduct margin from account and open / increase position
	if k.margin != nil {
		if err := k.margin.DeductMargin(ctx, addr, requiredMargin); err != nil {
			return err
		}
	}

	if err := k.position.OpenPosition(ctx, addr, marketID, size, price, requiredMargin, cumFunding); err != nil {
		return err
	}

	return nil
}

// -------------------------
// Internal helpers
// -------------------------

func (k Keeper) settleSingleTrade(ctx sdk.Context, trade types.MatchedTrade) error {
	// Settle maker side
	if err := k.ExecuteTrade(ctx, trade.MakerAddress, trade.MarketID, makerSize(trade), trade.ExecutionPrice); err != nil {
		return err
	}
	// Settle taker side
	if err := k.ExecuteTrade(ctx, trade.TakerAddress, trade.MarketID, takerSize(trade), trade.ExecutionPrice); err != nil {
		return err
	}

	// Collect fees
	k.collectFees(ctx, trade)

	return nil
}

// makerSize: maker is always on the opposite side of the taker.
func makerSize(trade types.MatchedTrade) sdk.Dec {
	if trade.IsTakerLong {
		return trade.Size.Neg() // maker is short
	}
	return trade.Size // maker is long
}

func takerSize(trade types.MatchedTrade) sdk.Dec {
	if trade.IsTakerLong {
		return trade.Size
	}
	return trade.Size.Neg()
}

func (k Keeper) collectFees(ctx sdk.Context, trade types.MatchedTrade) {
	// Fee amounts are logged; actual coin transfer requires bank keeper (add as needed)
	makerFee := trade.ExecutionPrice.Mul(trade.Size).Mul(k.params.MakerFeeRate)
	takerFee := trade.ExecutionPrice.Mul(trade.Size).Mul(k.params.TakerFeeRate)
	ctx.Logger().Info("fees collected",
		"market", trade.MarketID,
		"maker_fee", makerFee.String(),
		"taker_fee", takerFee.String(),
	)
}

func (k Keeper) incrementBatchID(ctx sdk.Context) uint64 {
	store := ctx.KVStore(k.storeKey)
	key := []byte("batch_id")
	bz := store.Get(key)
	var id uint64
	if bz != nil {
		id = sdk.BigEndianToUint64(bz)
	}
	id++
	store.Set(key, sdk.Uint64ToBigEndian(id))
	return id
}