"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DEFAULT_WALLETS } from "@/constants/hardcoded";

import { useOwnedWallets } from "@/stores/ownedWallets";

const STORAGE_KEY = "ownedWallets";
const ETH_REGEX = /^0x[a-fA-F0-9]{40}$/;

interface OwnedWalletsProps {
  /**
   * Optional initial wallets to seed the list (will be validated & merged with localStorage).
   * If not provided, a set of 10 hardcoded DEFAULT_WALLETS will be used.
   */
  initialWallets?: string[];
}

const OwnedWallets: React.FC<OwnedWalletsProps> = ({ initialWallets }) => {
  // STATES
  const [input, setInput] = useState("");
  const [walletList, setWalletList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { wallets, addMany, removeOne } = useOwnedWallets();

  // seed from localStorage or defaults
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      // Validate and normalize any provided initialWallets or fall back to defaults
      const seed = (
        initialWallets?.filter((a) => ETH_REGEX.test(a)) ?? DEFAULT_WALLETS
      ).map((a) => a.toLowerCase());

      if (raw) {
        const stored = JSON.parse(raw) as string[];
        const merged = Array.from(new Set([...(stored ?? []), ...seed]));
        setWalletList(merged);
      } else {
        setWalletList(Array.from(new Set(seed)));
      }
    } catch {
      // Fallback to defaults on any parse/storage issues
      setWalletList([...DEFAULT_WALLETS.map((a) => a.toLowerCase())]);
    }
  }, [initialWallets]);

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(walletList));
    } catch {}
  }, [walletList]);

  const parseAddresses = (text: string) =>
    text
      .split(/[\s,;\n\r]+/g)
      .map((s) => s.trim())
      .filter(Boolean);

  // FUNCTIONS
  const handleAddWallet = async () => {
    setError(null);
    const candidates = parseAddresses(input);
    if (candidates.length === 0) return;

    const invalid = candidates.filter((a) => !ETH_REGEX.test(a));
    if (invalid.length > 0) {
      setError(
        `Invalid address${invalid.length > 1 ? "es" : ""}: ${invalid.join(
          ", "
        )}`
      );
      return;
    }

    setWalletList((prev) => {
      const existing = new Set(prev.map((a) => a.toLowerCase()));
      const next = [
        ...prev,
        ...Array.from(new Set(candidates.map((a) => a.toLowerCase()))).filter(
          (a) => !existing.has(a)
        ),
      ];

      return next;
    });

    setInput("");
  };

  const handleRemove = (address: string) => {
    setWalletList((prev) => prev.filter((a) => a !== address));
  };

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Paste 0x3C6b5B3e25..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-w-md"
        />
        <Button onClick={handleAddWallet}>Add Wallets</Button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {walletList.length === 0 ? (
        <p>No wallets</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {walletList.map((address) => (
            <li
              key={address}
              className="flex items-center justify-between rounded-xl border px-3 py-2"
            >
              <code className="text-sm break-all">{address}</code>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(address)}
                >
                  Copy
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(address)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OwnedWallets;
