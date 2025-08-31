import {createInstance, SepoliaConfig} from "@zama-fhe/relayer-sdk";
import {Address, Hash, keccak256, toHex} from "viem";
import {useAccount, useWriteContract, useReadContract} from "wagmi";

// ---------- CONFIG DE TUS CONTRATOS ----------
export const ADDRESSES = {
  encryptedVault: process.env.NEXT_PUBLIC_ENCRYPTED_VAULT as Address,
  privateTipVault: process.env.NEXT_PUBLIC_PRIVATE_TIP as Address,
  chatRegistry: process.env.NEXT_PUBLIC_CHAT_REGISTRY as Address,
  messageCommit: process.env.NEXT_PUBLIC_MESSAGE_COMMIT as Address,
  profileRegistry: process.env.NEXT_PUBLIC_PROFILE_REGISTRY as Address,
  tipRouter: process.env.NEXT_PUBLIC_TIP_ROUTER as Address,
};

// ---------- ABIs (resumidos para ejemplo) ----------
import EncryptedMessageVaultABI from "./abis/EncryptedMessageVault.json";
import PrivateTipVaultABI from "./abis/PrivateTipVault.json";
import ChatRegistryABI from "./abis/ChatRegistry.json";
import MessageCommitABI from "./abis/MessageCommit.json";
import ProfileRegistryABI from "./abis/ProfileRegistry.json";
import TipRouterABI from "./abis/TipRouter.json";

// ---------- SDK FHE ----------
let fheInstance: any;
export async function initFHE() {
  if (!fheInstance) {
    fheInstance = await createInstance(SepoliaConfig);
  }
  return fheInstance;
}

// =========================================================
// 🚀 CLASE DE ALTO NIVEL PARA USAR CONTRATOS
// =========================================================
export class CryptekContracts {
  // 🔐 Enviar mensaje cifrado a Zama (EncryptedMessageVault)
  static async postEncryptedMessage(message: string, userAddress: Address) {
    const fhe = await initFHE();
    const encryptedInput = await fhe.createEncryptedInput(message, {
      contractAddress: ADDRESSES.encryptedVault,
      userAddress,
    });

    return {
      abi: EncryptedMessageVaultABI,
      address: ADDRESSES.encryptedVault,
      functionName: "storeMessage",
      args: [encryptedInput.handles[0], encryptedInput.attestation],
    };
  }

  // 💸 Enviar tip privado (PrivateTipVault - Zama)
  static async sendPrivateTip(amount: number, userAddress: Address) {
    const fhe = await initFHE();
    const encryptedInput = await fhe.createEncryptedInput(amount, {
      contractAddress: ADDRESSES.privateTipVault,
      userAddress,
    });

    return {
      abi: PrivateTipVaultABI,
      address: ADDRESSES.privateTipVault,
      functionName: "tip",
      args: [encryptedInput.handles[0], encryptedInput.attestation],
    };
  }

  // 📚 Registrar chat en Lisk
  static createChat(name: string) {
    return {
      abi: ChatRegistryABI,
      address: ADDRESSES.chatRegistry,
      functionName: "createChat",
      args: [name],
    };
  }

  // 📝 Postear metadata de mensaje en Lisk
  static commitMessage(chatId: bigint, text: string, cid: string) {
    const hash: Hash = keccak256(toHex(new TextEncoder().encode(text)));
    return {
      abi: MessageCommitABI,
      address: ADDRESSES.messageCommit,
      functionName: "post",
      args: [chatId, hash, cid],
    };
  }

  // 👤 Guardar ENS en perfil (ProfileRegistry - Lisk)
  static setENS(name: string) {
    return {
      abi: ProfileRegistryABI,
      address: ADDRESSES.profileRegistry,
      functionName: "setENS",
      args: [name],
    };
  }

  // 💰 Propina pública (TipRouter - Lisk)
  static tipPublic(user: Address, amount: bigint) {
    return {
      abi: TipRouterABI,
      address: ADDRESSES.tipRouter,
      functionName: "tip",
      args: [user, amount],
    };
  }
}
