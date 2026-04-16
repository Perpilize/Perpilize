package app

import (
	"io"
	"os"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/server"
	"github.com/cosmos/cosmos-sdk/store"
	"github.com/cosmos/cosmos-sdk/x/auth"
	authkeeper "github.com/cosmos/cosmos-sdk/x/auth/keeper"
	"github.com/cosmos/cosmos-sdk/x/bank"
	bankkeeper "github.com/cosmos/cosmos-sdk/x/bank/keeper"
	"github.com/cosmos/cosmos-sdk/x/params"

	ethermint "github.com/evmos/ethermint/app"
	evmkeeper "github.com/evmos/ethermint/x/evm/keeper"

	"github.com/initia-labs/initia/x/mstaking"
	initiavm "github.com/initia-labs/initia/x/evm"

	"github.com/perpilize/perpilize/x/oracle"
	oraclekeeper "github.com/perpilize/perpilize/x/oracle/keeper"

	"github.com/perpilize/perpilize/x/margin"
	marginkeeper "github.com/perpilize/perpilize/x/margin/keeper"

	"github.com/perpilize/perpilize/x/funding"
	fundingkeeper "github.com/perpilize/perpilize/x/funding/keeper"

	"github.com/perpilize/perpilize/x/position"
	positionkeeper "github.com/perpilize/perpilize/x/position/keeper"

	"github.com/perpilize/perpilize/x/liquidation"
	liqkeeper "github.com/perpilize/perpilize/x/liquidation/keeper"

	"github.com/perpilize/perpilize/x/insurance"
	insurancekeeper "github.com/perpilize/perpilize/x/insurance/keeper"

	"github.com/perpilize/perpilize/x/fee"
	feekeeper "github.com/perpilize/perpilize/x/fee/keeper"

	"github.com/perpilize/perpilize/x/admin"
	adminkeeper "github.com/perpilize/perpilize/x/admin/keeper"

	"github.com/perpilize/perpilize/x/settlement"
	settlekeeper "github.com/perpilize/perpilize/x/settlement/keeper"

	"github.com/perpilize/perpilize/x/interrollup"
	interrollupkeeper "github.com/perpilize/perpilize/x/interrollup/keeper"
)

type PerpilizeApp struct {
	*baseapp.BaseApp

	AccountKeeper    authkeeper.AccountKeeper
	BankKeeper       bankkeeper.Keeper
	EvmKeeper        *evmkeeper.Keeper

	OracleKeeper     oraclekeeper.Keeper
	MarginKeeper     marginkeeper.Keeper
	FundingKeeper    fundingkeeper.Keeper
	PositionKeeper   positionkeeper.Keeper
	LiquidationKeeper liqkeeper.Keeper
	InsuranceKeeper  insurancekeeper.Keeper
	FeeKeeper        feekeeper.Keeper
	AdminKeeper      adminkeeper.Keeper
	SettlementKeeper settlekeeper.Keeper
	InterrollupKeeper interrollupkeeper.Keeper
}

func NewPerpilizeApp(
	logger io.Writer,
	db sdk.DB,
	traceStore io.Writer,
	loadLatest bool,
) *PerpilizeApp {

	encoding := MakeEncodingConfig()

	bApp := baseapp.NewBaseApp(
		"perpilized",
		logger,
		db,
		encoding.TxConfig.TxDecoder(),
	)

	// Register stores
	keys := sdk.NewKVStoreKeys(
		auth.StoreKey,
		bank.StoreKey,
		params.StoreKey,
		initiavm.StoreKey,
		oracle.StoreKey,
		margin.StoreKey,
		funding.StoreKey,
		position.StoreKey,
		liquidation.StoreKey,
		insurance.StoreKey,
		fee.StoreKey,
		admin.StoreKey,
		settlement.StoreKey,
		interrollup.StoreKey,
	)

	bApp.MountKVStores(keys)

	// Base keepers
	accountKeeper := authkeeper.NewAccountKeeper(
		encoding.Codec,
		keys[auth.StoreKey],
		auth.ProtoBaseAccount,
		mstaking.AddressCodec{},
	)

	bankKeeper := bankkeeper.NewBaseKeeper(
		encoding.Codec,
		keys[bank.StoreKey],
		accountKeeper,
		nil,
	)

	// EVM
	evmKeeper := evmkeeper.NewKeeper(
		encoding.Codec,
		keys[initiavm.StoreKey],
		accountKeeper,
		bankKeeper,
		nil,
	)

	// Perpilize native modules
	oracleKeeper := oraclekeeper.NewKeeper(encoding.Codec, keys[oracle.StoreKey])
	marginKeeper := marginkeeper.NewKeeper(encoding.Codec, keys[margin.StoreKey])
	fundingKeeper := fundingkeeper.NewKeeper(encoding.Codec, keys[funding.StoreKey])
	positionKeeper := positionkeeper.NewKeeper(encoding.Codec, keys[position.StoreKey])
	liqKeeper := liqkeeper.NewKeeper(encoding.Codec, keys[liquidation.StoreKey])
	insuranceKeeper := insurancekeeper.NewKeeper(encoding.Codec, keys[insurance.StoreKey])
	feeKeeper := feekeeper.NewKeeper(encoding.Codec, keys[fee.StoreKey])
	adminKeeper := adminkeeper.NewKeeper(encoding.Codec, keys[admin.StoreKey])
	settleKeeper := settlekeeper.NewKeeper(encoding.Codec, keys[settlement.StoreKey])
	interKeeper := interrollupkeeper.NewKeeper(encoding.Codec, keys[interrollup.StoreKey])

	app := &PerpilizeApp{
		BaseApp:          bApp,
		AccountKeeper:    accountKeeper,
		BankKeeper:       bankKeeper,
		EvmKeeper:        evmKeeper,
		OracleKeeper:     oracleKeeper,
		MarginKeeper:     marginKeeper,
		FundingKeeper:    fundingKeeper,
		PositionKeeper:   positionKeeper,
		LiquidationKeeper: liqKeeper,
		InsuranceKeeper:  insuranceKeeper,
		FeeKeeper:        feeKeeper,
		AdminKeeper:      adminKeeper,
		SettlementKeeper: settleKeeper,
		InterrollupKeeper: interKeeper,
	}

	return app
}