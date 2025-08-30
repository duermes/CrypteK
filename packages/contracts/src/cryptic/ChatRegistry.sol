// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract ChatRegistry {
    struct Group { address owner; bool requiresDeposit; }
    mapping(uint256 => Group) public groups;
    uint256 public groupCount;
    event GroupCreated(uint256 indexed id, address indexed owner, bool requiresDeposit);
    function createGroup(bool requiresDeposit) external returns (uint256 id) {
        id = ++groupCount;
        groups[id] = Group(msg.sender, requiresDeposit);
        emit GroupCreated(id, msg.sender, requiresDeposit);
    }
}
