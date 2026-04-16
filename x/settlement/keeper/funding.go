package keeper

import sdk "github.com/cosmos/cosmos-sdk/types"

func (k Keeper) SettleFunding(ctx sdk.Context, trader string, amt sdk.Dec) {
	bal := k.GetBalance(ctx, trader)
	k.SetBalance(ctx, trader, bal.Add(amt))
}