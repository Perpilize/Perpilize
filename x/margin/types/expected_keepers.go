package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type OracleKeeper interface {
    GetPrice(ctx sdk.Context, marketID string) (sdk.Dec, int64, error)
}

type FundingKeeper interface {
    GetCumulativeFunding(ctx sdk.Context, marketID string, addr string) (sdk.Dec, error)
}

type PositionKeeper interface {
    GetPositions(ctx sdk.Context, addr string) []Position
}

type Position struct {
    MarketID string
    Size      sdk.Dec
    EntryPrice sdk.Dec
}