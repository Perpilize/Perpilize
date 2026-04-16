package keeper

import sdk "github.com/cosmos/cosmos-sdk/types"

func (k Keeper) GetBalance(ctx sdk.Context, addr string) sdk.Dec {
	store := ctx.KVStore(k.storeKey)

	bz := store.Get([]byte("bal:" + addr))
	if bz == nil {
		return sdk.ZeroDec()
	}

	var val sdk.Dec
	k.cdc.Unmarshal(bz, &val)
	return val
}

func (k Keeper) SetBalance(ctx sdk.Context, addr string, amt sdk.Dec) {
	store := ctx.KVStore(k.storeKey)

	bz, _ := k.cdc.Marshal(&amt)
	store.Set([]byte("bal:"+addr), bz)
}