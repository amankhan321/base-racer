import { NextResponse } from "next/server";

// Served at /.well-known/farcaster.json
// accountAssociation stays empty until Farcaster's "Generate account association"
// is run for THIS exact domain, then the header/payload/signature go in below.
export const dynamic = "force-static";

const DOMAIN = "https://base-racer-just-for-funs-projects-36446f10.vercel.app";

export async function GET() {
  return NextResponse.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjI1NjY0MywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEU2YzlGMTgxNDg5N0REQzNkRGRDNzRGQWZmQTgxOTRjNjZkMmM2MjgifQ",
      payload:
        "eyJkb21haW4iOiJiYXNlLXJhY2VyLWp1c3QtZm9yLWZ1bnMtcHJvamVjdHMtMzY0NDZmMTAudmVyY2VsLmFwcCJ9",
      signature:
        "V9L/7MrwJupxttimJ40gOS8JnUtSpx274lSAuc45XsBWCKfgV3GHHeSsqGelhb5LZKZrzM1NuF3PeuUVp3sdRRs=",
    },
    miniapp: {
      version: "1",
      name: "Base Racer",
      iconUrl: `${DOMAIN}/icon.png`,
      homeUrl: DOMAIN,
      imageUrl: `${DOMAIN}/og.png`,
      splashImageUrl: `${DOMAIN}/icon.png`,
      splashBackgroundColor: "#0A0E1A",
      subtitle: "Endless car racer on Base",
      description:
        "Dodge the traffic, grab the coins, see how far you can go. A skill-based endless racer, fully onchain on Base.",
      primaryCategory: "games",
      tags: ["game", "racing", "arcade", "base", "onchain"],
      tagline: "Dodge. Collect. Survive.",
      heroImageUrl: `${DOMAIN}/og.png`,
      ogTitle: "Base Racer",
      ogDescription: "Dodge traffic, grab coins, go the distance. Onchain on Base.",
      ogImageUrl: `${DOMAIN}/og.png`,
    },
  });
}
