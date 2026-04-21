package keeper

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// GetCollateral returns the collateral stored for an address.
func (k Keeper) GetCollateral(ctx sdk.Context, addr string) math.LegacyDec {
	store := ctx.KVStore(k.storeKey)
	bz    := store.Get([]byte("col:" + addr))
	if bz == nil {
		return math.LegacyZeroDec()
	}
	var dec math.LegacyDec
	if err := dec.Unmarshal(bz); err != nil {
		return math.LegacyZeroDec()
	}
	return dec
}

// SetCollateral stores the collateral for an address.
func (k Keeper) SetCollateral(ctx sdk.Context, addr string, amount math.LegacyDec) {
	store  := ctx.KVStore(k.storeKey)
	bz, _ := amount.Marshal()
	store.Set([]byte("col:"+addr), bz)
}

// AddCollateral increases stored collateral for an address.
func (k Keeper) AddCollateral(ctx sdk.Context, addr string, amount math.LegacyDec) {
	k.SetCollateral(ctx, addr, k.GetCollateral(ctx, addr).Add(amount))
}