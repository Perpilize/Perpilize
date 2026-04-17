package types

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Position holds an open perpetual position for one user in one market.
type Position struct {
	Owner                 string  `json:"owner"`
	MarketID              string  `json:"market_id"`
	Size                  sdk.Dec `json:"size"`           // positive = long, negative = short
	AvgEntryPrice         sdk.Dec `json:"avg_entry_price"`
	Margin                sdk.Dec `json:"margin"`
	LastCumulativeFunding sdk.Dec `json:"last_cumulative_funding"`
}

// Required to satisfy codec.ProtoMarshaler (replace with protoc output in production)
func (p *Position) Reset()         {}
func (p *Position) String() string { return p.Owner + "@" + p.MarketID }
func (p *Position) ProtoMessage()  {}

func (p *Position) Marshal() ([]byte, error)  { return []byte{}, nil }
func (p *Position) Unmarshal([]byte) error    { return nil }

// Errors
var ErrPositionNotFound = errors.New("position not found")