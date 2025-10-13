"use client";

import { motion } from "framer-motion";
import Container from "./Container";
import { Button } from "./ui/button";
import Demo from "./Demo";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white dark:bg-neutral-950">
      {/* subtle background accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="absolute -top-40 left-1/2 h-[40rem] w-[80rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-neutral-200 to-transparent dark:from-neutral-800" />
      </div>

      <Container>
        <div className="max-w-5xl px-6 py-24 sm:py-28 lg:py-48 text-left">
          {/* HERO COPY */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-medium tracking-tight sm:text-6xl"
          >
            Lunr simplifies crypto payments with automatic cross-chain
            conversions.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="mt-4 text-balance text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg max-w-2xl"
          >
            Cross-chain payments made simple — any token in, your preferred
            asset out.
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
    </section>
  );
}
