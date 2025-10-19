"use client";

import OwnedWallets from "@/components/dashboard/OwnedWallets";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

import { useOwnedWallets } from "@/stores/ownedWallets";
import { buildFromAccounts, leafHash } from "@/lib/merkle";
import { ACCOUNTS } from "@/lib/accounts";

import useSWR from "swr";
import { PRICE_FEEDS } from "@/constants/hardcoded";

const Page = () => {
  const { wallets, addMany, removeOne } = useOwnedWallets();
  const [root, setRoot] = useState<string>();
  const [prices, setPrices] = useState<any[]>([]);

  const priceIds = Object.values(PRICE_FEEDS);
  const queryString = priceIds.map(id => `id=${id}`).join('&');

  const { data, error, isLoading } = useSWR(
    `/api/pyth/latest?${queryString}`,
    (u) => fetch(u).then((r) => r.json()),
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    if (data?.latest && data.latest.length > 0) {
      const pricesWithSymbols = data.latest.map((feed: any) => {
        const normalizedId = feed.id.startsWith('0x') ? feed.id : `0x${feed.id}`;
        const symbol = Object.entries(PRICE_FEEDS).find(([_, feedId]) => feedId === normalizedId)?.[0] || "Unknown";
        return {
          ...feed,
          symbol
        };
      });
      setPrices(pricesWithSymbols);
    }
  }, [data]);

  const handleGenerateProof = () => {
    const tree = buildFromAccounts(ACCOUNTS);
    setRoot(tree.root);
    console.log("Tree", tree.root);
    for (const account of ACCOUNTS) {
      const leaf = leafHash(account.address, account.amount);
      const proof = tree.getAccountProof(account.address, account.amount);
      console.log("leaf", leaf);
      console.log("Proof", proof);
    }
    return;
  };

  const formatPrice = (price: string, expo: number) => {
    const priceNum = Number(price) * Math.pow(10, expo);
    return priceNum.toFixed(2);
  };

  return (
    <div className="flex gap-4 p-4 h-screen">
      {/* Left Section - Wallets */}
      <div className="w-1/3 flex flex-col gap-4">
        <OwnedWallets />
        <Button onClick={handleGenerateProof}>Generate Proof</Button>
        {root && <p className="text-xs break-all">{root}</p>}
      </div>

      {/* Right Section - Price Feeds */}
      <div className="flex-1 flex flex-col gap-4 pt-20">
        <h2 className="text-2xl font-bold">Price Feeds</h2>
        
        {isLoading && <div>Loading prices...</div>}
        {error && <div className="text-red-500">Error loading price data</div>}
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
          {prices.map((feed) => (
            <div key={feed.id} className="border p-3 rounded">
              <div className="text-sm font-semibold">{feed.symbol}</div>
              <div className="text-lg font-bold">${formatPrice(feed.price.price, feed.price.expo)}</div>
              <div className="text-xs text-gray-500">±{formatPrice(feed.price.conf, feed.price.expo)}</div>
              <div className="text-xs text-gray-400">{new Date(feed.price.publishTime * 1000).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;