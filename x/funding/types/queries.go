package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type QueryFundingRateRequest struct {
    MarketID string `json:"market_id"`
}

type QueryFundingRateResponse struct {
    MarketID string  `json:"market_id"`
    Rate     sdk.Dec `json:"rate"`
}

type QueryCumulativeFundingRequest struct {
    MarketID string `json:"market_id"`
    Address  string `json:"address"`
}

type QueryCumulativeFundingResponse struct {
    MarketID string  `json:"market_id"`
    Address  string  `json:"address"`
    Funding  sdk.Dec `json:"funding"`
}

type QueryParamsRequest struct{}

type QueryParamsResponse struct {
    Params Params `json:"params"`
}