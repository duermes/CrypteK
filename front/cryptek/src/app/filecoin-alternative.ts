"use client";

import { ethers } from 'ethers';

export async function connectToFilecoinCalibration() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask no está disponible');
  }

  try {    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x4CB2F', 
        chainName: 'Filecoin Calibration',
        nativeCurrency: { name: 'tFIL', symbol: 'tFIL', decimals: 18 },
        rpcUrls: ['https://api.calibration.node.glif.io/rpc/v1'],
        blockExplorerUrls: ['https://calibration.filscan.io']
      }]
    });
   
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x4CB2F' }],
    });

    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  } catch (error) {
    console.error('Error conectando a Filecoin Calibration:', error);
    throw error;
  }
}

export async function uploadToFilecoinDirect(file: File): Promise<{
  commP: string;
  size: number;
  cid: string;
}> {
  try {   
    const provider = await connectToFilecoinCalibration();
    const signer = await provider.getSigner();
    
    console.log('📁 Preparando subida a Filecoin Calibration...');
    console.log(`Archivo: ${file.name}, Tamaño: ${file.size} bytes`);
        
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
        
    const hash = ethers.keccak256(data);
    const mockCommP = `baga6ea4seaq${hash.slice(2, 50)}`;
    
    console.log(`✅ Archivo "subido" a Filecoin Calibration`);
    console.log(`CommP simulado: ${mockCommP}`);
        
    (window as any).filecoinStorage = (window as any).filecoinStorage || {};
    (window as any).filecoinStorage[mockCommP] = {
      data: data,
      fileName: file.name,
      fileType: file.type,
      uploadedAt: new Date().toISOString()
    };
    
    return {
      commP: mockCommP,
      size: file.size,
      cid: mockCommP
    };
  } catch (error) {
    console.error('❌ Error en upload directo a Filecoin:', error);
    throw new Error(`Error al subir a Filecoin: ${(error as Error).message}`);
  }
}

export async function downloadFromFilecoinDirect(commP: string): Promise<Uint8Array> {
  try {    
    const storage = (window as any).filecoinStorage;
    
    if (!storage || !storage[commP]) {
      throw new Error('Archivo no encontrado en Filecoin');
    }
    
    const fileData = storage[commP];
    console.log(`📥 Descargando ${fileData.fileName} desde Filecoin`);
    
    return fileData.data;
  } catch (error) {
    console.error('❌ Error descargando desde Filecoin:', error);
    throw error;
  }
}

export async function getFilecoinInfo() {
  try {
    const provider = await connectToFilecoinCalibration();
    const network = await provider.getNetwork();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    
    return {
      network: network.name,
      currentEpoch: (await provider.getBlockNumber()),
      walletBalance: ethers.formatEther(balance),
      paymentsBalance: "0 (n/a en esta demo)"
    };
  } catch (error) {
    console.error('Error obteniendo info de Filecoin:', error);
    throw error;
  }
}

export async function prepareForStorage(fileSize: number) {
  const estimatedCost = ethers.parseEther("0.0001"); // Costo estimado en FIL
  const provider = await connectToFilecoinCalibration();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);

  return {
    sufficient: balance >= estimatedCost,
    balance: balance,
    estimatedCost: estimatedCost,
  };
}