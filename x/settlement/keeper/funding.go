package keeper

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// SettleFunding applies the cumulative funding payment for addr in marketID.
// Positive payment = longs pay shorts; negative = shorts pay longs.
func (k Keeper) SettleFunding(ctx sdk.Context, addr, marketID string, payment math.LegacyDec) error {
	if payment.IsPositive() {
		return k.SubBalance(ctx, addr, payment)
	}
	k.AddBalance(ctx, addr, payment.Abs())
	return nil
}