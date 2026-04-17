// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IInsurancePrecompile {
    function getBalance() external view returns (uint256);
}

contract InsuranceFund {

    IInsurancePrecompile public insurance;

    constructor(address _insurance) {
        insurance = IInsurancePrecompile(_insurance);
    }

    function totalBalance() external view returns (uint256) {
        return insurance.getBalance();
    }
}