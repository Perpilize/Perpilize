package types

import "cosmossdk.io/math"

// FundingRate holds the current and cumulative funding rate for a market.
type FundingRate struct {
	MarketID            string         `json:"market_id"`
	CurrentRate         math.LegacyDec `json:"current_rate"`
	CumulativeRate      math.LegacyDec `json:"cumulative_rate"`
	LastUpdatedTimestamp int64         `json:"last_updated_timestamp"`
}