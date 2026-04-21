package types

import "context"

// MsgServer handles state-changing margin messages.
type MsgServer interface {
	Deposit(context.Context, *MsgDeposit)  (*MsgDepositResponse, error)
	Withdraw(context.Context, *MsgWithdraw) (*MsgWithdrawResponse, error)
}

type MsgDepositResponse  struct{}
type MsgWithdrawResponse struct{}

// QueryServer handles read-only margin queries.
type QueryServer interface {
	Params(context.Context, *QueryParamsRequest)         (*QueryParamsResponse, error)
	MarginAccount(context.Context, *QueryMarginAccountRequest) (*QueryMarginAccountResponse, error)
	MarginRisk(context.Context, *QueryMarginAccountRequest)    (*QueryMarginRiskResponse, error)
}

// Query request / response types
type QueryParamsRequest  struct{}
type QueryParamsResponse struct{ Params Params }

type QueryMarginAccountRequest  struct{ Owner string }
type QueryMarginAccountResponse struct{ Account Account }
type QueryMarginRiskResponse    struct{ Risk MarginRisk }