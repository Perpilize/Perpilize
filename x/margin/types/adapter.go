package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// MarginKeeperAdapter wraps the concrete margin Keeper behind the
// settlement/types.MarginKeeper interface, breaking the import cycle:
//
//   x/settlement/keeper → x/margin/types (interface only, no concrete import)
//   x/margin/keeper     → x/settlement/keeper (for ExecuteTrade)
//
// app.go constructs both keepers, then calls:
//   app.SettlementKeeper.SetMarginKeeper(margintypes.MarginKeeperAdapter{Keeper: app.MarginKeeper})
//
// The adapter is defined here in x/margin/types so that app.go can reference
// the concrete Keeper type without settlement needing to import x/margin/keeper.

// ConcreteMarginKeeper is the minimal interface the adapter wraps.
// The concrete marginkeeper.Keeper satisfies this automatically.
type ConcreteMarginKeeper interface {
	DeductMargin(ctx sdk.Context, addr string, amount sdk.Dec) error
	IsLiquidatable(ctx sdk.Context, addr string) (bool, error)
	ExecuteLiquidation(ctx sdk.Context, addr string, marketID string, partialRate sdk.Dec) error
}

// MarginKeeperAdapter satisfies settlement/types.MarginKeeper and
// liquidation/types.MarginKeeper by delegating to the concrete keeper.
type MarginKeeperAdapter struct {
	Keeper ConcreteMarginKeeper
}

func (a MarginKeeperAdapter) DeductMargin(ctx sdk.Context, addr string, amount sdk.Dec) error {
	return a.Keeper.DeductMargin(ctx, addr, amount)
}

func (a MarginKeeperAdapter) IsLiquidatable(ctx sdk.Context, addr string) (bool, error) {
	return a.Keeper.IsLiquidatable(ctx, addr)
}

func (a MarginKeeperAdapter) ExecuteLiquidation(ctx sdk.Context, addr string, marketID string, partialRate sdk.Dec) error {
	return a.Keeper.ExecuteLiquidation(ctx, addr, marketID, partialRate)
}