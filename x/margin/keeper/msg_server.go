package keeper

import (
	"context"

	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/margin/types"
)

type msgServer struct{ k Keeper }

func NewMsgServerImpl(k Keeper) types.MsgServer {
	return &msgServer{k}
}

func (s *msgServer) Deposit(goCtx context.Context, msg *types.MsgDeposit) (*types.MsgDepositResponse, error) {
	ctx    := sdk.UnwrapSDKContext(goCtx)
	amount, err := math.LegacyNewDecFromStr(msg.Amount)
	if err != nil {
		return nil, err
	}
	if err := s.k.Deposit(ctx, msg.Sender, amount); err != nil {
		return nil, err
	}
	return &types.MsgDepositResponse{}, nil
}

func (s *msgServer) Withdraw(goCtx context.Context, msg *types.MsgWithdraw) (*types.MsgWithdrawResponse, error) {
	ctx    := sdk.UnwrapSDKContext(goCtx)
	amount, err := math.LegacyNewDecFromStr(msg.Amount)
	if err != nil {
		return nil, err
	}
	if err := s.k.Withdraw(ctx, msg.Sender, amount); err != nil {
		return nil, err
	}
	return &types.MsgWithdrawResponse{}, nil
}