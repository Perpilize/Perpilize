package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/position/types"
)

func (k Keeper) ApplyTrade(
	ctx sdk.Context,
	trader string,
	market string,
	sizeDelta sdk.Dec,
	price sdk.Dec,
) error {

	pos, found := k.GetPosition(ctx, trader, market)

	if !found {
		pos = types.Position{
			Trader: trader,
			MarketID: market,
			Size: sdk.ZeroDec(),
			EntryPrice: price,
		}
	}

	newSize := pos.Size.Add(sizeDelta)

	if !pos.Size.IsZero() {

		total := pos.EntryPrice.Mul(pos.Size.Abs()).
			Add(price.Mul(sizeDelta.Abs()))

		pos.EntryPrice = total.Quo(newSize.Abs())
	}

	pos.Size = newSize

	k.SetPosition(ctx, pos)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			"position_update",
			sdk.NewAttribute("trader", trader),
			sdk.NewAttribute("market", market),
			sdk.NewAttribute("size", newSize.String()),
		),
	)

	return nil
}