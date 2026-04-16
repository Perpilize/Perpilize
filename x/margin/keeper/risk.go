package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Computes IMR + MMR across full portfolio
func (k Keeper) ComputeMarginRequirement(
	ctx sdk.Context,
	addr string,
) (sdk.Dec, sdk.Dec, error) {

	positions := k.position.GetPositions(ctx, addr)

	imrTotal := sdk.ZeroDec()
	mmrTotal := sdk.ZeroDec()

	for _, pos := range positions {

		price, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return sdk.ZeroDec(), sdk.ZeroDec(), err
		}

		notional := price.Mul(pos.Size.Abs())

		imr := notional.Mul(k.params.InitialMarginRatio)
		mmr := notional.Mul(k.params.MaintenanceMarginRatio)

		imrTotal = imrTotal.Add(imr)
		mmrTotal = mmrTotal.Add(mmr)
	}

	return imrTotal, mmrTotal, nil
}