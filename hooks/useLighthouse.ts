import { useState } from "react";
import {
  uploadToLighthouse,
  uploadWithTokenGate,
  retrieveFromLighthouse,
} from "@/lib/lighthouseService";

export function useLighthouse() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    hash: string;
    url: string;
  } | null>(null);

  const uploadData = async (
    data: any,
    useTokenGate: boolean = false,
    tokenAddress?: string,
    chainId?: number
  ) => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

    if (!apiKey) {
      const error =
        "Lighthouse API key not found. Please add NEXT_PUBLIC_LIGHTHOUSE_API_KEY to your .env file";
      setUploadError(error);
      throw new Error(error);
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let result;

      if (useTokenGate && tokenAddress) {
        // Upload with token-gated access
        result = await uploadWithTokenGate(data, apiKey, tokenAddress, chainId);
      } else {
        // Regular upload with encryption
        result = await uploadToLighthouse(data, apiKey);
      }

      setUploadResult(result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const retrieveData = async (cid: string) => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

    if (!apiKey) {
      throw new Error("Lighthouse API key not configured");
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await retrieveFromLighthouse(cid, apiKey);
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Retrieval failed";
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setUploadResult(null);
    setUploadError(null);
  };

  return {
    uploadData,
    retrieveData,
    isUploading,
    uploadError,
    uploadResult,
    reset,
  };
}
