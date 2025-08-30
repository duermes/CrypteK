// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract MessageCommit {
    struct Msg { address sender; bytes32 hash; string cid; uint256 ts; uint256 chatId; }
    Msg[] public messages;
    event MessagePosted(uint256 indexed id, uint256 indexed chatId, address indexed sender, bytes32 hash, string cid);
    function post(uint256 chatId, bytes32 hash, string calldata cid) external returns (uint256 id) {
        id = messages.length;
        messages.push(Msg(msg.sender, hash, cid, block.timestamp, chatId));
        emit MessagePosted(id, chatId, msg.sender, hash, cid);
    }
}
