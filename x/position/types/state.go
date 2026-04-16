package types

import sdk "github.com/cosmos/cosmos-sdk/types"

type Position struct {
    Trader      string   `json:"trader"`
    MarketID    string   `json:"market_id"`
    Size        sdk.Dec  `json:"size"`        
    EntryPrice  sdk.Dec  `json:"entry_price"`
    Margin      sdk.Dec  `json:"margin"`
    LastFunding sdk.Dec  `json:"last_funding"`
}