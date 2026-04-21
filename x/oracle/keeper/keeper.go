package keeper

import (
	"encoding/binary"

	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Keeper struct {
	storeKey storetypes.StoreKey
	cdc      codec.BinaryCodec
}

func NewKeeper(cdc codec.BinaryCodec, key storetypes.StoreKey) Keeper {
	return Keeper{storeKey: key, cdc: cdc}
}

// priceKey returns the KV key for a market's price entry.
func priceKey(marketID string) []byte {
	return []byte("price:" + marketID)
}

// fundingKey returns the KV key for a market's funding rate.
func fundingKey(marketID string) []byte {
	return []byte("funding:" + marketID)
}

// SetPrice stores the mark price and timestamp for a market.
func (k Keeper) SetPrice(ctx sdk.Context, marketID string, price math.LegacyDec, timestamp int64) {
	store := ctx.KVStore(k.storeKey)
	bz, _ := price.Marshal()
	// Append 8-byte big-endian timestamp after the Dec bytes
	var tsBuf [8]byte
	binary.BigEndian.PutUint64(tsBuf[:], uint64(timestamp))
	store.Set(priceKey(marketID), append(bz, tsBuf[:]...))
}

// GetPrice returns (price, timestamp, error) for a market.
// Implements oracle.OracleKeeper interface used by margin, funding, liquidation.
func (k Keeper) GetPrice(ctx sdk.Context, marketID string) (math.LegacyDec, int64, error) {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(priceKey(marketID))
	if bz == nil {
		// Return a sensible default for devnet / tests
		return math.LegacyZeroDec(), 0, nil
	}

	// Last 8 bytes = timestamp; rest = Dec
	if len(bz) < 8 {
		return math.LegacyZeroDec(), 0, nil
	}
	decBz := bz[:len(bz)-8]
	tsBz  := bz[len(bz)-8:]

	var price math.LegacyDec
	if err := price.Unmarshal(decBz); err != nil {
		return math.LegacyZeroDec(), 0, err
	}
	ts := int64(binary.BigEndian.Uint64(tsBz))
	return price, ts, nil
}

// SetFundingRate stores the current funding rate for a market.
func (k Keeper) SetFundingRate(ctx sdk.Context, marketID string, rate math.LegacyDec) {
	store := ctx.KVStore(k.storeKey)
	bz, _ := rate.Marshal()
	store.Set(fundingKey(marketID), bz)
}

// GetFundingRate returns the stored funding rate for a market.
func (k Keeper) GetFundingRate(ctx sdk.Context, marketID string) (math.LegacyDec, error) {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(fundingKey(marketID))
	if bz == nil {
		return math.LegacyZeroDec(), nil
	}
	var rate math.LegacyDec
	if err := rate.Unmarshal(bz); err != nil {
		return math.LegacyZeroDec(), err
	}
	return rate, nil
}

// GetAllPrices returns all stored market prices (used by indexer / query).
func (k Keeper) GetAllPrices(ctx sdk.Context) map[string]math.LegacyDec {
	store  := ctx.KVStore(k.storeKey)
	prefix := []byte("price:")
	iter   := store.Iterator(prefix, append(prefix, 0xff))
	defer iter.Close()

	prices := make(map[string]math.LegacyDec)
	for ; iter.Valid(); iter.Next() {
		marketID := string(iter.Key()[len(prefix):])
		bz := iter.Value()
		if len(bz) < 8 {
			continue
		}
		var price math.LegacyDec
		if err := price.Unmarshal(bz[:len(bz)-8]); err == nil {
			prices[marketID] = price
		}
	}
	return prices
}