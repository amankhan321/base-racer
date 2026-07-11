"use client";
import { useCallback, useEffect, useState } from "react";
import RacerGame, { RaceResult } from "./RacerGame";
import {
  connectWallet, currentChain, switchToBase, payPlayFee, getEth,
  BASE_CHAIN_HEX, RACER_CONTRACT,
} from "@/lib/wallet";
type Screen = "home" | "playing" | "over";
const short = (a?: string | null) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [result, setResult] = useState<RaceResult | null>(null);
  const [best, setBest] = useState(0);
  const [garage, setGarage] = useState(0); // persistent coin balance
  const [hud, setHud] = useState({ score: 0, coins: 0, speed: 0 });
  const [addr, setAddr] = useState<string | null>(null);
  const [chain, setChain] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [hasWallet, setHasWallet] = useState(true);
  useEffect(() => {
    setBest(Number(localStorage.getItem("racer_best") || 0));
    setGarage(Number(localStorage.getItem("racer_garage") || 0));
    setHasWallet(!!getEth());
    currentChain().then(setChain);
    import("@farcaster/miniapp-sdk")
      .then(({ sdk }) => sdk.actions.ready())
      .catch(() => {});
    const eth = getEth();
    const onChain = (c: unknown) => setChain(c as string);
    const onAccts = (a: unknown) => setAddr(((a as string[]) || [])[0] ?? null);
    eth?.on?.("chainChanged", onChain);
    eth?.on?.("accountsChanged", onAccts);
    return () => {
      eth?.removeListener?.("chainChanged", onChain);
      eth?.removeListener?.("accountsChanged", onAccts);
    };
  }, []);
  const onBase = chain === BASE_CHAIN_HEX;
  const connected = !!addr;
  const doConnect = useCallback(async () => {
    setBusy(true); setMsg("");
    try {
      const a = await connectWallet();
      setAddr(a);
      setChain(await currentChain());
      if (!a) setMsg("No wallet found — open in a wallet browser or install one.");
    } catch { setMsg("Connection cancelled."); }
    setBusy(false);
  }, []);
  const doSwitch = useCallback(async () => {
    setBusy(true); setMsg("");
    const ok = await switchToBase();
    setChain(await currentChain());
    if (!ok) setMsg("Couldn't switch — please switch to Base in your wallet.");
    setBusy(false);
  }, []);
  const start = useCallback(async () => {
    if (!connected || !onBase) return;
    setBusy(true); setMsg("");
    try {
      await payPlayFee(addr!); // "free" when contract not set yet
      setResult(null);
      setHud({ score: 0, coins: 0, speed: 0 });
      setScreen("playing");
    } catch {
      setMsg("Transaction cancelled — no race without fuel ⛽");
    }
    setBusy(false);
  }, [connected, onBase, addr]);
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
  const gate = !hasWallet ? (
    <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/70">
      Open this page inside a wallet app (Coinbase Wallet, Rabby, MetaMask) to race.
    </p>
  ) : !connected ? (
    <button onClick={doConnect} disabled={busy}
      className="mt-8 w-full rounded-2xl bg-base py-4 text-lg font-extrabold text-white shadow-[0_0_30px_rgba(0,82,255,0.4)] active:scale-[0.98] disabled:opacity-60">
      {busy ? "Connecting…" : "🔵 Connect Wallet"}
    </button>
  ) : !onBase ? (
    <button onClick={doSwitch} disabled={busy}
      className="mt-8 w-full rounded-2xl bg-base py-4 text-lg font-extrabold text-white shadow-[0_0_30px_rgba(0,82,255,0.4)] active:scale-[0.98] disabled:opacity-60">
      {busy ? "Switching…" : "⛓ Switch to Base"}
    </button>
  ) : (
    <button onClick={start} disabled={busy}
      className="mt-8 w-full rounded-2xl bg-neon py-4 text-lg font-extrabold text-night shadow-[0_0_30px_rgba(0,229,255,0.35)] active:scale-[0.98] disabled:opacity-60">
      {busy ? "Confirm in wallet…" : "▶ Start Race"}
    </button>
  );
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
            {best > 0 && <span className="rounded-full bg-white/10 px-4 py-1 font-semibold">Best: {best}</span>}
            <span className="rounded-full bg-white/10 px-4 py-1 font-semibold text-gold">🪙 {garage}</span>
          </div>
          {connected && (
            <p className="mt-3 rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
              {short(addr)} {onBase ? "· Base ✓" : "· wrong network"}
            </p>
          )}
          {gate}
          {msg && <p className="mt-3 text-xs text-danger">{msg}</p>}
          <p className="mt-4 text-xs text-white/40">
            Drag left / right to steer{RACER_CONTRACT ? "" : " · fee goes live once the contract is deployed"}
          </p>
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
          <button onClick={start} disabled={busy}
            className="mt-8 w-full rounded-2xl bg-neon py-4 text-lg font-extrabold text-night active:scale-[0.98] disabled:opacity-60">
            {busy ? "Confirm in wallet…" : "↻ Race again"}
          </button>
          <button onClick={() => setScreen("home")}
            className="mt-3 w-full rounded-2xl bg-white/10 py-3 font-bold active:scale-[0.98]">
            Home
          </button>
          {msg && <p className="mt-3 text-xs text-danger">{msg}</p>}
        </div>
      )}
    </main>
  );
}