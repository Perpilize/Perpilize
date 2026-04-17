package keeper

import (
	"context"

	"github.com/perpilize/perpilize/x/funding/types"
)

type queryServer struct {
	Keeper
}

func NewQueryServerImpl(k Keeper) types.QueryServer {
	return &queryServer{Keeper: k}
}

func (q queryServer) MarketFunding(
	ctx context.Context,
	req *types.QueryMarketFundingRequest,
) (*types.QueryMarketFundingResponse, error) {

	rate := q.GetFundingRate(ctx, req.MarketId)

	return &types.QueryMarketFundingResponse{
		Rate: rate,
	}, nil
}