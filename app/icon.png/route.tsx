import { ImageResponse } from "next/og";

export const runtime = "edge";

// 512x512 app icon: a neon car on a dark road
export async function GET() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0A0E1A", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", width: 200, height: 512, background: "#242a37", position: "absolute", left: 156 }} />
        <div style={{ display: "flex", width: 130, height: 270, background: "#00C2FF", borderRadius: 46, alignItems: "flex-start", justifyContent: "center", position: "relative" }}>
          <div style={{ display: "flex", width: 90, height: 84, background: "#12314d", borderRadius: 20, marginTop: 52 }} />
          <div style={{ display: "flex", width: 104, height: 14, background: "#ff3346", borderRadius: 6, position: "absolute", bottom: 12 }} />
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
