import { NextResponse } from "next/server";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Alchemy endpoints for different chains
const ALCHEMY_ENDPOINTS: Record<string, string> = {
  eth: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  polygon: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  optimism: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  const chain = url.searchParams.get("chain") || "eth";

  console.log("API Key exists:", !!ALCHEMY_API_KEY);
  console.log("Address:", address);
  console.log("Chain:", chain);

  if (!ALCHEMY_API_KEY) {
    return NextResponse.json(
      { error: "ALCHEMY_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (!address) {
    return NextResponse.json({ error: "No address provided" }, { status: 400 });
  }

  if (!ALCHEMY_ENDPOINTS[chain]) {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  try {
    // Get token balances
    const tokenBalancesRes = await fetch(ALCHEMY_ENDPOINTS[chain], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [address],
      }),
    });

    const tokenBalances = await tokenBalancesRes.json();
    console.log("Token balances response:", tokenBalances);

    if (tokenBalances.error) {
      return NextResponse.json(
        { error: tokenBalances.error.message },
        { status: 400 }
      );
    }

    // Get native balance (ETH, MATIC, etc.)
    const nativeBalanceRes = await fetch(ALCHEMY_ENDPOINTS[chain], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    });

    const nativeBalance = await nativeBalanceRes.json();
    console.log("Native balance response:", nativeBalance);

    // Get token metadata for tokens with balance > 0
    const tokensWithBalance = tokenBalances.result?.tokenBalances?.filter(
      (token: any) => token.tokenBalance !== "0x0"
    ) || [];

    // Fetch metadata for each token
    const metadataPromises = tokensWithBalance.map((token: any) =>
      fetch(ALCHEMY_ENDPOINTS[chain], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "alchemy_getTokenMetadata",
          params: [token.contractAddress],
        }),
      }).then((r) => r.json())
    );

    const metadataResults = await Promise.all(metadataPromises);

    // Combine balances with metadata
    const tokensWithMetadata = tokensWithBalance.map((token: any, index: number) => ({
      ...token,
      metadata: metadataResults[index].result,
    }));

    return NextResponse.json({
      address,
      chain,
      nativeBalance: nativeBalance.result,
      tokens: tokensWithMetadata,
    });
  } catch (error: any) {
    console.error("Alchemy API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch wallet assets" },
      { status: 500 }
    );
  }
}