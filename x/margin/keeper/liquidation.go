package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/margin/types"
)

// DeductMargin reduces the collateral of an account by amount.
// Used by the settlement keeper when opening a position.
func (k Keeper) DeductMargin(ctx sdk.Context, addr string, amount sdk.Dec) error {
	if amount.IsNegative() || amount.IsZero() {
		return types.ErrInvalidAmount
	}
	acc := k.GetAccount(ctx, addr)
	if acc.Collateral.LT(amount) {
		return types.ErrInsufficientCollateral
	}
	acc.Collateral = acc.Collateral.Sub(amount)
	k.SetAccount(ctx, acc)
	return nil
}

// ExecuteLiquidation reduces a position by partialRate and deducts the
// liquidation penalty from the account's collateral.
// Called by the liquidation keeper when processing MsgLiquidate.
func (k Keeper) ExecuteLiquidation(ctx sdk.Context, addr, marketID string, partialRate sdk.Dec) error {
	markPrice, _, err := k.oracle.GetPrice(ctx, marketID)
	if err != nil {
		return err
	}

	positions := k.position.GetPositions(ctx, addr)
	acc := k.GetAccount(ctx, addr)

	for _, pos := range positions {
		if pos.MarketID != marketID {
			continue
		}

		notional := pos.Size.Abs().Mul(markPrice).Mul(partialRate)
		penaltyAmount := notional.Mul(k.params.LiquidationPenaltyMin)

		acc.Collateral = acc.Collateral.Sub(penaltyAmount)
		if acc.Collateral.IsNegative() {
			acc.Collateral = sdk.ZeroDec()
		}

		// Reduce the position
		if err := k.position.ReducePosition(ctx, addr, marketID, partialRate); err != nil {
			return err
		}
	}

	k.SetAccount(ctx, acc)
	return nil
}