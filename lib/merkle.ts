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

// Hashing primitives
export function leafHash(address: `0x${string}`, amount: bigint): Hex32 {
  return keccak256(encodePacked(["address", "uint256"], [address, amount]));
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
