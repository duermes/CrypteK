// filecoin.ts
import { SynapseSDK } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';

// Filecoin Calibration Testnet Configuration
export const FILECOIN_CALIBRATION_CONFIG = {
  chainId: 314159,
  name: 'Filecoin Calibration',
  rpcUrl: 'https://api.calibration.node.glif.io/rpc/v1',
  explorerUrl: 'https://calibration.filfox.info'
};

let synapseSDK: SynapseSDK | null = null;

/**
 * Inicializa el SynapseSDK con la configuración de Calibration testnet
 */
export const initializeSynapse = async () => {
  try {
    // Configuración para Filecoin Calibration testnet
    const config = {
      network: 'calibration', // Usar calibration testnet
      rpcUrl: FILECOIN_CALIBRATION_CONFIG.rpcUrl,
      // Opcional: configurar storage providers específicos
      storageProviders: [
        // Puedes especificar storage providers específicos aquí
        // o dejar que el SDK use los por defecto
      ]
    };

    synapseSDK = new SynapseSDK(config);
    await synapseSDK.initialize();
    
    console.log('✅ SynapseSDK inicializado correctamente para Filecoin Calibration');
    return synapseSDK;
  } catch (error) {
    console.error('❌ Error inicializando SynapseSDK:', error);
    throw new Error(`Error al inicializar SynapseSDK: ${error}`);
  }
};

/**
 * Obtiene información del estado de storage en Filecoin
 */
export const getStorageInfo = async (): Promise<{
  network: string;
  currentEpoch: number;
  paymentsBalance: string;
  walletBalance: string;
}> => {
  if (!synapseSDK) {
    throw new Error('SynapseSDK no inicializado. Llama a initializeSynapse() primero.');
  }

  try {
    // Obtener información del estado actual
    const networkInfo = await synapseSDK.getNetworkInfo();
    const balanceInfo = await synapseSDK.getBalanceInfo();

    return {
      network: 'Filecoin Calibration',
      currentEpoch: networkInfo.currentEpoch || 0,
      paymentsBalance: balanceInfo.paymentsBalance || '0',
      walletBalance: balanceInfo.walletBalance || '0'
    };
  } catch (error) {
    console.error('❌ Error obteniendo info de storage:', error);
    throw error;
  }
};

/**
 * Prepara el wallet para storage verificando balance y estimando costos
 */
export const prepareForStorage = async (fileSize: number): Promise<{
  balance: bigint;
  estimatedCost: bigint;
  sufficient: boolean;
}> => {
  if (!synapseSDK) {
    throw new Error('SynapseSDK no inicializado');
  }

  try {
    // Estimar el costo de almacenamiento
    const costEstimate = await synapseSDK.estimateStorageCost({
      size: fileSize,
      duration: 2880 * 180, // ~6 meses en epochs
      replicas: 1
    });

    // Obtener balance actual
    const balanceInfo = await synapseSDK.getBalanceInfo();
    const currentBalance = BigInt(balanceInfo.walletBalance || '0');
    const estimatedCost = BigInt(costEstimate.totalCost || '0');

    return {
      balance: currentBalance,
      estimatedCost: estimatedCost,
      sufficient: currentBalance >= estimatedCost
    };
  } catch (error) {
    console.error('❌ Error preparando storage:', error);
    throw error;
  }
};

/**
 * Sube un archivo a Filecoin usando SynapseSDK
 */
export const uploadToFilecoin = async (file: File): Promise<{
  commP: string;
  size: number;
  cid: string;
  dealId?: string;
}> => {
  if (!synapseSDK) {
    throw new Error('SynapseSDK no inicializado');
  }

  try {
    console.log(`📁 Iniciando upload de archivo: ${file.name} (${file.size} bytes)`);

    // Convertir File a Buffer/Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Configurar parámetros de storage
    const storageParams = {
      data: fileData,
      fileName: file.name,
      duration: 2880 * 180, // ~6 meses en epochs de Filecoin
      replicas: 1, // Número de copias
      // Opcional: especificar storage providers
      // storageProviders: ['f0xxxxx']
    };

    // Subir archivo usando SynapseSDK
    const uploadResult = await synapseSDK.uploadFile(storageParams);

    console.log(`✅ Archivo subido exitosamente!`);
    console.log(`   CID: ${uploadResult.cid}`);
    console.log(`   CommP: ${uploadResult.commP}`);
    console.log(`   Deal ID: ${uploadResult.dealId}`);

    return {
      commP: uploadResult.commP,
      size: file.size,
      cid: uploadResult.cid,
      dealId: uploadResult.dealId
    };

  } catch (error) {
    console.error('❌ Error subiendo archivo a Filecoin:', error);
    throw new Error(`Error en upload: ${error}`);
  }
};

/**
 * Descarga un archivo desde Filecoin usando el CID
 */
export const downloadFromFilecoin = async (cid: string): Promise<Uint8Array> => {
  if (!synapseSDK) {
    throw new Error('SynapseSDK no inicializado');
  }

  try {
    console.log(`📥 Descargando archivo con CID: ${cid}`);

    const fileData = await synapseSDK.retrieveFile(cid);
    
    console.log(`✅ Archivo descargado exitosamente (${fileData.length} bytes)`);
    return fileData;

  } catch (error) {
    console.error('❌ Error descargando archivo:', error);
    throw new Error(`Error en download: ${error}`);
  }
};

/**
 * Verifica el estado de un deal en Filecoin
 */
export const checkDealStatus = async (dealId: string): Promise<{
  status: string;
  isActive: boolean;
  provider: string;
}> => {
  if (!synapseSDK) {
    throw new Error('SynapseSDK no inicializado');
  }

  try {
    const dealInfo = await synapseSDK.getDealInfo(dealId);
    
    return {
      status: dealInfo.status,
      isActive: dealInfo.isActive,
      provider: dealInfo.provider
    };
  } catch (error) {
    console.error('❌ Error verificando deal:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de storage del usuario
 */
export const getStorageStats = async (): Promise<{
  totalStored: number;
  activeDeals: number;
  totalCost: string;
}> => {
  if (!synapseSDK) {
    throw new Error('SynapseSDK no inicializado');
  }

  try {
    const stats = await synapseSDK.getStorageStats();
    
    return {
      totalStored: stats.totalBytesStored || 0,
      activeDeals: stats.activeDeals || 0,
      totalCost: stats.totalSpent || '0'
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    throw error;
  }
};