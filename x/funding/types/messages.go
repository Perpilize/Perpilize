package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type MsgUpdateFundingParams struct {
    Sender          sdk.AccAddress `json:"sender"`
    MaxFundingRate  float64        `json:"max_funding_rate"`
    FundingInterval int64          `json:"funding_interval"` // in seconds
}