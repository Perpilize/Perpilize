package keeper

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// CollectFee deducts a fee from addr and credits it to the fee pool.
func (k Keeper) CollectFee(ctx sdk.Context, addr string, feeAmount math.LegacyDec) error {
	if err := k.SubBalance(ctx, addr, feeAmount); err != nil {
		return err
	}
	k.AddBalance(ctx, "fee_pool", feeAmount)
	return nil
}

// GetFeePool returns the accumulated fee pool balance.
func (k Keeper) GetFeePool(ctx sdk.Context) math.LegacyDec {
	return k.GetBalance(ctx, "fee_pool")
}