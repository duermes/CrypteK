// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";


contract EncryptedMessageVault {
struct ZMsg {
address sender;
uint256 chatId;
uint256 ts;
euint64 contentRef; // encrypted reference (e.g.: truncation/wrapping of handle or hash)
}


ZMsg[] private zmessages;
event EncryptedMessagePosted(uint256 indexed id, uint256 indexed chatId, address indexed sender);
event PublicCiphertext(uint256 indexed id, bytes payload);


function postEncrypted(uint256 chatId, externalEuint64 encContentRef) external returns (uint256 id) {
euint64 sealed = FHE.fromExternal(encContentRef, ""); // if your toolchain requires attestation, pass it
id = zmessages.length;
zmessages.push(ZMsg({ sender: msg.sender, chatId: chatId, ts: block.timestamp, contentRef: sealed }));
emit EncryptedMessagePosted(id, chatId, msg.sender);
}


function grantReader(uint256 id, address reader) external {
require(id < zmessages.length, "bad id");
require(zmessages[id].sender == msg.sender, "only sender");
FHE.allow(zmessages[id].contentRef, reader);
}


function makePublic(uint256 id) external {
require(id < zmessages.length, "bad id");
require(zmessages[id].sender == msg.sender, "only sender");
bytes memory payload = FHE.makePubliclyDecryptable(zmessages[id].contentRef);
// Emit payload for frontend to call publicDecrypt(...) (or for oracles)
emit PublicCiphertext(id, payload);
// Note: we emit a specific event for public ciphertexts; frontend will listen for this event.
}


function size() external view returns (uint256) { return zmessages.length; }
function meta(uint256 id) external view returns (address sender, uint256 chatId, uint256 ts) {
ZMsg storage m = zmessages[id];
return (m.sender, m.chatId, m.ts);
}
}