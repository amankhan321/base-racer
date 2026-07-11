"use client";

// Minimal injected-wallet helper. No wagmi — talks to window.ethereum directly.
// Hard-gates everything to Base mainnet (8453).

export const BASE_CHAIN_HEX = "0x2105"; // 8453
// Fee receiver: the BaseRacer contract. Empty string = free mode (no tx) until set.
export const RACER_CONTRACT: string = "0x87407B77B2BE9F8aE02C8eF208AFC4646A76D546";
// 0.000001 ETH in wei, hex — the "penny" restart fee
export const PLAY_FEE_HEX = "0xe8d4a51000"; // 1e12 wei
// play() selector: keccak("play()") first 4 bytes
export const PLAY_SELECTOR = "0x93e84cd9";

type Eth = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (ev: string, cb: (...a: unknown[]) => void) => void;
  removeListener?: (ev: string, cb: (...a: unknown[]) => void) => void;
};

export function getEth(): Eth | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: Eth }).ethereum ?? null;
}

export async function connectWallet(): Promise<string | null> {
  const eth = getEth();
  if (!eth) return null;
  const accts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  return accts?.[0] ?? null;
}

export async function currentChain(): Promise<string | null> {
  const eth = getEth();
  if (!eth) return null;
  try {
    return (await eth.request({ method: "eth_chainId" })) as string;
  } catch {
    return null;
  }
}

export async function switchToBase(): Promise<boolean> {
  const eth = getEth();
  if (!eth) return false;
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_HEX }],
    });
    return true;
  } catch (e: unknown) {
    // 4902 = chain not added to wallet
    const code = (e as { code?: number })?.code;
    if (code === 4902) {
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BASE_CHAIN_HEX,
              chainName: "Base",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Pays the tiny play fee. Resolves with tx hash once the user confirms.
export async function payPlayFee(from: string): Promise<string> {
  const eth = getEth();
  if (!eth) throw new Error("no wallet");
  if (!RACER_CONTRACT) return "free";
  const hash = (await eth.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: RACER_CONTRACT,
        value: PLAY_FEE_HEX,
        data: PLAY_SELECTOR,
      },
    ],
  })) as string;
  return hash;
}
