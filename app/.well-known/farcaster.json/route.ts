import { NextResponse } from "next/server";

// Served at /.well-known/farcaster.json
// accountAssociation stays empty until Farcaster's "Generate account association"
// is run for THIS exact domain, then the header/payload/signature go in below.
export const dynamic = "force-static";

const DOMAIN = "https://base-racer-just-for-funs-projects-36446f10.vercel.app";

export async function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
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
