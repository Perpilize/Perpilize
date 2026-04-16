package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type Account struct {
    Address         string   `json:"address"`
    Collateral      sdk.Dec  `json:"collateral"`
    UnrealizedPnL   sdk.Dec  `json:"unrealized_pnl"`
    FundingPnL      sdk.Dec  `json:"funding_pnl"`
    MarginUsed      sdk.Dec  `json:"margin_used"`
}