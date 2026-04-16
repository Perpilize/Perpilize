package types

import "time"

type Params struct {
    Heartbeat          time.Duration `json:"heartbeat" yaml:"heartbeat"`
    DeviationThreshold float64       `json:"deviation_threshold" yaml:"deviation_threshold"`
    CircuitBreaker     bool          `json:"circuit_breaker" yaml:"circuit_breaker"`
}

func DefaultParams() Params {
    return Params{
        Heartbeat:          5 * time.Second,
        DeviationThreshold: 0.05,
        CircuitBreaker:     false,
    }
}