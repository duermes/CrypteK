"use client";

import {useState, useCallback} from "react";
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
    chats,
    sendMessage: wsSendMessage,
    createChat: wsCreateChat,
  } = useWebSocket(address);

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

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

          await writeContract({
            ...contractCall,
            onSuccess: (hash) => {
              console.log("[v0] Encrypted message sent:", hash);
              // Also send via WebSocket for real-time updates
              wsSendMessage(selectedChat, content, true);
              toast.success("Mensaje cifrado enviado");
            },
            onError: (error) => {
              console.error("[v0] Error sending encrypted message:", error);
              toast.error("Error enviando mensaje cifrado");
            },
          });
        } else {
          // Send public message via WebSocket only
          wsSendMessage(selectedChat, content, false);
          toast.success("Mensaje enviado");
        }
      } catch (error) {
        console.error("[v0] Error in sendMessage:", error);
        toast.error("Error enviando mensaje");
      }
    },
    [address, selectedChat, writeContract, wsSendMessage]
  );

  const createNewChat = useCallback(
    async (participantAddress: Address, chatName?: string) => {
      if (!address) return;

      setIsCreatingChat(true);

      try {
        // Create chat on Lisk CryptekContracts
        const contractCall = CryptekContracts.createChat(
          chatName || `Chat with ${participantAddress.slice(0, 8)}...`
        );

        await writeContract({
          ...contractCall,
          onSuccess: (hash) => {
            console.log("[v0] Chat created on CryptekContracts:", hash);
            // Also create via WebSocket
            wsCreateChat(participantAddress, chatName);
            toast.success("Chat creado exitosamente");
          },
          onError: (error) => {
            console.error("[v0] Error creating chat:", error);
            toast.error("Error creando chat");
          },
        });
      } catch (error) {
        console.error("[v0] Error in createNewChat:", error);
        toast.error("Error creando chat");
      } finally {
        setIsCreatingChat(false);
      }
    },
    [address, writeContract, wsCreateChat]
  );

  const sendPrivateTip = useCallback(
    async (amount: number) => {
      if (!address) return;

      try {
        const contractCall = await CryptekContracts.sendPrivateTip(
          amount,
          address
        );

        await writeContract({
          ...contractCall,
          onSuccess: (hash) => {
            console.log("[v0] Private tip sent:", hash);
            toast.success(`Tip privado de ${amount} enviado`);
          },
          onError: (error) => {
            console.error("[v0] Error sending private tip:", error);
            toast.error("Error enviando tip privado");
          },
        });
      } catch (error) {
        console.error("[v0] Error in sendPrivateTip:", error);
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
