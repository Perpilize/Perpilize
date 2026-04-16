package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/position/types"
)

func (k Keeper) GetPosition(ctx sdk.Context, trader, market string) (types.Position, bool) {
	store := ctx.KVStore(k.storeKey)

	bz := store.Get(types.PositionKey(trader, market))
	if bz == nil {
		return types.Position{}, false
	}

	var pos types.Position
	k.cdc.Unmarshal(bz, &pos)

	return pos, true
}

func (k Keeper) SetPosition(ctx sdk.Context, pos types.Position) {
	store := ctx.KVStore(k.storeKey)

	bz, _ := k.cdc.Marshal(&pos)
	store.Set(types.PositionKey(pos.Trader, pos.MarketID), bz)
}

func (k Keeper) ClosePosition(ctx sdk.Context, trader, market string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete(types.PositionKey(trader, market))
}

func (k Keeper) GetPositions(ctx sdk.Context, trader string) []types.Position {
	store := ctx.KVStore(k.storeKey)

	iterator := sdk.KVStorePrefixIterator(store, []byte(trader+":"))
	defer iterator.Close()

	var positions []types.Position

	for ; iterator.Valid(); iterator.Next() {
		var pos types.Position
		k.cdc.Unmarshal(iterator.Value(), &pos)
		positions = append(positions, pos)
	}

	return positions
}