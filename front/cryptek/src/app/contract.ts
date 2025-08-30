export const MESSAGE_COMMIT_ADDRESS = process.env.NEXT_PUBLIC_MESSAGE_COMMIT as `0x${string}`;

export const MESSAGE_COMMIT_ABI = [
  {
    "type":"function",
    "name":"post",
    "stateMutability":"nonpayable",
    "inputs":[
      {"name":"chatId","type":"uint256"},
      {"name":"hash","type":"bytes32"},
      {"name":"cid","type":"string"}
    ],
    "outputs":[{"name":"id","type":"uint256"}]
  }
] as const;
