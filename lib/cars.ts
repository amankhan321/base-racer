export type CarModel = {
  id: string;
  name: string;
  price: number; // in coins; 0 = owned by default
  body: string;
  body2: string; // sheen gradient tone
  roof: string;
  glass: string;
  stripe?: string;
  spoiler?: boolean;
  glow?: string; // underglow color
};

export const CARS: CarModel[] = [
  {
    id: "runner",
    name: "Runner",
    price: 0,
    body: "#00E5FF",
    body2: "#00A3C4",
    roof: "#0E2A33",
    glass: "#BFefff",
  },
  {
    id: "blaze",
    name: "Blaze GT",
    price: 40,
    body: "#FF7A2F",
    body2: "#E24E00",
    roof: "#3A1A08",
    glass: "#FFE2C4",
    stripe: "#FFFFFF",
  },
  {
    id: "viper",
    name: "Viper S",
    price: 90,
    body: "#FF3B57",
    body2: "#B4102A",
    roof: "#320813",
    glass: "#FFD2DA",
    spoiler: true,
  },
  {
    id: "onyx",
    name: "Onyx Lux",
    price: 160,
    body: "#2B2F3A",
    body2: "#0E1016",
    roof: "#000000",
    glass: "#8FA0B8",
    stripe: "#FFC93C",
    spoiler: true,
  },
  {
    id: "volt",
    name: "Volt X",
    price: 260,
    body: "#A855F7",
    body2: "#6D28D9",
    roof: "#1E0A33",
    glass: "#E9D5FF",
    spoiler: true,
    glow: "#C084FC",
  },
  {
    id: "basegt",
    name: "Base GT",
    price: 400,
    body: "#2E6BFF",
    body2: "#0038B8",
    roof: "#04122E",
    glass: "#CFE0FF",
    stripe: "#FFFFFF",
    spoiler: true,
    glow: "#3B82F6",
  },
];

export const carById = (id: string) => CARS.find((c) => c.id === id) || CARS[0];
