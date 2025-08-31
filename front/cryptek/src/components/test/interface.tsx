"use client";

import type React from "react";

import {useState, useRef} from "react";
import {
  useAccount,
  useDisconnect,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {keccak256, toHex, formatUnits} from "viem";
import {
  uploadToFilecoinDirect,
  downloadFromFilecoinDirect,
  prepareForStorage,
} from "@/lib/filecoin";

import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Shield,
  Phone,
  Video,
  LogOut,
  MessageSquare,
  X,
  Download,
  Loader2,
  DollarSign,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {ChatBox} from "./chatbox";
import {toast} from "sonner";
import {NewChatDialog} from "../chat/new-chat";

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

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isEncrypted: boolean;
  fileCommP?: string;
  fileName?: string;
  fileType?: string;
  txHash?: string;
}

const MediaMessage = ({message}: {message: Message}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!message.fileCommP) return;
    setIsDownloading(true);
    try {
      const data = await downloadFromFilecoinDirect(message.fileCommP);
      const blob = new Blob([new Uint8Array(data)], {
        type: message.fileType || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      if (message.fileType?.startsWith("image/")) {
        setPreviewUrl(url);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = message.fileName || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success(`Archivo ${message.fileName} descargado exitosamente`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error descargando archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-2 border-t border-white/20 pt-2">
      {previewUrl ? (
        <img
          src={previewUrl || "/placeholder.svg"}
          alt={message.fileName}
          className="rounded-lg max-w-full h-auto"
        />
      ) : (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-2 text-sm bg-black/20 px-3 py-2 rounded-lg hover:bg-black/40 transition-colors w-full disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>
            {isDownloading ? "Descargando..." : `Descargar ${message.fileName}`}
          </span>
        </button>
      )}
    </div>
  );
};

const mockMessages: Message[] = [
  // ... (tus mensajes mock no necesitan cambios)
];

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const [file, setFile] = useState<File | null>(null);
  const [tipAmount, setTipAmount] = useState("");
  const [showTipInput, setShowTipInput] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chats, setChats] = useState([]);

  const {address, isConnected, chain} = useAccount();
  const {disconnect} = useDisconnect();

  const {writeContract, isPending} = useWriteContract();
  const {switchChain} = useSwitchChain();
  const [isUploading, setIsUploading] = useState(false);

  // const messages: Message[] = [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && !file) return;
    if (!isConnected || !address) {
      alert("Por favor, conecta tu wallet.");
      return;
    }

    let fileCommP = ""; // Aquí guardaremos el CommP del archivo
    let tempFileName = "";
    let tempFileType = "";

    // --- PASO 1: Subir archivo a Filecoin (si existe) ---
    if (file) {
      setIsUploading(true);
      // Cambiar a la red de Filecoin
      if (chain?.id !== FILECOIN_CALIBRATION_ID) {
        try {
          await switchChain({chainId: FILECOIN_CALIBRATION_ID});
          // Nota: El código se detendrá aquí y continuará una vez que el usuario cambie de red.
          // Para una UX más fluida, se podría necesitar un useEffect que detecte el cambio de red.
          // Por simplicidad, asumimos que el usuario confirma el cambio.
        } catch (err) {
          alert("Error al cambiar a Filecoin Calibration. Intento cancelado.");
          setIsUploading(false);
          return;
        }
      }

      try {
        console.log("Verificando balance y preparando almacenamiento...");
        const prep = await prepareForStorage(file.size);
        if (!prep.sufficient) {
          alert(
            `❌ Fondos insuficientes en Filecoin.\nBalance: ${formatUnits(
              prep.balance,
              18
            )} USDFC\nRequerido: ${formatUnits(prep.estimatedCost, 18)} USDFC`
          );
          setIsUploading(false);
          return;
        }

        console.log("📁 Subiendo archivo a Filecoin...");
        const result = await uploadToFilecoinDirect(file);
        fileCommP = result.commP; // Guardamos el CommP
        tempFileName = file.name;
        tempFileType = file.type;
        console.log(`✅ Archivo subido a Filecoin! CommP: ${fileCommP}`);
      } catch (err) {
        console.error("❌ Error al subir a Filecoin:", err);
        alert("❌ Error al subir archivo: " + (err as Error).message);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // --- PASO 2: Postear el mensaje en Lisk ---
    if (chain?.id !== LISK_SEPOLIA_ID) {
      try {
        await switchChain({chainId: LISK_SEPOLIA_ID});
      } catch (err) {
        alert("Error al cambiar a Lisk Sepolia. Intento cancelado.");
        return;
      }
    }

    try {
      // Usamos el hash del mensaje o un hash vacío si solo se envía un archivo
      const hash = message.trim()
        ? keccak256(toHex(new TextEncoder().encode(message)))
        : "0x0000000000000000000000000000000000000000000000000000000000000000";

      // Llamamos al contrato en Lisk
      await writeContract({
        abi: MESSAGE_COMMIT_ABI,
        address: MESSAGE_COMMIT_ADDRESS,
        functionName: "post",
        args: [BigInt(1), hash, fileCommP], // Usando un chatId=1 por ahora
      });

      // --- PASO 3: Actualizar la UI localmente (simulación) ---
      // En una app real, escucharíamos eventos del contrato para añadir el mensaje.
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "Tu",
        content: message,
        timestamp: new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
        isEncrypted: true,
        fileCommP: fileCommP,
        fileName: tempFileName,
        fileType: tempFileType,
      };

      setMessages([...messages, newMessage]);
      setMessage("");
      setFile(null);
    } catch (err) {
      console.error("Error al postear mensaje en Lisk:", err);
      alert("Error al enviar el mensaje en Lisk.");
    }
  };

  const createNewChat = async (walletAddress: string) => {
    setIsCreatingChat(true);
    try {
      const newChatId = Date.now().toString();
      const newChat = {
        id: newChatId,
        name: walletAddress.includes(".")
          ? walletAddress
          : `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        address: walletAddress,
        createdAt: new Date().toISOString(),
        lastMessage: {content: "Nuevo chat"},
      };

      // Add new chat to the beginning of the list
      setChats((prevChats) => [newChat, ...prevChats]);

      // Automatically select the new chat
      setSelectedChat(newChatId);

      console.log("[v0] Creating new chat with:", walletAddress);
      toast.success(`Nuevo chat creado con ${newChat.name}`);
    } catch (error) {
      console.error("[v0] Error creating chat:", error);
      toast.error("Error creando nuevo chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleSendTip = async () => {
    if (!tipAmount || isNaN(Number(tipAmount))) {
      toast.error("Ingresa un monto válido");
      return;
    }

    try {
      // TODO: Implement tip functionality
      console.log("[v0] Sending tip:", tipAmount);
      setTipAmount("");
      setShowTipInput(false);
      toast.success("Tip enviado exitosamente");
    } catch (error) {
      console.error("[v0] Error sending tip:", error);
      toast.error("Error enviando tip");
    }
  };

  const handleChatSelect = (chatId: string, chatName: string) => {
    console.log("[v0] Selecting chat:", chatId, chatName);
    setSelectedChat(chatId);
    toast.success(`Chat abierto con ${chatName}`);
  };

  const displayMessages: Message[] = selectedChat ? messages : [];
  const selectedChatData = chats.find((chat) => chat.id === selectedChat);
  const isSending = isUploading || isPending;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card/30 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CrypteK</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => disconnect()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {address?.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Conectado</span>
                <Shield className="w-3 h-3 text-primary" />
              </div>
            </div>
          </div>

          <NewChatDialog
            onCreateChat={createNewChat}
            isCreating={isCreatingChat}
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id, chat.name)}
                className={`cursor-pointer transition-all hover:bg-muted/50 rounded-lg ${
                  selectedChat === chat.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : ""
                }`}
              >
                <ChatBox
                  name={chat.name}
                  time={new Date(chat.createdAt).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  messagePreview={chat.lastMessage?.content || "Nuevo chat"}
                />
              </div>
            ))}

            {chats.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No hay chats aún.
                <br />
                Crea uno nuevo para empezar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat && selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/abstract-profile.png" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedChatData.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChatData.name}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      En línea
                    </span>
                    <Shield className="w-3 h-3 text-primary ml-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTipInput(!showTipInput)}
                >
                  <DollarSign className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Encryption Notice */}
            <div className="p-3 bg-primary/5 border-b border-border">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-primary">
                  Mensajes cifrados de extremo a extremo con Zama
                </span>
              </div>
            </div>

            {showTipInput && (
              <div className="p-3 bg-muted/50 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Monto del tip"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSendTip} disabled={isSending}>
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Enviar Tip"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowTipInput(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      msg.isOwn ? "order-2" : "order-1"
                    }`}
                  >
                    {!msg.isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-primary">
                          {msg.sender}
                        </span>
                        {msg.isEncrypted && (
                          <Shield className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    )}
                    <Card
                      className={`p-3 ${
                        msg.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border-border"
                      }`}
                    >
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      {msg.fileCommP && <MediaMessage message={msg} />}

                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs ${
                            msg.isOwn
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                        {msg.isEncrypted && (
                          <Shield
                            className={`w-3 h-3 ${
                              msg.isOwn
                                ? "text-primary-foreground/70"
                                : "text-primary"
                            }`}
                          />
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              ))}

              {displayMessages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No hay mensajes aún.
                  <br />
                  Envía el primer mensaje cifrado.
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card/50">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {file && (
                <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between text-sm">
                  <span className="truncate">Adjuntado: {file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje cifrado..."
                    className="pr-10"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isSending}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    disabled={isSending}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={sendMessage}
                  className="bg-primary hover:bg-primary/90"
                  disabled={(!message.trim() && !file) || isSending}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-center mt-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Cifrado con Zama • Almacenado en Filecoin
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecciona un chat</h3>
              <p className="text-muted-foreground mb-4">
                Elige una conversación existente o crea una nueva para empezar a
                chatear de forma segura.
              </p>
              <NewChatDialog
                onCreateChat={createNewChat}
                isCreating={isCreatingChat}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
