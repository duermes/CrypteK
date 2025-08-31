"use client";

import {useEffect, useState} from "react";
import type {Address} from "viem";

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: Address;
  content: string;
  timestamp: number;
  encrypted: boolean;
  cid?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: Address[];
  lastMessage?: ChatMessage;
  createdAt: number;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(userAddress: Address) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    // In production, this would be your WebSocket server URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

    try {
      this.ws = new WebSocket(`${wsUrl}?address=${userAddress}`);

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected");
        this.reconnectAttempts = 0;
        this.emit("connected", {userAddress});
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data.payload);
        } catch (error) {
          console.error("[v0] WebSocket message parse error:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("[v0] WebSocket disconnected");
        this.emit("disconnected", {});
        this.attemptReconnect(userAddress);
      };

      this.ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error);
        this.emit("error", {error});
      };
    } catch (error) {
      console.error("[v0] WebSocket connection failed:", error);
    }
  }

  private attemptReconnect(userAddress: Address) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`[v0] Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect(userAddress);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({type, payload}));
    } else {
      console.warn("[v0] WebSocket not connected, message not sent");
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

const wsManager = new WebSocketManager();

export function useWebSocket(userAddress?: Address) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (!userAddress) return;

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleChatCreated = (chat: ChatRoom) => {
      setChats((prev) => [...prev, chat]);
    };

    const handleChatUpdated = (updatedChat: ChatRoom) => {
      setChats((prev) =>
        prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
      );
    };

    wsManager.on("connected", handleConnected);
    wsManager.on("disconnected", handleDisconnected);
    wsManager.on("new_message", handleNewMessage);
    wsManager.on("chat_created", handleChatCreated);
    wsManager.on("chat_updated", handleChatUpdated);

    wsManager.connect(userAddress);

    return () => {
      wsManager.off("connected", handleConnected);
      wsManager.off("disconnected", handleDisconnected);
      wsManager.off("new_message", handleNewMessage);
      wsManager.off("chat_created", handleChatCreated);
      wsManager.off("chat_updated", handleChatUpdated);
    };
  }, [userAddress]);

  const sendMessage = (chatId: string, content: string, encrypted = true) => {
    wsManager.send("send_message", {chatId, content, encrypted});
  };

  const createChat = (participantAddress: Address, name?: string) => {
    wsManager.send("create_chat", {participantAddress, name});
  };

  const joinChat = (chatId: string) => {
    wsManager.send("join_chat", {chatId});
  };

  return {
    isConnected,
    messages,
    chats,
    sendMessage,
    createChat,
    joinChat,
    wsManager,
  };
}

export default wsManager;
