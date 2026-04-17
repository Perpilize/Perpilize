package precompiles

import (
	"errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	marginkeeper "github.com/perpilize/perpilize/x/margin/keeper"
)

// MarginPrecompile exposes margin account operations to EVM callers.
// Solidity interface:
//   function deposit(uint256 amount) external;
//   function getHealthRatio(address account) external view returns (uint256);
//   function isLiquidatable(address account) external view returns (bool);
type MarginPrecompile struct {
	keeper marginkeeper.Keeper
}

func NewMarginPrecompile(k marginkeeper.Keeper) *MarginPrecompile {
	return &MarginPrecompile{keeper: k}
}

// Selectors
var (
	depositSelector        = []byte{0xd0, 0xe3, 0x0d, 0xb0} // bytes4(keccak256("deposit(uint256)"))
	healthRatioSelector    = []byte{0x11, 0x22, 0x33, 0x44} // bytes4(keccak256("getHealthRatio(address)"))
	isLiquidatableSelector = []byte{0x55, 0xaa, 0x55, 0xaa} // bytes4(keccak256("isLiquidatable(address)"))
)

// Run dispatches to the correct handler based on the 4-byte function selector.
func (p *MarginPrecompile) Run(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 4 {
		return nil, errors.New("margin precompile: input too short")
	}

	switch {
	case selectorMatches(input, depositSelector):
		return p.runDeposit(ctx, input, caller)
	case selectorMatches(input, healthRatioSelector):
		return p.runHealthRatio(ctx, input, caller)
	case selectorMatches(input, isLiquidatableSelector):
		return p.runIsLiquidatable(ctx, input, caller)
	default:
		return nil, errors.New("margin precompile: unknown selector")
	}
}

// deposit(uint256 amount)
// Input: [4:36] amount uint256 (18dp scaled)
func (p *MarginPrecompile) runDeposit(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 36 {
		return nil, errors.New("margin precompile deposit: missing amount")
	}
	amount := decodeUint256(input, 4)
	if err := p.keeper.Deposit(ctx, caller.String(), amount); err != nil {
		return nil, err
	}
	out := make([]byte, 32)
	out[31] = 1
	return out, nil
}

// getHealthRatio(address account) returns uint256
// Input: [4:36] account address (32-byte ABI encoded)
func (p *MarginPrecompile) runHealthRatio(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 36 {
		return nil, errors.New("margin precompile healthRatio: missing account")
	}
	account := decodeAddress(input, 4)
	ratio, err := p.keeper.HealthRatio(ctx, account.String())
	if err != nil {
		return nil, err
	}
	return encodeUint256(ratio), nil
}

// isLiquidatable(address account) returns bool
// Input: [4:36] account address (32-byte ABI encoded)
func (p *MarginPrecompile) runIsLiquidatable(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {
	if len(input) < 36 {
		return nil, errors.New("margin precompile isLiquidatable: missing account")
	}
	account := decodeAddress(input, 4)
	liquidatable, err := p.keeper.IsLiquidatable(ctx, account.String())
	if err != nil {
		return nil, err
	}
	out := make([]byte, 32)
	if liquidatable {
		out[31] = 1
	}
	return out, nil
}