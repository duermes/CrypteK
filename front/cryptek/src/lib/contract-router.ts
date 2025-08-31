// import {createInstance, SepoliaConfig} from "@zama-fhe/relayer-sdk";

// const instance = await createInstance(SepoliaConfig);

// const {publicKey, privateKey} = await instance.generateKeypair();

// const eip712 = instance.createEIP712(
//   publicKey,
//   process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
// );

// const signature = async (userAddress: string) =>
//   await window.ethereum.request({
//     method: "eth_signTypedData_v4",
//     params: [userAddress, JSON.stringify(eip712)],
//   });

// const encryptedInput = async (value: string, userAddress: string) =>
//   await instance.createEncryptedInput(value, {
//     contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
//     userAddress: userAddress,
//   });

// const decryptedInput = async (
//   encryptedHandle: string,
//   privateKey: string,
//   publicKey: string,
//   signature: string,
//   contractAddress: string,
//   userAddress: string
// ) => {
//   return await instance.userDecrypt(
//     encryptedHandle,
//     privateKey,
//     publicKey,
//     signature,
//     contractAddress,
//     userAddress
//   );
// };
