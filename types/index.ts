export type Hex32 = `0x${string}`;

export type Account = {
  address: Hex32;
  amount: int;
};

export type MerkleTree = {
  root: Hex32;
  levels: Hex32[][];
  leaves: Hex32[];
  getProof: (leaf: Hex32) => Hex32[];
};
