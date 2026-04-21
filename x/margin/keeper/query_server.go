package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/margin/types"
)

type queryServer struct{ k Keeper }

func NewQueryServerImpl(k Keeper) types.QueryServer {
	return &queryServer{k}
}

func (q *queryServer) Params(goCtx context.Context, _ *types.QueryParamsRequest) (*types.QueryParamsResponse, error) {
	return &types.QueryParamsResponse{Params: q.k.GetParams()}, nil
}

func (q *queryServer) MarginAccount(goCtx context.Context, req *types.QueryMarginAccountRequest) (*types.QueryMarginAccountResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	acc := q.k.GetAccount(ctx, req.Owner)
	return &types.QueryMarginAccountResponse{Account: acc}, nil
}

func (q *queryServer) MarginRisk(goCtx context.Context, req *types.QueryMarginAccountRequest) (*types.QueryMarginRiskResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	equity, err := q.k.Equity(ctx, req.Owner)
	if err != nil {
		return nil, err
	}
	imr, err := q.k.InitialMarginRequired(ctx, req.Owner)
	if err != nil {
		return nil, err
	}
	mmr, err := q.k.MaintenanceMarginRequired(ctx, req.Owner)
	if err != nil {
		return nil, err
	}
	ratio, err := q.k.HealthRatio(ctx, req.Owner)
	if err != nil {
		return nil, err
	}
	liquidatable, err := q.k.IsLiquidatable(ctx, req.Owner)
	if err != nil {
		return nil, err
	}

	return &types.QueryMarginRiskResponse{
		Risk: types.MarginRisk{
			Equity:         equity,
			IMR:            imr,
			MMR:            mmr,
			HealthRatio:    ratio,
			IsLiquidatable: liquidatable,
		},
	}, nil
}