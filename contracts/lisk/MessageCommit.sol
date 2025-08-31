// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract MessageCommit {
struct Msg { address sender; bytes32 hash; string cid; uint256 ts; uint256 chatId; string kind; }
Msg[] public messages;
event MessagePosted(uint256 indexed id, uint256 indexed chatId, address indexed sender, bytes32 hash, string cid, string kind, uint256 ts);


// Postea solo metadata: cid apunta al ciphertext en Filecoin/IPFS
function post(uint256 chatId, bytes32 hash, string calldata cid, string calldata kind) external returns (uint256 id) {
id = messages.length;
messages.push(Msg(msg.sender, hash, cid, block.timestamp, chatId, kind));
emit MessagePosted(id, chatId, msg.sender, hash, cid, kind, block.timestamp);
}


function size() external view returns (uint256) { return messages.length; }


function get(uint256 id) external view returns (address sender, bytes32 hash, string memory cid, uint256 ts, uint256 chatId, string memory kind) {
Msg storage m = messages[id];
return (m.sender, m.hash, m.cid, m.ts, m.chatId, m.kind);
}
}