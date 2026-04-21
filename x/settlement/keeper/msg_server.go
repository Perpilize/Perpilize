package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/settlement/types"
)

type settlementMsgServer struct{ k Keeper }

func NewMsgServerImpl(k Keeper) types.MsgServer {
	return &settlementMsgServer{k}
}

func (s *settlementMsgServer) SettleMatchedOrders(
	goCtx context.Context,
	msg *types.MsgSettleMatchedOrders,
) (*types.MsgSettleMatchedOrdersResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	batchID, err := s.k.SettleMatchedOrders(ctx, msg.Matcher, msg.Trades)
	if err != nil {
		return nil, err
	}
	return &types.MsgSettleMatchedOrdersResponse{SettlementBatchId: batchID}, nil
}