package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type QueryPriceRequest struct {
    MarketID string `json:"market_id"`
}

type QueryPriceResponse struct {
    MarketID  string  `json:"market_id"`
    Price     sdk.Dec `json:"price"`
    Timestamp int64   `json:"timestamp"`
}

type QueryParamsRequest struct{}

type QueryParamsResponse struct {
    Params Params `json:"params"`
}