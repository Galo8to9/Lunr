"use client";
import React, { useState, useMemo } from "react";
import {
  Copy,
  Plus,
  Trash2,
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletStore } from "@/store/walletStore";
import useSWR from "swr";
import { usePythPriceCotations } from "@/stores/pythPriceCotations";
import GenerateProof from "./GenerateProof";

const CHAIN_ID = "eth";

const chainNames = {
  eth: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  base: "Base",
};

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
  return formatted.toFixed(4);
};

const formatNativeBalance = (hexBalance: string) => {
  const balance = parseInt(hexBalance, 16);
  const formatted = balance / Math.pow(10, 18);
  return formatted.toFixed(4);
};

const formatPrice = (price: string, expo: number) => {
  const priceNum = Number(price) * Math.pow(10, expo);
  return priceNum;
};

const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function AssetsPrice() {
  const { wallets } = useWalletStore();
  const { prices, getPriceBySymbol } = usePythPriceCotations();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [input, setInput] = useState("");
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showColumns, setShowColumns] = useState({
    asset: true,
    wallets: true,
    amount: true,
    valuation: true,
  });

  const pageSize = 20;

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

  // Aggregate assets from all wallets
  const items = useMemo(() => {
    const assetMap = new Map();

    walletDataHooks.forEach(({ data }, walletIndex) => {
      if (!data) return;

      const wallet = wallets[walletIndex];

      // Add native token
      const nativeSymbol = CHAIN_ID.toUpperCase();
      if (data.nativeBalance) {
        const balance = parseFloat(formatNativeBalance(data.nativeBalance));
        if (!assetMap.has(nativeSymbol)) {
          assetMap.set(nativeSymbol, {
            id: nativeSymbol,
            asset: nativeSymbol,
            walletsSet: new Set([wallet.address]),
            totalAmount: 0,
          });
        }
        const asset = assetMap.get(nativeSymbol);
        asset.walletsSet.add(wallet.address);
        asset.totalAmount += balance;
      }

      // Add tokens
      if (data.tokens && data.tokens.length > 0) {
        data.tokens.forEach((token) => {
          const symbol = token.metadata?.symbol || "UNKNOWN";
          const balance = parseFloat(
            formatBalance(token.tokenBalance, token.metadata?.decimals || 18)
          );

          if (!assetMap.has(symbol)) {
            assetMap.set(symbol, {
              id: symbol,
              asset: symbol,
              walletsSet: new Set([wallet.address]),
              totalAmount: 0,
            });
          }
          const asset = assetMap.get(symbol);
          asset.walletsSet.add(wallet.address);
          asset.totalAmount += balance;
        });
      }
    });

    // Convert to array and calculate valuations
    return Array.from(assetMap.values()).map((asset) => {
      const amount = asset.totalAmount;

      // Get the Pyth price feed symbol for this asset
      const pythSymbol = SYMBOL_TO_PYTH_MAP[asset.asset] || null;
      let valuation = 0;
      let hasPrice = false;

      if (pythSymbol) {
        const priceData = getPriceBySymbol(pythSymbol);
        if (priceData) {
          const price = formatPrice(
            priceData.price.price,
            priceData.price.expo
          );
          valuation = amount * price;
          hasPrice = true;
        }
      }

      return {
        ...asset,
        wallets: asset.walletsSet.size,
        amount: amount.toFixed(4),
        valuation: hasPrice ? formatUSD(valuation) : "N/A",
        valuationRaw: valuation, // Keep raw value for sorting
        hasPrice,
      };
    });
  }, [walletDataHooks, wallets, prices, getPriceBySymbol]);

  // Calculate total portfolio value
  const totalPortfolioValue = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + (item.hasPrice ? item.valuationRaw : 0);
    }, 0);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!filterText) return items;
    return items.filter((item) =>
      item.asset.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [items, filterText]);

  const paginatedItems = filteredItems.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const isLoading = walletDataHooks.some((hook) => hook.isLoading);
  const hasError = walletDataHooks.some((hook) => hook.error);

  const toggleSelectAll = () => {
    const currentPageIds = paginatedItems.map((item) => item.id);
    const allSelected = currentPageIds.every((id) => selectedItems.has(id));

    if (allSelected) {
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        currentPageIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    } else {
      setSelectedItems((prev) => new Set([...prev, ...currentPageIds]));
    }
  };

  const handleAdd = () => {
    // Add your logic here
    setInput("");
    setIsAddDialogOpen(false);
  };

  const handleBulkDelete = () => {
    // Add your logic here
    setSelectedItems(new Set());
  };

  if (!wallets || wallets.length === 0) {
    return (
      <div className="w-full py-4">
        <div className="text-center text-muted-foreground">
          No wallets found. Please add a wallet first.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Total Portfolio Value Banner */}
      <div className="flex w-full space-x-4">
        <div className="w-full rounded-lg border bg-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Portfolio Value
              </p>
              <p className="text-3xl font-bold mt-1">
                {formatUSD(totalPortfolioValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-semibold mt-1">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="flex space-y-4 items-center flex-col rounded-lg border border-dashed p-6 justify-center">
          <h1>Commit Snapshot</h1>
          <GenerateProof />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-0">
          <Input
            placeholder="Filter assets..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-sm"
          />

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-dashed whitespace-nowrap"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>
                  Enter the details for your new asset.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  type="text"
                  placeholder="Enter asset..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAdd();
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Add</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {selectedItems.size > 0 && (
            <Button
              variant="destructive"
              className="border-dashed whitespace-nowrap"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedItems.size})
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                View <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={showColumns.asset}
                onCheckedChange={(value) =>
                  setShowColumns({ ...showColumns, asset: value })
                }
              >
                Asset
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showColumns.wallets}
                onCheckedChange={(value) =>
                  setShowColumns({ ...showColumns, wallets: value })
                }
              >
                Wallets
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showColumns.amount}
                onCheckedChange={(value) =>
                  setShowColumns({ ...showColumns, amount: value })
                }
              >
                Amount
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showColumns.valuation}
                onCheckedChange={(value) =>
                  setShowColumns({ ...showColumns, valuation: value })
                }
              >
                Valuation
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="whitespace-nowrap">Action Button</Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    className="rounded border"
                    checked={
                      paginatedItems.length > 0 &&
                      paginatedItems.every((item) => selectedItems.has(item.id))
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                {showColumns.asset && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Button variant="ghost" className="font-medium">
                      Asset
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                )}
                {showColumns.wallets && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Button variant="ghost" className="font-medium">
                      Wallets
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                )}
                {showColumns.amount && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Button variant="ghost" className="font-medium">
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                )}
                {showColumns.valuation && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Button variant="ghost" className="font-medium">
                      Valuation
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                )}
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    Loading assets...
                  </td>
                </tr>
              ) : hasError ? (
                <tr>
                  <td colSpan={6} className="h-24 text-center text-red-500">
                    Error loading assets
                  </td>
                </tr>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 py-2 align-middle">
                      <input
                        type="checkbox"
                        className="rounded border"
                        checked={selectedItems.has(item.id)}
                        onChange={() => {
                          setSelectedItems((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(item.id)) {
                              newSet.delete(item.id);
                            } else {
                              newSet.add(item.id);
                            }
                            return newSet;
                          });
                        }}
                      />
                    </td>
                    {showColumns.asset && (
                      <td className="p-4 py-2 align-middle">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-semibold">
                            {item.asset}
                          </code>
                          {!item.hasPrice && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              No price
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    {showColumns.wallets && (
                      <td className="p-4 py-2 align-middle">{item.wallets}</td>
                    )}
                    {showColumns.amount && (
                      <td className="p-4 py-2 align-middle">{item.amount}</td>
                    )}
                    {showColumns.valuation && (
                      <td className="p-4 py-2 align-middle">
                        <span
                          className={
                            item.hasPrice
                              ? "font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {item.valuation}
                        </span>
                      </td>
                    )}
                    <td className="p-4 py-2 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy item
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    No assets found.{" "}
                    {filterText && "Try adjusting your filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedItems.size} of {filteredItems.length} asset(s) selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <div className="flex items-center px-3 text-sm">
            Page {currentPage + 1} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
