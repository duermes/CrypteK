// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateTipVault is SepoliaConfig {
struct TipRef {
address from;
address to;
address token;
uint256 messageId;
uint256 ts;
euint64 amountEnc;
}


TipRef[] private tips;
mapping(uint256 => euint64) private sumByMessage;
mapping(uint256 => bool) private messageInitialized;


event TipRecorded(uint256 indexed tipId, uint256 indexed messageId, address indexed from, address to, address token);
event PublicTotal(uint256 indexed messageId, bytes payload);


function recordTip(uint256 messageId, address token, address to, externalEuint64 encAmount) external returns (uint256 tipId) {
euint64 a = FHE.fromExternal(encAmount, "");
tipId = tips.length;
tips.push(TipRef({ from: msg.sender, to: to, token: token, messageId: messageId, ts: block.timestamp, amountEnc: a }));

// Initialize sum if this is the first tip for this message
if (!messageInitialized[messageId]) {
    sumByMessage[messageId] = FHE.asEuint64(0);
    messageInitialized[messageId] = true;
}
sumByMessage[messageId] = FHE.add(sumByMessage[messageId], a);

emit TipRecorded(tipId, messageId, msg.sender, to, token);
}


function grantTipReader(uint256 tipId, address reader) external {
require(tipId < tips.length, "bad id");
TipRef storage t = tips[tipId];
require(msg.sender == t.from || msg.sender == t.to, "only parties");
FHE.allow(t.amountEnc, reader);
}


function publishTotal(uint256 messageId) external {
FHE.makePubliclyDecryptable(sumByMessage[messageId]);
emit PublicTotal(messageId, bytes(""));
}


function size() external view returns (uint256) { return tips.length; }
}