package app

import (
	"encoding/json"
	"io"

	abci "github.com/cometbft/cometbft/abci/types"

	"github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	paramkeeper "github.com/cosmos/cosmos-sdk/x/params/keeper"
	params "github.com/cosmos/cosmos-sdk/x/params/types"

	margin "github.com/perpilize/perpilize/x/margin"
	marginkeeper "github.com/perpilize/perpilize/x/margin/keeper"
	margintypes "github.com/perpilize/perpilize/x/margin/types"

	position "github.com/perpilize/perpilize/x/position"
	positionkeeper "github.com/perpilize/perpilize/x/position/keeper"

	settlement "github.com/perpilize/perpilize/x/settlement"
	settlementkeeper "github.com/perpilize/perpilize/x/settlement/keeper"
	settlementtypes "github.com/perpilize/perpilize/x/settlement/types"

	funding "github.com/perpilize/perpilize/x/funding"
	fundingkeeper "github.com/perpilize/perpilize/x/funding/keeper"

	oracle "github.com/perpilize/perpilize/x/oracle"
	oraclekeeper "github.com/perpilize/perpilize/x/oracle/keeper"

	liquidation "github.com/perpilize/perpilize/x/liquidation"
	liquidationkeeper "github.com/perpilize/perpilize/x/liquidation/keeper"
)

type App struct {
	*baseapp.BaseApp

	appCodec codec.Codec
	cdc      *codec.LegacyAmino
	registry codectypes.InterfaceRegistry

	keys map[string]*storetypes.KVStoreKey

	ParamsKeeper      paramkeeper.Keeper
	MarginKeeper      marginkeeper.Keeper
	PositionKeeper    positionkeeper.Keeper
	SettlementKeeper  settlementkeeper.Keeper
	FundingKeeper     fundingkeeper.Keeper
	OracleKeeper      oraclekeeper.Keeper
	LiquidationKeeper liquidationkeeper.Keeper

	mm *module.Manager
}

func NewApp(logger io.Writer) *App {
	interfaceRegistry := codectypes.NewInterfaceRegistry()
	appCodec := codec.NewProtoCodec(interfaceRegistry)
	amino := codec.NewLegacyAmino()

	bApp := baseapp.NewBaseApp("perpilize", logger, nil, nil)

	keys := map[string]*storetypes.KVStoreKey{
		"margin":      storetypes.NewKVStoreKey("margin"),
		"position":    storetypes.NewKVStoreKey("position"),
		"settlement":  storetypes.NewKVStoreKey("settlement"),
		"funding":     storetypes.NewKVStoreKey("funding"),
		"oracle":      storetypes.NewKVStoreKey("oracle"),
		"liquidation": storetypes.NewKVStoreKey("liquidation"),
		"params":      storetypes.NewKVStoreKey("params"),
	}

	app := &App{
		BaseApp:  bApp,
		appCodec: appCodec,
		cdc:      amino,
		registry: interfaceRegistry,
		keys:     keys,
	}

	// -------------------------
	// Params
	// -------------------------
	app.ParamsKeeper = paramkeeper.NewKeeper(
		appCodec,
		amino,
		keys["params"],
	)

	_ = app.ParamsKeeper.Subspace("margin").WithKeyTable(params.NewKeyTable())
	_ = app.ParamsKeeper.Subspace("position")
	_ = app.ParamsKeeper.Subspace("settlement")
	_ = app.ParamsKeeper.Subspace("funding")
	_ = app.ParamsKeeper.Subspace("liquidation")

	// -------------------------
	// Keepers (dependency order matters)
	// -------------------------

	// 1. Oracle — no dependencies
	app.OracleKeeper = oraclekeeper.NewKeeper(
		appCodec,
		keys["oracle"],
	)

	// 2. Funding — depends on oracle
	app.FundingKeeper = fundingkeeper.NewKeeper(
		appCodec,
		keys["funding"],
		app.OracleKeeper,
	)

	// 3. Position — no keeper dependencies (oracle read via margin)
	app.PositionKeeper = positionkeeper.NewKeeper(
		appCodec,
		keys["position"],
	)

	// 4. Settlement — depends on position + funding
	//    NOTE: Does NOT take margin keeper here — that would create a cycle.
	//    MarginKeeper is injected post-construction via SetMarginKeeper().
	app.SettlementKeeper = settlementkeeper.NewKeeper(
		appCodec,
		keys["settlement"],
		app.PositionKeeper,
		app.FundingKeeper,
		settlementtypes.DefaultParams(),
	)

	// 5. Margin — depends on oracle, funding, position, settlement
	app.MarginKeeper = marginkeeper.NewKeeper(
		appCodec,
		keys["margin"],
		app.OracleKeeper,
		app.FundingKeeper,
		app.PositionKeeper,
		app.SettlementKeeper,
	)

	// 6. Break the settlement→margin cycle: inject MarginKeeper post-construction.
	//    Settlement needs margin only for DeductMargin() inside ExecuteTrade().
	app.SettlementKeeper.SetMarginKeeper(margintypes.MarginKeeperAdapter{Keeper: app.MarginKeeper})

	// 7. Liquidation — depends on margin + position + oracle
	app.LiquidationKeeper = liquidationkeeper.NewKeeper(
		appCodec,
		keys["liquidation"],
		app.MarginKeeper,
		app.PositionKeeper,
		app.OracleKeeper,
	)

	// -------------------------
	// Module wiring
	// -------------------------
	marginModule := margin.NewAppModule(appCodec, app.MarginKeeper)
	positionModule := position.NewAppModule(appCodec, app.PositionKeeper)
	settlementModule := settlement.NewAppModule(appCodec, app.SettlementKeeper)
	fundingModule := funding.NewAppModule(appCodec, app.FundingKeeper)
	oracleModule := oracle.NewAppModule(appCodec, app.OracleKeeper)
	liquidationModule := liquidation.NewAppModule(appCodec, app.LiquidationKeeper)

	app.mm = module.NewManager(
		oracleModule,
		fundingModule,
		positionModule,
		marginModule,
		settlementModule,
		liquidationModule,
	)

	// BeginBlock order:
	//   1. funding  — update cumulative funding indices for all markets
	//   2. position — any position-level begin-block work
	app.mm.SetOrderBeginBlockers(
		"oracle",
		"funding",
		"position",
	)

	// EndBlock order:
	//   1. margin      — scan all accounts, auto-liquidate unhealthy ones
	//   2. liquidation — process any externally submitted MsgLiquidate messages
	app.mm.SetOrderEndBlockers(
		"margin",
		"liquidation",
	)

	app.mm.SetOrderInitGenesis(
		"oracle",
		"funding",
		"position",
		"margin",
		"settlement",
		"liquidation",
	)

	app.mm.SetOrderExportGenesis(
		"oracle",
		"funding",
		"position",
		"margin",
		"settlement",
		"liquidation",
	)

	app.MountKVStores(keys)

	app.SetInitChainer(app.InitChainer)
	app.SetBeginBlocker(app.BeginBlocker)
	app.SetEndBlocker(app.EndBlocker)

	app.RegisterServices()

	return app
}

// -------------------------
// ABCI lifecycle hooks
// -------------------------

func (app *App) InitChainer(ctx sdk.Context, req abci.RequestInitChain) abci.ResponseInitChain {
	var genesisState map[string]json.RawMessage
	if err := json.Unmarshal(req.AppStateBytes, &genesisState); err != nil {
		panic(err)
	}
	return app.mm.InitGenesis(ctx, app.appCodec, genesisState)
}

func (app *App) BeginBlocker(ctx sdk.Context, req abci.RequestBeginBlock) abci.ResponseBeginBlock {
	return app.mm.BeginBlock(ctx, req)
}

func (app *App) EndBlocker(ctx sdk.Context, req abci.RequestEndBlock) abci.ResponseEndBlock {
	return app.mm.EndBlock(ctx, req)
}

func (app *App) RegisterServices() {
	// Register gRPC query and tx services for each module here.
	// Example: settlementtypes.RegisterMsgServer(app.MsgServiceRouter(), app.SettlementKeeper)
}