package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

func (k Keeper) ShouldLiquidate(ctx sdk.Context, addr string) (bool, error) {
	hr, err := k.HealthRatio(ctx, addr)
	if err != nil {
		return false, err
	}
	return hr.LT(sdk.OneDec()), nil
}

// Entry point
func (k Keeper) Liquidate(ctx sdk.Context, addr string) error {

	should, err := k.ShouldLiquidate(ctx, addr)
	if err != nil {
		return err
	}
	if !should {
		return nil
	}

	// Step 1: Partial liquidation
	err = k.executePartial(ctx, addr)
	if err != nil {
		return err
	}

	// Step 2: Recheck
	hr, err := k.HealthRatio(ctx, addr)
	if err != nil {
		return err
	}

	if hr.LT(sdk.OneDec()) {
		return k.executeFull(ctx, addr)
	}

	return nil
}

func (k Keeper) executePartial(ctx sdk.Context, addr string) error {

	positions := k.position.GetPositions(ctx, addr)

	for _, pos := range positions {

		reduce := pos.Size.Mul(k.params.PartialLiquidationRate)

		err := k.sendLiquidationOrder(ctx, addr, pos.MarketID, reduce)
		if err != nil {
			return err
		}
	}

	return nil
}

func (k Keeper) executeFull(ctx sdk.Context, addr string) error {

	positions := k.position.GetPositions(ctx, addr)

	for _, pos := range positions {

		err := k.sendLiquidationOrder(ctx, addr, pos.MarketID, pos.Size)
		if err != nil {
			return err
		}
	}

	return nil
}

// Matching engine hook
func (k Keeper) sendLiquidationOrder(
	ctx sdk.Context,
	addr string,
	market string,
	size sdk.Dec,
) error {

	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			"liquidation_order",
			sdk.NewAttribute("trader", addr),
			sdk.NewAttribute("market", market),
			sdk.NewAttribute("size", size.String()),
		),
	)

	return nil
}