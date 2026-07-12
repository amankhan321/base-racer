// BaseRacer on Base mainnet (8453)
export const RACER_ADDRESS =
  "0x87407B77B2BE9F8aE02C8eF208AFC4646A76D546" as const;

// 0.000001 ETH play fee, in wei
export const PLAY_FEE = 1000000000000n;

export const racerAbi = [
  {
    type: "function",
    name: "play",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;
