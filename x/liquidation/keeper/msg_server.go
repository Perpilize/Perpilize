package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/liquidation/types"
)

type msgServer struct {
	Keeper
}

func NewMsgServerImpl(k Keeper) types.MsgServer {
	return &msgServer{Keeper: k}
}

func (m msgServer) Liquidate(
	goCtx context.Context,
	msg *types.MsgLiquidate,
) (*types.MsgLiquidateResponse, error) {

	ctx := sdk.UnwrapSDKContext(goCtx)

	target := msg.TargetAccount

	err := m.margin.Liquidate(ctx, target)
	if err != nil {
		return nil, err
	}

	penalty := sdk.NewDecWithPrec(5, 2) // 5%

	m.settlement.ApplyLiquidation(ctx, target, penalty, "insurance")

	return &types.MsgLiquidateResponse{
		RewardedAmount: penalty.String(),
	}, nil
}