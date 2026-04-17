// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFundingPrecompile {
    function getFundingRate(string calldata market)
        external
        view
        returns (int256 rate, int256 cumulative);
}

contract FundingManager {

    IFundingPrecompile public funding;

    constructor(address _funding) {
        funding = IFundingPrecompile(_funding);
    }

    function fundingRate(string calldata market)
        external
        view
        returns (int256 rate)
    {
        (rate, ) = funding.getFundingRate(market);
    }

    function cumulativeFunding(string calldata market)
        external
        view
        returns (int256 cumulative)
    {
        (, cumulative) = funding.getFundingRate(market);
    }
}