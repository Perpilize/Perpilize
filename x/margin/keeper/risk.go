package keeper

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// RiskSnapshot returns a full risk picture for an account at the current block.
type RiskSnapshot struct {
	Equity         math.LegacyDec
	IMR            math.LegacyDec
	MMR            math.LegacyDec
	HealthRatio    math.LegacyDec
	IsLiquidatable bool
}

func (k Keeper) GetRiskSnapshot(ctx sdk.Context, addr string) (RiskSnapshot, error) {
	equity, err := k.Equity(ctx, addr)
	if err != nil {
		return RiskSnapshot{}, err
	}
	imr, err := k.InitialMarginRequired(ctx, addr)
	if err != nil {
		return RiskSnapshot{}, err
	}
	mmr, err := k.MaintenanceMarginRequired(ctx, addr)
	if err != nil {
		return RiskSnapshot{}, err
	}
	ratio, err := k.HealthRatio(ctx, addr)
	if err != nil {
		return RiskSnapshot{}, err
	}
	liquidatable, err := k.IsLiquidatable(ctx, addr)
	if err != nil {
		return RiskSnapshot{}, err
	}

	return RiskSnapshot{
		Equity:         equity,
		IMR:            imr,
		MMR:            mmr,
		HealthRatio:    ratio,
		IsLiquidatable: liquidatable,
	}, nil
}