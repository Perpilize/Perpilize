package app

import (
	"encoding/json"

	abci      "github.com/cometbft/cometbft/abci/types"
	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	margin           "github.com/perpilize/perpilize/x/margin"
	marginkeeper     "github.com/perpilize/perpilize/x/margin/keeper"
	margintypes      "github.com/perpilize/perpilize/x/margin/types"
	position         "github.com/perpilize/perpilize/x/position"
	positionkeeper   "github.com/perpilize/perpilize/x/position/keeper"
	settlement       "github.com/perpilize/perpilize/x/settlement"
	settlementkeeper "github.com/perpilize/perpilize/x/settlement/keeper"
	settlementtypes  "github.com/perpilize/perpilize/x/settlement/types"
	funding          "github.com/perpilize/perpilize/x/funding"
	fundingkeeper    "github.com/perpilize/perpilize/x/funding/keeper"
	oracle           "github.com/perpilize/perpilize/x/oracle"
	oraclekeeper     "github.com/perpilize/perpilize/x/oracle/keeper"
	liquidation      "github.com/perpilize/perpilize/x/liquidation"
	liquidationkeeper "github.com/perpilize/perpilize/x/liquidation/keeper"
)

type App struct {
	*baseapp.BaseApp

	appCodec codec.Codec
	cdc      *codec.LegacyAmino
	registry codectypes.InterfaceRegistry

	keys map[string]*storetypes.KVStoreKey

	MarginKeeper      marginkeeper.Keeper
	PositionKeeper    positionkeeper.Keeper
	SettlementKeeper  settlementkeeper.Keeper
	FundingKeeper     fundingkeeper.Keeper
	OracleKeeper      oraclekeeper.Keeper
	LiquidationKeeper liquidationkeeper.Keeper

	mm *module.Manager
}

func NewApp(logger log.Logger) *App {
	interfaceRegistry := codectypes.NewInterfaceRegistry()
	appCodec          := codec.NewProtoCodec(interfaceRegistry)
	amino             := codec.NewLegacyAmino()

	bApp := baseapp.NewBaseApp("perpilize", logger, nil, nil)

	keys := map[string]*storetypes.KVStoreKey{
		"margin":      storetypes.NewKVStoreKey("margin"),
		"position":    storetypes.NewKVStoreKey("position"),
		"settlement":  storetypes.NewKVStoreKey("settlement"),
		"funding":     storetypes.NewKVStoreKey("funding"),
		"oracle":      storetypes.NewKVStoreKey("oracle"),
		"liquidation": storetypes.NewKVStoreKey("liquidation"),
	}

	app := &App{
		BaseApp:  bApp,
		appCodec: appCodec,
		cdc:      amino,
		registry: interfaceRegistry,
		keys:     keys,
	}

	// ── Keepers ───────────────────────────────────────────────────────────────

	app.OracleKeeper = oraclekeeper.NewKeeper(appCodec, keys["oracle"])
	app.FundingKeeper = fundingkeeper.NewKeeper(appCodec, keys["funding"], app.OracleKeeper)
	app.PositionKeeper = positionkeeper.NewKeeper(appCodec, keys["position"])
	app.SettlementKeeper = settlementkeeper.NewKeeper(
		appCodec, keys["settlement"],
		app.PositionKeeper, app.FundingKeeper,
		settlementtypes.DefaultParams(),
	)
	app.MarginKeeper = marginkeeper.NewKeeper(
		appCodec, keys["margin"],
		app.OracleKeeper, app.FundingKeeper,
		app.PositionKeeper, app.SettlementKeeper,
	)
	app.SettlementKeeper.SetMarginKeeper(
		margintypes.MarginKeeperAdapter{Keeper: app.MarginKeeper},
	)
	app.LiquidationKeeper = liquidationkeeper.NewKeeper(
		appCodec, keys["liquidation"],
		app.MarginKeeper, app.PositionKeeper, app.OracleKeeper,
	)

	// ── Modules ───────────────────────────────────────────────────────────────

	app.mm = module.NewManager(
		oracle.NewAppModule(appCodec, app.OracleKeeper),
		funding.NewAppModule(appCodec, app.FundingKeeper),
		position.NewAppModule(appCodec, app.PositionKeeper),
		margin.NewAppModule(appCodec, app.MarginKeeper),
		settlement.NewAppModule(appCodec, app.SettlementKeeper),
		liquidation.NewAppModule(appCodec, app.LiquidationKeeper),
	)

	app.mm.SetOrderInitGenesis(
		"oracle", "funding", "position", "margin", "settlement", "liquidation",
	)

	app.MountKVStores(keys)
	app.SetInitChainer(app.InitChainer)

	return app
}

// InitChainer implements the correct SDK v0.50 signature.
func (app *App) InitChainer(ctx sdk.Context, req *abci.RequestInitChain) (*abci.ResponseInitChain, error) {
	var genesisState map[string]json.RawMessage
	if err := json.Unmarshal(req.AppStateBytes, &genesisState); err != nil {
		return nil, err
	}
	return app.mm.InitGenesis(ctx, app.appCodec, genesisState)
}