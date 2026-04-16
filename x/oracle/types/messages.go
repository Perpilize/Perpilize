package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type MsgUpdatePrice struct {
    Sender    sdk.AccAddress `json:"sender" yaml:"sender"`
    MarketID  string         `json:"market_id" yaml:"market_id"`
    Price     sdk.Dec        `json:"price" yaml:"price"`
    Timestamp int64          `json:"timestamp" yaml:"timestamp"`
}