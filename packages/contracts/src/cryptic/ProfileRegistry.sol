// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract ProfileRegistry {
    mapping(address => string) public ensName;
    event ProfileUpdated(address indexed user, string ens);
    function setENS(string calldata name) external {
        ensName[msg.sender] = name;
        emit ProfileUpdated(msg.sender, name);
    }
}
