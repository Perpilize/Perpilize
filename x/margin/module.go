package margin

import (
	"encoding/json"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	abci "github.com/cometbft/cometbft/abci/types"

	"github.com/perpilize/perpilize/x/margin/keeper"
	"github.com/perpilize/perpilize/x/margin/types"
)

var _ module.AppModule = AppModule{}

type AppModule struct {
	cdc    codec.Codec
	keeper keeper.Keeper
}

func NewAppModule(cdc codec.Codec, k keeper.Keeper) AppModule {
	return AppModule{cdc: cdc, keeper: k}
}

func (AppModule) Name() string                                    { return types.ModuleName }
func (AppModule) RegisterInterfaces(_ interface{})                {}
func (AppModule) DefaultGenesis(_ codec.JSONCodec) json.RawMessage { return []byte("{}") }
func (AppModule) ValidateGenesis(_ codec.JSONCodec, _ interface{}, _ json.RawMessage) error {
	return nil
}
func (AppModule) RegisterRESTRoutes(_ interface{}, _ interface{}) {}
func (AppModule) RegisterGRPCGatewayRoutes(_ interface{}, _ interface{}) {}
func (AppModule) GetTxCmd() interface{}                           { return nil }
func (AppModule) GetQueryCmd() interface{}                        { return nil }
func (AppModule) RegisterLegacyAminoCodec(_ *codec.LegacyAmino)  {}

func (m AppModule) InitGenesis(ctx sdk.Context, _ codec.JSONCodec, _ json.RawMessage) []abci.ValidatorUpdate {
	return nil
}

func (m AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	return []byte("{}")
}

func (m AppModule) BeginBlock(_ sdk.Context, _ abci.RequestBeginBlock) {}

func (m AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
	m.keeper.EndBlock(ctx)
	return nil
}

func (m AppModule) ConsensusVersion() uint64 { return 1 }