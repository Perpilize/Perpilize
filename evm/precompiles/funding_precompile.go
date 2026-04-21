package precompiles

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	fundingkeeper "github.com/perpilize/perpilize/x/funding/keeper"
)

// FundingPrecompile exposes funding rate queries to EVM callers.
// Solidity interface:
//   function getFundingRate(bytes32 marketId) external view returns (int256 rate, int256 cumulativeRate);
type FundingPrecompile struct {
	keeper fundingkeeper.Keeper
}

func NewFundingPrecompile(k fundingkeeper.Keeper) *FundingPrecompile {
	return &FundingPrecompile{keeper: k}
}

// Selector: bytes4(keccak256("getFundingRate(bytes32)"))
var fundingSelector = []byte{0x44, 0x33, 0x22, 0x11}

// Input layout (after 4-byte selector):
//   [4:36] marketId bytes32
func (p *FundingPrecompile) Run(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 4 {
		return nil, errors.New("funding precompile: input too short")
	}
	if !selectorMatches(input, fundingSelector) {
		return nil, errors.New("funding precompile: unknown selector")
	}
	if len(input) < 36 {
		return nil, errors.New("funding precompile: missing marketId")
	}

	marketID := decodeString32(input, 4)

	// GetFundingRate returns (math.LegacyDec, error)
	rate, err := p.keeper.GetFundingRate(ctx, marketID)
	if err != nil {
		return nil, err
	}

	// Also get the cumulative index
	cumulative := p.keeper.GetMarketCumulativeIndex(ctx, marketID)

	// Return: rate (int256) ++ cumulativeRate (int256) — both 18dp scaled
	out := make([]byte, 64)
	copy(out[0:32], encodeUint256(rate))
	copy(out[32:64], encodeUint256(cumulative))
	return out, nil
}