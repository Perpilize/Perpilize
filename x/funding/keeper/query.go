package keeper

import (
    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/perpilize/perpilize/x/funding/types"
)

func (k FundingKeeper) FundingRate(ctx sdk.Context, req types.QueryFundingRateRequest, markPrice sdk.Dec) (types.QueryFundingRateResponse, error) {
    rate, err := k.ComputeFundingRate(ctx, req.MarketID, markPrice)
    if err != nil {
        return types.QueryFundingRateResponse{}, err
    }

    return types.QueryFundingRateResponse{
        MarketID: req.MarketID,
        Rate:     rate,
    }, nil
}

func (k FundingKeeper) CumulativeFunding(ctx sdk.Context, req types.QueryCumulativeFundingRequest) (types.QueryCumulativeFundingResponse, error) {
    funding, err := k.GetCumulativeFunding(ctx, req.MarketID, req.Address)
    if err != nil {
        return types.QueryCumulativeFundingResponse{}, err
    }

    return types.QueryCumulativeFundingResponse{
        MarketID: req.MarketID,
        Address:  req.Address,
        Funding:  funding,
    }, nil
}

func (k FundingKeeper) Params(ctx sdk.Context) types.QueryParamsResponse {
    return types.QueryParamsResponse{
        Params: k.params,
    }
}