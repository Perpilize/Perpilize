package types

import "time"

type Params struct {
    MaxFundingRate   float64       `json:"max_funding_rate" yaml:"max_funding_rate"`
    FundingInterval  time.Duration `json:"funding_interval" yaml:"funding_interval"`
}

func DefaultParams() Params {
    return Params{
        MaxFundingRate:  0.005,           
        FundingInterval: 1 * time.Second, 
    }
}