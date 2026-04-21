package keeper

import (
	"errors"

	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

var errInsufficientBalance = errors.New("insufficient settlement balance")

func (k Keeper) GetBalance(ctx sdk.Context, addr string) math.LegacyDec {
	store := ctx.KVStore(k.storeKey)
	bz    := store.Get([]byte("bal:" + addr))
	if bz == nil {
		return math.LegacyZeroDec()
	}
	var dec math.LegacyDec
	if err := dec.Unmarshal(bz); err != nil {
		return math.LegacyZeroDec()
	}
	return dec
}

func (k Keeper) SetBalance(ctx sdk.Context, addr string, amount math.LegacyDec) {
	store  := ctx.KVStore(k.storeKey)
	bz, _ := amount.Marshal()
	store.Set([]byte("bal:"+addr), bz)
}

func (k Keeper) AddBalance(ctx sdk.Context, addr string, amount math.LegacyDec) {
	k.SetBalance(ctx, addr, k.GetBalance(ctx, addr).Add(amount))
}

func (k Keeper) SubBalance(ctx sdk.Context, addr string, amount math.LegacyDec) error {
	bal := k.GetBalance(ctx, addr)
	if bal.LT(amount) {
		return errInsufficientBalance
	}
	k.SetBalance(ctx, addr, bal.Sub(amount))
	return nil
}