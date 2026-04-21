package keeper

import (
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/perpilize/perpilize/x/position/types"
)

type Keeper struct {
	storeKey storetypes.StoreKey
	cdc      codec.BinaryCodec
}

func NewKeeper(cdc codec.BinaryCodec, key storetypes.StoreKey) Keeper {
	return Keeper{storeKey: key, cdc: cdc}
}

// ── Key helpers ──────────────────────────────────────────────────────────────

func positionKey(addr, marketID string) []byte {
	return []byte("pos:" + addr + ":" + marketID)
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

func (k Keeper) GetPosition(ctx sdk.Context, addr, marketID string) (types.Position, bool) {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(positionKey(addr, marketID))
	if bz == nil {
		return types.Position{}, false
	}
	var pos types.Position
	k.cdc.MustUnmarshal(bz, &pos)
	return pos, true
}

func (k Keeper) SetPosition(ctx sdk.Context, pos types.Position) {
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshal(&pos)
	store.Set(positionKey(pos.Owner, pos.MarketID), bz)
}

func (k Keeper) DeletePosition(ctx sdk.Context, addr, marketID string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete(positionKey(addr, marketID))
}

// GetPositions returns all open positions for an address.
func (k Keeper) GetPositions(ctx sdk.Context, addr string) []types.Position {
	store  := ctx.KVStore(k.storeKey)
	prefix := []byte("pos:" + addr + ":")
	iter   := store.Iterator(prefix, append(prefix, 0xff))
	defer iter.Close()

	var positions []types.Position
	for ; iter.Valid(); iter.Next() {
		var pos types.Position
		k.cdc.MustUnmarshal(iter.Value(), &pos)
		positions = append(positions, pos)
	}
	return positions
}

// ── Mutations ────────────────────────────────────────────────────────────────

// OpenPosition opens or increases a position.
// size > 0 = long, size < 0 = short.
func (k Keeper) OpenPosition(
	ctx sdk.Context,
	addr, marketID string,
	size, executionPrice, margin, cumulativeFunding math.LegacyDec,
) error {
	existing, found := k.GetPosition(ctx, addr, marketID)

	if !found {
		k.SetPosition(ctx, types.Position{
			Owner:                 addr,
			MarketID:              marketID,
			Size:                  size,
			AvgEntryPrice:         executionPrice,
			Margin:                margin,
			LastCumulativeFunding: cumulativeFunding,
		})
		return nil
	}

	totalSize := existing.Size.Add(size)
	if totalSize.IsZero() {
		k.DeletePosition(ctx, addr, marketID)
		return nil
	}

	// Weighted average entry price
	existingNotional := existing.Size.Mul(existing.AvgEntryPrice)
	newNotional      := size.Mul(executionPrice)
	avgEntry         := existingNotional.Add(newNotional).Quo(totalSize)

	existing.Size                  = totalSize
	existing.AvgEntryPrice         = avgEntry
	existing.Margin                = existing.Margin.Add(margin)
	existing.LastCumulativeFunding = cumulativeFunding

	k.SetPosition(ctx, existing)
	return nil
}

// ReducePosition reduces an open position by reduceBy fraction (0-1).
func (k Keeper) ReducePosition(ctx sdk.Context, addr, marketID string, reduceBy math.LegacyDec) error {
	pos, found := k.GetPosition(ctx, addr, marketID)
	if !found {
		return types.ErrPositionNotFound
	}

	pos.Size = pos.Size.Mul(math.LegacyOneDec().Sub(reduceBy))

	if pos.Size.Abs().LTE(math.LegacyNewDecWithPrec(1, 8)) {
		k.DeletePosition(ctx, addr, marketID)
		return nil
	}

	k.SetPosition(ctx, pos)
	return nil
}