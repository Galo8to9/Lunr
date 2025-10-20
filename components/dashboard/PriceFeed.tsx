"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import { PRICE_FEEDS } from "@/constants/hardcoded";
import { Bitcoin, CircleDollarSign, Coins, Gem, Waves } from "lucide-react";
import { usePythPriceCotations } from "@/stores/pythPriceCotations";

type PriceFeedData = {
  id: string;
  symbol: string;
  price: {
    price: string;
    expo: number;
    conf: string;
    publishTime: number;
  };
};

// Icon mapping for each crypto
const CRYPTO_ICONS: Record<string, React.ElementType> = {
  BTCUSD: Bitcoin,
  ETHUSD: Gem,
  SOLUSD: Coins,
  BNBUSD: CircleDollarSign,
  XRPUSD: Waves,
};

// Color mapping for each crypto
const CRYPTO_COLORS: Record<string, string> = {
  BTCUSD: "text-orange-500",
  ETHUSD: "text-indigo-500",
  SOLUSD: "text-purple-500",
  BNBUSD: "text-yellow-500",
  XRPUSD: "text-blue-500",
};

const PriceFeed = () => {
  const { prices, setPrices } = usePythPriceCotations();

  const priceIds = Object.values(PRICE_FEEDS);
  const queryString = priceIds.map((id) => `id=${id}`).join("&");

  const { data, error, isLoading } = useSWR(
    `/api/pyth/latest?${queryString}`,
    (u) => fetch(u).then((r) => r.json()),
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    if (data?.latest && data.latest.length > 0) {
      const pricesWithSymbols = data.latest.map((feed: any) => {
        const normalizedId = feed.id.startsWith("0x")
          ? feed.id
          : `0x${feed.id}`;
        const symbol =
          Object.entries(PRICE_FEEDS).find(
            ([_, feedId]) => feedId === normalizedId
          )?.[0] || "Unknown";
        return {
          ...feed,
          symbol,
        };
      });
      setPrices(pricesWithSymbols);
      console.log("PYTH API DATA", pricesWithSymbols);
    }
  }, [data, setPrices]);

  const formatPrice = (price: string, expo: number) => {
    const priceNum = Number(price) * Math.pow(10, expo);
    return priceNum.toFixed(2);
  };

  const getDisplaySymbol = (symbol: string) => {
    return symbol.replace("USD", "/USD");
  };

  const PriceCard = ({ feed }: { feed: PriceFeedData }) => {
    const Icon = CRYPTO_ICONS[feed.symbol] || Coins;
    const colorClass = CRYPTO_COLORS[feed.symbol] || "text-gray-500";

    return (
      <div className="flex w-full justify-between border-1 rounded-lg p-4 hover:shadow-md transition-shadow bg-card hover:border-solid">
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${colorClass}`} />
            <div className="text-sm font-semibold">
              {getDisplaySymbol(feed.symbol)}
            </div>
          </div>
          <div className="text-2xl font-bold mt-2">
            ${formatPrice(feed.price.price, feed.price.expo)}
          </div>
        </div>

        <div className="flex flex-col justify-between items-end text-right">
          <div className="text-xs text-muted-foreground">
            ±{formatPrice(feed.price.conf, feed.price.expo)}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(feed.price.publishTime * 1000).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-2xl font-bold">Price Feeds</h2>

      {isLoading && (
        <div className="text-muted-foreground">Loading prices...</div>
      )}
      {error && <div className="text-red-500">Error loading price data</div>}

      {!isLoading && !error && prices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {prices.map((feed) => (
            <PriceCard key={feed.id} feed={feed} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceFeed;
