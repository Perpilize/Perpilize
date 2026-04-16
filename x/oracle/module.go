package oracle

import (
    "github.com/cosmos/cosmos-sdk/codec"
    "github.com/cosmos/cosmos-sdk/types/module"
)

type AppModule struct {
    keeper Keeper
}

func NewAppModule(k Keeper) AppModule {
    return AppModule{keeper: k}
}

func (AppModule) Name() string { return types.ModuleName }

func (am AppModule) RegisterInterfaces(registry codec.InterfaceRegistry) {}