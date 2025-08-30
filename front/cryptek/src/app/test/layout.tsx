"use client";

import {WagmiProvider} from "wagmi";
import {createConfig, http} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {liskSepolia, filecoinCalibration} from "wagmi/chains";

const config = createConfig({
  chains: [liskSepolia, filecoinCalibration],
  transports: {
    [liskSepolia.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
