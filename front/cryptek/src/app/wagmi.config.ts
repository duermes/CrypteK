import { http, createConfig } from 'wagmi';
import { liskSepolia } from 'wagmi/chains';

export const filecoinCalibration = {
  id: 314159,
  name: 'Filecoin Calibration',
  nativeCurrency: {
    decimals: 18,
    name: 'tFIL',
    symbol: 'tFIL',
  },
  rpcUrls: {
    default: {
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
      webSocket: ['wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1'],
    },
  },
  blockExplorers: {
    default: {
      name: 'FilFox',
      url: 'https://calibration.filfox.info',
    },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [liskSepolia, filecoinCalibration],
  transports: {
    [liskSepolia.id]: http(),
    [filecoinCalibration.id]: http('https://api.calibration.node.glif.io/rpc/v1'),
  },
});

export const CHAIN_IDS = {
  LISK_SEPOLIA: 4202,
  FILECOIN_CALIBRATION: 314159,
} as const;