import {createInstance, SepoliaConfig} from "@zama-fhe/relayer-sdk";

import {Address, Hash, keccak256, toHex} from "viem";
import {useAccount, useWriteContract, useReadContract} from "wagmi";
import {
  ENCRYPTED_MESSAGE_VAULT_ABI,
  PRIVATE_TIP_VAULT_ABI,
  TIP_ROUTER_ABI,
  PROFILE_REGISTRY_ABI,
  MESSAGE_COMMIT_ABI,
  CHAT_REGISTRY_ABI,
} from "./contract";

export const ADDRESSES = {
  encryptedVault: process.env.NEXT_PUBLIC_ENCRYPTED_VAULT as Address,
  privateTipVault: process.env.NEXT_PUBLIC_PRIVATE_TIP as Address,
  chatRegistry: process.env.NEXT_PUBLIC_CHAT_REGISTRY as Address,
  messageCommit: process.env.NEXT_PUBLIC_MESSAGE_COMMIT as Address,
  profileRegistry: process.env.NEXT_PUBLIC_PROFILE_REGISTRY as Address,
  tipRouter: process.env.NEXT_PUBLIC_TIP_ROUTER as Address,
};

let fheInstance: any;
export async function initFHE() {
  if (!fheInstance) {
    fheInstance = await createInstance(SepoliaConfig);
  }
  return fheInstance;
}

export class CryptekContracts {
  static async postEncryptedMessage(message: string, userAddress: Address) {
    const fhe = await initFHE();
    const encryptedInput = await fhe.createEncryptedInput(message, {
      contractAddress: ADDRESSES.encryptedVault,
      userAddress,
    });

    return {
      abi: ENCRYPTED_MESSAGE_VAULT_ABI,
      address: ADDRESSES.encryptedVault,
      functionName: "storeMessage",
      args: [encryptedInput.handles[0], encryptedInput.attestation],
    };
  }

  static async sendPrivateTip(amount: number, userAddress: Address) {
    const fhe = await initFHE();
    const encryptedInput = await fhe.createEncryptedInput(amount, {
      contractAddress: ADDRESSES.privateTipVault,
      userAddress,
    });

    return {
      abi: PRIVATE_TIP_VAULT_ABI,
      address: ADDRESSES.privateTipVault,
      functionName: "tip",
      args: [encryptedInput.handles[0], encryptedInput.attestation],
    };
  }

  static createChat(name: string) {
    return {
      abi: CHAT_REGISTRY_ABI,
      address: ADDRESSES.chatRegistry,
      functionName: "createChat",
      args: [name],
    };
  }

  static commitMessage(chatId: bigint, text: string, cid: string) {
    const hash: Hash = keccak256(toHex(new TextEncoder().encode(text)));
    return {
      abi: MESSAGE_COMMIT_ABI,
      address: ADDRESSES.messageCommit,
      functionName: "post",
      args: [chatId, hash, cid],
    };
  }

  static setENS(name: string) {
    return {
      abi: PROFILE_REGISTRY_ABI,
      address: ADDRESSES.profileRegistry,
      functionName: "setENS",
      args: [name],
    };
  }


  static tipPublic(user: Address, amount: bigint) {
    return {
      abi: TIP_ROUTER_ABI,
      address: ADDRESSES.tipRouter,
      functionName: "tip",
      args: [user, amount],
    };
  }
}
