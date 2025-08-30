"use client";
import {useState, useEffect} from "react";
import {keccak256, toHex, formatUnits} from "viem";
import {
  useWriteContract,
  useAccount,
  useSwitchChain,
  useReadContract,
} from "wagmi";
import {
  uploadToFilecoinDirect,
  downloadFromFilecoinDirect,
  getFilecoinInfo,
  prepareForStorage,
} from "./filecoin-alternative";
import {PROFILE_ABI, PROFILE_REGISTRY} from "./profile";
import {verifyEnsOwner} from "./ens";

const MESSAGE_COMMIT_ADDRESS = process.env
  .NEXT_PUBLIC_MESSAGE_COMMIT as `0x${string}`;
const MESSAGE_COMMIT_ABI = [
  {
    type: "function",
    name: "post",
    stateMutability: "nonpayable",
    inputs: [
      {name: "chatId", type: "uint256"},
      {name: "hash", type: "bytes32"},
      {name: "cid", type: "string"},
    ],
    outputs: [{name: "id", type: "uint256"}],
  },
] as const;

const LISK_SEPOLIA_ID = 4202;
const FILECOIN_CALIBRATION_ID = 314159;

export default function Home() {
  const {address, isConnected, chain} = useAccount();
  const {writeContract, isPending, error} = useWriteContract();
  const {switchChain} = useSwitchChain();

  const [chatId, setChatId] = useState<number>(1);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [commP, setCommP] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isPreparingStorage, setIsPreparingStorage] = useState(false);

  // ENS Profile states
  const [ens, setEns] = useState("");
  const [isVerifyingEns, setIsVerifyingEns] = useState(false);
  const {data: ensOnchain} = useReadContract({
    abi: PROFILE_ABI,
    address: PROFILE_REGISTRY,
    functionName: "ensName",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
  });
  const {writeContract: writeProfile} = useWriteContract();

  useEffect(() => {
    if (isConnected && chain?.id === FILECOIN_CALIBRATION_ID) {
      loadStorageInfo();
    }
  }, [isConnected, chain?.id]);

  const loadStorageInfo = async () => {
    try {
      const info = await getFilecoinInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error("Error cargando info de storage:", error);
    }
  };

  const handleUploadToFilecoin = async () => {
    if (!file) return;

    if (chain?.id !== FILECOIN_CALIBRATION_ID) {
      try {
        await switchChain({chainId: FILECOIN_CALIBRATION_ID});
      } catch (error) {
        alert("❌ Error al cambiar a Filecoin Calibration");
        return;
      }
    }

    setIsUploading(true);
    try {
      setIsPreparingStorage(true);
      const prep = await prepareForStorage(file.size);

      if (!prep.sufficient) {
        alert(
          `❌ Fondos insuficientes.\nBalance: ${formatUnits(
            prep.balance,
            18
          )} USDFC\nRequerido: ${formatUnits(prep.estimatedCost, 18)} USDFC`
        );
        return;
      }

      console.log("📁 Subiendo archivo a Filecoin...");
      const result = await uploadToFilecoinDirect(file);
      setCommP(result.commP);

      alert(
        `✅ Archivo subido a Filecoin!\nCommP: ${result.commP}\nTamaño: ${result.size} bytes`
      );
    } catch (error) {
      console.error("❌ Error al subir a Filecoin:", error);
      alert("❌ Error al subir archivo: " + (error as Error).message);
    } finally {
      setIsUploading(false);
      setIsPreparingStorage(false);
    }
  };

  const postMessageToLisk = async () => {
    if (!text.trim()) {
      alert("Por favor escribe un mensaje");
      return;
    }

    if (!isConnected) {
      alert("Por favor conecta tu wallet");
      return;
    }

    if (chain?.id !== LISK_SEPOLIA_ID) {
      try {
        await switchChain({chainId: LISK_SEPOLIA_ID});
      } catch (error) {
        alert("Error al cambiar a Lisk Sepolia");
        return;
      }
    }

    try {
      const hash = keccak256(toHex(new TextEncoder().encode(text)));
      await writeContract({
        abi: MESSAGE_COMMIT_ABI,
        address: MESSAGE_COMMIT_ADDRESS,
        functionName: "post",
        args: [BigInt(chatId), hash, commP ?? ""],
      });

      console.log("Mensaje posteado en Lisk, media almacenada en Filecoin");
    } catch (error) {
      console.error("Error al postear mensaje:", error);
    }
  };

  const saveEns = async () => {
    if (!address) {
      alert("Conecta tu wallet primero.");
      return;
    }

    if (!ens.endsWith(".eth")) {
      alert("Ingresa un ENS válido (termina en .eth).");
      return;
    }

    setIsVerifyingEns(true);

    try {
      const ok = await verifyEnsOwner(ens, address as `0x${string}`);
      if (!ok) {
        alert(
          "Ese ENS no resuelve a tu dirección en Sepolia. Revisa o usa otro."
        );
        return;
      }

      // Si verifica, guardamos preferencia en Lisk:
      writeProfile({
        abi: PROFILE_ABI,
        address: PROFILE_REGISTRY,
        functionName: "setENS",
        args: [ens],
      });
    } catch (error) {
      console.error("Error verificando ENS:", error);
      alert("Error al verificar ENS. Inténtalo de nuevo.");
    } finally {
      setIsVerifyingEns(false);
    }
  };

  const getCurrentChainInfo = () => {
    if (!chain) return "No conectado";

    switch (chain.id) {
      case LISK_SEPOLIA_ID:
        return "🟢 Lisk Sepolia (Mensajes)";
      case FILECOIN_CALIBRATION_ID:
        return "🟣 Filecoin (Storage)";
      default:
        return `❓ Red desconocida (${chain.name})`;
    }
  };

  return (
    <main className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">CrypteK</h1>
        <p className="text-gray-600 mt-2">
          Mensajes en Lisk (rápido) + Media en Filecoin (descentralizado)
        </p>
      </div>

      {/* Estado de conexión */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Estado de conexión:</h3>
        {!isConnected ? (
          <div className="text-yellow-600">⚠️ Wallet no conectado</div>
        ) : (
          <div className="space-y-1">
            <div className="text-green-600">
              ✅ Conectado: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="text-sm">Red actual: {getCurrentChainInfo()}</div>
          </div>
        )}
      </div>

      {/* Estado de Filecoin */}
      {storageInfo && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">
            🟣 Estado de Filecoin:
          </h3>
          <div className="text-sm text-purple-700 space-y-1">
            <div>
              Red: <strong>{storageInfo.network}</strong>
            </div>
            <div>
              Época actual: <strong>{storageInfo.currentEpoch}</strong>
            </div>
            <div>
              Balance USDFC (Payments):{" "}
              <strong>{storageInfo.paymentsBalance}</strong>
            </div>
            <div>
              Balance USDFC (Wallet):{" "}
              <strong>{storageInfo.walletBalance}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Sección de archivo - Filecoin */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">
          🟣 Almacenamiento en Filecoin
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Archivo (se almacenará en Filecoin)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <button
            onClick={handleUploadToFilecoin}
            disabled={!file || isUploading || !isConnected}
            className="rounded bg-purple-600 text-white px-4 py-2 disabled:opacity-50 hover:bg-purple-700 transition-colors"
          >
            {isPreparingStorage
              ? "Preparando..."
              : isUploading
              ? "Subiendo a Filecoin..."
              : "📁 Subir a Filecoin"}
          </button>

          {commP && (
            <div className="bg-purple-50 p-3 rounded border">
              <p className="text-sm font-medium text-purple-800">
                ✅ Archivo en Filecoin:
              </p>
              <p className="text-xs break-all font-mono text-purple-600">
                {commP}
              </p>
              <button
                onClick={async () => {
                  try {
                    const data = await downloadFromFilecoinDirect(commP);
                    const blob = new Blob([new Uint8Array(data)], {
                      type: file?.type || "application/octet-stream",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = file?.name || "download";
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    alert("Error descargando: " + (error as Error).message);
                  }
                }}
                className="mt-2 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
              >
                📥 Descargar desde Filecoin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sección de mensaje - Lisk */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">
          🟢 Mensaje en Lisk (Rápido & Barato)
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Chat ID</label>
            <input
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              type="number"
              value={chatId}
              onChange={(e) => setChatId(parseInt(e.target.value || "1"))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mensaje</label>
            <textarea
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu mensaje…"
            />
          </div>

          <button
            onClick={postMessageToLisk}
            disabled={isPending || !isConnected || !text.trim()}
            className="w-full rounded bg-green-600 text-white px-4 py-2 disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            {isPending ? "Enviando a Lisk..." : "📝 Postear en Lisk"}
          </button>
        </div>
      </div>

      {/* Información del flujo */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">
          🔄 Flujo de la aplicación:
        </h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>
            1. 📁 Media se almacena en <strong>Filecoin</strong>{" "}
            (descentralizado)
          </li>
          <li>
            2. 📝 Mensajes se guardan en <strong>Lisk</strong> (rápido y barato)
          </li>
          <li>3. 🔗 El CID de Filecoin se referencia en el contrato de Lisk</li>
        </ol>
      </div>

      {/* Perfil / ENS */}
      <section className="mt-10 border-t pt-6 space-y-3">
        <h2 className="font-semibold">Perfil / ENS</h2>
        <p className="text-sm text-slate-600">
          ENS onchain actual: <b>{(ensOnchain as string) || "(no set)"}</b>
        </p>
        <p className="text-xs text-slate-500">
          ⚠️ Solo se aceptan ENS que resuelvan a tu dirección en Sepolia
        </p>
        <div className="flex gap-3">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="tu-handle.eth"
            value={ens}
            onChange={(e) => setEns(e.target.value)}
            disabled={isVerifyingEns}
          />
          <button
            onClick={saveEns}
            disabled={isVerifyingEns || !ens.trim() || !address}
            className="rounded bg-blue-700 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
          >
            {isVerifyingEns ? "Verificando..." : "Guardar"}
          </button>
        </div>
      </section>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error.message}
        </div>
      )}
    </main>
  );
}
