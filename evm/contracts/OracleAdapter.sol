// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOraclePrecompile {
    function getPrice(string calldata market) external view returns (uint256);
}

contract OracleAdapter {

    IOraclePrecompile public oracle;

    constructor(address _oracle) {
        oracle = IOraclePrecompile(_oracle);
    }

    function price(string calldata market) external view returns (uint256) {
        return oracle.getPrice(market);
    }
}