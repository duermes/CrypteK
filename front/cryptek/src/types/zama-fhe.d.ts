declare module "https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.js" {
  export function initSDK(): Promise<void>;
  export function createInstance(config: any): Promise<any>;
  export const SepoliaConfig: any;
  export function createEncryptedInput(
    data: string | number,
    options: { contractAddress: string; userAddress: string }
  ): Promise<{
    handles: string[];
    attestation: any;
  }>;
}
