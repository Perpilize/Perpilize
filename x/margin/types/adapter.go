package types

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// ConcreteMarginKeeper is the minimal interface the adapter wraps.
type ConcreteMarginKeeper interface {
	DeductMargin(ctx sdk.Context, addr string, amount math.LegacyDec) error
	IsLiquidatable(ctx sdk.Context, addr string) (bool, error)
	ExecuteLiquidation(ctx sdk.Context, addr string, marketID string, partialRate math.LegacyDec) error
}

// MarginKeeperAdapter breaks the settlement/liquidation → margin import cycle.
type MarginKeeperAdapter struct {
	Keeper ConcreteMarginKeeper
}

func (a MarginKeeperAdapter) DeductMargin(ctx sdk.Context, addr string, amount math.LegacyDec) error {
	return a.Keeper.DeductMargin(ctx, addr, amount)
}

func (a MarginKeeperAdapter) IsLiquidatable(ctx sdk.Context, addr string) (bool, error) {
	return a.Keeper.IsLiquidatable(ctx, addr)
}

func (a MarginKeeperAdapter) ExecuteLiquidation(ctx sdk.Context, addr string, marketID string, partialRate math.LegacyDec) error {
	return a.Keeper.ExecuteLiquidation(ctx, addr, marketID, partialRate)
}