package precompiles

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	settlementkeeper "github.com/perpilize/perpilize/x/settlement/keeper"
)

// SettlementPrecompile allows the off-chain matcher to submit trade settlements
// via an EVM call, which is then routed to the settlement Cosmos module.
// Solidity interface:
//   function executeTrade(bytes32 marketId, int256 size, uint256 price) external;
type SettlementPrecompile struct {
	keeper settlementkeeper.Keeper
}

func NewSettlementPrecompile(k settlementkeeper.Keeper) *SettlementPrecompile {
	return &SettlementPrecompile{keeper: k}
}

// Selector: bytes4(keccak256("executeTrade(bytes32,int256,uint256)"))
var executeTradeSelector = []byte{0x99, 0x88, 0x77, 0x66}

// Input layout (after 4-byte selector):
//   [4:36]   marketId  bytes32
//   [36:68]  size      int256  (positive = long, negative = short)
//   [68:100] price     uint256 (18dp scaled)
func (p *SettlementPrecompile) Run(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 4 {
		return nil, errors.New("settlement precompile: input too short")
	}

	if !selectorMatches(input, executeTradeSelector) {
		return nil, errors.New("settlement precompile: unknown selector")
	}

	if len(input) < 100 {
		return nil, errors.New("settlement precompile: missing arguments")
	}

	marketID := decodeString32(input, 4)
	size := decodeUint256(input, 36)
	price := decodeUint256(input, 68)

	if err := p.keeper.ExecuteTrade(ctx, caller.String(), marketID, size, price); err != nil {
		return nil, err
	}

	// Return success (1 as uint256)
	out := make([]byte, 32)
	out[31] = 1
	return out, nil
}