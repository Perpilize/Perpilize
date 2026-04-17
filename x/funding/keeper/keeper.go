package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/funding/types"
	oraclekeeper "github.com/perpilize/perpilize/x/oracle/keeper"
)

type Keeper struct {
	storeKey sdk.StoreKey
	cdc      codec.BinaryCodec
	oracle   oraclekeeper.Keeper
	params   types.Params
}

func NewKeeper(
	cdc codec.BinaryCodec,
	key sdk.StoreKey,
	oracleKeeper oraclekeeper.Keeper,
) Keeper {
	return Keeper{
		storeKey: key,
		cdc:      cdc,
		oracle:   oracleKeeper,
		params:   types.DefaultParams(),
	}
}

// -------------------------
// Funding rate computation
// -------------------------

// ComputeFundingRate calculates the periodic funding rate for a market.
// Rate = (indexPrice - markPrice) / fundingIntervalSeconds
// Clamped to ±MaxFundingRate.
func (k Keeper) ComputeFundingRate(ctx sdk.Context, marketID string, markPrice sdk.Dec) (sdk.Dec, error) {
	indexPrice, _, err := k.oracle.GetPrice(ctx, marketID)
	if err != nil {
		return sdk.ZeroDec(), err
	}

	intervalSecs := sdk.NewDec(k.params.FundingIntervalSeconds)
	if intervalSecs.IsZero() {
		intervalSecs = sdk.NewDec(3600) // default 1h
	}

	delta := indexPrice.Sub(markPrice)
	fundingRate := delta.Quo(intervalSecs)

	maxRate := sdk.NewDecWithPrec(int64(k.params.MaxFundingRateBps), 4) // bps → decimal
	if fundingRate.GT(maxRate) {
		fundingRate = maxRate
	}
	if fundingRate.LT(maxRate.Neg()) {
		fundingRate = maxRate.Neg()
	}

	return fundingRate, nil
}

// -------------------------
// Cumulative funding index
// -------------------------

// UpdateCumulativeIndex accumulates the latest funding rate into the market-level index.
// Called every BeginBlock for all active markets.
func (k Keeper) UpdateCumulativeIndex(ctx sdk.Context, marketID string, rate sdk.Dec) {
	current := k.GetMarketCumulativeIndex(ctx, marketID)
	updated := current.Add(rate)
	k.setMarketCumulativeIndex(ctx, marketID, updated)
}

// GetMarketCumulativeIndex returns the global cumulative funding index for a market.
func (k Keeper) GetMarketCumulativeIndex(ctx sdk.Context, marketID string) sdk.Dec {
	store := ctx.KVStore(k.storeKey)
	key := []byte("cumidx:" + marketID)
	bz := store.Get(key)
	if bz == nil {
		return sdk.ZeroDec()
	}
	var dec sdk.Dec
	if err := dec.Unmarshal(bz); err != nil {
		return sdk.ZeroDec()
	}
	return dec
}

func (k Keeper) setMarketCumulativeIndex(ctx sdk.Context, marketID string, val sdk.Dec) {
	store := ctx.KVStore(k.storeKey)
	key := []byte("cumidx:" + marketID)
	bz, _ := val.Marshal()
	store.Set(key, bz)
}

// -------------------------
// Per-position funding tracking
// -------------------------

// GetCumulativeFunding returns the accumulated funding payment for a specific
// address+market combination since their last settlement.
// Implements margin/types.FundingKeeper interface.
func (k Keeper) GetCumulativeFunding(ctx sdk.Context, marketID string, addr string) (sdk.Dec, error) {
	store := ctx.KVStore(k.storeKey)
	key := []byte("funding:" + marketID + ":" + addr)
	bz := store.Get(key)
	if bz == nil {
		return sdk.ZeroDec(), nil
	}
	var dec sdk.Dec
	if err := dec.Unmarshal(bz); err != nil {
		return sdk.ZeroDec(), err
	}
	return dec, nil
}

// SetCumulativeFunding stores the cumulative funding snapshot for an address+market.
func (k Keeper) SetCumulativeFunding(ctx sdk.Context, marketID string, addr string, val sdk.Dec) {
	store := ctx.KVStore(k.storeKey)
	key := []byte("funding:" + marketID + ":" + addr)
	bz, _ := val.Marshal()
	store.Set(key, bz)
}

// ApplyFunding computes and persists funding payments for all positions in a market.
// Called from BeginBlock after UpdateCumulativeIndex.
func (k Keeper) ApplyFunding(ctx sdk.Context, marketID string, markPrice sdk.Dec, positions map[string]sdk.Dec) error {
	rate, err := k.ComputeFundingRate(ctx, marketID, markPrice)
	if err != nil {
		return err
	}

	k.UpdateCumulativeIndex(ctx, marketID, rate)

	for addr, size := range positions {
		payment := size.Mul(rate)
		prev, err := k.GetCumulativeFunding(ctx, marketID, addr)
		if err != nil {
			return err
		}
		k.SetCumulativeFunding(ctx, marketID, addr, prev.Add(payment))
	}

	return nil
}

// -------------------------
// Params
// -------------------------

func (k Keeper) GetParams(ctx sdk.Context) types.Params {
	return k.params
}