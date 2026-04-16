package keeper

import (
    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/perpilize/perpilize/x/position/types"
)

type Keeper struct {
    storeKey sdk.StoreKey
    cdc      codec.BinaryCodec
}

func NewKeeper(cdc codec.BinaryCodec, key sdk.StoreKey) Keeper {
    return Keeper{
        storeKey: key,
        cdc:      cdc,
    }
}