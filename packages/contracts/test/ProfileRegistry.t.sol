// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "contracts/lisk/ProfileRegistry.sol";

contract ProfileRegistryTest is Test {
    ProfileRegistry public profileRegistry;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        profileRegistry = new ProfileRegistry();
    }

    function testSetENS() public {
        string memory ensName = "alice.eth";

        vm.prank(user1);
        profileRegistry.setENS(ensName);

        assertEq(profileRegistry.ensName(user1), ensName);
    }

    function testUpdateENS() public {
        vm.prank(user1);
        profileRegistry.setENS("alice.eth");

        vm.prank(user1);
        profileRegistry.setENS("alice.crypto");

        assertEq(profileRegistry.ensName(user1), "alice.crypto");
    }

    function testMultipleUsers() public {
        vm.prank(user1);
        profileRegistry.setENS("alice.eth");

        vm.prank(user2);
        profileRegistry.setENS("bob.eth");

        assertEq(profileRegistry.ensName(user1), "alice.eth");
        assertEq(profileRegistry.ensName(user2), "bob.eth");
    }

    function testEmptyENS() public {
        // Initially should be empty
        assertEq(profileRegistry.ensName(user1), "");

        vm.prank(user1);
        profileRegistry.setENS("");

        assertEq(profileRegistry.ensName(user1), "");
    }

    function testENSEvent() public {
        string memory ensName = "test.eth";

        vm.expectEmit(true, false, false, true);
        emit ProfileRegistry.ProfileUpdated(user1, ensName);

        vm.prank(user1);
        profileRegistry.setENS(ensName);
    }

    function testLongENSName() public {
        string memory longName = "very-long-ens-name-with-many-characters.eth";

        vm.prank(user1);
        profileRegistry.setENS(longName);

        assertEq(profileRegistry.ensName(user1), longName);
    }
}
