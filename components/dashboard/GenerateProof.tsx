"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { buildFromAccounts, leafHash } from "@/lib/merkle";
import { ACCOUNTS } from "@/lib/accounts";
import { useOwnedWallets } from "@/stores/ownedWallets";
import { usePythPriceCotations } from "@/stores/pythPriceCotations";

const GenerateProof = () => {
  const { wallets, addMany, removeOne } = useOwnedWallets();
  const { pythPriceCotations } = usePythPriceCotations();
  const [root, setRoot] = useState<string>();

  const handleGenerateProof = () => {
    const tree = buildFromAccounts(wallets);
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

  return (
    <>
      <Button onClick={handleGenerateProof}>Generate On-chain Proof</Button>
      {root && <p className="text-xs break-all">{root}</p>}
    </>
  );
};

export default GenerateProof;
