package margin

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/margin/keeper"
	"github.com/perpilize/perpilize/x/margin/types"
)

type GenesisState struct {
	Params   types.Params    `json:"params"`
	Accounts []types.Account `json:"accounts"`
}

func DefaultGenesisState() GenesisState {
	return GenesisState{
		Params:   types.DefaultParams(),
		Accounts: []types.Account{},
	}
}

func InitGenesis(ctx sdk.Context, k keeper.Keeper, gs GenesisState) {
	for _, acc := range gs.Accounts {
		k.SetAccount(ctx, acc)
	}
}

func ExportGenesis(ctx sdk.Context, k keeper.Keeper) GenesisState {
	return GenesisState{
		Params:   k.GetParams(),
		Accounts: k.GetAllAccounts(ctx),
	}
}