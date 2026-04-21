package margin

import (
	"cosmossdk.io/math"
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/margin/keeper"
	"github.com/perpilize/perpilize/x/margin/types"
)

type msgServer struct {
	keeper keeper.Keeper
}

func NewMsgServerImpl(k keeper.Keeper) types.MsgServer {
	return &msgServer{keeper: k}
}

func (s *msgServer) Deposit(goCtx context.Context, msg *types.MsgDeposit) (*types.MsgDepositResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	amount, err := math.LegacyNewDecFromStr(msg.Amount)
	if err != nil {
		return nil, err
	}
	if err := s.keeper.Deposit(ctx, msg.Sender, amount); err != nil {
		return nil, err
	}
	return &types.MsgDepositResponse{}, nil
}

func (s *msgServer) Withdraw(goCtx context.Context, msg *types.MsgWithdraw) (*types.MsgWithdrawResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	amount, err := math.LegacyNewDecFromStr(msg.Amount)
	if err != nil {
		return nil, err
	}
	if err := s.keeper.Withdraw(ctx, msg.Sender, amount); err != nil {
		return nil, err
	}
	return &types.MsgWithdrawResponse{}, nil
}