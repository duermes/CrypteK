"use client";

export const PROFILE_REGISTRY = process.env
  .NEXT_PUBLIC_PROFILE_REGISTRY as `0x${string}`;

export const PROFILE_ABI = [
  {
    type: "function",
    name: "ensName",
    stateMutability: "view",
    inputs: [{name: "", type: "address"}],
    outputs: [{type: "string"}],
  },
  {
    type: "function",
    name: "setENS",
    stateMutability: "nonpayable",
    inputs: [{name: "name", type: "string"}],
    outputs: [],
  },
] as const;
