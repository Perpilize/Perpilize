package types

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	positiontypes "github.com/perpilize/perpilize/x/position/types"
)

// OracleKeeper is the subset of oracle.Keeper used by the margin module.
type OracleKeeper interface {
	GetPrice(ctx sdk.Context, marketID string) (math.LegacyDec, int64, error)
}

// FundingKeeper is the subset of funding.Keeper used by the margin module.
type FundingKeeper interface {
	GetCumulativeFunding(ctx sdk.Context, marketID string, addr string) (math.LegacyDec, error)
}

// PositionKeeper is the subset of position.Keeper used by the margin module.
type PositionKeeper interface {
	GetPositions(ctx sdk.Context, addr string) []positiontypes.Position
	ReducePosition(ctx sdk.Context, addr string, marketID string, reduceBy math.LegacyDec) error
}

// SettlementKeeper is the subset of settlement.Keeper used by the margin module.
type SettlementKeeper interface {
	ExecuteTrade(ctx sdk.Context, addr string, marketID string, size math.LegacyDec, price math.LegacyDec) error
}