package types

import (
	"errors"

	"cosmossdk.io/math"
)

// ── Params ────────────────────────────────────────────────────────────────────

type Params struct {
	InitialMarginRatio     math.LegacyDec `json:"imr"`
	MaintenanceMarginRatio math.LegacyDec `json:"mmr"`
	LiquidationPenaltyMin  math.LegacyDec `json:"penalty_min"`
	PartialLiquidationRate math.LegacyDec `json:"partial_liq_rate"`
}

func DefaultParams() Params {
	return Params{
		InitialMarginRatio:     math.LegacyMustNewDecFromStr("0.05"),
		MaintenanceMarginRatio: math.LegacyMustNewDecFromStr("0.03"),
		LiquidationPenaltyMin:  math.LegacyMustNewDecFromStr("0.02"),
		PartialLiquidationRate: math.LegacyMustNewDecFromStr("0.50"),
	}
}

// ── Account ───────────────────────────────────────────────────────────────────

type Account struct {
	Address       string         `json:"address"`
	Collateral    math.LegacyDec `json:"collateral"`
	UnrealizedPnL math.LegacyDec `json:"unrealized_pnl"`
	FundingPnL    math.LegacyDec `json:"funding_pnl"`
	MarginUsed    math.LegacyDec `json:"margin_used"`
}

func (a *Account) Reset()         {}
func (a *Account) String() string { return a.Address }
func (a *Account) ProtoMessage()  {}
func (a *Account) Marshal() ([]byte, error) { return []byte{}, nil }
func (a *Account) Unmarshal([]byte) error   { return nil }

// ── MarginRisk ────────────────────────────────────────────────────────────────

type MarginRisk struct {
	Equity         math.LegacyDec
	IMR            math.LegacyDec
	MMR            math.LegacyDec
	HealthRatio    math.LegacyDec
	IsLiquidatable bool
}

// ── Errors ────────────────────────────────────────────────────────────────────

var (
	ErrInvalidAmount            = errors.New("amount must be positive")
	ErrInsufficientCollateral   = errors.New("insufficient collateral")
	ErrWithdrawalBreachesMargin = errors.New("withdrawal would breach maintenance margin")
	ErrAccountNotFound          = errors.New("margin account not found")
	ErrBelowMaintenanceMargin   = errors.New("account below maintenance margin")
)