import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Wallet {
  address: string;
  name?: string;
  // Add other wallet properties here as needed
}

interface WalletStore {
  wallets: Wallet[];
  addWallets: (newWallets: Wallet[]) => void;
  removeWallet: (address: string) => void;
  removeWallets: (addresses: Set<string>) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      wallets: [],
      addWallets: (newWallets) =>
        set((state) => {
          const existing = new Set(
            state.wallets.map((w) => w.address.toLowerCase())
          );
          const walletsToAdd = newWallets
            .filter((wallet) => !existing.has(wallet.address.toLowerCase()))
            .map((wallet) => ({
              ...wallet,
              address: wallet.address.toLowerCase(),
            }));
          return { wallets: [...state.wallets, ...walletsToAdd] };
        }),
      removeWallet: (address) =>
        set((state) => ({
          wallets: state.wallets.filter((w) => w.address !== address),
        })),
      removeWallets: (addresses) =>
        set((state) => ({
          wallets: state.wallets.filter((w) => !addresses.has(w.address)),
        })),
    }),
    {
      name: "wallet-storage",
    }
  )
);
