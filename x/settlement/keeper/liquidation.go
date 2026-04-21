package keeper

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// ProcessLiquidationPenalty moves the penalty amount from the liquidated account
// to the insurance fund, and rewards the liquidator.
func (k Keeper) ProcessLiquidationPenalty(
	ctx sdk.Context,
	liquidated string,
	liquidator string,
	penalty math.LegacyDec,
) error {
	// Half penalty to liquidator, half to insurance fund
	liquidatorReward := penalty.Quo(math.LegacyNewDec(2))
	insuranceAmount  := penalty.Sub(liquidatorReward)

	if err := k.SubBalance(ctx, liquidated, penalty); err != nil {
		return err
	}
	k.AddBalance(ctx, liquidator,        liquidatorReward)
	k.AddBalance(ctx, "insurance_fund",  insuranceAmount)
	return nil
}

// GetInsuranceFund returns the current insurance fund balance.
func (k Keeper) GetInsuranceFund(ctx sdk.Context) math.LegacyDec {
	return k.GetBalance(ctx, "insurance_fund")
}