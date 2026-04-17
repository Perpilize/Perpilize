// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMarginPrecompile {
    function deposit(address user, uint256 amount) external;
    function withdraw(address user, uint256 amount) external;
}

contract CollateralVault {

    IMarginPrecompile public margin;

    event Deposited(address user, uint256 amount);
    event Withdrawn(address user, uint256 amount);

    constructor(address _margin) {
        margin = IMarginPrecompile(_margin);
    }

    function deposit(uint256 amount) external {
        margin.deposit(msg.sender, amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        margin.withdraw(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
}