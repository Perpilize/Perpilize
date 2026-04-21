package liquidation

import (
	"encoding/json"

	abci    "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk     "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	gwruntime "github.com/grpc-ecosystem/grpc-gateway/runtime"

	"github.com/perpilize/perpilize/x/liquidation/keeper"
)

var _ module.AppModule = AppModule{}

type AppModule struct {
	cdc    codec.Codec
	keeper keeper.Keeper
}

func NewAppModule(cdc codec.Codec, k keeper.Keeper) AppModule {
	return AppModule{cdc: cdc, keeper: k}
}

func (AppModule) Name() string                                { return "liquidation" }
func (AppModule) IsAppModule()                                {}
func (AppModule) IsOnePerModuleType()                         {}
func (AppModule) RegisterInterfaces(_ codectypes.InterfaceRegistry) {}
func (AppModule) RegisterLegacyAminoCodec(_ *codec.LegacyAmino) {}
func (AppModule) DefaultGenesis(_ codec.JSONCodec) json.RawMessage { return []byte("{}") }
func (AppModule) ValidateGenesis(_ codec.JSONCodec, _ client.TxEncodingConfig, _ json.RawMessage) error {
	return nil
}
func (AppModule) RegisterGRPCGatewayRoutes(_ client.Context, _ *gwruntime.ServeMux) {}

func (m AppModule) InitGenesis(_ sdk.Context, _ codec.JSONCodec, _ json.RawMessage) []abci.ValidatorUpdate {
	return nil
}
func (m AppModule) ExportGenesis(_ sdk.Context, _ codec.JSONCodec) json.RawMessage {
	return []byte("{}")
}
func (m AppModule) BeginBlock(_ sdk.Context)                    {}
func (m AppModule) EndBlock(_ sdk.Context) []abci.ValidatorUpdate { return nil }
func (m AppModule) ConsensusVersion() uint64                    { return 1 }