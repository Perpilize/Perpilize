package precompiles

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	fundingkeeper "github.com/perpilize/perpilize/x/funding/keeper"
)

type FundingPrecompile struct {
	keeper fundingkeeper.Keeper
}

func NewFundingPrecompile(k fundingkeeper.Keeper) *FundingPrecompile {
	return &FundingPrecompile{keeper: k}
}

var fundingSelector = []byte{0x44, 0x33, 0x22, 0x11}

func (p *FundingPrecompile) Run(ctx sdk.Context, input []byte, caller sdk.AccAddress) ([]byte, error) {

	if string(input[:4]) != string(fundingSelector) {
		return nil, nil
	}

	market := string(input[4:36])

	rate := p.keeper.GetFundingRate(ctx, market)

	return encodeUint256(rate.CurrentRate), nil
}