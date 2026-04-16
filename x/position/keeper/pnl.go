package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/position/types"
)

func (k Keeper) ComputePnL(
	pos types.Position,
	price sdk.Dec,
) sdk.Dec {
	return price.Sub(pos.EntryPrice).Mul(pos.Size)
}