package types

// Params holds module-level configuration for the funding engine.
type Params struct {
	// FundingIntervalSeconds is the period over which funding is normalised (default 3600 = 1h).
	FundingIntervalSeconds int64 `json:"funding_interval_seconds"`

	// MaxFundingRateBps is the maximum absolute funding rate in basis points per interval (default 75 = 0.75%).
	MaxFundingRateBps int64 `json:"max_funding_rate_bps"`
}

func DefaultParams() Params {
	return Params{
		FundingIntervalSeconds: 3600, // 1 hour
		MaxFundingRateBps:      75,   // 0.75% per hour cap
	}
}