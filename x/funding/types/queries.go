package types

import "cosmossdk.io/math"

type QueryMarketFundingRequest struct {
	MarketID string `json:"market_id"`
}

type QueryMarketFundingResponse struct {
	Rate            math.LegacyDec `json:"rate"`
	CumulativeRate  math.LegacyDec `json:"cumulative_rate"`
}