"use client";

import {useState, useCallback, useEffect} from "react";
import {useAccount, useWriteContract} from "wagmi";
import type {Address} from "viem";
import {CryptekContracts} from "@/lib/contract-helper";
import {useWebSocket} from "@/lib/websocket-manager";
import {toast} from "sonner";

export function useChat() {
  const {address} = useAccount();
  const {writeContract, isPending: isWriting} = useWriteContract();
  const {
    isConnected: wsConnected,
    messages,
    chats: wsChats,
    sendMessage: wsSendMessage,
    createChat: wsCreateChat,
  } = useWebSocket(address);

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [localChats, setLocalChats] = useState<any[]>([]);

  // Combine WebSocket chats with local chats
  const chats = [...wsChats, ...localChats];

  // Debug logs
  console.log("[v0] wsChats:", wsChats);
  console.log("[v0] localChats:", localChats);
  console.log("[v0] localChats length:", localChats.length);
  localChats.forEach((chat, index) => {
    console.log(`[v0] Local chat ${index}:`, { id: chat.id, name: chat.name, hasId: !!chat.id });
  });
  console.log("[v0] combined chats:", chats);
  console.log("[v0] combined chats length:", chats.length);

  // Debug: log when chats change
  useEffect(() => {
    console.log("[v0] Chats state changed:", chats);
    console.log("[v0] Chats count:", chats.length);
  }, [chats]);

  const selectedChatMessages = messages.filter(
    (msg) => msg.chatId === selectedChat
  );

  const sendMessage = useCallback(
    async (content: string, isPrivate = true) => {
      if (!address || !selectedChat) return;

      try {
        if (isPrivate) {
          // Send encrypted message to Zama CryptekContracts
          const contractCall = await CryptekContracts.postEncryptedMessage(
            content,
            address
          );

          const hash = await writeContract(contractCall);
          console.log("[v0] Encrypted message sent:", hash);

          // Only send via WebSocket if connected
          if (wsConnected) {
            wsSendMessage(selectedChat, content, true);
          } else {
            console.log("[v0] WebSocket not connected, message stored locally only");
          }

          toast.success("Mensaje cifrado enviado");
        } else {
          // Send public message via WebSocket only if connected
          if (wsConnected) {
            wsSendMessage(selectedChat, content, false);
            toast.success("Mensaje enviado");
          } else {
            console.log("[v0] WebSocket not connected, cannot send public message");
            toast.error("Conexión WebSocket requerida para mensajes públicos");
          }
        }
      } catch (error: any) {
        console.error("[v0] Error in sendMessage:", error);
        toast.error("Error enviando mensaje");
      }
    },
    [address, selectedChat, writeContract, wsSendMessage]
  );

  const createNewChat = useCallback(
    async (participantAddress: Address, chatName?: string) => {
      console.log("[v0] createNewChat called with:", { participantAddress, chatName, address });

      if (!address) {
        console.error("[v0] No address available for creating chat");
        toast.error("Conecta tu wallet primero");
        return;
      }

      setIsCreatingChat(true);

      try {
        // Create chat on Lisk CryptekContracts
        const contractCall = CryptekContracts.createChat(
          chatName || `Chat with ${participantAddress.slice(0, 8)}...`
        );

        const hash = await writeContract(contractCall);
        console.log("[v0] Chat created on CryptekContracts:", hash);
        console.log("[v0] Hash type:", typeof hash);
        console.log("[v0] Hash value:", hash);

        // Ensure we have a valid ID - handle void type properly
        let chatId: string;
        if (hash !== undefined && hash !== null) {
          chatId = String(hash);
          console.log("[v0] Using transaction hash as ID:", chatId);
        } else {
          // Fallback: generate a unique ID based on timestamp and random
          chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log("[v0] Using fallback ID (no hash):", chatId);
        }

        // Create a local chat object for immediate UI update
        const newChat = {
          id: chatId,
          name: chatName || `Chat with ${participantAddress.slice(0, 8)}...`,
          participants: [address, participantAddress],
          createdAt: Date.now(),
        };

        console.log("[v0] New chat object:", newChat);

        // Add to local chats state
        setLocalChats(prev => {
          const newChats = [...prev, newChat];
          console.log("[v0] Updated localChats:", newChats);
          console.log("[v0] New chat added with ID:", newChat.id);
          console.log("[v0] Total chats after adding:", newChats.length);
          return newChats;
        });

        // Update local state immediately
        // Note: In production, this would come from WebSocket
        console.log("[v0] Chat created locally:", newChat);

        toast.success("Chat creado exitosamente");
      } catch (error: any) {
        console.error("[v0] Error creating chat:", error);
        toast.error("Error creando chat");
      } finally {
        setIsCreatingChat(false);
      }
    },
    [address, writeContract]
  );

  const sendPrivateTip = useCallback(
    async (amount: number) => {
      if (!address) return;

      try {
        const contractCall = await CryptekContracts.sendPrivateTip(
          amount,
          address
        );

        const hash = await writeContract(contractCall);
        console.log("[v0] Private tip sent:", hash);
        toast.success(`Tip privado de ${amount} enviado`);
      } catch (error: any) {
        console.error("[v0] Error sending private tip:", error);
        toast.error("Error enviando tip");
      }
    },
    [address, writeContract]
  );

  return {
    // Connection status
    isConnected: wsConnected,
    isWriting,
    isCreatingChat,

    // Chat data
    chats,
    messages: selectedChatMessages,
    selectedChat,
    setSelectedChat,

    // Actions
    sendMessage,
    createNewChat,
    sendPrivateTip,

    // User
    userAddress: address,
  };
}
