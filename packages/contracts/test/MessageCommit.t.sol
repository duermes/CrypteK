// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "contracts/lisk/MessageCommit.sol";

contract MessageCommitTest is Test {
    MessageCommit public messageCommit;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        messageCommit = new MessageCommit();
    }

    function testPostMessage() public {
        bytes32 hash = keccak256("test message");
        string memory cid = "QmTest123";
        string memory kind = "text";

        vm.prank(user1);
        uint256 messageId = messageCommit.post(1, hash, cid, kind);

        assertEq(messageId, 0);
        (address msgSender, bytes32 msgHash, string memory msgCid, uint256 msgTs, uint256 msgChatId, string memory msgKind) = messageCommit.messages(messageId);
        assertEq(msgSender, user1);
        assertEq(msgHash, hash);
        assertEq(msgCid, cid);
        assertEq(msgChatId, 1);
        assertEq(msgKind, kind);
        assertGt(msgTs, 0);
    }

    function testMultipleMessages() public {
        vm.prank(user1);
        messageCommit.post(1, keccak256("msg1"), "cid1", "text");

        vm.prank(user2);
        messageCommit.post(1, keccak256("msg2"), "cid2", "text");

        vm.prank(user1);
        messageCommit.post(2, keccak256("msg3"), "cid3", "text");

        (address sender3, , , , , ) = messageCommit.messages(2);
        assertEq(sender3, user1); // Third message should exist
    }

    function testMessageEmitsEvent() public {
        bytes32 hash = keccak256("test message");
        string memory cid = "QmTest123";
        string memory kind = "text";

        vm.expectEmit(true, true, true, true);
        emit MessageCommit.MessagePosted(0, 1, user1, hash, cid, kind, block.timestamp);

        vm.prank(user1);
        messageCommit.post(1, hash, cid, kind);
    }

    function testDifferentChatIds() public {
        vm.prank(user1);
        uint256 msgId1 = messageCommit.post(1, keccak256("chat1"), "cid1", "text");

        vm.prank(user1);
        uint256 msgId2 = messageCommit.post(2, keccak256("chat2"), "cid2", "text");

        (, , , , uint256 chatId1, ) = messageCommit.messages(msgId1);
        (, , , , uint256 chatId2, ) = messageCommit.messages(msgId2);

        assertEq(chatId1, 1);
        assertEq(chatId2, 2);
    }
}
