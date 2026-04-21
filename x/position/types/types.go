package types

import (
	"cosmossdk.io/math"
	"errors"

)

// Position holds an open perpetual position for one user in one market.
type Position struct {
	Owner                 string  `json:"owner"`
	MarketID              string  `json:"market_id"`
	Size                  math.LegacyDec `json:"size"`           // positive = long, negative = short
	AvgEntryPrice         math.LegacyDec `json:"avg_entry_price"`
	Margin                math.LegacyDec `json:"margin"`
	LastCumulativeFunding math.LegacyDec `json:"last_cumulative_funding"`
}

// Required to satisfy codec.ProtoMarshaler (replace with protoc output in production)
func (p *Position) Reset()         {}
func (p *Position) String() string { return p.Owner + "@" + p.MarketID }
func (p *Position) ProtoMessage()  {}

func (p *Position) Marshal() ([]byte, error)  { return []byte{}, nil }
func (p *Position) Unmarshal([]byte) error    { return nil }

// Errors
var ErrPositionNotFound = errors.New("position not found")