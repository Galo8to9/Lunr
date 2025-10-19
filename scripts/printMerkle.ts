// scripts/printMerkle.ts
import { ACCOUNTS } from "@/lib/accounts";
import { buildFromAccounts, leafHash } from "@/lib/merkle";

(async () => {
  const tree = buildFromAccounts(ACCOUNTS);

  console.log("============================================");
  console.log("🌳 MERKLE TREE DUMP");
  console.log("============================================\n");

  console.log("→ Merkle Root:");
  console.log(tree.root);
  console.log("\n");

  console.log("→ Accounts used to build tree:");
  ACCOUNTS.forEach((a, i) => {
    console.log(`#${i}  Address: ${a.address}  Amount: ${a.amount.toString()}`);
  });
  console.log("\n");

  console.log("→ Leaves (after hashing & sorting):");
  tree.leaves.forEach((leaf, i) => {
    console.log(`#${i}: ${leaf}`);
  });
  console.log("\n");

  console.log("→ Levels (bottom = 0, top = root):");
  tree.levels.forEach((level, i) => {
    console.log(`Level ${i} (${level.length} nodes):`);
    level.forEach((node, j) => {
      console.log(`  [${j}] ${node}`);
    });
    console.log("");
  });

  console.log("============================================");
  console.log("🔍 INDIVIDUAL ACCOUNT PROOFS");
  console.log("============================================\n");

  for (const account of ACCOUNTS) {
    const leaf = leafHash(account.address, account.amount);
    const proof = tree.getAccountProof(account.address, account.amount);

    console.log(`Account: ${account.address}`);
    console.log(`Amount:  ${account.amount}`);
    console.log(`Leaf:    ${leaf}`);
    console.log(`Proof (${proof.length} items):`);
    proof.forEach((p, i) => console.log(`  [${i}] ${p}`));
    console.log("\n--------------------------------------------\n");
  }

  console.log("✅ DONE — total leaves:", tree.leaves.length);
})();
