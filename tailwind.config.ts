import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0052FF",
        night: "#0A0E1A",
        asphalt: "#1A1F2E",
        neon: "#00E5FF",
        gold: "#FFC93C",
        danger: "#FF3B57",
      },
      fontFamily: { display: ["system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
