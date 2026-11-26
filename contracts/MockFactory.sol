// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Test-only stand-in for the ERC-2470 SingletonFactory interface.
contract MockFactory {
    event ContractDeployed(address createdContract);
    function deploy(bytes memory initCode, bytes32 salt) public returns (address created) {
        assembly { created := create2(0, add(initCode, 0x20), mload(initCode), salt) }
        require(created != address(0), "create2 failed");
        emit ContractDeployed(created);
    }
}
