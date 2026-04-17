package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/margin/types"
)

type queryServer struct {
	Keeper
}

func NewQueryServerImpl(k Keeper) types.QueryServer {
	return &queryServer{Keeper: k}
}

func (q queryServer) MarginRisk(
	goCtx context.Context,
	req *types.QueryMarginAccountRequest,
) (*types.QueryMarginRiskResponse, error) {

	ctx := sdk.UnwrapSDKContext(goCtx)

	equity, _ := q.ComputeEquity(ctx, req.Owner)
	imr, mmr, _ := q.ComputeMarginRequirement(ctx, req.Owner)
	hr, _ := q.HealthRatio(ctx, req.Owner)

	return &types.QueryMarginRiskResponse{
		Risk: types.MarginRisk{
			Equity:         equity.String(),
			Imr:            imr.String(),
			Mmr:            mmr.String(),
			HealthRatio:    hr.String(),
			IsLiquidatable: hr.LT(sdk.OneDec()),
		},
	}, nil
}