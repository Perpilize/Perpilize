package keeper

import (
    "github.com/cosmos/cosmos-sdk/codec"
    sdk "github.com/cosmos/cosmos-sdk/types"

    "github.com/perpilize/perpilize/x/margin/types"
)

type Keeper struct {
    storeKey sdk.StoreKey
    cdc      codec.BinaryCodec

    oracle   types.OracleKeeper
    funding  types.FundingKeeper
    position types.PositionKeeper

    params types.Params
}

func NewKeeper(
    cdc codec.BinaryCodec,
    key sdk.StoreKey,
    oracle types.OracleKeeper,
    funding types.FundingKeeper,
    position types.PositionKeeper,
) Keeper {
    return Keeper{
        storeKey: key,
        cdc:      cdc,
        oracle:   oracle,
        funding:  funding,
        position: position,
        params:   types.DefaultParams(),
    }
}