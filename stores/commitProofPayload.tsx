"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Namespace = "evm" | "solana";

export interface Holding {
  namespace: Namespace;
  chainId: number;
  wallet: string;
  tokenAddress: string;
  amountRaw: bigint;
  decimals: number;
}

export interface PythPriceLeaf {
  priceId: string;
  tokenAddress: string; // ADD THIS: link price to token
  price: bigint;
  expo: number;
  conf: bigint;
  publishTime: number;
}

type Store = {
  holdings: Record<string, Holding>;
  prices: Record<string, PythPriceLeaf>; // key = tokenAddress (lowercase)
  updatedAt: string;

  upsertHolding: (h: Holding) => void;
  removeHolding: (key: string) => void;
  clearAll: () => void;

  setPythPrice: (p: PythPriceLeaf) => void;
  getPriceForToken: (tokenAddress: string) => PythPriceLeaf | undefined;
  clearPrices: () => void;
};

export const holdingKey = (h: Holding) =>
  `${h.namespace}:${
    h.chainId
  }:${h.wallet.toLowerCase()}:${h.tokenAddress.toLowerCase()}`;

export const useCommitProofPayload = create<Store>()(
  persist(
    (set, get) => ({
      holdings: {},
      prices: {},
      updatedAt: new Date().toISOString(),

      upsertHolding: (h) => {
        const key = holdingKey(h);
        const existing = get().holdings[key];
        const merged: Holding = existing
          ? { ...existing, amountRaw: existing.amountRaw + h.amountRaw }
          : {
              ...h,
              wallet: h.wallet.toLowerCase(),
              tokenAddress: h.tokenAddress.toLowerCase(),
            };
        set((s) => ({
          holdings: { ...s.holdings, [key]: merged },
          updatedAt: new Date().toISOString(),
        }));
      },

      removeHolding: (key) =>
        set((s) => {
          const next = { ...s.holdings };
          delete next[key];
          return { holdings: next, updatedAt: new Date().toISOString() };
        }),

      clearAll: () =>
        set({ holdings: {}, prices: {}, updatedAt: new Date().toISOString() }),

      setPythPrice: (p) =>
        set((s) => ({
          prices: {
            ...s.prices,
            [p.tokenAddress.toLowerCase()]: p, // KEY BY TOKEN ADDRESS
          },
          updatedAt: new Date().toISOString(),
        })),

      getPriceForToken: (tokenAddress: string) => {
        return get().prices[tokenAddress.toLowerCase()];
      },

      clearPrices: () =>
        set({ prices: {}, updatedAt: new Date().toISOString() }),
    }),
    {
      name: "commitProofPayload",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        holdings: s.holdings,
        prices: s.prices,
        updatedAt: s.updatedAt,
      }),
      // Add serialization for bigint
      serialize: (state) => {
        return JSON.stringify(state, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        );
      },
      deserialize: (str) => {
        return JSON.parse(str, (key, value) => {
          // Restore bigint for known fields
          if (
            (key === "amountRaw" || key === "price" || key === "conf") &&
            typeof value === "string"
          ) {
            return BigInt(value);
          }
          return value;
        });
      },
    }
  )
);
