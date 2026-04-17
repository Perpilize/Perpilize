package keeper

import (
	"errors"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/oracle/types"
)

type OracleKeeper struct {
	storeKey sdk.StoreKey
	cdc      codec.BinaryCodec
	params   types.Params
}

func NewKeeper(cdc codec.BinaryCodec, key sdk.StoreKey) OracleKeeper {
	return OracleKeeper{
		storeKey: key,
		cdc:      cdc,
		params:   types.DefaultParams(),
	}
}

func (k OracleKeeper) SetPrice(ctx sdk.Context, marketID string, price sdk.Dec, timestamp int64) error {
	store := ctx.KVStore(k.storeKey)

	last := store.Get([]byte(marketID))
	if last != nil {
	}

	bz, err := k.cdc.Marshal(&types.MsgUpdatePrice{
		MarketID:  marketID,
		Price:     price,
		Timestamp: timestamp,
	})
	if err != nil {
		return err
	}

	store.Set([]byte(marketID), bz)
	return nil
}

func (k OracleKeeper) GetPrice(ctx sdk.Context, marketID string) (sdk.Dec, int64, error) {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get([]byte(marketID))
	if bz == nil {
		return sdk.Dec{}, 0, errors.New("price not found")
	}

	var msg types.MsgUpdatePrice
	if err := k.cdc.Unmarshal(bz, &msg); err != nil {
		return sdk.Dec{}, 0, err
	}

	return msg.Price, msg.Timestamp, nil
}

func (k OracleKeeper) CheckHeartbeat(ctx sdk.Context, marketID string) bool {
	_, ts, err := k.GetPrice(ctx, marketID)
	if err != nil {
		return false
	}

	now := ctx.BlockTime().Unix()
	return now-int64(ts) <= int64(k.params.Heartbeat.Seconds())
}
