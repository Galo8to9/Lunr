import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWalletStore = create(
  persist(
    (set) => ({
      wallets: [],
      addWallets: (newWallets) => set((state) => {
        const existing = new Set(state.wallets.map((w) => w.address.toLowerCase()))
        const walletsToAdd = newWallets
          .filter((wallet) => !existing.has(wallet.address.toLowerCase()))
          .map((wallet) => ({
            ...wallet,
            address: wallet.address.toLowerCase(),
          }))
        return { wallets: [...state.wallets, ...walletsToAdd] }
      }),
      removeWallet: (address) => set((state) => ({
        wallets: state.wallets.filter((w) => w.address !== address)
      })),
      removeWallets: (addresses) => set((state) => ({
        wallets: state.wallets.filter((w) => !addresses.has(w.address))
      })),
    }),
    {
      name: 'wallet-storage',
    }
  )
)