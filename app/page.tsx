"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { base } from "wagmi/chains";
import RacerGame, { RaceResult } from "./RacerGame";
import { RACER_ADDRESS, PLAY_FEE, racerAbi } from "@/lib/contract";

type Screen = "home" | "playing" | "over";

const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [result, setResult] = useState<RaceResult | null>(null);
  const [best, setBest] = useState(0);
  const [garage, setGarage] = useState(0);
  const [hud, setHud] = useState({ score: 0, coins: 0, speed: 0 });
  const [err, setErr] = useState("");

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { writeContractAsync, isPending: paying } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });

  const onBase = chainId === base.id;

  useEffect(() => {
    setBest(Number(localStorage.getItem("racer_best") || 0));
    setGarage(Number(localStorage.getItem("racer_garage") || 0));
    // dismiss the Farcaster splash
    import("@farcaster/miniapp-sdk")
      .then(({ sdk }) => sdk.actions.ready())
      .catch(() => {});
  }, []);

  // Inside Farcaster / Base App, connect straight to the host wallet.
  useEffect(() => {
    if (isConnected) return;
    const fc = connectors.find((c) => c.id === "farcasterMiniApp" || c.id === "farcaster");
    if (fc) connect({ connector: fc });
  }, [isConnected, connectors, connect]);

  const doConnect = useCallback(() => {
    setErr("");
    const fc = connectors.find((c) => c.id === "farcasterMiniApp" || c.id === "farcaster");
    const inj = connectors.find((c) => c.id === "injected");
    const pick = fc ?? inj;
    if (pick) connect({ connector: pick });
    else setErr("No wallet available.");
  }, [connectors, connect]);

  const start = useCallback(async () => {
    if (!isConnected) return doConnect();
    if (!onBase) {
      setErr("");
      switchChain({ chainId: base.id });
      return;
    }
    setErr("");
    try {
      const hash = await writeContractAsync({
        address: RACER_ADDRESS,
        abi: racerAbi,
        functionName: "play",
        value: PLAY_FEE,
        chainId: base.id,
      });
      setTxHash(hash);
      setResult(null);
      setHud({ score: 0, coins: 0, speed: 0 });
      setScreen("playing");
    } catch {
      setErr("Transaction cancelled.");
    }
  }, [isConnected, onBase, doConnect, switchChain, writeContractAsync]);

  const onGameOver = useCallback((r: RaceResult) => {
    setResult(r);
    setBest((b) => {
      const nb = Math.max(b, r.score);
      localStorage.setItem("racer_best", String(nb));
      return nb;
    });
    setGarage((g) => {
      const ng = g + r.coins;
      localStorage.setItem("racer_garage", String(ng));
      return ng;
    });
    setScreen("over");
  }, []);

  const busy = connecting || switching || paying || confirming;
  const label = !isConnected
    ? connecting
      ? "Connecting…"
      : "🔵 Connect Wallet"
    : !onBase
    ? switching
      ? "Switching…"
      : "⛓ Switch to Base"
    : paying
    ? "Confirm in wallet…"
    : confirming
    ? "Starting on Base…"
    : "▶ Start Race";

  return (
    <main className="relative mx-auto flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-night">
      {screen === "home" && (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="text-[64px] leading-none">🏎️</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            <span className="text-neon">BASE</span> RACER
          </h1>
          <p className="mt-2 max-w-[290px] text-sm text-white/55">
            Dodge the traffic, grab the coins. Every run starts with a tiny onchain
            fee on Base — just for fun, no prizes.
          </p>
          <div className="mt-4 flex gap-2 text-sm">
            {best > 0 && (
              <span className="rounded-full bg-white/10 px-4 py-1 font-semibold">Best: {best}</span>
            )}
            <span className="rounded-full bg-white/10 px-4 py-1 font-semibold text-gold">🪙 {garage}</span>
          </div>
          {isConnected && (
            <p className="mt-3 rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
              {short(address)} {onBase ? "· Base ✓" : "· wrong network"}
            </p>
          )}
          <button
            onClick={start}
            disabled={busy}
            className="mt-8 w-full rounded-2xl bg-neon py-4 text-lg font-extrabold text-night shadow-[0_0_30px_rgba(0,229,255,0.35)] active:scale-[0.98] disabled:opacity-60"
          >
            {label}
          </button>
          {err && <p className="mt-3 text-xs text-danger">{err}</p>}
          <p className="mt-4 text-xs text-white/40">Drag left / right to steer</p>
        </div>
      )}

      {screen === "playing" && (
        <div className="relative h-full w-full">
          <RacerGame onGameOver={onGameOver} onTick={setHud} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-sm font-bold">
            <span className="rounded-lg bg-black/45 px-3 py-1 tabular-nums backdrop-blur">{hud.score}</span>
            <span className="rounded-lg bg-black/45 px-3 py-1 text-gold tabular-nums backdrop-blur">🪙 {hud.coins}</span>
          </div>
        </div>
      )}

      {screen === "over" && result && (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">Crashed</p>
          <h2 className="mt-1 text-6xl font-extrabold text-neon tabular-nums">{result.score}</h2>
          <div className="mt-4 flex gap-3 text-sm">
            <span className="rounded-xl bg-white/10 px-4 py-2">Distance {result.distance}</span>
            <span className="rounded-xl bg-white/10 px-4 py-2 text-gold">🪙 +{result.coins}</span>
          </div>
          <p className="mt-3 text-xs text-white/45">Garage balance: 🪙 {garage}</p>
          {result.score >= best && result.score > 0 && (
            <p className="mt-3 font-bold text-gold">🏆 New best!</p>
          )}
          <button
            onClick={start}
            disabled={busy}
            className="mt-8 w-full rounded-2xl bg-neon py-4 text-lg font-extrabold text-night active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? label : "↻ Race again"}
          </button>
          <button
            onClick={() => setScreen("home")}
            className="mt-3 w-full rounded-2xl bg-white/10 py-3 font-bold active:scale-[0.98]"
          >
            Home
          </button>
          {err && <p className="mt-3 text-xs text-danger">{err}</p>}
        </div>
      )}
    </main>
  );
}
