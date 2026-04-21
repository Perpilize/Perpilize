package keeper

import (
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/liquidation/types"
)

type Keeper struct {
	storeKey storetypes.StoreKey
	cdc      codec.BinaryCodec
	margin   types.MarginKeeper
	position types.PositionKeeper
	oracle   types.OracleKeeper
}

func NewKeeper(
	cdc codec.BinaryCodec,
	key storetypes.StoreKey,
	margin types.MarginKeeper,
	position types.PositionKeeper,
	oracle types.OracleKeeper,
) Keeper {
	return Keeper{storeKey: key, cdc: cdc, margin: margin, position: position, oracle: oracle}
}

// Liquidate processes an externally submitted liquidation request.
func (k Keeper) Liquidate(ctx sdk.Context, liquidator, target, marketID string) (math.LegacyDec, error) {
	liquidatable, err := k.margin.IsLiquidatable(ctx, target)
	if err != nil {
		return math.LegacyZeroDec(), err
	}
	if !liquidatable {
		return math.LegacyZeroDec(), types.ErrAccountNotLiquidatable
	}

	pos, found := k.position.GetPosition(ctx, target, marketID)
	if !found {
		return math.LegacyZeroDec(), types.ErrPositionNotFound
	}

	markPrice, _, err := k.oracle.GetPrice(ctx, marketID)
	if err != nil {
		return math.LegacyZeroDec(), err
	}

	partialRate := math.LegacyMustNewDecFromStr("0.5")
	penaltyRate := math.LegacyMustNewDecFromStr("0.02")
	notional    := pos.Size.Abs().Mul(markPrice).Mul(partialRate)
	reward      := notional.Mul(penaltyRate).Mul(math.LegacyMustNewDecFromStr("0.5"))

	if err := k.margin.ExecuteLiquidation(ctx, target, marketID, partialRate); err != nil {
		return math.LegacyZeroDec(), err
	}

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeLiquidation,
		sdk.NewAttribute("liquidator", liquidator),
		sdk.NewAttribute("target", target),
		sdk.NewAttribute("market_id", marketID),
		sdk.NewAttribute("reward", reward.String()),
	))

	return reward, nil
}