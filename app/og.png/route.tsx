import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0A0E1A", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 900, color: "#00E5FF" }}>BASE RACER</div>
        <div style={{ display: "flex", fontSize: 36, color: "#ffffff", opacity: 0.7, marginTop: 16 }}>Dodge. Collect. Survive.</div>
        <div style={{ display: "flex", fontSize: 26, color: "#ffffff", opacity: 0.45, marginTop: 28 }}>Onchain on Base</div>
      </div>
    ),
    { width: 1200, height: 800 }
  );
}
