package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/perpilize/perpilize/x/margin/types"
)

// GetAllAccounts returns every margin account in the store (used by EndBlock scanner).
func (k Keeper) GetAllAccounts(ctx sdk.Context) []types.Account {
	store := ctx.KVStore(k.storeKey)
	prefix := []byte("account:")
	iter := store.Iterator(prefix, append(prefix, 0xff))
	defer iter.Close()

	var accounts []types.Account
	for ; iter.Valid(); iter.Next() {
		var acc types.Account
		k.cdc.MustUnmarshal(iter.Value(), &acc)
		accounts = append(accounts, acc)
	}
	return accounts
}

// HasAccount returns true if the address has an existing margin account.
func (k Keeper) HasAccount(ctx sdk.Context, addr string) bool {
	store := ctx.KVStore(k.storeKey)
	return store.Has([]byte("account:" + addr))
}