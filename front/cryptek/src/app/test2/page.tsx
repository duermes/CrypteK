import {useEffect, useState} from "react";
import {ethers} from "ethers";
import {
  createInstance,
  createEncryptedInput,
  userDecrypt,
  publicDecrypt,
} from "@zama-fhe/relayer-sdk";
import {Web3Storage} from "web3.storage";

// ABI imports (export your compiled ABIs from hardhat to frontend)
// import ChatRegistry from "../abis/ChatRegistry.json";
// import MessageCommit from "../abis/MessageCommit.json";
// import EncryptedMessageVault from "../abis/EncryptedMessageVault.json";

// replace with deployed addresses
const CHAT_REGISTRY_ADDR = "0x...";
const MESSAGE_COMMIT_ADDR = "0x...";
const ENCRYPTED_VAULT_ADDR = "0x...";

// Filecoin/IPFS client (Web3.Storage)
const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN!,
});

export default function ChatApp() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [registry, setRegistry] = useState<any>();
  const [commit, setCommit] = useState<any>();
  const [vault, setVault] = useState<any>();
  const [chatId] = useState<number>(1); // MVP: single chat
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const prov = new ethers.providers.Web3Provider(window.ethereum as any);
      await prov.send("eth_requestAccounts", []);
      const signer = prov.getSigner();
      setProvider(prov);
      setSigner(signer);

      setRegistry(
        new ethers.Contract(CHAT_REGISTRY_ADDR, ChatRegistry.abi, signer)
      );
      setCommit(
        new ethers.Contract(MESSAGE_COMMIT_ADDR, MessageCommit.abi, signer)
      );
      setVault(
        new ethers.Contract(
          ENCRYPTED_VAULT_ADDR,
          EncryptedMessageVault.abi,
          signer
        )
      );
    })();
  }, []);

  async function sendMessage() {
    if (!signer || !input) return;
    // 1. cifrar input con Zama SDK
    const instance = await createInstance({network: "sepolia"});
    const encInput = await createEncryptedInput(instance, signer, input);

    // 2. subir ciphertext a Filecoin
    const blob = new Blob([encInput.ciphertext]);
    const cid = await client.put([new File([blob], "msg.enc")]);

    // 3. calcular hash
    const hash = ethers.utils.keccak256(await blob.arrayBuffer());

    // 4. guardar metadata en Lisk contract
    const tx = await commit.post(chatId, hash, cid, "text");
    await tx.wait();

    // 5. opcional: registrar handle privado en Zama contract
    await vault.postEncrypted(chatId, encInput.toExternal());

    setInput("");
    loadMessages();
  }

  async function loadMessages() {
    if (!commit) return;
    const size = await commit.size();
    const msgs = [];
    for (let i = 0; i < size; i++) {
      const m = await commit.get(i);
      msgs.push(m);
    }
    setMessages(msgs);
  }

  useEffect(() => {
    if (commit) loadMessages();
  }, [commit]);

  async function decryptMessage(cid: string) {
    const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
    const ciphertext = new Uint8Array(await res.arrayBuffer());
    // decrypt con clave privada (userDecrypt)
    const instance = await createInstance({network: "sepolia"});
    const plaintext = await userDecrypt(instance, signer!, ciphertext);
    return plaintext;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Zama + Lisk Chat</h1>
      <div className="border rounded p-2 h-96 overflow-y-scroll mb-4">
        {messages.map((m, idx) => (
          <div key={idx} className="mb-2">
            <span className="font-bold">{m.sender}</span>
            <span className="ml-2 text-gray-600">
              ({new Date(m.ts * 1000).toLocaleTimeString()})
            </span>
            <button
              className="ml-2 text-blue-600 underline"
              onClick={async () => {
                const pt = await decryptMessage(m.cid);
                alert(pt);
              }}
            >
              Ver mensaje
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
