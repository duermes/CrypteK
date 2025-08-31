"use client";

import type React from "react";

import {useState} from "react";
import {type Address, isAddress} from "viem";
import {useAccount} from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Plus} from "lucide-react";
import {toast} from "sonner";

interface NewChatDialogProps {
  onCreateChat: (address: Address, name?: string) => Promise<void>;
  isCreating: boolean;
}

export function NewChatDialog({onCreateChat, isCreating}: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [chatName, setChatName] = useState("");

  const {address, isConnected} = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Por favor, conecta tu wallet primero");
      return;
    }

    if (!walletAddress.trim()) {
      toast.error("Ingresa una dirección de wallet");
      return;
    }

    if (!isAddress(walletAddress)) {
      toast.error("Dirección de wallet inválida");
      return;
    }

    try {
      await onCreateChat(
        walletAddress as Address,
        chatName.trim() || undefined
      );
      setOpen(false);
      setWalletAddress("");
      setChatName("");
    } catch (error) {
      console.error("[v0] Error creating chat:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet">Dirección de Wallet</Label>
            <Input
              id="wallet"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Chat (opcional)</Label>
            <Input
              id="name"
              placeholder="Mi chat privado"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear Chat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
