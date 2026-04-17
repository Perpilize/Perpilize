package precompiles

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	positionkeeper "github.com/perpilize/perpilize/x/position/keeper"
)

// PositionPrecompile exposes position queries to EVM callers.
// Solidity interface:
//   function getPosition(address owner, bytes32 marketId)
//       external view returns (int256 size, uint256 avgEntryPrice, uint256 margin);
type PositionPrecompile struct {
	keeper positionkeeper.Keeper
}

func NewPositionPrecompile(k positionkeeper.Keeper) *PositionPrecompile {
	return &PositionPrecompile{keeper: k}
}

// Selector: bytes4(keccak256("getPosition(address,bytes32)"))
var getPositionSelector = []byte{0x55, 0x66, 0x77, 0x88}

// Input layout (after 4-byte selector):
//   [4:36]   owner    address (32-byte EVM ABI encoded)
//   [36:68]  marketId bytes32
func (p *PositionPrecompile) Run(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 4 {
		return nil, errors.New("position precompile: input too short")
	}

	if !selectorMatches(input, getPositionSelector) {
		return nil, errors.New("position precompile: unknown selector")
	}

	if len(input) < 68 {
		return nil, errors.New("position precompile: missing arguments")
	}

	owner := decodeAddress(input, 4)
	marketID := decodeString32(input, 36)

	pos, found := p.keeper.GetPosition(ctx, owner.String(), marketID)
	if !found {
		// Return zero position (no error — Solidity callers handle zeros)
		return make([]byte, 96), nil
	}

	// Return: size (int256) ++ avgEntryPrice (uint256) ++ margin (uint256)
	out := make([]byte, 96)
	copy(out[0:32], encodeUint256(pos.Size))
	copy(out[32:64], encodeUint256(pos.AvgEntryPrice))
	copy(out[64:96], encodeUint256(pos.Margin))
	return out, nil
}