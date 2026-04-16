package keeper

import sdk "github.com/cosmos/cosmos-sdk/types"

func (k Keeper) SettlePnL(ctx sdk.Context, trader string, pnl sdk.Dec) {

	bal := k.GetBalance(ctx, trader)
	k.SetBalance(ctx, trader, bal.Add(pnl))
}