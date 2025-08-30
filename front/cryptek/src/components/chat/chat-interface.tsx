"use client";

import {useState} from "react";
import {useAccount, useDisconnect} from "wagmi";
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
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {ChatBox} from "./chat-box";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isEncrypted: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "alice.eth",
    content: "¡Hola! ¿Cómo estás? 👋",
    timestamp: "10:30",
    isOwn: false,
    isEncrypted: true,
  },
  {
    id: "2",
    sender: "Tu",
    content: "¡Todo bien! ¿Qué tal el nuevo trabajo?",
    timestamp: "10:32",
    isOwn: true,
    isEncrypted: true,
  },
  {
    id: "3",
    sender: "alice.eth",
    content:
      "Excelente, me encanta trabajar en Web3. Los proyectos son súper interesantes.",
    timestamp: "10:35",
    isOwn: false,
    isEncrypted: true,
  },
];

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const {address, isConnected} = useAccount();
  const {disconnect} = useDisconnect();

  const sendMessage = () => {
    if (!message.trim()) return;

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
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card/30 flex flex-col">
        {/* Sidebar Header */}
        <div className="">
          <ConnectButton />
        </div>
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

          <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
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
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-xs text-muted-foreground">Conectado</span>
                <Shield className="w-3 h-3 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <ChatBox
              name="alice.eth"
              time="10:35"
              messagePreview="¡Hola! ¿Cómo estás? 👋"
            />
            <ChatBox
              name="ricardo.eth"
              time="14:14"
              messagePreview="que tal.. 👋"
            />
            <ChatBox
              name="garye.eth"
              time="11:35"
              messagePreview="¡Hola! ¿Cómo estás? 👋¡Hola! ¿Cómo estás? 👋v"
            />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/abstract-profile.png" />
              <AvatarFallback className="bg-primary/10 text-primary">
                AE
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">alice.eth</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-xs text-muted-foreground">En línea</span>
                <Shield className="w-3 h-3 text-primary ml-1" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
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
                  <p className="text-sm">{msg.content}</p>
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
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje cifrado..."
                className="pr-10"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center mt-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Cifrado con Zama • Almacenado en Filecoin
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
