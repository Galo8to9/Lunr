"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "commitProofPayload";

export type TokenBalance = {
  symbol: string;
  amount: string;
  decimals: number;
  contractAddress?: string;
};

export type ChainSnapshot = {
  chainId: string;
  chainName: string;
  nativeBalance?: string;
  tokens: TokenBalance[];
};

export type WalletSnapshot = {
  address: string;
  chains: ChainSnapshot[];
};

export type PriceSnapshot = {
  symbol: string;
  pythSymbol: string;
  price: string;
  expo: number;
  publishTime: number;
};

export type SnapshotData = {
  wallets: WalletSnapshot[];
  prices: PriceSnapshot[];
  totalPortfolioValue: number;
  timestamp: number;
  snapshotId: string;
};

type Store = {
  snapshots: SnapshotData[];
  currentSnapshot: SnapshotData | null;

  createSnapshot: (data: {
    wallets: WalletSnapshot[];
    prices: PriceSnapshot[];
    totalPortfolioValue: number;
  }) => string;

  getSnapshot: (snapshotId: string) => SnapshotData | undefined;

  getLatestSnapshot: () => SnapshotData | undefined;

  deleteSnapshot: (snapshotId: string) => void;

  clearAll: () => void;
};

// Helper to generate unique snapshot ID
const generateSnapshotId = () => {
  return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useCommitProofPayload = create<Store>()(
  persist(
    (set, get) => ({
      snapshots: [],
      currentSnapshot: null,

      createSnapshot: (data) => {
        const snapshotId = generateSnapshotId();
        const snapshot: SnapshotData = {
          ...data,
          timestamp: Date.now(),
          snapshotId,
        };

        set((state) => ({
          snapshots: [...state.snapshots, snapshot],
          currentSnapshot: snapshot,
        }));

        return snapshotId;
      },

      getSnapshot: (snapshotId) => {
        return get().snapshots.find((s) => s.snapshotId === snapshotId);
      },

      getLatestSnapshot: () => {
        const snapshots = get().snapshots;
        if (snapshots.length === 0) return undefined;
        return snapshots[snapshots.length - 1];
      },

      deleteSnapshot: (snapshotId) => {
        set((state) => ({
          snapshots: state.snapshots.filter((s) => s.snapshotId !== snapshotId),
          currentSnapshot:
            state.currentSnapshot?.snapshotId === snapshotId
              ? null
              : state.currentSnapshot,
        }));
      },

      clearAll: () => {
        set({
          snapshots: [],
          currentSnapshot: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        snapshots: state.snapshots,
        currentSnapshot: state.currentSnapshot,
      }),
    }
  )
);
