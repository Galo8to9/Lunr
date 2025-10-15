"use client";

import { useEffect, useState } from "react";

export default function NoiseLayer({
  opacity = 0.55,      // grain strength
  size = 140,          // tile size in px (smaller = finer grain)
  alpha = 55,          // 0–255 alpha per grain dot (higher = harsher)
  blend = "overlay",   // overlay | soft-light | multiply | screen
}: {
  opacity?: number;
  size?: number;
  alpha?: number;
  blend?: React.CSSProperties["mixBlendMode"];
}) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    // Gera o noise apenas no cliente
    if (typeof window === "undefined") return;

    const s = Math.max(16, Math.min(size, 512));
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;

    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = ctx.createImageData(s, s);

    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255; // 0..255
      img.data[i + 0] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = alpha;       // per-pixel opacity
    }

    ctx.putImageData(img, 0, 0);
    const data = c.toDataURL("image/png");
    setUrl(data);
  }, [size, alpha]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] will-change-transform"
      style={{
        opacity,
        mixBlendMode: blend,
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundRepeat: "repeat",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
