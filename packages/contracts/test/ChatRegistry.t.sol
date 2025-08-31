// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "contracts/lisk/ChatRegistry.sol";

contract ChatRegistryTest is Test {
    ChatRegistry public chatRegistry;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        chatRegistry = new ChatRegistry();
    }

    function testCreateGroup() public {
        vm.prank(user1);
        uint256 groupId = chatRegistry.createGroup(false);

        assertEq(groupId, 1);
        assertEq(chatRegistry.groupCount(), 1);

        (address owner, bool requiresDeposit) = chatRegistry.groups(groupId);
        assertEq(owner, user1);
        assertEq(requiresDeposit, false);
    }

    function testCreateGroupWithDeposit() public {
        vm.prank(user1);
        uint256 groupId = chatRegistry.createGroup(true);

        (address owner, bool requiresDeposit) = chatRegistry.groups(groupId);
        assertEq(requiresDeposit, true);
    }

    function testMultipleGroups() public {
        vm.prank(user1);
        uint256 groupId1 = chatRegistry.createGroup(false);

        vm.prank(user2);
        uint256 groupId2 = chatRegistry.createGroup(true);

        assertEq(groupId1, 1);
        assertEq(groupId2, 2);
        assertEq(chatRegistry.groupCount(), 2);

        (address owner1, ) = chatRegistry.groups(groupId1);
        (address owner2, ) = chatRegistry.groups(groupId2);

        assertEq(owner1, user1);
        assertEq(owner2, user2);
    }

    function testGroupCreationEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit ChatRegistry.GroupCreated(1, user1, false);

        vm.prank(user1);
        chatRegistry.createGroup(false);
    }
}
