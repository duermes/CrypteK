// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract ChatRegistry {
struct Group { address owner; bool requiresDeposit; }
mapping(uint256 => Group) public groups;
uint256 public groupCount;


// messages index: chatId => array of message ids (index into MessageCommit)
mapping(uint256 => uint256[]) public messagesByChat;


event GroupCreated(uint256 indexed id, address indexed owner, bool requiresDeposit);
event MessageIndexed(uint256 indexed chatId, uint256 indexed messageId, address indexed sender, bytes32 hash, string fileCid, uint256 ts, string kind);


function createGroup(bool requiresDeposit) external returns (uint256 id) {
id = ++groupCount;
groups[id] = Group(msg.sender, requiresDeposit);
emit GroupCreated(id, msg.sender, requiresDeposit);
}


// Solo index: el contenido real está en IPFS/Filecoin y cifrado por frontend
function indexMessage(
uint256 chatId,
uint256 messageId,
bytes32 ciphertextHash,
string calldata fileCid,
string calldata kind // "text" | "file" | "image" etc
) external returns (uint256 indexId) {
require(chatId > 0 && chatId <= groupCount, "invalid chat");
indexId = messagesByChat[chatId].length;
messagesByChat[chatId].push(messageId);
emit MessageIndexed(chatId, messageId, msg.sender, ciphertextHash, fileCid, block.timestamp, kind);
}


function getMessagesOfChat(uint256 chatId) external view returns (uint256[] memory) {
return messagesByChat[chatId];
}
}