import { CarModel } from "./cars";

export function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  m: CarModel,
  facingUp: boolean
) {
  const rr = (X: number, Y: number, W: number, H: number, r: number) => {
    const rad = Math.min(r, W / 2, H / 2);
    ctx.beginPath();
    ctx.moveTo(X + rad, Y);
    ctx.arcTo(X + W, Y, X + W, Y + H, rad);
    ctx.arcTo(X + W, Y + H, X, Y + H, rad);
    ctx.arcTo(X, Y + H, X, Y, rad);
    ctx.arcTo(X, Y, X + W, Y, rad);
    ctx.closePath();
  };
  const hexA = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  };

  ctx.save();
  ctx.translate(x, y);
  if (!facingUp) ctx.rotate(Math.PI);
  const hw = w / 2, hh = h / 2;
  const yAt = (f: number) => -hh + f * h;

  if (m.glow) {
    const g = ctx.createRadialGradient(0, 0, w * 0.15, 0, 0, w * 1.05);
    g.addColorStop(0, hexA(m.glow, 0.55));
    g.addColorStop(1, hexA(m.glow, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 1.05, h * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  rr(-hw + 3, -hh + 7, w, h, 12); ctx.fill();

  ctx.fillStyle = "#0a0a0f";
  const ww = w * 0.19, wl = h * 0.23;
  rr(-hw - ww * 0.26, yAt(0.12), ww, wl, 4); ctx.fill();
  rr(hw - ww * 0.74, yAt(0.12), ww, wl, 4); ctx.fill();
  rr(-hw - ww * 0.26, yAt(0.65), ww, wl, 4); ctx.fill();
  rr(hw - ww * 0.74, yAt(0.65), ww, wl, 4); ctx.fill();

  const grad = ctx.createLinearGradient(-hw, 0, hw, 0);
  grad.addColorStop(0, m.body2);
  grad.addColorStop(0.42, m.body);
  grad.addColorStop(0.6, m.body);
  grad.addColorStop(1, m.body2);
  ctx.fillStyle = grad;
  const nose = w * 0.13;
  ctx.beginPath();
  ctx.moveTo(-hw + nose, -hh);
  ctx.quadraticCurveTo(-hw, -hh + h * 0.05, -hw, -hh + h * 0.16);
  ctx.lineTo(-hw, hh - h * 0.08);
  ctx.quadraticCurveTo(-hw, hh, -hw + w * 0.14, hh);
  ctx.lineTo(hw - w * 0.14, hh);
  ctx.quadraticCurveTo(hw, hh, hw, hh - h * 0.08);
  ctx.lineTo(hw, -hh + h * 0.16);
  ctx.quadraticCurveTo(hw, -hh + h * 0.05, hw - nose, -hh);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  rr(-hw + w * 0.14, -hh + h * 0.06, w * 0.2, h * 0.86, 6); ctx.fill();

  if (m.stripe) {
    ctx.fillStyle = m.stripe;
    ctx.globalAlpha = 0.92;
    rr(-w * 0.1, -hh + h * 0.04, w * 0.07, h * 0.9, 3); ctx.fill();
    rr(w * 0.03, -hh + h * 0.04, w * 0.07, h * 0.9, 3); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = m.glass;
  ctx.beginPath();
  ctx.moveTo(-w * 0.28, yAt(0.4));
  ctx.lineTo(w * 0.28, yAt(0.4));
  ctx.lineTo(w * 0.2, yAt(0.31));
  ctx.lineTo(-w * 0.2, yAt(0.31));
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = m.roof;
  rr(-w * 0.3, yAt(0.4), w * 0.6, h * 0.24, 5); ctx.fill();
  ctx.fillStyle = hexA(m.glass, 0.85);
  ctx.beginPath();
  ctx.moveTo(-w * 0.28, yAt(0.64));
  ctx.lineTo(w * 0.28, yAt(0.64));
  ctx.lineTo(w * 0.2, yAt(0.72));
  ctx.lineTo(-w * 0.2, yAt(0.72));
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = "#FFF7CC";
  rr(-hw + w * 0.16, yAt(0.02), w * 0.16, h * 0.05, 3); ctx.fill();
  rr(hw - w * 0.32, yAt(0.02), w * 0.16, h * 0.05, 3); ctx.fill();
  ctx.fillStyle = "#FF3B4E";
  rr(-hw + w * 0.16, yAt(0.93), w * 0.16, h * 0.045, 3); ctx.fill();
  rr(hw - w * 0.32, yAt(0.93), w * 0.16, h * 0.045, 3); ctx.fill();

  if (m.spoiler) {
    ctx.fillStyle = "#0c0c12";
    rr(-hw - w * 0.08, yAt(0.86), w * 1.16, h * 0.06, 3); ctx.fill();
    ctx.fillStyle = hexA(m.body, 0.5);
    rr(-hw - w * 0.08, yAt(0.86), w * 1.16, h * 0.02, 2); ctx.fill();
  }
  ctx.restore();
}
