package precompiles

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	oraclekeeper "github.com/perpilize/perpilize/x/oracle/keeper"
)

// OraclePrecompile exposes oracle price queries to EVM callers.
// Solidity interface:
//   function getPrice(bytes32 marketId) external view returns (uint256 price, int64 timestamp);
type OraclePrecompile struct {
	keeper oraclekeeper.Keeper
}

func NewOraclePrecompile(k oraclekeeper.Keeper) *OraclePrecompile {
	return &OraclePrecompile{keeper: k}
}

// Selector: bytes4(keccak256("getPrice(bytes32)")) — set to match your Solidity contract
var getPriceSelector = []byte{0xaa, 0x11, 0xbb, 0x22}

// Run dispatches EVM calls to the oracle keeper.
// Input layout (after 4-byte selector):
//   [4:36]  marketId  bytes32
func (p *OraclePrecompile) Run(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 4 {
		return nil, errors.New("oracle precompile: input too short")
	}

	if !selectorMatches(input, getPriceSelector) {
		return nil, errors.New("oracle precompile: unknown selector")
	}

	if len(input) < 36 {
		return nil, errors.New("oracle precompile: missing marketId")
	}

	marketID := decodeString32(input, 4)

	price, timestamp, err := p.keeper.GetPrice(ctx, marketID)
	if err != nil {
		return nil, err
	}

	// Return: price (uint256, 18dp scaled) ++ timestamp (uint256)
	out := make([]byte, 64)
	copy(out[0:32], encodeUint256(price))
	copy(out[32:64], encodeUint64(uint64(timestamp)))
	return out, nil
}