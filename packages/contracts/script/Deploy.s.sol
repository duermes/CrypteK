// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

// Contratos principales desde la raíz del proyecto
import {ProfileRegistry} from "contracts/lisk/ProfileRegistry.sol";
import {ChatRegistry} from "contracts/lisk/ChatRegistry.sol";
import {MessageCommit} from "contracts/lisk/MessageCommit.sol";
import {TipRouter as LiskTipRouter} from "contracts/lisk/TipRouter.sol";

// Contratos Zama - AHORA DESCOMENTADOS
import {EncryptedMessageVault} from "contracts/zama/EncryptedMessageVault.sol";
import {PrivateTipVault} from "contracts/zama/PrivateTipVault.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        console.log("Deploying CrypteK Contracts to Zama Sepolia Testnet");
        console.log("==================================================");

        // Deploy contratos Lisk (4 contratos principales)
        console.log("Deploying Lisk Contracts...");

        ProfileRegistry pr = new ProfileRegistry();
        console.log("ProfileRegistry deployed at:", address(pr));

        ChatRegistry cr = new ChatRegistry();
        console.log("ChatRegistry deployed at:", address(cr));

        MessageCommit mc = new MessageCommit();
        console.log("MessageCommit deployed at:", address(mc));

        LiskTipRouter ltr = new LiskTipRouter();
        console.log("TipRouter deployed at:", address(ltr));

        // Deploy contratos Zama (2 contratos FHE)
        console.log("Deploying Zama FHE Contracts...");

        EncryptedMessageVault emv = new EncryptedMessageVault();
        console.log("EncryptedMessageVault deployed at:", address(emv));

        PrivateTipVault ptv = new PrivateTipVault();
        console.log("PrivateTipVault deployed at:", address(ptv));

        vm.stopBroadcast();

        console.log("");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("====================");
        console.log("6/6 contracts deployed successfully");
        console.log("Save these addresses for your frontend:");
        console.log("- ProfileRegistry:", address(pr));
        console.log("- ChatRegistry:", address(cr));
        console.log("- MessageCommit:", address(mc));
        console.log("- TipRouter:", address(ltr));
        console.log("- EncryptedMessageVault:", address(emv));
        console.log("- PrivateTipVault:", address(ptv));
    }
}
