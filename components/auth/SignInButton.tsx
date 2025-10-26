"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { Button } from "../ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import { WalletButton } from "../ui/walletButton";

// Define the session type
interface SessionData {
  address?: string;
  chainId?: number;
}

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
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/siwe/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch session:", err);
        setLoading(false);
      });
  }, []);

  // Separate effect to handle navigation
  useEffect(() => {
    if (session?.address) {
      router.push("/dashboard");
    }
  }, [session, router]);

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
        headers: { "Content-Type": "application/json" }, // Fixed typo: was "Conent-Type"
        body: JSON.stringify({
          message: preparedMessage,
          signature: signature,
        }),
      });

      const data = await res.json();
      console.log("CLIENT DEBUG");
      console.log("Server response:", data); // Fixed typo: was "responde"

      if (res.ok && data.ok) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Failed to sign message"); // Fixed typo: was "erro"
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
      <div className="flex w-full justify-center">
        <Button
          className="w-full"
          onClick={handleSign}
          disabled={loading || !address}
        >
          Connect Wallet
        </Button>
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
