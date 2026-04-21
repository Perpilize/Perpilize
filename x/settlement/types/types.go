package types

import (
	"context"
	"errors"

	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	positiontypes "github.com/perpilize/perpilize/x/position/types"
)

// Expected keeper interfaces

type PositionKeeper interface {
	OpenPosition(ctx sdk.Context, addr, marketID string, size, price, margin, cumFunding math.LegacyDec) error
	GetPositions(ctx sdk.Context, addr string) []positiontypes.Position
}

type FundingKeeper interface {
	GetCumulativeFunding(ctx sdk.Context, marketID string, addr string) (math.LegacyDec, error)
}

// MarginKeeper injected post-construction to break the import cycle.
type MarginKeeper interface {
	DeductMargin(ctx sdk.Context, addr string, amount math.LegacyDec) error
}

// Params

type Params struct {
	AuthorizedMatcherAddress string         `json:"authorized_matcher_address"`
	MakerFeeRate             math.LegacyDec `json:"maker_fee_rate"`
	TakerFeeRate             math.LegacyDec `json:"taker_fee_rate"`
	InitialMarginRatio       math.LegacyDec `json:"initial_margin_ratio"`
}

func DefaultParams() Params {
	return Params{
		AuthorizedMatcherAddress: "",
		MakerFeeRate:             math.LegacyMustNewDecFromStr("0.0002"),
		TakerFeeRate:             math.LegacyMustNewDecFromStr("0.0005"),
		InitialMarginRatio:       math.LegacyMustNewDecFromStr("0.05"),
	}
}

// MatchedTrade

type MatchedTrade struct {
	MakerAddress   string         `json:"maker_address"`
	TakerAddress   string         `json:"taker_address"`
	MarketID       string         `json:"market_id"`
	ExecutionPrice math.LegacyDec `json:"execution_price"`
	Size           math.LegacyDec `json:"size"`
	IsTakerLong    bool           `json:"is_taker_long"`
}

// Errors

var (
	ErrUnauthorizedMatcher = errors.New("only the authorized matcher may submit settlements")
	ErrZeroTradeSize       = errors.New("trade size cannot be zero")
)

// Additional errors
var ErrInsufficientBalance = errors.New("insufficient balance for operation")

// ── Msg types ─────────────────────────────────────────────────────────────────

type MsgSettleMatchedOrders struct {
	Matcher string         `json:"matcher"`
	Trades  []MatchedTrade `json:"trades"`
}

type MsgSettleMatchedOrdersResponse struct {
	SettlementBatchId uint64 `json:"settlement_batch_id"`
}

// MsgServer is the settlement message server interface.
type MsgServer interface {
	SettleMatchedOrders(context.Context, *MsgSettleMatchedOrders) (*MsgSettleMatchedOrdersResponse, error)
}