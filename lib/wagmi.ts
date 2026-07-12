import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

// Base ONLY. Farcaster/Base App wallet first, browser extension as fallback.
export const config = createConfig({
  chains: [base],
  connectors: [farcasterMiniApp(), injected()],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
