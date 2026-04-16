package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type Params struct {
    InitialMarginRatio     sdk.Dec `json:"imr"`
    MaintenanceMarginRatio sdk.Dec `json:"mmr"`
    LiquidationPenaltyMin  sdk.Dec `json:"penalty_min"`
    PartialLiquidationRate sdk.Dec `json:"partial_liq_rate"`
}

func DefaultParams() Params {
    return Params{
        InitialMarginRatio:     sdk.MustNewDecFromStr("0.05"),
        MaintenanceMarginRatio: sdk.MustNewDecFromStr("0.03"),
        LiquidationPenaltyMin:  sdk.MustNewDecFromStr("0.02"),
        PartialLiquidationRate: sdk.MustNewDecFromStr("0.5"),
    }
}