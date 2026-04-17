package types

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	positiontypes "github.com/perpilize/perpilize/x/position/types"
)

// -------------------------
// Expected keeper interfaces
// -------------------------

type PositionKeeper interface {
	OpenPosition(ctx sdk.Context, addr, marketID string, size, price, margin, cumFunding sdk.Dec) error
	GetPositions(ctx sdk.Context, addr string) []positiontypes.Position
}

type FundingKeeper interface {
	GetCumulativeFunding(ctx sdk.Context, marketID string, addr string) (sdk.Dec, error)
}

// MarginKeeper is set post-construction to break the import cycle.
type MarginKeeper interface {
	DeductMargin(ctx sdk.Context, addr string, amount sdk.Dec) error
}

// -------------------------
// Params
// -------------------------

type Params struct {
	AuthorizedMatcherAddress string  `json:"authorized_matcher_address"`
	MakerFeeRate             sdk.Dec `json:"maker_fee_rate"`
	TakerFeeRate             sdk.Dec `json:"taker_fee_rate"`
	InitialMarginRatio       sdk.Dec `json:"initial_margin_ratio"`
}

func DefaultParams() Params {
	return Params{
		AuthorizedMatcherAddress: "",
		MakerFeeRate:             sdk.MustNewDecFromStr("0.0002"), // 0.02%
		TakerFeeRate:             sdk.MustNewDecFromStr("0.0005"), // 0.05%
		InitialMarginRatio:       sdk.MustNewDecFromStr("0.05"),   // 5%
	}
}

// -------------------------
// MatchedTrade
// -------------------------

type MatchedTrade struct {
	MakerAddress   string  `json:"maker_address"`
	TakerAddress   string  `json:"taker_address"`
	MarketID       string  `json:"market_id"`
	ExecutionPrice sdk.Dec `json:"execution_price"`
	Size           sdk.Dec `json:"size"`
	IsTakerLong    bool    `json:"is_taker_long"`
}

// -------------------------
// Errors
// -------------------------

var (
	ErrUnauthorizedMatcher = errors.New("only the authorized matcher may submit settlements")
	ErrZeroTradeSize       = errors.New("trade size cannot be zero")
)