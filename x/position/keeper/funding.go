package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/position/types"
)

func (k Keeper) ApplyFunding(
	pos types.Position,
	rate sdk.Dec,
) types.Position {

	payment := pos.Size.Mul(rate)
	pos.LastFunding = pos.LastFunding.Add(payment)

	return pos
}