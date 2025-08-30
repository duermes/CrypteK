"use client";
import * as React from "react";
import {RainbowKitProvider, connectorsForWallets} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {createConfig, WagmiProvider, http} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {defineChain} from "viem/utils";

const filecoinCalibration = defineChain({
  id: 314159,
  name: "Filecoin Calibration",
  nativeCurrency: {name: "tFIL", symbol: "tFIL", decimals: 18},
  rpcUrls: {
    default: {
      http: ["https://api.calibration.node.glif.io/rpc/v1"],
    },
  },
  blockExplorers: {
    default: {
      name: "FilScan",
      url: "https://calibration.filscan.io",
    },
  },
  testnet: true,
});

const liskSepolia = defineChain({
  id: 4202,
  name: "Lisk Sepolia",
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18},
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_LISK_RPC_URL as string],
    },
  },
  testnet: true,
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Billeteras populares",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        trustWallet,
      ],
    },
  ],
  {
    appName: "CrypteK",
    projectId: projectId,
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [liskSepolia, filecoinCalibration],
  transports: {
    [liskSepolia.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});

export function Providers({children}: {children: React.ReactNode}) {
  const [mounted, setMounted] = React.useState(false);
  const [queryClient] = React.useState(() => new QueryClient());

  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{mounted && children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
