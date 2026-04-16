package keeper

import (
    sdk "github.com/cosmos/cosmos-sdk/types"
    "github.com/perpilize/perpilize/x/oracle/types"
)

func (k OracleKeeper) Price(ctx sdk.Context, req types.QueryPriceRequest) (types.QueryPriceResponse, error) {
    price, ts, err := k.GetPrice(ctx, req.MarketID)
    if err != nil {
        return types.QueryPriceResponse{}, err
    }

    return types.QueryPriceResponse{
        MarketID:  req.MarketID,
        Price:     price,
        Timestamp: ts,
    }, nil
}

func (k OracleKeeper) Params(ctx sdk.Context) types.QueryParamsResponse {
    return types.QueryParamsResponse{
        Params: k.params,
    }
}