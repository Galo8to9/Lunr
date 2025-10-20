"use client";

import { useEffect, useState } from "react";

export default function NoiseLayer({
  opacity = 0.55,                // grain strength
  size = 140,                    // tile size in px (smaller = finer grain)
  alpha = 55,                    // 0–255 alpha per grain dot (higher = harsher)
  blend = "overlay",             // overlay | soft-light | multiply | screen
  viewport = false,              // true => fixed full-viewport overlay
  className = "",               // allow extra classes (e.g., z-index)
}: {
  opacity?: number;
  size?: number;
  alpha?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  viewport?: boolean;
  className?: string;
}) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
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
    setUrl(c.toDataURL("image/png"));
  }, [size, alpha]);

  // Choose positioning strategy
  const basePos = viewport
    ? "fixed inset-0"          // full viewport
    : "absolute inset-0";      // fill positioned ancestor

  return (
    <div
      aria-hidden
      data-noise-layer
      className={[
        "pointer-events-none will-change-transform",
        basePos,
        className || "z-[1]",
      ].join(" ")}
      style={{
        opacity,
        mixBlendMode: blend,
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundRepeat: "repeat",
        backgroundSize: `${Math.max(16, Math.min(size, 512))}px ${Math.max(16, Math.min(size, 512))}px`,
        backgroundPosition: "0 0",      // ensure tiling starts top-left, not centered
        ...(viewport ? { backgroundAttachment: "fixed" } : null),
      }}
    />
  );
}
