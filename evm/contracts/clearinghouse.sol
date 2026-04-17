// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMarginPrecompile {
    function getHealthRatio(address trader) external view returns (uint256);
}

interface ISettlementPrecompile {
    function executeTrade(
        address trader,
        string calldata market,
        int256 size,
        uint256 price
    ) external;
}

contract ClearingHouse {

    address public owner;

    IMarginPrecompile public margin;
    ISettlementPrecompile public settlement;

    event TradeExecuted(
        address indexed trader,
        string market,
        int256 size,
        uint256 price
    );

    constructor(address _margin, address _settlement) {
        owner = msg.sender;
        margin = IMarginPrecompile(_margin);
        settlement = ISettlementPrecompile(_settlement);
    }

    modifier onlyHealthy(address trader) {
        uint256 hr = margin.getHealthRatio(trader);
        require(hr >= 1e18, "LOW_MARGIN");
        _;
    }

    function openPosition(
        string calldata market,
        int256 size,
        uint256 price
    ) external onlyHealthy(msg.sender) {

        settlement.executeTrade(
            msg.sender,
            market,
            size,
            price
        );

        emit TradeExecuted(msg.sender, market, size, price);
    }

    function closePosition(
        string calldata market,
        int256 size,
        uint256 price
    ) external {

        settlement.executeTrade(
            msg.sender,
            market,
            -size,
            price
        );

        emit TradeExecuted(msg.sender, market, -size, price);
    }
}