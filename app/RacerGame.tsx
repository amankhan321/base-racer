"use client";
import { useEffect, useRef } from "react";
export type RaceResult = { distance: number; coins: number; score: number };
const LANES = 4;
const ENEMY_COLORS = ["#D62828", "#5B21B6", "#0F766E", "#B45309", "#BE185D", "#1D4ED8", "#C2410C", "#0891B2"];
function tones(hex: string) {
const n = parseInt(hex.slice(1), 16);
const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
const mk = (d: number) => `rgb(${Math.max(0, Math.min(255, r + d))},${Math.max(0, Math.min(255, g + d))},${Math.max(0, Math.min(255, b + d))})`;
return { dark: mk(-70), mid: mk(-15), lite: mk(55), base: hex };
}
type Car = { lane: number; y: number; speed: number; color: string; w: number; h: number };
type Coin = { lane: number; y: number; taken: boolean; spin: number };
export default function RacerGame({
carColor = "#00C2FF",
onGameOver,
onTick,
}: {
carColor?: string;
onGameOver: (r: RaceResult) => void;
onTick?: (r: { score: number; coins: number; speed: number }) => void;
}) {
const canvasRef = useRef<HTMLCanvasElement>(null);
const wrapRef = useRef<HTMLDivElement>(null);
const stateRef = useRef({
W: 360, H: 640, dpr: 1, roadX: 40, roadW: 280,
playerX: 180, targetX: 180, playerW: 40, playerH: 92,
dash: 0, dist: 0, coins: 0, speed: 5.4, baseSpeed: 5.4,
enemies: [] as Car[], coinItems: [] as Coin[],
spawnT: 0, coinT: 0, alive: true, started: 0, raf: 0, t: 0,
});
useEffect(() => {
const canvas = canvasRef.current;
const wrap = wrapRef.current;
if (!canvas || !wrap) return;
const ctx = canvas.getContext("2d");
if (!ctx) return;
const S = stateRef.current;
const resize = () => {
const r = wrap.getBoundingClientRect();
S.dpr = Math.min(2, window.devicePixelRatio || 1);
S.W = r.width || window.innerWidth;
S.H = r.height || window.innerHeight;
canvas.width = S.W * S.dpr; canvas.height = S.H * S.dpr;
canvas.style.width = S.W + "px"; canvas.style.height = S.H + "px";
ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
S.roadW = Math.min(380, S.W * 0.88);
S.roadX = (S.W - S.roadW) / 2;
S.playerW = (S.roadW / LANES) * 0.56;
S.playerH = S.playerW * 2.3;
if (S.started === 0) { S.playerX = S.W / 2; S.targetX = S.W / 2; }
};
resize();
const ro = new ResizeObserver(resize);
ro.observe(wrap);
const laneCenter = (lane: number) => S.roadX + (S.roadW / LANES) * (lane + 0.5);
const reset = () => {
S.dash = 0; S.dist = 0; S.coins = 0; S.speed = S.baseSpeed;
S.enemies = []; S.coinItems = [];
S.spawnT = 44; S.coinT = 24; S.alive = true; S.started = performance.now();
S.playerX = S.W / 2; S.targetX = S.W / 2;
};
reset();
const pointerTo = (clientX: number) => {
const rect = canvas.getBoundingClientRect();
S.targetX = Math.max(S.roadX + S.playerW / 2, Math.min(S.roadX + S.roadW - S.playerW / 2, clientX - rect.left));
};
let dragging = false;
const down = (e: PointerEvent) => { dragging = true; pointerTo(e.clientX); };
const move = (e: PointerEvent) => { if (dragging) pointerTo(e.clientX); };
const up = () => (dragging = false);
canvas.addEventListener("pointerdown", down);
window.addEventListener("pointermove", move);
window.addEventListener("pointerup", up);
const keys: Record<string, boolean> = {};
const kd = (e: KeyboardEvent) => (keys[e.key] = true);
const ku = (e: KeyboardEvent) => (keys[e.key] = false);
window.addEventListener("keydown", kd);
window.addEventListener("keyup", ku);
const rr = (x: number, y: number, w: number, h: number, r: number) => {
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.closePath();
};
const bodyPath = (hw: number, hh: number) => {
const nw = hw * 0.74, tw = hw * 0.9;
ctx.beginPath();
ctx.moveTo(0, -hh);
ctx.bezierCurveTo(nw, -hh, hw, -hh * 0.6, hw, -hh * 0.12);
ctx.lineTo(hw, hh * 0.15);
ctx.bezierCurveTo(hw, hh * 0.72, tw, hh, tw * 0.5, hh);
ctx.lineTo(-tw * 0.5, hh);
ctx.bezierCurveTo(-tw, hh, -hw, hh * 0.72, -hw, hh * 0.15);
ctx.lineTo(-hw, -hh * 0.12);
ctx.bezierCurveTo(-hw, -hh * 0.6, -nw, -hh, 0, -hh);
ctx.closePath();
};
const drawCar = (cx: number, cy: number, w: number, h: number, color: string, facingUp: boolean) => {
const hw = w / 2, hh = h / 2;
const c = tones(color);
ctx.save();
ctx.translate(cx, cy);
if (!facingUp) ctx.rotate(Math.PI);
ctx.save();
ctx.translate(1, 6);
ctx.filter = "blur(3px)";
ctx.fillStyle = "rgba(0,0,0,0.4)";
bodyPath(hw * 1.02, hh * 1.02); ctx.fill();
ctx.restore();
const tW = w * 0.15, tH = h * 0.17;
const wx = hw * 0.98, wyF = -hh * 0.58, wyR = hh * 0.6;
ctx.fillStyle = "#0b0d12";
for (const [x, y] of [[-wx, wyF], [wx, wyF], [-wx, wyR], [wx, wyR]] as const) {
rr(x - tW / 2, y - tH / 2, tW, tH, 3); ctx.fill();
ctx.fillStyle = "#3a3f4a"; rr(x - tW * 0.28, y - tH * 0.34, tW * 0.56, tH * 0.68, 2); ctx.fill();
ctx.fillStyle = "#0b0d12";
}
const g = ctx.createLinearGradient(-hw, 0, hw, 0);
g.addColorStop(0, c.dark); g.addColorStop(0.26, c.mid); g.addColorStop(0.44, c.lite);
g.addColorStop(0.5, "#ffffff"); g.addColorStop(0.56, c.lite); g.addColorStop(0.74, c.mid); g.addColorStop(1, c.dark);
ctx.fillStyle = g; bodyPath(hw, hh); ctx.fill();
const g2 = ctx.createLinearGradient(0, -hh, 0, hh);
g2.addColorStop(0, "rgba(255,255,255,0.22)"); g2.addColorStop(0.35, "rgba(255,255,255,0.02)"); g2.addColorStop(1, "rgba(0,0,0,0.28)");
ctx.fillStyle = g2; bodyPath(hw, hh); ctx.fill();
ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1.2; bodyPath(hw, hh); ctx.stroke();
ctx.strokeStyle = "rgba(0,0,0,0.16)"; ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(-hw * 0.4, -hh * 0.62); ctx.lineTo(-hw * 0.3, -hh * 0.1); ctx.stroke();
ctx.beginPath(); ctx.moveTo(hw * 0.4, -hh * 0.62); ctx.lineTo(hw * 0.3, -hh * 0.1); ctx.stroke();
const gg = ctx.createLinearGradient(0, -hh * 0.3, 0, hh * 0.5);
gg.addColorStop(0, "#0a141f"); gg.addColorStop(0.5, "#1b3a58"); gg.addColorStop(1, "#0a141f");
ctx.fillStyle = gg; rr(-hw * 0.56, -hh * 0.28, hw * 1.12, hh * 0.78, 8); ctx.fill();
ctx.fillStyle = "rgba(150,210,255,0.32)";
ctx.beginPath();
ctx.moveTo(-hw * 0.4, -hh * 0.22); ctx.lineTo(hw * 0.1, -hh * 0.22);
ctx.lineTo(-hw * 0.1, -hh * 0.02); ctx.lineTo(-hw * 0.5, -hh * 0.02); ctx.closePath(); ctx.fill();
ctx.fillStyle = c.mid;
rr(-hw - w * 0.06, -hh * 0.18, w * 0.1, h * 0.05, 2); ctx.fill();
rr(hw - w * 0.04, -hh * 0.18, w * 0.1, h * 0.05, 2); ctx.fill();
ctx.save(); ctx.shadowColor = "#fff6d0"; ctx.shadowBlur = 8; ctx.fillStyle = "#fff6d0";
rr(-hw * 0.55, -hh * 0.94, w * 0.22, h * 0.04, 2); ctx.fill();
rr(hw * 0.33, -hh * 0.94, w * 0.22, h * 0.04, 2); ctx.fill();
ctx.restore();
ctx.save(); ctx.shadowColor = "#ff2b3d"; ctx.shadowBlur = 9; ctx.fillStyle = "#ff3346";
rr(-hw * 0.55, hh * 0.86, hw * 1.1, h * 0.035, 2); ctx.fill();
ctx.restore();
ctx.restore();
};
const drawCoin = (x: number, y: number, spin: number) => {
const rad = 12, sx = Math.max(0.32, Math.abs(Math.cos(spin)));
ctx.save(); ctx.translate(x, y);
ctx.shadowColor = "rgba(255,201,60,0.8)"; ctx.shadowBlur = 14;
const g = ctx.createRadialGradient(-rad * 0.3, -rad * 0.3, 2, 0, 0, rad);
g.addColorStop(0, "#FFF1BE"); g.addColorStop(0.6, "#FFC93C"); g.addColorStop(1, "#D98A12");
ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rad * sx, rad, 0, 0, Math.PI * 2); ctx.fill();
ctx.shadowBlur = 0;
if (sx > 0.5) { ctx.fillStyle = "rgba(120,70,10,0.8)"; ctx.font = `bold ${Math.round(rad * sx + 4)}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$", 0, 1); }
ctx.restore();
};
const loop = () => {
S.raf = requestAnimationFrame(loop);
if (!S.alive) return;
S.t += 1;
const secs = (performance.now() - S.started) / 1000;
S.speed = S.baseSpeed + secs * 0.12;
if (keys["ArrowLeft"] || keys["a"]) S.targetX -= 7;
if (keys["ArrowRight"] || keys["d"]) S.targetX += 7;
S.targetX = Math.max(S.roadX + S.playerW / 2, Math.min(S.roadX + S.roadW - S.playerW / 2, S.targetX));
S.playerX += (S.targetX - S.playerX) * 0.26;
S.dist += S.speed * 0.1;
S.dash = (S.dash + S.speed) % 56;
S.spawnT -= 1;
const spawnGap = Math.max(15, 42 - secs * 0.5);
if (S.spawnT <= 0) {
S.spawnT = spawnGap;
S.enemies.push({ lane: Math.floor(Math.random() * LANES), y: -120, speed: 0.9 + Math.random() * 1.7, color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)], w: S.playerW, h: S.playerH });
}
S.coinT -= 1;
if (S.coinT <= 0) { S.coinT = 26 + Math.random() * 30; S.coinItems.push({ lane: Math.floor(Math.random() * LANES), y: -40, taken: false, spin: 0 }); }
const grass = ctx.createLinearGradient(0, 0, S.W, 0);
grass.addColorStop(0, "#122b1c"); grass.addColorStop(0.5, "#1a3d26"); grass.addColorStop(1, "#122b1c");
ctx.fillStyle = grass; ctx.fillRect(0, 0, S.W, S.H);
ctx.fillStyle = "rgba(255,255,255,0.05)";
for (let i = 0; i < 24; i++) {
const gx = (i * 89) % S.W;
const gy = ((i * 197 + S.t * S.speed) % (S.H + 20)) - 10;
if (gx < S.roadX - 34 || gx > S.roadX + S.roadW + 34) ctx.fillRect(gx, gy, 2, 6);
}
const sandW = 26;
for (const [sx0, flip] of [[S.roadX - 8 - sandW, 0], [S.roadX + S.roadW + 8, 1]] as const) {
const sg = ctx.createLinearGradient(sx0, 0, sx0 + sandW, 0);
sg.addColorStop(flip ? 1 : 0, "#6b5a35"); sg.addColorStop(flip ? 0 : 1, "#907b4a");
ctx.fillStyle = sg; ctx.fillRect(sx0, 0, sandW, S.H);
ctx.fillStyle = "rgba(0,0,0,0.12)";
for (let i = 0; i < 14; i++) {
const ax = sx0 + ((i * 37) % sandW);
const ay = ((i * 173 + S.t * S.speed) % (S.H + 12)) - 6;
ctx.fillRect(ax, ay, 2, 2);
}
}
const leftMargin = S.roadX - 8 - sandW;
const rightStart = S.roadX + S.roadW + 8 + sandW;
const drawTree = (tx: number, ty: number, s: number) => {
ctx.fillStyle = "rgba(0,0,0,0.3)";
ctx.beginPath(); ctx.ellipse(tx + 3, ty + s * 0.55, s * 0.7, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "#4a3620";
ctx.fillRect(tx - s * 0.08, ty, s * 0.16, s * 0.5);
const lg = ctx.createRadialGradient(tx - s * 0.2, ty - s * 0.3, s * 0.1, tx, ty - s * 0.15, s * 0.75);
lg.addColorStop(0, "#3f7d3a"); lg.addColorStop(1, "#1e4520");
ctx.fillStyle = lg;
ctx.beginPath(); ctx.arc(tx, ty - s * 0.15, s * 0.55, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.arc(tx - s * 0.35, ty + s * 0.05, s * 0.38, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.arc(tx + s * 0.35, ty + s * 0.05, s * 0.38, 0, Math.PI * 2); ctx.fill();
};
const drawBush = (bx: number, by: number, s: number) => {
const bgd = ctx.createRadialGradient(bx - s * 0.2, by - s * 0.2, 1, bx, by, s);
bgd.addColorStop(0, "#4e8c3f"); bgd.addColorStop(1, "#264d24");
ctx.fillStyle = bgd;
ctx.beginPath(); ctx.arc(bx, by, s * 0.5, 0, Math.PI * 2);
ctx.arc(bx - s * 0.4, by + s * 0.1, s * 0.35, 0, Math.PI * 2);
ctx.arc(bx + s * 0.4, by + s * 0.1, s * 0.35, 0, Math.PI * 2); ctx.fill();
};
for (let i = 0; i < 7; i++) {
const ty = ((i * 250 + S.t * S.speed) % (S.H + 260)) - 130;
const size = 26 + (i % 3) * 8;
if (leftMargin > 30) drawTree(Math.max(16, leftMargin * 0.5), ty, size);
if (S.W - rightStart > 30) drawTree(Math.min(S.W - 16, rightStart + (S.W - rightStart) * 0.5), ty + 125, size);
}
for (let i = 0; i < 6; i++) {
const by = ((i * 310 + 90 + S.t * S.speed) % (S.H + 200)) - 100;
if (leftMargin > 22) drawBush(leftMargin * 0.7, by, 15);
if (S.W - rightStart > 22) drawBush(rightStart + (S.W - rightStart) * 0.3, by + 70, 15);
}
const deco = (idx: number, side: number) => {
const span = 180;
const yy = (((idx * span) + S.t * S.speed) % (S.H + span * 2)) - span;
const margin = side === 0 ? S.roadX - 26 : S.roadX + S.roadW + 26;
const jitter = ((idx * 73) % 17) - 8;
const x = margin + jitter * (side === 0 ? -1 : 1);
if (x < -30 || x > S.W + 30) return;
const kind = (idx * 31 + side * 7) % 5;
if (kind < 2) {
ctx.fillStyle = "#4a3826";
ctx.fillRect(x - 2, yy + 8, 4, 10);
ctx.fillStyle = "#1d4a26";
ctx.beginPath(); ctx.arc(x, yy + 2, 14, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "#2b6b33";
ctx.beginPath(); ctx.arc(x - 5, yy - 2, 9, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.arc(x + 6, yy + 1, 8, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "#3f8a47";
ctx.beginPath(); ctx.arc(x, yy - 4, 6, 0, Math.PI * 2); ctx.fill();
} else if (kind < 4) {
ctx.fillStyle = "#2b5e33";
ctx.beginPath(); ctx.arc(x, yy, 8, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "#3c7a44";
ctx.beginPath(); ctx.arc(x + 6, yy + 2, 6, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.arc(x - 6, yy + 2, 6, 0, Math.PI * 2); ctx.fill();
} else {
ctx.fillStyle = "#7d7568";
ctx.beginPath(); ctx.ellipse(x, yy, 7, 5, 0.3, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "rgba(255,255,255,0.18)";
ctx.beginPath(); ctx.ellipse(x - 2, yy - 2, 3, 2, 0.3, 0, Math.PI * 2); ctx.fill();
}
};
for (let i = 0; i < 8; i++) { deco(i, 0); deco(i + 20, 1); }
const road = ctx.createLinearGradient(S.roadX, 0, S.roadX + S.roadW, 0);
road.addColorStop(0, "#191d27"); road.addColorStop(0.5, "#242a37"); road.addColorStop(1, "#191d27");
ctx.fillStyle = road; ctx.fillRect(S.roadX, 0, S.roadW, S.H);
ctx.fillStyle = "rgba(0,0,0,0.14)";
for (let i = 0; i < 34; i++) {
const ax = S.roadX + ((i * 71) % S.roadW);
const ay = ((i * 211 + S.t * S.speed) % (S.H + 16)) - 8;
ctx.fillRect(ax, ay, 2, 2);
}
ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 5;
for (let i = 0; i < LANES; i++) {
const x = laneCenter(i);
ctx.beginPath(); ctx.moveTo(x - 8, 0); ctx.lineTo(x - 8, S.H); ctx.stroke();
ctx.beginPath(); ctx.moveTo(x + 8, 0); ctx.lineTo(x + 8, S.H); ctx.stroke();
}
const block = 26;
for (const edge of [S.roadX - 8, S.roadX + S.roadW] as const) {
for (let y = -block; y < S.H + block; y += block) {
const yy = y + (S.dash % block) * (56 / block);
const on = Math.floor((y + S.t) / 1) % 1; // fixed pattern
ctx.fillStyle = (Math.floor((yy) / block) % 2 === 0) ? "#e33b3b" : "#f4f4f4";
ctx.fillRect(edge, yy, 8, block * 0.62);
}
}
ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 4;
ctx.setLineDash([30, 26]); ctx.lineDashOffset = -S.dash;
for (let i = 1; i < LANES; i++) {
const x = S.roadX + (S.roadW / LANES) * i;
ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, S.H); ctx.stroke();
}
ctx.setLineDash([]);
const sl = Math.min(1, (S.speed - S.baseSpeed) / 6);
if (sl > 0.06) {
ctx.strokeStyle = `rgba(255,255,255,${0.05 + sl * 0.12})`; ctx.lineWidth = 2;
for (let i = 0; i < 6; i++) {
const yy = (((S.t * S.speed * 2.4) + i * 150) % (S.H + 150)) - 80;
ctx.beginPath(); ctx.moveTo(S.roadX + 18, yy); ctx.lineTo(S.roadX + 18, yy + 46); ctx.stroke();
ctx.beginPath(); ctx.moveTo(S.roadX + S.roadW - 18, yy); ctx.lineTo(S.roadX + S.roadW - 18, yy + 46); ctx.stroke();
}
}
const playerY = S.H - S.playerH / 2 - 30;
const pL = S.playerX - S.playerW / 2, pR = S.playerX + S.playerW / 2;
const pT = playerY - S.playerH / 2, pB = playerY + S.playerH / 2;
for (const cn of S.coinItems) {
cn.y += S.speed; cn.spin += 0.15;
if (cn.taken) continue;
const cx = laneCenter(cn.lane);
if (cn.y > pT - 14 && cn.y < pB + 14 && Math.abs(cx - S.playerX) < S.playerW / 2 + 12) { cn.taken = true; S.coins += 1; continue; }
drawCoin(cx, cn.y, cn.spin);
}
S.coinItems = S.coinItems.filter((cn) => cn.y < S.H + 40 && !cn.taken);
for (const e of S.enemies) {
e.y += S.speed + e.speed;
const ex = laneCenter(e.lane);
drawCar(ex, e.y, e.w, e.h, e.color, false);
const eL = ex - e.w / 2, eR = ex + e.w / 2, eT = e.y - e.h / 2, eB = e.y + e.h / 2;
if (pL < eR - 8 && pR > eL + 8 && pT < eB - 10 && pB > eT + 10) {
S.alive = false;
const score = Math.floor(S.dist) + S.coins * 10;
setTimeout(() => onGameOver({ distance: Math.floor(S.dist), coins: S.coins, score }), 240);
}
}
S.enemies = S.enemies.filter((e) => e.y < S.H + 140);
drawCar(S.playerX, playerY, S.playerW, S.playerH, carColor, true);
const vg = ctx.createRadialGradient(S.W / 2, S.H / 2, S.H * 0.35, S.W / 2, S.H / 2, S.H * 0.75);
vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.5)");
ctx.fillStyle = vg; ctx.fillRect(0, 0, S.W, S.H);
if (onTick) onTick({ score: Math.floor(S.dist) + S.coins * 10, coins: S.coins, speed: S.speed });
};
S.raf = requestAnimationFrame(loop);
return () => {
cancelAnimationFrame(S.raf); ro.disconnect();
canvas.removeEventListener("pointerdown", down);
window.removeEventListener("pointermove", move);
window.removeEventListener("pointerup", up);
window.removeEventListener("keydown", kd);
window.removeEventListener("keyup", ku);
};
}, [carColor]);
return (
<div ref={wrapRef} className="absolute inset-0">
<canvas ref={canvasRef} className="block h-full w-full" />
</div>
);
}