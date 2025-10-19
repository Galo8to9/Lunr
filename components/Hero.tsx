"use client";

import { motion } from "framer-motion";
import Container from "./Container";
import { Button } from "./ui/button";
import Demo from "./Demo";
import NoiseLayer from "./NoiseLayer";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-neutral-950">
      {/* --- Granular gradient background (centered + extra grain) --- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Centered color blobs (scaled up) */}
        <div className="absolute inset-0 [mask-image:radial-gradient(85%_85%_at_50%_45%,black,transparent)]">
          <div
            className="absolute inset-0 animate-[float_18s_ease-in-out_infinite] blur-2xl opacity-95 will-change-transform"
            // scale the blobs responsively so they don’t feel like a tiny ball
            style={{ ["--blob-scale" as any]: "1.8" }}
          >
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
radial-gradient(calc(34rem * var(--blob-scale)) calc(28rem * var(--blob-scale)) at 50% 38%, rgba(0, 157, 255, 0.45), transparent 60%), radial-gradient(calc(32rem * var(--blob-scale)) calc(26rem * var(--blob-scale)) at 62% 52%, rgba(31, 155, 66, 0.75), transparent 60%), radial-gradient(calc(30rem * var(--blob-scale)) calc(24rem * var(--blob-scale)) at 38% 56%, rgba(0,180,255,0.30), transparent 60%), radial-gradient(calc(36rem * var(--blob-scale)) calc(28rem * var(--blob-scale)) at 50% 70%, rgba(123, 180, 43, 0.69), transparent 65%)`,
              }}
            />
          </div>
        </div>

        {/* Optional wide wash to avoid hard falloff on huge screens */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full blur-3xl"
            style={{
              backgroundImage: `
          radial-gradient(120% 100% at 50% 40%, rgba(0, 157, 255, 0.18), transparent 70%)
        `,
            }}
          />
        </div>

        {/* Grain overlay — dual layer for extra texture */}
        {/* --- Grain overlay (extra granular) --- */}
        {/* Ultra-fine speckle */}
        <div
          className="pointer-events-none absolute inset-0 opacity-55 mix-blend-multiply dark:mix-blend-screen"
          style={{ filter: "contrast(165%) brightness(95%)" }}
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
        url("data:image/svg+xml;utf8,
          <svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
            <filter id='n0'>
              <feTurbulence type='fractalNoise' baseFrequency='1.35' numOctaves='5' stitchTiles='stitch'/>
              <feColorMatrix type='saturate' values='0'/>
              <feComponentTransfer>
                <feFuncA type='table' tableValues='0 0.9'/>
              </feComponentTransfer>
            </filter>
            <rect width='100%' height='100%' filter='url(%23n0)'/>
          </svg>
        ")
      `,
              backgroundSize: "90px 90px",
            }}
          />
        </div>

        {/* Fine grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-45 mix-blend-multiply dark:mix-blend-screen"
          style={{ filter: "contrast(150%)" }}
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
        url("data:image/svg+xml;utf8,
          <svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
            <filter id='n1'>
              <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/>
              <feColorMatrix type='saturate' values='0'/>
              <feComponentTransfer>
                <feFuncA type='table' tableValues='0 0.85'/>
              </feComponentTransfer>
            </filter>
            <rect width='100%' height='100%' filter='url(%23n1)'/>
          </svg>
        ")
      `,
              backgroundSize: "160px 160px",
            }}
          />
        </div>

        {/* Coarse grain (adds bite/variation) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply dark:mix-blend-screen"
          style={{ filter: "contrast(140%)" }}
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
        url("data:image/svg+xml;utf8,
          <svg xmlns='http://www.w3.org/2000/svg' width='520' height='520'>
            <filter id='n2'>
              <feTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='3' stitchTiles='stitch'/>
              <feColorMatrix type='saturate' values='0'/>
              <feComponentTransfer>
                <feFuncA type='table' tableValues='0 0.7'/>
              </feComponentTransfer>
            </filter>
            <rect width='100%' height='100%' filter='url(%23n2)'/>
          </svg>
        ")
      `,
              backgroundSize: "420px 420px",
            }}
          />
        </div>

        <div className="absolute inset-0 opacity-22 mix-blend-overlay dark:opacity-20">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
          url("data:image/svg+xml;utf8,
            <svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'>
              <filter id='n2'>
                <feTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/>
                <feColorMatrix type='saturate' values='0'/>
                <feComponentTransfer>
                  <feFuncA type='table' tableValues='0 0.65'/>
                </feComponentTransfer>
              </filter>
              <rect width='100%' height='100%' filter='url(%23n2)'/>
            </svg>
          ")
        `,
              backgroundSize: "360px 360px",
            }}
          />
        </div>
      </div>

      <NoiseLayer opacity={0.65} size={110} alpha={40} blend="overlay" />
      {/* For darker themes you can stack another for punch: */}
      {/* <NoiseLayer opacity={0.35} size={280} alpha={90} blend="soft-light" /> */}

      {/* Foreground content above background */}
      <div className="relative z-10">
        <Container>
          <div className="max-w-5xl px-6 py-24 sm:py-28 lg:py-48 text-left">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-4xl font-medium tracking-tight sm:text-6xl"
            >
              Lunr simplifies crypto cross-chain solvency audits by generating
              verifiable, on-chain proofs of reserves.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="mt-4 text-balance text-base leading-7 text-neutral-400 dark:text-neutral-400 sm:text-lg max-w-2xl leading-snug"
            >
              Lunr brings cryptographic transparency to crypto finance —
              generating Merkle-proof–based, on-chain attestations that verify
              reserves across chains, assets, and custodians in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="mt-8 flex items-center justify-start gap-3"
            >
              <Button>Get Started</Button>
              <Button variant="outline">Learn More</Button>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* Global keyframes so Tailwind's animate-[float...] can find them */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translate3d(0, 0, 0) rotate(0.0001deg);
          }
          50% {
            transform: translate3d(-2%, -3%, 0) rotate(0.0001deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0.0001deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[float_18s_ease-in-out_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
