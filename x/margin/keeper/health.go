package keeper

import sdk "github.com/cosmos/cosmos-sdk/types"

// Equity = PnL + Funding
func (k Keeper) ComputeEquity(ctx sdk.Context, addr string) (sdk.Dec, error) {

	positions := k.position.GetPositions(ctx, addr)

	equity := sdk.ZeroDec()

	for _, pos := range positions {

		price, _, err := k.oracle.GetPrice(ctx, pos.MarketID)
		if err != nil {
			return sdk.ZeroDec(), err
		}

		pnl := price.Sub(pos.EntryPrice).Mul(pos.Size)
		equity = equity.Add(pnl)

		funding, err := k.funding.GetCumulativeFunding(ctx, pos.MarketID, addr)
		if err != nil {
			return sdk.ZeroDec(), err
		}

		equity = equity.Add(funding)
	}

	return equity, nil
}

// Health = Equity / MMR
func (k Keeper) HealthRatio(ctx sdk.Context, addr string) (sdk.Dec, error) {

	equity, err := k.ComputeEquity(ctx, addr)
	if err != nil {
		return sdk.ZeroDec(), err
	}

	_, mmr, err := k.ComputeMarginRequirement(ctx, addr)
	if err != nil {
		return sdk.ZeroDec(), err
	}

	if mmr.IsZero() {
		return sdk.OneDec(), nil
	}

	return equity.Quo(mmr), nil
}