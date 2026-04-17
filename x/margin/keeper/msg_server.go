package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/margin/types"
)

type msgServer struct {
	Keeper
}

func NewMsgServerImpl(k Keeper) types.MsgServer {
	return &msgServer{Keeper: k}
}

func (m msgServer) DepositCollateral(
	goCtx context.Context,
	msg *types.MsgDepositCollateral,
) (*types.MsgDepositCollateralResponse, error) {

	ctx := sdk.UnwrapSDKContext(goCtx)

	addr := msg.Depositor

	err := m.settlement.AddCollateral(ctx, addr, sdk.NewDecFromInt(msg.Amount.Amount))
	if err != nil {
		return nil, err
	}

	return &types.MsgDepositCollateralResponse{}, nil
}

func (m msgServer) WithdrawCollateral(
	goCtx context.Context,
	msg *types.MsgWithdrawCollateral,
) (*types.MsgWithdrawCollateralResponse, error) {

	ctx := sdk.UnwrapSDKContext(goCtx)

	addr := msg.Withdrawer
	amount := sdk.NewDecFromInt(msg.Amount.Amount)

	err := m.settlement.RemoveCollateral(ctx, addr, amount)
	if err != nil {
		return nil, err
	}

	hr, err := m.HealthRatio(ctx, addr)
	if err != nil {
		return nil, err
	}

	if hr.LT(sdk.OneDec()) {
		return nil, sdk.ErrInsufficientFunds
	}

	return &types.MsgWithdrawCollateralResponse{}, nil
}