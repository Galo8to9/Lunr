"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { Button } from "../ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import { WalletButton } from "../ui/walletButton";

export function SignInButton() {
  // WEB3 WALLET
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Other Stuff i dont recall now
  const router = useRouter();

  // STATES
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // FUNCTIONS
  const handleSign = async () => {
    if (!address || !chainId) {
      setError("Wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the app",
        uri: window.location.origin,
        version: "1",
        chainId: chainId,
      });

      const preparedMessage = message.prepareMessage();

      console.log("CLIENT DEBUG");
      console.log("Prepared message:", preparedMessage);

      const signature = await signMessageAsync({
        message: preparedMessage,
      });
      console.log("CLIENT DEBUG");
      console.log("Signature", signature);

      const res = await fetch("/api/siwe/signmessage", {
        method: "POST",
        headers: { "Conent-Type": "application/json" },
        body: JSON.stringify({
          message: preparedMessage,
          signature: signature,
        }),
      });

      const data = await res.json();
      console.log("CLIENT DEBUG");
      console.log("Server responde:", data);

      if (res.ok && data.ok) {
        window.location.href = "/dashboard";
      } else {
        setError(data.erro || "Failed to sign message");
      }
    } catch (err) {
      console.error("=== Client Error ===", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/siwe/logout", { method: "POST" });
    disconnect();
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="flex w-full">
        <Button disabled>Connect Wallet</Button>
      </div>
    );
  }
  return (
    <div className="flex w-full justify-center">
      {!address && <WalletButton />}
      {address && (
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleSign}
          disabled={loading || !address}
        >
          {loading ? "Signing..." : "Sign Message"}
        </Button>
      )}
    </div>
  );
}
