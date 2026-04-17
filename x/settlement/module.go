package settlement

import (
	"encoding/json"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	"github.com/perpilize/perpilize/x/settlement/keeper"
	"github.com/perpilize/perpilize/x/settlement/types"
)

type AppModule struct {
	cdc    codec.Codec
	keeper keeper.Keeper
}

func NewAppModule(cdc codec.Codec, k keeper.Keeper) AppModule {
	return AppModule{cdc: cdc, keeper: k}
}

func (am AppModule) Name() string { return types.ModuleName }

func (am AppModule) RegisterServices(cfg module.Configurator) {
	types.RegisterMsgServer(cfg.MsgServer(), keeper.NewMsgServerImpl(am.keeper))
	types.RegisterQueryServer(cfg.QueryServer(), keeper.NewQueryServerImpl(am.keeper))
}

func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, data json.RawMessage) {
	var state types.GenesisState
	cdc.MustUnmarshalJSON(data, &state)
	am.keeper.SetParams(ctx, state.Params)
}

func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	state := types.GenesisState{
		Params: am.keeper.GetParams(ctx),
	}
	return cdc.MustMarshalJSON(&state)
}

func (am AppModule) ConsensusVersion() uint64 { return 1 }