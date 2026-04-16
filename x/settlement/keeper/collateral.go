package keeper

import (
	"fmt"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

func (k Keeper) AddCollateral(ctx sdk.Context, addr string, amt sdk.Dec) {
	bal := k.GetBalance(ctx, addr)
	k.SetBalance(ctx, addr, bal.Add(amt))
}

func (k Keeper) RemoveCollateral(ctx sdk.Context, addr string, amt sdk.Dec) error {

	bal := k.GetBalance(ctx, addr)

	if bal.LT(amt) {
		return fmt.Errorf("insufficient collateral")
	}

	k.SetBalance(ctx, addr, bal.Sub(amt))
	return nil
}