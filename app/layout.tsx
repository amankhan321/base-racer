import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Base Racer",
  description: "An endless car racer on Base.",
  other: {
    "base:app_id": "6a52dc3ce3b311a8d678de9b",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0E1A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
