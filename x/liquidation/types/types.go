package types

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	positiontypes "github.com/perpilize/perpilize/x/position/types"
)

// Expected keeper interfaces

type MarginKeeper interface {
	IsLiquidatable(ctx sdk.Context, addr string) (bool, error)
	ExecuteLiquidation(ctx sdk.Context, addr string, marketID string, partialRate sdk.Dec) error
}

type PositionKeeper interface {
	GetPosition(ctx sdk.Context, addr, marketID string) (positiontypes.Position, bool)
}

type OracleKeeper interface {
	GetPrice(ctx sdk.Context, marketID string) (sdk.Dec, int64, error)
}

// Event types
const EventTypeLiquidation = "liquidation"

// Errors
var (
	ErrAccountNotLiquidatable = errors.New("account health ratio is above 1, not liquidatable")
	ErrPositionNotFound       = errors.New("no position found for target in specified market")
)