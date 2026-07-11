"use client";

import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: { [base.id]: http() },
});

// Deployed BaseRacer contract (set NEXT_PUBLIC_RACER_CONTRACT in Vercel once deployed)
export const RACER_CONTRACT = (process.env.NEXT_PUBLIC_RACER_CONTRACT ||
  "") as `0x${string}` | "";

export const PLAY_FEE = 1000000000000n; // 0.000001 ETH

export const racerAbi = [
  {
    type: "function",
    name: "play",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
] as const;
