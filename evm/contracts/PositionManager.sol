// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPositionPrecompile {
    function getPosition(
        address trader,
        string calldata market
    )
        external
        view
        returns (
            int256 size,
            uint256 entryPrice,
            int256 fundingIndex
        );
}

interface IOraclePrecompile {
    function getPrice(string calldata market) external view returns (uint256);
}

contract PositionManager {

    IPositionPrecompile public position;
    IOraclePrecompile public oracle;

    constructor(address _position, address _oracle) {
        position = IPositionPrecompile(_position);
        oracle = IOraclePrecompile(_oracle);
    }

    function getPosition(
        address trader,
        string calldata market
    )
        external
        view
        returns (
            int256 size,
            uint256 entryPrice,
            int256 pnl
        )
    {
        (size, entryPrice, ) = position.getPosition(trader, market);

        uint256 markPrice = oracle.getPrice(market);

        if (size > 0) {
            pnl = int256((markPrice - entryPrice) * uint256(size));
        } else {
            pnl = int256((entryPrice - markPrice) * uint256(-size));
        }
    }
}