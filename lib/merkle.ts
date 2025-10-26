// lib/merkle.ts
import { keccak256, hexToBytes } from "viem/utils";
import { encodePacked } from "viem";

export type Hex32 = `0x${string}`;

export type MerkleOptions = {
  sortLeaves?: boolean; // default true
  promoteOdd?: boolean; // default true
};

export type MerkleTree = {
  root: Hex32;
  levels: Hex32[][];
  leaves: Hex32[];
  getProof: (leaf: Hex32) => Hex32[];
  verifyProof: (leaf: Hex32, proof: Hex32[]) => boolean;
  indexOf: (leaf: Hex32) => number;
};

// Types for snapshot data (matching commitProofPayload.tsx)
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

// Hashing primitives
export function leafHash(address: `0x${string}`, amount: bigint): Hex32 {
  return keccak256(encodePacked(["address", "uint256"], [address, amount]));
}

// Hash for wallet balance entry (includes price data)
export function balanceLeafHash(
  walletAddress: `0x${string}`,
  chainId: string,
  tokenSymbol: string,
  amount: bigint,
  priceUSD: bigint, // Price in USD with decimals
  priceTimestamp: bigint
): Hex32 {
  return keccak256(
    encodePacked(
      ["address", "string", "string", "uint256", "uint256", "uint256"],
      [walletAddress, chainId, tokenSymbol, amount, priceUSD, priceTimestamp]
    )
  );
}

// Hash for price feed entry
export function priceLeafHash(
  pythSymbol: string,
  price: bigint,
  expo: number,
  publishTime: bigint
): Hex32 {
  return keccak256(
    encodePacked(
      ["string", "uint256", "int32", "uint256"],
      [pythSymbol, price, expo, publishTime]
    )
  );
}

// Hash for snapshot metadata
export function snapshotMetadataHash(
  snapshotId: string,
  timestamp: bigint,
  totalPortfolioValue: bigint,
  balancesRoot: Hex32,
  pricesRoot: Hex32
): Hex32 {
  return keccak256(
    encodePacked(
      ["string", "uint256", "uint256", "bytes32", "bytes32"],
      [snapshotId, timestamp, totalPortfolioValue, balancesRoot, pricesRoot]
    )
  );
}

function compareBytes(a: Uint8Array, b: Uint8Array): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
}

function hashPair(a: Hex32, b: Hex32): Hex32 {
  if (a === b) return a;
  const ab = hexToBytes(a);
  const bb = hexToBytes(b);
  const [left, right] = compareBytes(ab, bb) <= 0 ? [ab, bb] : [bb, ab];
  const concatenated = new Uint8Array(left.length + right.length);
  concatenated.set(left, 0);
  concatenated.set(right, left.length);
  return keccak256(concatenated);
}

// Core builder
export function buildMerkleTree(
  leavesInput: Hex32[],
  opts?: MerkleOptions
): MerkleTree {
  const { sortLeaves = true, promoteOdd = true } = opts ?? {};

  if (leavesInput.length === 0) {
    const emptyRoot = keccak256(new Uint8Array([]));
    const levels: Hex32[][] = [[emptyRoot]];
    const leaves: Hex32[] = [emptyRoot];
    return {
      root: emptyRoot,
      levels,
      leaves,
      getProof: () => [],
      verifyProof: () => true,
      indexOf: () => 0,
    };
  }

  const leaves = sortLeaves
    ? [...leavesInput].sort((a, b) =>
        compareBytes(hexToBytes(a), hexToBytes(b))
      )
    : [...leavesInput];

  const levels: Hex32[][] = [leaves];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    const next: Hex32[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const left = prev[i];
      const right = prev[i + 1];
      if (right === undefined) {
        next.push(promoteOdd ? left : hashPair(left, left));
      } else {
        next.push(hashPair(left, right));
      }
    }
    levels.push(next);
  }

  const root = levels[levels.length - 1][0];

  function indexOf(leaf: Hex32) {
    return levels[0].indexOf(leaf);
  }
  function getProof(leaf: Hex32): Hex32[] {
    let idx = indexOf(leaf);
    if (idx === -1) throw new Error("Leaf not found in tree");
    const proof: Hex32[] = [];
    for (let level = 0; level < levels.length - 1; level++) {
      const nodes = levels[level];
      const isRight = (idx & 1) === 1;
      const pairIndex = isRight ? idx - 1 : idx + 1;
      if (pairIndex < nodes.length) proof.push(nodes[pairIndex]);
      idx = Math.floor(idx / 2);
    }
    return proof;
  }
  function verifyProof(leaf: Hex32, proof: Hex32[]) {
    let computed = leaf;
    for (const sibling of proof) computed = hashPair(computed, sibling);
    return computed.toLowerCase() === root.toLowerCase();
  }

  return { root, levels, leaves, getProof, verifyProof, indexOf };
}

// Convenience: account entries
export function buildFromAccounts(
  entries: { address: `0x${string}`; amount: bigint }[],
  opts?: MerkleOptions
) {
  const leaves = entries.map((e) => leafHash(e.address, e.amount));
  const tree = buildMerkleTree(leaves, opts);
  const leafByKey = new Map<string, Hex32>();
  for (const e of entries) {
    leafByKey.set(
      `${e.address.toLowerCase()}-${e.amount.toString()}`,
      leafHash(e.address, e.amount)
    );
  }
  return {
    ...tree,
    getAccountLeaf(address: `0x${string}`, amount: bigint): Hex32 {
      return leafHash(address, amount);
    },
    getAccountProof(address: `0x${string}`, amount: bigint): Hex32[] {
      const key = `${address.toLowerCase()}-${amount.toString()}`;
      const leaf = leafByKey.get(key);
      if (!leaf) throw new Error("Account/amount not found");
      return tree.getProof(leaf);
    },
    verifyAccount(
      address: `0x${string}`,
      amount: bigint,
      proof: Hex32[]
    ): boolean {
      const leaf = leafHash(address, amount);
      return tree.verifyProof(leaf, proof);
    },
  };
}

// Balance entry with price data
export type BalanceLeafEntry = {
  walletAddress: `0x${string}`;
  chainId: string;
  tokenSymbol: string;
  amount: bigint;
  amountString: string;
  priceUSD: bigint; // Price * 10^8 (Pyth format)
  priceUSDFormatted: number;
  priceTimestamp: bigint;
  valuation: bigint; // amount * price
  valuationFormatted: number;
};

// Price feed entry
export type PriceLeafEntry = {
  pythSymbol: string;
  price: bigint;
  expo: number;
  publishTime: bigint;
  priceFormatted: number;
};

// Build comprehensive merkle tree from snapshot
export function buildFromSnapshot(
  snapshot: SnapshotData,
  opts?: MerkleOptions
) {
  // Create price lookup map
  const priceMap = new Map<string, PriceLeafEntry>();
  for (const priceData of snapshot.prices) {
    const priceBigInt = BigInt(priceData.price);
    const priceFormatted = Number(priceBigInt) * Math.pow(10, priceData.expo);

    priceMap.set(priceData.pythSymbol, {
      pythSymbol: priceData.pythSymbol,
      price: priceBigInt,
      expo: priceData.expo,
      publishTime: BigInt(priceData.publishTime),
      priceFormatted,
    });
  }

  // Symbol to Pyth mapping
  const SYMBOL_TO_PYTH_MAP: Record<string, string> = {
    ETH: "ETHUSD",
    WETH: "ETHUSD",
    BTC: "BTCUSD",
    WBTC: "BTCUSD",
    SOL: "SOLUSD",
    BNB: "BNBUSD",
    XRP: "XRPUSD",
  };

  // Build balance entries
  const balanceEntries: BalanceLeafEntry[] = [];
  for (const wallet of snapshot.wallets) {
    for (const chain of wallet.chains) {
      for (const token of chain.tokens) {
        const amountFloat = parseFloat(token.amount);
        const amountBigInt = BigInt(
          Math.floor(amountFloat * Math.pow(10, token.decimals))
        );

        // Get price data
        const pythSymbol = SYMBOL_TO_PYTH_MAP[token.symbol];
        const priceData = pythSymbol ? priceMap.get(pythSymbol) : undefined;

        let priceUSD = BigInt(0);
        let priceUSDFormatted = 0;
        let priceTimestamp = BigInt(snapshot.timestamp);
        let valuation = BigInt(0);
        let valuationFormatted = 0;

        if (priceData) {
          priceUSD = priceData.price;
          priceUSDFormatted = priceData.priceFormatted;
          priceTimestamp = priceData.publishTime;

          // Calculate valuation
          valuationFormatted = amountFloat * priceData.priceFormatted;
          // For bigint: (amount * price) / 10^8 (adjusting for price decimals)
          valuation =
            (amountBigInt * priceData.price) / BigInt(Math.pow(10, 8));
        }

        balanceEntries.push({
          walletAddress: wallet.address as `0x${string}`,
          chainId: chain.chainId,
          tokenSymbol: token.symbol,
          amount: amountBigInt,
          amountString: token.amount,
          priceUSD,
          priceUSDFormatted,
          priceTimestamp,
          valuation,
          valuationFormatted,
        });
      }
    }
  }

  // Generate balance leaves
  const balanceLeaves = balanceEntries.map((e) =>
    balanceLeafHash(
      e.walletAddress,
      e.chainId,
      e.tokenSymbol,
      e.amount,
      e.priceUSD,
      e.priceTimestamp
    )
  );

  // Generate price leaves
  const priceEntries = Array.from(priceMap.values());
  const priceLeaves = priceEntries.map((e) =>
    priceLeafHash(e.pythSymbol, e.price, e.expo, e.publishTime)
  );

  // Build separate trees
  const balanceTree = buildMerkleTree(balanceLeaves, opts);
  const priceTree = buildMerkleTree(priceLeaves, opts);

  // Create final snapshot root
  const totalPortfolioValueBigInt = BigInt(
    Math.floor(snapshot.totalPortfolioValue * 100) // Store as cents
  );

  const snapshotRoot = snapshotMetadataHash(
    snapshot.snapshotId,
    BigInt(snapshot.timestamp),
    totalPortfolioValueBigInt,
    balanceTree.root,
    priceTree.root
  );

  // Create lookup maps
  const balanceLeafByKey = new Map<
    string,
    { leaf: Hex32; entry: BalanceLeafEntry }
  >();
  for (let i = 0; i < balanceEntries.length; i++) {
    const e = balanceEntries[i];
    const key = `${e.walletAddress.toLowerCase()}-${e.chainId}-${
      e.tokenSymbol
    }-${e.amount.toString()}`;
    balanceLeafByKey.set(key, { leaf: balanceLeaves[i], entry: e });
  }

  const priceLeafByKey = new Map<
    string,
    { leaf: Hex32; entry: PriceLeafEntry }
  >();
  for (let i = 0; i < priceEntries.length; i++) {
    const e = priceEntries[i];
    priceLeafByKey.set(e.pythSymbol, { leaf: priceLeaves[i], entry: e });
  }

  return {
    snapshotRoot,
    balanceTree,
    priceTree,
    balanceEntries,
    priceEntries,
    snapshot,

    // Get balance proof
    getBalanceProof(
      walletAddress: `0x${string}`,
      chainId: string,
      tokenSymbol: string,
      amount: bigint
    ): { proof: Hex32[]; priceUSD: bigint; priceTimestamp: bigint } {
      const key = `${walletAddress.toLowerCase()}-${chainId}-${tokenSymbol}-${amount.toString()}`;
      const data = balanceLeafByKey.get(key);
      if (!data) throw new Error("Balance entry not found");
      return {
        proof: balanceTree.getProof(data.leaf),
        priceUSD: data.entry.priceUSD,
        priceTimestamp: data.entry.priceTimestamp,
      };
    },

    // Get price proof
    getPriceProof(pythSymbol: string): {
      proof: Hex32[];
      price: bigint;
      expo: number;
      publishTime: bigint;
    } {
      const data = priceLeafByKey.get(pythSymbol);
      if (!data) throw new Error("Price entry not found");
      return {
        proof: priceTree.getProof(data.leaf),
        price: data.entry.price,
        expo: data.entry.expo,
        publishTime: data.entry.publishTime,
      };
    },

    // Verify balance entry
    verifyBalance(
      walletAddress: `0x${string}`,
      chainId: string,
      tokenSymbol: string,
      amount: bigint,
      priceUSD: bigint,
      priceTimestamp: bigint,
      proof: Hex32[]
    ): boolean {
      const leaf = balanceLeafHash(
        walletAddress,
        chainId,
        tokenSymbol,
        amount,
        priceUSD,
        priceTimestamp
      );
      return balanceTree.verifyProof(leaf, proof);
    },

    // Verify price entry
    verifyPrice(
      pythSymbol: string,
      price: bigint,
      expo: number,
      publishTime: bigint,
      proof: Hex32[]
    ): boolean {
      const leaf = priceLeafHash(pythSymbol, price, expo, publishTime);
      return priceTree.verifyProof(leaf, proof);
    },

    // Get all entries for a wallet
    getWalletEntries(walletAddress: `0x${string}`): BalanceLeafEntry[] {
      return balanceEntries.filter(
        (e) => e.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
    },

    // Get all entries for a token
    getTokenEntries(tokenSymbol: string): BalanceLeafEntry[] {
      return balanceEntries.filter((e) => e.tokenSymbol === tokenSymbol);
    },
  };
}
