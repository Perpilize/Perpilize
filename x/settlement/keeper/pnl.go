package keeper

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// RealizePnL credits or debits realized PnL for an address.
// Positive pnl = profit credited to balance; negative = loss debited.
func (k Keeper) RealizePnL(ctx sdk.Context, addr string, pnl math.LegacyDec) error {
	if pnl.IsPositive() {
		k.AddBalance(ctx, addr, pnl)
		return nil
	}
	if pnl.IsNegative() {
		return k.SubBalance(ctx, addr, pnl.Abs())
	}
	return nil
}