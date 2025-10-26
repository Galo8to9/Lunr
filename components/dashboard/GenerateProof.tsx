"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWalletStore } from "@/store/walletStore";
import { usePythPriceCotations } from "@/stores/pythPriceCotations";
import { useCommitProofPayload } from "@/stores/commitProofPayload";
import { buildFromSnapshot } from "@/lib/merkle";
import useSWR from "swr";
import { Loader2, Check, Copy, CheckCheck, ExternalLink } from "lucide-react";
import { uploadToLighthouse } from "@/lib/lighthouseService";

const CHAIN_ID = "eth";

// Map token symbols to Pyth price feed symbols
const SYMBOL_TO_PYTH_MAP: Record<string, string> = {
  ETH: "ETHUSD",
  WETH: "ETHUSD",
  BTC: "BTCUSD",
  WBTC: "BTCUSD",
  SOL: "SOLUSD",
  BNB: "BNBUSD",
  XRP: "XRPUSD",
};

const formatBalance = (hexBalance: string, decimals: number) => {
  const balance = parseInt(hexBalance, 16);
  const formatted = balance / Math.pow(10, decimals);
  return formatted.toFixed(18); // Keep high precision for snapshot
};

const formatNativeBalance = (hexBalance: string) => {
  const balance = parseInt(hexBalance, 16);
  const formatted = balance / Math.pow(10, 18);
  return formatted.toFixed(18);
};

const formatPrice = (price: string, expo: number) => {
  const priceNum = Number(price) * Math.pow(10, expo);
  return priceNum;
};

export default function GenerateProof() {
  const { wallets } = useWalletStore();
  const { prices, getPriceBySymbol } = usePythPriceCotations();
  const { createSnapshot } = useCommitProofPayload();
  const {
    uploadSnapshot,
    isUploading: isUploadingToIPFS,
    uploadResult,
  } = uploadToLighthouse();

  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [snapshotRoot, setSnapshotRoot] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [snapshotData, setSnapshotData] = useState<{
    snapshotId: string;
    timestamp: number;
    balanceRoot: string;
    priceRoot: string;
    totalValue: number;
    balanceCount: number;
    priceCount: number;
  } | null>(null);

  // Fetch data for all wallets
  const walletDataHooks = (wallets || []).map((wallet) =>
    useSWR(
      wallet.address
        ? `/api/wallet/assets?address=${wallet.address}&chain=${CHAIN_ID}`
        : null,
      (u) => fetch(u).then((r) => r.json()),
      { refreshInterval: 30000 }
    )
  );

  const handleGenerateProof = async () => {
    setIsGenerating(true);
    setSuccess(false);
    setSnapshotRoot(null);
    setIpfsHash(null);
    setEncryptionKey(null);
    setIpfsUrl(null);

    try {
      // Collect all wallet snapshots
      const walletSnapshots = walletDataHooks.map(({ data }, walletIndex) => {
        const wallet = wallets[walletIndex];
        const tokens = [];

        if (!data) {
          return {
            address: wallet.address,
            chains: [],
          };
        }

        // Add native token
        if (data.nativeBalance) {
          const balance = formatNativeBalance(data.nativeBalance);
          tokens.push({
            symbol: CHAIN_ID.toUpperCase(),
            amount: balance,
            decimals: 18,
          });
        }

        // Add ERC20 tokens
        if (data.tokens && data.tokens.length > 0) {
          data.tokens.forEach((token) => {
            tokens.push({
              symbol: token.metadata?.symbol || "UNKNOWN",
              amount: formatBalance(
                token.tokenBalance,
                token.metadata?.decimals || 18
              ),
              decimals: token.metadata?.decimals || 18,
              contractAddress: token.contractAddress,
            });
          });
        }

        return {
          address: wallet.address,
          chains: [
            {
              chainId: CHAIN_ID,
              chainName: "Ethereum",
              nativeBalance: data.nativeBalance
                ? formatNativeBalance(data.nativeBalance)
                : undefined,
              tokens,
            },
          ],
        };
      });

      // Collect price snapshots
      const priceSnapshots = prices
        .filter((priceData) => priceData.price && priceData.price.price)
        .map((priceData) => ({
          symbol: priceData.symbol,
          pythSymbol: priceData.symbol,
          price: priceData.price.price,
          expo: priceData.price.expo,
          publishTime: priceData.price.publishTime,
        }));

      // Calculate total portfolio value
      let totalPortfolioValue = 0;

      walletSnapshots.forEach((walletSnapshot) => {
        walletSnapshot.chains.forEach((chain) => {
          chain.tokens.forEach((token) => {
            const pythSymbol = SYMBOL_TO_PYTH_MAP[token.symbol];
            if (pythSymbol) {
              const priceData = getPriceBySymbol(pythSymbol);
              if (priceData) {
                const price = formatPrice(
                  priceData.price.price,
                  priceData.price.expo
                );
                const amount = parseFloat(token.amount);
                totalPortfolioValue += amount * price;
              }
            }
          });
        });
      });

      // Create the snapshot
      const snapshotId = createSnapshot({
        wallets: walletSnapshots,
        prices: priceSnapshots,
        totalPortfolioValue,
      });

      // Build comprehensive merkle tree from the snapshot
      const snapshot = {
        wallets: walletSnapshots,
        prices: priceSnapshots,
        totalPortfolioValue,
        timestamp: Date.now(),
        snapshotId,
      };

      const merkleData = buildFromSnapshot(snapshot);

      // ============================================
      // Upload to IPFS via Pinata
      // ============================================
      try {
        console.log("📤 Uploading snapshot to IPFS via Pinata...");

        const ipfsResult = await uploadSnapshot(merkleData, "pinata");

        setIpfsHash(ipfsResult.ipfsHash);
        setEncryptionKey(ipfsResult.encryptionKey);
        setIpfsUrl(ipfsResult.url);

        console.log("✅ Successfully uploaded to IPFS!");
        console.log("IPFS Hash:", ipfsResult.ipfsHash);
        console.log("Encryption Key (SAVE THIS!):", ipfsResult.encryptionKey);
        console.log("Gateway URL:", ipfsResult.url);
        console.log(
          "⚠️ SAVE BOTH THE IPFS HASH AND ENCRYPTION KEY TO RETRIEVE YOUR DATA LATER!"
        );
      } catch (ipfsError) {
        console.error("❌ IPFS upload failed (continuing anyway):", ipfsError);
        // Don't throw - we still want to show the snapshot even if IPFS fails
      }
      // ============================================

      console.log("=== Comprehensive Snapshot & Merkle Trees Created ===");
      console.log("Snapshot ID:", snapshotId);
      console.log("Snapshot Root (Final):", merkleData.snapshotRoot);
      console.log("Balance Tree Root:", merkleData.balanceTree.root);
      console.log("Price Tree Root:", merkleData.priceTree.root);
      console.log("\n--- Balance Entries ---");
      console.log("Total Balance Leaves:", merkleData.balanceEntries.length);
      merkleData.balanceEntries.forEach((entry, i) => {
        console.log(
          `  ${i + 1}. ${entry.walletAddress.slice(0, 10)}... | ${
            entry.chainId
          } | ${entry.tokenSymbol}`
        );
        console.log(
          `     Amount: ${entry.amountString} (${entry.amount.toString()})`
        );
        console.log(
          `     Price: $${entry.priceUSDFormatted.toFixed(
            2
          )} (${entry.priceUSD.toString()}) @ ${new Date(
            Number(entry.priceTimestamp) * 1000
          ).toISOString()}`
        );
        console.log(`     Valuation: $${entry.valuationFormatted.toFixed(2)}`);
      });

      console.log("\n--- Price Feed Entries ---");
      console.log("Total Price Leaves:", merkleData.priceEntries.length);
      merkleData.priceEntries.forEach((entry, i) => {
        console.log(
          `  ${i + 1}. ${entry.pythSymbol}: $${entry.priceFormatted.toFixed(
            2
          )} (${entry.price.toString()} * 10^${entry.expo})`
        );
        console.log(
          `     Published: ${new Date(
            Number(entry.publishTime) * 1000
          ).toISOString()}`
        );
      });

      console.log("\n--- Portfolio Summary ---");
      console.log(`Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}`);

      // Example: Generate and verify proofs
      if (merkleData.balanceEntries.length > 0) {
        const firstBalance = merkleData.balanceEntries[0];
        console.log("\n--- Example Balance Proof ---");
        console.log(
          `Entry: ${firstBalance.walletAddress} | ${firstBalance.tokenSymbol} | ${firstBalance.amountString}`
        );

        const balanceProof = merkleData.getBalanceProof(
          firstBalance.walletAddress,
          firstBalance.chainId,
          firstBalance.tokenSymbol,
          firstBalance.amount
        );
        console.log("Balance Proof Length:", balanceProof.proof.length);
        console.log("Balance Proof:", balanceProof.proof);

        const isValidBalance = merkleData.verifyBalance(
          firstBalance.walletAddress,
          firstBalance.chainId,
          firstBalance.tokenSymbol,
          firstBalance.amount,
          balanceProof.priceUSD,
          balanceProof.priceTimestamp,
          balanceProof.proof
        );
        console.log("Balance Proof Valid:", isValidBalance);
      }

      if (merkleData.priceEntries.length > 0) {
        const firstPrice = merkleData.priceEntries[0];
        console.log("\n--- Example Price Proof ---");
        console.log(
          `Price Feed: ${
            firstPrice.pythSymbol
          } = $${firstPrice.priceFormatted.toFixed(2)}`
        );

        const priceProof = merkleData.getPriceProof(firstPrice.pythSymbol);
        console.log("Price Proof Length:", priceProof.proof.length);
        console.log("Price Proof:", priceProof.proof);

        const isValidPrice = merkleData.verifyPrice(
          firstPrice.pythSymbol,
          priceProof.price,
          priceProof.expo,
          priceProof.publishTime,
          priceProof.proof
        );
        console.log("Price Proof Valid:", isValidPrice);
      }

      setSnapshotRoot(merkleData.snapshotRoot);
      setSnapshotData({
        snapshotId,
        timestamp: snapshot.timestamp,
        balanceRoot: merkleData.balanceTree.root,
        priceRoot: merkleData.priceTree.root,
        totalValue: totalPortfolioValue,
        balanceCount: merkleData.balanceEntries.length,
        priceCount: merkleData.priceEntries.length,
      });
      setSuccess(true);
      setDialogOpen(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating snapshot:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = walletDataHooks.some((hook) => hook.isLoading);
  const hasData = walletDataHooks.some((hook) => hook.data);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleGenerateProof}
          disabled={isGenerating || isLoading || !hasData || isUploadingToIPFS}
          className="w-full"
        >
          {isGenerating || isUploadingToIPFS ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploadingToIPFS ? "Uploading to IPFS..." : "Generating..."}
            </>
          ) : success ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Snapshot Created!
            </>
          ) : (
            "Generate Proof"
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Snapshot Generated Successfully</DialogTitle>
          <DialogDescription>
            Your portfolio snapshot has been captured, merkle trees generated,
            and uploaded to IPFS
          </DialogDescription>
        </DialogHeader>

        {snapshotData && (
          <div className="space-y-6 py-4">
            {/* IPFS Storage Section */}
            {ipfsHash && encryptionKey && (
              <div className="space-y-3 border-2 border-green-500 rounded-lg p-4 bg-green-500/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-green-500">
                    ☁️ IPFS Storage (Encrypted)
                  </h3>
                </div>

                {/* IPFS Hash */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      IPFS Hash (CID)
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ipfsHash, "ipfs")}
                      className="h-8"
                    >
                      {copiedField === "ipfs" ? (
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <code className="block text-xs bg-muted p-2 rounded break-all font-mono">
                    {ipfsHash}
                  </code>
                </div>

                {/* Encryption Key */}
                <div className="space-y-2 bg-red-500/10 border border-red-500/20 rounded p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                      🔑 Encryption Key (CRITICAL - SAVE THIS!)
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(encryptionKey, "key")}
                      className="h-8"
                    >
                      {copiedField === "key" ? (
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <code className="block text-xs bg-muted p-2 rounded break-all font-mono">
                    {encryptionKey}
                  </code>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    ⚠️ Without this key, you CANNOT decrypt your data. Store it
                    securely!
                  </p>
                </div>

                {/* Gateway Link */}
                {ipfsUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(ipfsUrl, "_blank")}
                    className="w-full text-xs"
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View on IPFS Gateway (Encrypted Data)
                  </Button>
                )}
              </div>
            )}

            {/* Snapshot Root */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-green-500">
                  Snapshot Root (Final)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(snapshotRoot || "", "root")}
                  className="h-8"
                >
                  {copiedField === "root" ? (
                    <CheckCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="block text-xs bg-muted p-3 rounded break-all font-mono">
                {snapshotRoot}
              </code>
              <p className="text-xs text-muted-foreground">
                This is your single commitment hash that proves the liquidity of
                your portfolio
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">
                  Total Portfolio Value
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatUSD(snapshotData.totalValue)}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">Snapshot Time</p>
                <p className="text-sm font-semibold mt-1">
                  {new Date(snapshotData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Merkle Tree Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Merkle Tree Details</h3>

              {/* Balance Tree */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Balance Tree Root</p>
                    <p className="text-xs text-muted-foreground">
                      {snapshotData.balanceCount} balance entries
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(snapshotData.balanceRoot, "balance")
                    }
                    className="h-8"
                  >
                    {copiedField === "balance" ? (
                      <CheckCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <code className="block text-xs bg-muted p-2 rounded break-all font-mono">
                  {snapshotData.balanceRoot}
                </code>
              </div>

              {/* Price Tree */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Price Feed Tree Root</p>
                    <p className="text-xs text-muted-foreground">
                      {snapshotData.priceCount} price feeds from Pyth
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(snapshotData.priceRoot, "price")
                    }
                    className="h-8"
                  >
                    {copiedField === "price" ? (
                      <CheckCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <code className="block text-xs bg-muted p-2 rounded break-all font-mono">
                  {snapshotData.priceRoot}
                </code>
              </div>
            </div>

            {/* Snapshot ID */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Snapshot ID</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(snapshotData.snapshotId, "id")}
                  className="h-8"
                >
                  {copiedField === "id" ? (
                    <CheckCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="block text-xs bg-muted p-2 rounded break-all">
                {snapshotData.snapshotId}
              </code>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 <strong>What does this mean?</strong> Your snapshot root
                combines both the balance tree and price feed tree into a single
                cryptographic commitment. The full merkle data is encrypted and
                stored on IPFS. You can now prove any wallet balance or price at
                this specific moment in time by retrieving the data with your
                encryption key.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
