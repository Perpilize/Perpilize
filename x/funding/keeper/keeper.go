package keeper

import (
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/funding/types"
	oraclekeeper "github.com/perpilize/perpilize/x/oracle/keeper"
)

type Keeper struct {
	storeKey storetypes.StoreKey
	cdc      codec.BinaryCodec
	oracle   oraclekeeper.Keeper
	params   types.Params
}

func NewKeeper(cdc codec.BinaryCodec, key storetypes.StoreKey, oracleKeeper oraclekeeper.Keeper) Keeper {
	return Keeper{storeKey: key, cdc: cdc, oracle: oracleKeeper, params: types.DefaultParams()}
}

// ── Funding rate ─────────────────────────────────────────────────────────────

// ComputeFundingRate calculates the periodic funding rate.
// Rate = (indexPrice - markPrice) / intervalSeconds, clamped to ±maxRate.
func (k Keeper) ComputeFundingRate(ctx sdk.Context, marketID string, markPrice math.LegacyDec) (math.LegacyDec, error) {
	indexPrice, _, err := k.oracle.GetPrice(ctx, marketID)
	if err != nil {
		return math.LegacyZeroDec(), err
	}

	intervalSecs := math.LegacyNewDec(k.params.FundingIntervalSeconds)
	if intervalSecs.IsZero() {
		intervalSecs = math.LegacyNewDec(3600)
	}

	delta       := indexPrice.Sub(markPrice)
	fundingRate := delta.Quo(intervalSecs)

	maxRate := math.LegacyNewDecWithPrec(k.params.MaxFundingRateBps, 4) // bps → decimal
	if fundingRate.GT(maxRate) {
		fundingRate = maxRate
	}
	if fundingRate.LT(maxRate.Neg()) {
		fundingRate = maxRate.Neg()
	}

	return fundingRate, nil
}

// GetFundingRate returns the last stored funding rate for a market.
// Satisfies oracle precompile's GetFundingRate call.
func (k Keeper) GetFundingRate(ctx sdk.Context, marketID string) (math.LegacyDec, error) {
	return k.GetMarketCumulativeIndex(ctx, marketID), nil
}

// ── Cumulative index ─────────────────────────────────────────────────────────

func (k Keeper) UpdateCumulativeIndex(ctx sdk.Context, marketID string, rate math.LegacyDec) {
	current := k.GetMarketCumulativeIndex(ctx, marketID)
	k.setMarketCumulativeIndex(ctx, marketID, current.Add(rate))
}

func (k Keeper) GetMarketCumulativeIndex(ctx sdk.Context, marketID string) math.LegacyDec {
	store := ctx.KVStore(k.storeKey)
	bz    := store.Get([]byte("cumidx:" + marketID))
	if bz == nil {
		return math.LegacyZeroDec()
	}
	var dec math.LegacyDec
	if err := dec.Unmarshal(bz); err != nil {
		return math.LegacyZeroDec()
	}
	return dec
}

func (k Keeper) setMarketCumulativeIndex(ctx sdk.Context, marketID string, val math.LegacyDec) {
	store    := ctx.KVStore(k.storeKey)
	bz, _   := val.Marshal()
	store.Set([]byte("cumidx:"+marketID), bz)
}

// ── Per-position funding ─────────────────────────────────────────────────────

// GetCumulativeFunding returns accumulated funding for address+market.
func (k Keeper) GetCumulativeFunding(ctx sdk.Context, marketID string, addr string) (math.LegacyDec, error) {
	store := ctx.KVStore(k.storeKey)
	bz    := store.Get([]byte("funding:" + marketID + ":" + addr))
	if bz == nil {
		return math.LegacyZeroDec(), nil
	}
	var dec math.LegacyDec
	if err := dec.Unmarshal(bz); err != nil {
		return math.LegacyZeroDec(), err
	}
	return dec, nil
}

func (k Keeper) SetCumulativeFunding(ctx sdk.Context, marketID, addr string, val math.LegacyDec) {
	store  := ctx.KVStore(k.storeKey)
	bz, _ := val.Marshal()
	store.Set([]byte("funding:"+marketID+":"+addr), bz)
}

// ApplyFunding computes and persists funding payments for all positions in a market.
func (k Keeper) ApplyFunding(ctx sdk.Context, marketID string, markPrice math.LegacyDec, positions map[string]math.LegacyDec) error {
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

func (k Keeper) GetParams(_ sdk.Context) types.Params { return k.params }