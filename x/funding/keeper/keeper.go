package keeper

import (
    "math"
    "time"

    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/perpilize/perpilize/x/funding/types"
    "github.com/perpilize/perpilize/x/oracle/keeper as oraclekeeper"
)

type FundingKeeper struct {
    storeKey sdk.StoreKey
    cdc      codec.BinaryCodec
    params   types.Params
    oracle   oraclekeeper.OracleKeeper
}

func NewKeeper(cdc codec.BinaryCodec, key sdk.StoreKey, oracleKeeper oraclekeeper.OracleKeeper) FundingKeeper {
    return FundingKeeper{
        storeKey: key,
        cdc:      cdc,
        params:   types.DefaultParams(),
        oracle:   oracleKeeper,
    }
}

func (k FundingKeeper) ComputeFundingRate(ctx sdk.Context, marketID string, markPrice sdk.Dec) (sdk.Dec, error) {
    indexPrice, _, err := k.oracle.GetPrice(ctx, marketID)
    if err != nil {
        return sdk.ZeroDec(), err
    }

    delta := indexPrice.Sub(markPrice)
    fundingRate := delta.Quo(sdk.NewDec(int64(k.params.FundingInterval.Seconds())))
    max := sdk.NewDecWithPrec(int64(k.params.MaxFundingRate*1e6), 6)
    if fundingRate.GT(max) {
        fundingRate = max
    }
    if fundingRate.LT(max.Neg()) {
        fundingRate = max.Neg()
    }

    return fundingRate, nil
}

func (k FundingKeeper) ApplyFunding(ctx sdk.Context, marketID string, markPrice sdk.Dec, positions map[string]sdk.Dec) error {
    rate, err := k.ComputeFundingRate(ctx, marketID, markPrice)
    if err != nil {
        return err
    }

    store := ctx.KVStore(k.storeKey)
    for addr, size := range positions {
        payment := size.Mul(rate)
        key := []byte("funding_" + marketID + "_" + addr)
        bz, _ := payment.Marshal()
        store.Set(key, bz)
    }

    return nil
}

func (k FundingKeeper) GetCumulativeFunding(ctx sdk.Context, marketID string, addr string) (sdk.Dec, error) {
    store := ctx.KVStore(k.storeKey)
    key := []byte("funding_" + marketID + "_" + addr)
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