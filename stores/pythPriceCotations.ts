import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "pythPriceCotations";

export type PriceFeedData = {
  id: string;
  symbol: string;
  price: {
    price: string;
    expo: number;
    conf: string;
    publishTime: number;
  };
};

type Store = {
  prices: PriceFeedData[];
  lastUpdate: number | null;
  setPrices: (prices: PriceFeedData[]) => void;
  getPriceBySymbol: (symbol: string) => PriceFeedData | undefined;
  clearPrices: () => void;
};

export const usePythPriceCotations = create<Store>()(
  persist(
    (set, get) => ({
      prices: [],
      lastUpdate: null,

      setPrices: (prices: PriceFeedData[]) =>
        set({
          prices,
          lastUpdate: Date.now(),
        }),

      getPriceBySymbol: (symbol: string) => {
        const { prices } = get();
        return prices.find((p) => p.symbol === symbol);
      },

      clearPrices: () =>
        set({
          prices: [],
          lastUpdate: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
