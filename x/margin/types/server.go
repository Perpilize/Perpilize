package types

import "context"

type MsgServer interface {
	Deposit(context.Context, *MsgDeposit) (*MsgDepositResponse, error)
	Withdraw(context.Context, *MsgWithdraw) (*MsgWithdrawResponse, error)
}

type MsgDepositResponse struct{}
type MsgWithdrawResponse struct{}