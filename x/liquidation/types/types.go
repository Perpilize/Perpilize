package types

import (
	"errors"

	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	positiontypes "github.com/perpilize/perpilize/x/position/types"
)

// Expected keeper interfaces

type MarginKeeper interface {
	IsLiquidatable(ctx sdk.Context, addr string) (bool, error)
	ExecuteLiquidation(ctx sdk.Context, addr string, marketID string, partialRate math.LegacyDec) error
}

type PositionKeeper interface {
	GetPosition(ctx sdk.Context, addr, marketID string) (positiontypes.Position, bool)
}

type OracleKeeper interface {
	GetPrice(ctx sdk.Context, marketID string) (math.LegacyDec, int64, error)
}

const EventTypeLiquidation = "liquidation"

var (
	ErrAccountNotLiquidatable = errors.New("account health ratio is above 1, not liquidatable")
	ErrPositionNotFound       = errors.New("no position found for target in specified market")
)