package types

import (
	"errors"

	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

const ModuleName = "oracle"

// PriceEntry holds a mark price with its update timestamp.
type PriceEntry struct {
	MarketID  string           `json:"market_id"`
	Price     math.LegacyDec  `json:"price"`
	Timestamp int64            `json:"timestamp"`
}

// MsgSetPrice is submitted by authorized price feeders.
type MsgSetPrice struct {
	Feeder   string          `json:"feeder"`
	MarketID string          `json:"market_id"`
	Price    math.LegacyDec  `json:"price"`
}

func (m *MsgSetPrice) Reset()         {}
func (m *MsgSetPrice) String() string { return m.MarketID }
func (m *MsgSetPrice) ProtoMessage()  {}
func (m *MsgSetPrice) ValidateBasic() error {
	if m.Feeder == "" || m.MarketID == "" {
		return errors.New("feeder and market_id required")
	}
	if m.Price.IsNegative() {
		return errors.New("price must be non-negative")
	}
	return nil
}
func (m *MsgSetPrice) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Feeder)
	return []sdk.AccAddress{addr}
}

// QueryPriceRequest / Response
type QueryPriceRequest struct {
	MarketID string `json:"market_id"`
}

type QueryPriceResponse struct {
	Price     math.LegacyDec `json:"price"`
	Timestamp int64          `json:"timestamp"`
}

// Errors
var ErrMarketNotFound = errors.New("market price not found")