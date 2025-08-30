"use client";

import { ethers } from 'ethers';

interface SynapseInstance {
  payments: {
    balance: () => Promise<bigint>;
    walletBalance: (token: string) => Promise<bigint>;
    getCurrentEpoch: () => Promise<number>;
    calculateStorageCost?: (size: number) => Promise<{ perMonth: bigint }>;
  };
  createStorage: (options?: any) => Promise<StorageService>;
  getNetwork: () => string;
}

interface StorageService {
  proofSetId: number;
  storageProvider: string;
  preflightUpload: (size: number) => Promise<{
    estimatedCost: bigint;
    allowanceCheck: { sufficient: boolean };
  }>;
  upload: (data: Uint8Array, callbacks?: any) => Promise<{
    commp: { toString: () => string };
    size: number;
  }>;
  download: (commP: string) => Promise<Uint8Array>;
}

let synapseInstance: SynapseInstance | null = null;

export async function initializeSynapse(): Promise<SynapseInstance> {
  if (synapseInstance) return synapseInstance;
  
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask no está disponible');
  }

  try {    
    const { Synapse, RPC_URLS } = await import('@filoz/synapse-sdk');
       
    const provider = new ethers.BrowserProvider(window.ethereum);
        
    synapseInstance = await Synapse.create({
      provider,
      rpcURL: RPC_URLS.calibration.http,
    }) as SynapseInstance;

    console.log('✅ Synapse SDK inicializado para Filecoin Calibration');
    return synapseInstance;
  } catch (error) {
    console.error('Error inicializando Synapse:', error);
    throw new Error(`Error al inicializar Synapse: ${(error as Error).message}`);
  }
}

export async function prepareForStorage(dataSize: number) {
  const synapse = await initializeSynapse();
  
  try {    
    const balance = await synapse.payments.balance();
    console.log(`Balance USDFC en payments: ${ethers.formatUnits(balance, 18)}`);
    
    let estimatedCost = BigInt(0);
    try {
      if (synapse.payments.calculateStorageCost) {
        const costs = await synapse.payments.calculateStorageCost(dataSize);
        estimatedCost = costs.perMonth;
      } else {        
        estimatedCost = BigInt(Math.ceil(dataSize / 1024 / 1024)) * BigInt(10);
      }
    } catch (e) {
      console.warn('No se pudo calcular costo, usando estimación básica');
      estimatedCost = BigInt(Math.ceil(dataSize / 1024 / 1024)) * BigInt(10);
    }

    console.log(`Costo estimado: ${ethers.formatUnits(estimatedCost, 18)} USDFC/mes`);

    return {
      balance,
      estimatedCost,
      sufficient: balance > estimatedCost
    };
  } catch (error) {
    console.error('Error preparando storage:', error);
    throw error;
  }
}

export async function uploadToFilecoin(file: File): Promise<{
  commP: string;
  size: number;
  cid: string;
}> {
  const synapse = await initializeSynapse();
  
  try {    
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    console.log(`📁 Subiendo archivo de ${data.length} bytes a Filecoin Calibration...`);
    
    const storage = await synapse.createStorage({
      withCDN: true,
      callbacks: {
        onProviderSelected: (provider: any) => {
          console.log(`🏪 Proveedor seleccionado: ${provider.owner}`);
        },
        onProofSetResolved: (info: any) => {
          if (info.isExisting) {
            console.log(`📋 Usando proof set existente: ${info.proofSetId}`);
          } else {
            console.log(`📋 Creando nuevo proof set: ${info.proofSetId}`);
          }
        },
        onProofSetCreationProgress: (status: any) => {
          const elapsed = Math.round(status.elapsedMs / 1000);
          console.log(`⏱️ [${elapsed}s] Minado: ${status.transactionMined}, Activo: ${status.proofSetLive}`);
        }
      }
    });

    console.log(`📋 Proof Set ID: ${storage.proofSetId}`);
    console.log(`🏪 Storage Provider: ${storage.storageProvider}`);

    // Verificar si la subida es posible
    const preflight = await storage.preflightUpload(data.length);
    console.log('💰 Costos estimados:', preflight.estimatedCost);
    console.log('✅ Allowance suficiente:', preflight.allowanceCheck.sufficient);

    if (!preflight.allowanceCheck.sufficient) {
      throw new Error('Fondos insuficientes para la operación de storage');
    }
    
    const result = await storage.upload(data, {
      onUploadComplete: (commP: string) => {
        console.log(`✅ Upload completo! CommP: ${commP}`);
      },
      onRootAdded: (transaction: any) => {
        if (transaction) {
          console.log(`🔗 Transacción confirmada: ${transaction.hash}`);
        } else {
          console.log('📝 Datos agregados al proof set');
        }
      },
      onRootConfirmed: (rootIds: string[]) => {
        console.log(`🆔 Root IDs asignados: ${rootIds.join(', ')}`);
      }
    });

    return {
      commP: result.commp.toString(),
      size: result.size,
      cid: result.commp.toString()
    };
  } catch (error) {
    console.error('❌ Error subiendo a Filecoin:', error);
    throw new Error(`Error al subir a Filecoin: ${(error as Error).message}`);
  }
}


export async function downloadFromFilecoin(commP: string): Promise<Uint8Array> {
  const synapse = await initializeSynapse();
  
  try {
    const storage = await synapse.createStorage({ withCDN: true });
    const data = await storage.download(commP);
    return data;
  } catch (error) {
    console.error('❌ Error descargando desde Filecoin:', error);
    throw new Error(`Error al descargar de Filecoin: ${(error as Error).message}`);
  }
}

// Verificar estado del almacenamiento
export async function getStorageInfo(): Promise<any> {
  const synapse = await initializeSynapse();
  
  try {
    const { TOKENS } = await import('@filoz/synapse-sdk');
    
    const currentEpoch = await synapse.payments.getCurrentEpoch();
    const balance = await synapse.payments.balance();
    const walletBalance = await synapse.payments.walletBalance(TOKENS.USDFC);
    
    return {
      currentEpoch,
      paymentsBalance: ethers.formatUnits(balance, 18),
      walletBalance: ethers.formatUnits(walletBalance, 18),
      network: synapse.getNetwork()
    };
  } catch (error) {
    console.error('Error obteniendo info de storage:', error);    
    return {
      currentEpoch: 0,
      paymentsBalance: '0.0',
      walletBalance: '0.0',
      network: 'calibration'
    };
  }
}