package keeper

import (
	"fmt"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

func (k Keeper) DeductFee(ctx sdk.Context, trader string, fee sdk.Dec) error {

	bal := k.GetBalance(ctx, trader)

	if bal.LT(fee) {
		return fmt.Errorf("insufficient balance")
	}

	k.SetBalance(ctx, trader, bal.Sub(fee))
	return nil
}