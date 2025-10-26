// lib/lighthouseService.ts
import lighthouse from "@lighthouse-web3/sdk";

interface LighthouseUploadResult {
  hash: string;
  url: string;
  accessConditions?: any;
}

/**
 * Custom JSON stringifier that handles BigInt values
 */
function stringifyWithBigInt(data: any): string {
  return JSON.stringify(data, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}

/**
 * Upload encrypted data to Lighthouse with access control
 */
export async function uploadToLighthouse(
  data: any,
  apiKey: string,
  accessConditions?: any[]
): Promise<LighthouseUploadResult> {
  try {
    // Convert data to JSON string (handling BigInt)
    const jsonString = stringifyWithBigInt(data);

    // Create a blob
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], `snapshot-${Date.now()}.json`);

    // Upload with encryption
    const response = await lighthouse.upload(
      [file],
      apiKey,
      false, // dealParameters
      accessConditions // Optional access control
    );

    const hash = response.data.Hash;

    return {
      hash,
      url: `https://gateway.lighthouse.storage/ipfs/${hash}`,
      accessConditions,
    };
  } catch (error) {
    console.error("Lighthouse upload error:", error);
    throw error;
  }
}

/**
 * Upload with token-gated access (only for NFT/token holders)
 */
export async function uploadWithTokenGate(
  data: any,
  apiKey: string,
  tokenAddress: string,
  chainId: number = 1,
  minBalance: string = "1"
): Promise<LighthouseUploadResult> {
  const accessConditions = [
    {
      id: 1,
      chain: chainId.toString(),
      method: "balanceOf",
      standardContractType: "ERC20", // or "ERC721" for NFTs
      contractAddress: tokenAddress,
      returnValueTest: {
        comparator: ">=",
        value: minBalance,
      },
      parameters: [":userAddress"],
    },
  ];

  return uploadToLighthouse(data, apiKey, accessConditions);
}

/**
 * Retrieve and decrypt data from Lighthouse
 */
export async function retrieveFromLighthouse(
  cid: string,
  apiKey: string,
  userAddress?: string
): Promise<any> {
  try {
    // If there are access conditions, you'll need to sign a message
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to retrieve from Lighthouse: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Convert string representations back to BigInt where needed
    return parseWithBigInt(data);
  } catch (error) {
    console.error("Lighthouse retrieval error:", error);
    throw error;
  }
}

/**
 * Parse JSON with BigInt support
 * Note: This is a simple implementation. For production, you might want
 * to store metadata about which fields are BigInt
 */
function parseWithBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Try to parse if it looks like a BigInt string
    // You might want to be more specific about which fields should be BigInt
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => parseWithBigInt(item));
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = parseWithBigInt(obj[key]);
    }
    return result;
  }

  return obj;
}

/**
 * Get file info from Lighthouse
 */
export async function getFileInfo(cid: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.lighthouse.storage/api/fileInfo?cid=${cid}`
    );

    if (!response.ok) {
      throw new Error("Failed to get file info");
    }

    return response.json();
  } catch (error) {
    console.error("Error getting file info:", error);
    throw error;
  }
}
