"use client";

import React from "react";
import useSWR from "swr";
import { useWalletStore } from "@/store/walletStore";

export default function TableAssetsPrice() {
  const chainId = "eth";
  const { wallets } = useWalletStore();

  const chainNames: Record<string, string> = {
    eth: "Ethereum",
    polygon: "Polygon",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
    base: "Base",
  };

  const formatBalance = (hexBalance: string, decimals: number) => {
    const balance = parseInt(hexBalance, 16);
    const formatted = balance / Math.pow(10, decimals);
    return formatted.toFixed(4);
  };

  const formatNativeBalance = (hexBalance: string) => {
    const balance = parseInt(hexBalance, 16);
    const formatted = balance / Math.pow(10, 18);
    return formatted.toFixed(4);
  };

  if (!wallets || wallets.length === 0) {
    return <div className="text-gray-500">No wallets found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Wallet Assets on {chainNames[chainId]}</h2>
      
      {wallets.map((wallet, index) => (
        <WalletSection
          key={wallet.address}
          wallet={wallet}
          index={index}
          chainId={chainId}
          chainNames={chainNames}
          formatBalance={formatBalance}
          formatNativeBalance={formatNativeBalance}
        />
      ))}
    </div>
  );
}

interface WalletSectionProps {
  wallet: { address: string; [key: string]: any };
  index: number;
  chainId: string;
  chainNames: Record<string, string>;
  formatBalance: (hexBalance: string, decimals: number) => string;
  formatNativeBalance: (hexBalance: string) => string;
}

function WalletSection({
  wallet,
  index,
  chainId,
  chainNames,
  formatBalance,
  formatNativeBalance,
}: WalletSectionProps) {
  const { data, error, isLoading } = useSWR(
    wallet.address ? `/api/wallet/assets?address=${wallet.address}&chain=${chainId}` : null,
    (u) => fetch(u).then((r) => r.json()),
    { refreshInterval: 30000 }
  );

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Wallet {index + 1}</h3>
        <p className="text-xs font-mono truncate">{wallet.address}</p>
      </div>

      {isLoading && <div className="">Loading assets...</div>}
      
      {error && <div className="text-red-500">Error loading assets</div>}
      
      {data && (
        <div className="flex flex-col gap-3">
          {/* Native Balance */}
          <div className="border p-3 rounded bg-gray-50">
            <div className="text-sm font-semibold">{chainId.toUpperCase()}</div>
            <div className="text-lg font-bold">
              {formatNativeBalance(data.nativeBalance)}
            </div>
          </div>

          {/* Token Balances */}
          {data.tokens && data.tokens.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.tokens.map((token: any) => (
                <div key={token.contractAddress} className="border p-3 rounded">
                  <div className="text-sm font-semibold">
                    {token.metadata?.name || "Unknown Token"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {token.metadata?.symbol || "???"}
                  </div>
                  <div className="text-lg font-bold">
                    {formatBalance(token.tokenBalance, token.metadata?.decimals || 18)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No tokens found</div>
          )}
        </div>
      )}
    </div>
  );
}