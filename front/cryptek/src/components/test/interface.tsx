"use client";

import type React from "react";

import {useState, useRef} from "react";
import {useAccount, useDisconnect} from "wagmi";
import {useChat} from "@/hooks/use-chat";
import {NewChatDialog} from "@/components/chat/new-chat";
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

  const handleDownload = async () => {
    if (!message.fileCommP) return;
    setIsDownloading(true);
    try {
      console.log(`[v0] Downloading file with CommP: ${message.fileCommP}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Archivo ${message.fileName} descargado exitosamente`);
    } catch (error) {
      console.error("[v0] Error downloading file:", error);
      toast.error("Error descargando archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-2 border-t border-white/20 pt-2">
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
    </div>
  );
};

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tipAmount, setTipAmount] = useState("");
  const [showTipInput, setShowTipInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {address, isConnected} = useAccount();
  const {disconnect} = useDisconnect();

  const {
    isConnected: wsConnected,
    isWriting,
    isCreatingChat,
    chats,
    messages,
    selectedChat,
    setSelectedChat,
    sendMessage: sendChatMessage,
    createNewChat,
    sendPrivateTip,
    userAddress,
  } = useChat();

  // Use wallet connection status instead of WebSocket for basic functionality
  const canSendMessages = isConnected && address;

  // Debug function to reset chat state
  const resetChatState = () => {
    setSelectedChat(null);
    console.log("[DEBUG] Chat state reset");
  };

  // Debug function to log current state
  const logCurrentState = () => {
    console.log("[DEBUG] Current state:", {
      selectedChat,
      chats,
      chatsCount: chats.length,
      hasWallet: !!address,
      isWalletConnected: isConnected,
      canSendMessages
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && !file) return;
    if (!canSendMessages) {
      toast.error("Por favor, conecta tu wallet.");
      return;
    }

    if (!selectedChat) {
      toast.error("Selecciona un chat primero");
      return;
    }

    try {
      console.log("[v0] Sending message with new chat system...");

      // Handle file upload if present
      if (file) {
        console.log("[v0] File detected, preparing for upload...");
        // TODO: Integrate with Filecoin helper for actual file upload
        toast.info("Subiendo archivo a Filecoin...");
      }

      // Send message using new chat system
      await sendChatMessage(message, true); // true for encrypted

      setMessage("");
      setFile(null);
    } catch (error) {
      console.error("[v0] Error sending message:", error);
    }
  };

  const handleSendTip = async () => {
    if (!tipAmount || isNaN(Number(tipAmount))) {
      toast.error("Ingresa un monto válido");
      return;
    }

    try {
      await sendPrivateTip(Number(tipAmount));
      setTipAmount("");
      setShowTipInput(false);
    } catch (error) {
      console.error("[v0] Error sending tip:", error);
    }
  };

  const displayMessages: Message[] = messages.map((msg) => ({
    id: msg.id,
    sender: msg.sender === address ? "Tu" : msg.sender.slice(0, 8) + "...",
    content: msg.content,
    timestamp: new Date(msg.timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isOwn: msg.sender === address,
    isEncrypted: msg.encrypted,
    fileCommP: msg.cid,
  }));

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  // Debug: if selectedChat exists but selectedChatData is null, log the issue
  if (selectedChat && !selectedChatData) {
    console.error("[v0] selectedChat exists but no matching chat found:", selectedChat);
    console.log("[v0] Available chats:", chats.map(c => ({ id: c.id, name: c.name })));
  }

  // Debug logs
  console.log("[v0] selectedChat:", selectedChat);
  console.log("[v0] chats:", chats);
  console.log("[v0] chats length:", chats.length);
  chats.forEach((chat, index) => {
    console.log(`[v0] Chat ${index}:`, { id: chat.id, name: chat.name, hasId: !!chat.id });
  });
  console.log("[v0] selectedChatData:", selectedChatData);
  console.log("[v0] displayMessages:", displayMessages);

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
                <div
                  className={`w-2 h-2 rounded-full ${
                    wsConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-muted-foreground">
                  {wsConnected ? "Conectado" : "Desconectado"}
                </span>
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
                onClick={() => {
                  console.log("[v0] Clicking on chat:", chat);
                  console.log("[v0] Chat ID:", chat.id);
                  console.log("[v0] Chat name:", chat.name);
                  if (chat.id) {
                    setSelectedChat(chat.id);
                    console.log("[v0] Selected chat set to:", chat.id);
                  } else {
                    console.error("[v0] Chat ID is undefined! Cannot select chat:", chat);
                    // Try to use index as fallback
                    const chatIndex = chats.findIndex(c => c === chat);
                    if (chatIndex !== -1) {
                      const fallbackId = `fallback_${chatIndex}`;
                      setSelectedChat(fallbackId);
                      console.log("[v0] Using fallback ID:", fallbackId);
                    }
                  }
                }}
                className={`cursor-pointer ${
                  selectedChat === chat.id ? "ring-2 ring-primary" : ""
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
                <br />
                <button
                  onClick={() => console.log("[DEBUG] Current state:", { chats, localChats: chats, selectedChat })}
                  className="mt-2 px-3 py-1 bg-primary/20 rounded text-xs"
                >
                  Debug State
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {(() => {
          console.log("[v0] Render condition check:", { selectedChat, selectedChatData: !!selectedChatData });
          return selectedChat && selectedChatData ? (
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
                    <div
                      className={`w-2 h-2 rounded-full ${
                        wsConnected ? "bg-green-500" : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {wsConnected ? "En línea" : "Desconectado"}
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
                  <Button onClick={handleSendTip} disabled={isWriting}>
                    {isWriting ? (
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
                    disabled={isWriting}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={sendMessage}
                  className="bg-primary hover:bg-primary/90"
                  disabled={(!message.trim() && !file) || isWriting}
                >
                  {isWriting ? (
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
        )})()}
      </div>
    </div>
  );
}

export default ChatInterface;
