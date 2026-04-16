package keeper

import sdk "github.com/cosmos/cosmos-sdk/types"

func (k Keeper) ApplyLiquidation(
	ctx sdk.Context,
	trader string,
	penalty sdk.Dec,
	insurance string,
) {

	bal := k.GetBalance(ctx, trader)

	newBal := bal.Sub(penalty)

	if newBal.IsNegative() {
		deficit := newBal.Abs()

		insBal := k.GetBalance(ctx, insurance)
		k.SetBalance(ctx, insurance, insBal.Sub(deficit))

		newBal = sdk.ZeroDec()
	}

	k.SetBalance(ctx, trader, newBal)
}