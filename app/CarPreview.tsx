"use client";

import { useEffect, useRef } from "react";
import { CarModel } from "@/lib/cars";
import { drawCar } from "@/lib/drawCar";

export default function CarPreview({ car, size = 96 }: { car: CarModel; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr;
    c.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const w = size * 0.5;
    const h = w * 1.8;
    drawCar(ctx, size / 2, size / 2, w, h, car, true);
  }, [car, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} />;
}
