package keeper

import (
	"context"

	"github.com/perpilize/perpilize/x/position/types"
)

type queryServer struct {
	Keeper
}

func NewQueryServerImpl(k Keeper) types.QueryServer {
	return &queryServer{Keeper: k}
}

func (q queryServer) Positions(
	ctx context.Context,
	req *types.QueryPositionsRequest,
) (*types.QueryPositionsResponse, error) {

	positions := q.GetPositions(ctx, req.Owner)

	return &types.QueryPositionsResponse{
		Positions: positions,
	}, nil
}