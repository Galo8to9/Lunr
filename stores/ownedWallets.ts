"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "ownedWallets";
const ETH_REGEX = /^0x[a-fA-F0-9]{40}$/;

type Store = {
  wallets: string[];
  addMany: (inputs: string[]) => { ok: string[]; invalid: string[] };
  removeOne: (addr: string) => void;
  clearAll: () => void;
  initFrom: (seed: string[]) => void; // one-time merge/seed
  _initialized: boolean;
};

const normalize = (arr: string[]) =>
  Array.from(new Set(arr.map((a) => a.toLowerCase())));

export const useOwnedWallets = create<Store>()(
  persist(
    (set, get) => ({
      wallets: [],
      _initialized: false,

      initFrom: (seed) => {
        if (get()._initialized) return;
        const valid = normalize(seed).filter((a) => ETH_REGEX.test(a));
        set((s) => ({
          wallets: normalize([...(s.wallets ?? []), ...valid]),
          _initialized: true,
        }));
      },

      addMany: (inputs) => {
        const lower = normalize(inputs);
        const invalid = lower.filter((a) => !ETH_REGEX.test(a));
        const ok = lower.filter((a) => ETH_REGEX.test(a));
        set((s) => ({ wallets: normalize([...(s.wallets ?? []), ...ok]) }));
        return { ok, invalid };
      },

      removeOne: (addr) =>
        set((s) => ({
          wallets: (s.wallets ?? []).filter((a) => a !== addr.toLowerCase()),
        })),

      clearAll: () => set({ wallets: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage), // persists + cross-tab via 'storage' event
      partialize: (s) => ({ wallets: s.wallets, _initialized: s._initialized }),
    }
  )
);
