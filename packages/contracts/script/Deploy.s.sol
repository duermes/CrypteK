// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "forge-std/Script.sol";
import {ProfileRegistry} from "../src/cryptic/ProfileRegistry.sol";
import {ChatRegistry} from "../src/cryptic/ChatRegistry.sol";
import {MessageCommit} from "../src/cryptic/MessageCommit.sol";
import {TipRouter} from "../src/cryptic/TipRouter.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        ProfileRegistry pr = new ProfileRegistry();
        ChatRegistry cr = new ChatRegistry();
        MessageCommit mc = new MessageCommit();
        TipRouter tr = new TipRouter();
        vm.stopBroadcast();
    }
}
