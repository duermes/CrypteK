"use client";
import {createPublicClient, http, namehash} from "viem";
import {mainnet, sepolia} from "viem/chains";

const ENS_CHAIN = sepolia;
const ENS_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string;

const client = createPublicClient({chain: ENS_CHAIN, transport: http(ENS_RPC)});

export async function resolveEnsName(name: string) {
  try {
    const addr = await client.getEnsAddress({name});
    return addr as `0x${string}` | null;
  } catch {
    return null;
  }
}

export async function reverseResolve(address: `0x${string}`) {
  try {
    const name = await client.getEnsName({address});
    return name as string | null;
  } catch {
    return null;
  }
}

export async function verifyEnsOwner(name: string, user: `0x${string}`) {
  const addr = await resolveEnsName(name);
  return addr?.toLowerCase() === user.toLowerCase();
}
