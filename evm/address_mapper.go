package evm

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/ethereum/go-ethereum/common"
)

// AddressMapper converts between EVM (20-byte hex) and Cosmos (bech32) addresses.
// Both formats share the same underlying bytes — no cryptographic conversion needed.
type AddressMapper struct{}

func NewAddressMapper() *AddressMapper {
	return &AddressMapper{}
}

// ToCosmos converts an EVM address to a Cosmos sdk.AccAddress.
func (m *AddressMapper) ToCosmos(addr common.Address) sdk.AccAddress {
	return sdk.AccAddress(addr.Bytes())
}

// ToEVM converts a Cosmos sdk.AccAddress to an EVM common.Address.
func (m *AddressMapper) ToEVM(addr sdk.AccAddress) common.Address {
	return common.BytesToAddress(addr.Bytes())
}

// ToCosmosString converts an EVM address to a bech32 string.
func (m *AddressMapper) ToCosmosString(addr common.Address) string {
	return sdk.AccAddress(addr.Bytes()).String()
}