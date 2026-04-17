package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/settlement/types"
)

type msgServer struct {
	Keeper
}

func NewMsgServerImpl(k Keeper) types.MsgServer {
	return &msgServer{Keeper: k}
}

// CORE ENGINE ENTRYPOINT
func (m msgServer) SettleMatchedOrders(
	goCtx context.Context,
	msg *types.MsgSettleMatchedOrders,
) (*types.MsgSettleMatchedOrdersResponse, error) {

	ctx := sdk.UnwrapSDKContext(goCtx)

	for _, t := range msg.Trades {

		size := sdk.MustNewDecFromStr(t.Size)
		price := sdk.MustNewDecFromStr(t.ExecutionPrice)

		var buyer, seller string

		if t.IsTakerLong {
			buyer = t.TakerAddress
			seller = t.MakerAddress
		} else {
			buyer = t.MakerAddress
			seller = t.TakerAddress
		}

		// Apply trade to both sides
		_ = m.position.ApplyTrade(ctx, buyer, t.MarketId, size, price)
		_ = m.position.ApplyTrade(ctx, seller, t.MarketId, size.Neg(), price)

		// Fees
		_ = m.DeductFee(ctx, buyer, size.Mul(price).Mul(m.params.TakerFeeRate))
		_ = m.DeductFee(ctx, seller, size.Mul(price).Mul(m.params.MakerFeeRate))

		// PnL settlement
		m.SettlePnL(ctx, buyer, sdk.ZeroDec())
		m.SettlePnL(ctx, seller, sdk.ZeroDec())
	}

	return &types.MsgSettleMatchedOrdersResponse{
		SettlementBatchId: uint64(ctx.BlockHeight()),
	}, nil
}