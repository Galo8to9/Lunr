import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className="w-full"
              variant="outline"
            >
              Connect Wallet
            </Button>
          );
        }

        if (chain?.unsupported) {
          return (
            <Button variant="destructive" onClick={openChainModal}>
              Wrong network
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={openChainModal}
            >
              {chain.hasIcon && chain.iconUrl && (
                <img
                  alt={chain.name ?? "chain icon"}
                  src={chain.iconUrl}
                  className="h-4 w-4 rounded-full mr-2"
                />
              )}
              {chain.name}
            </Button>

            <Button onClick={openAccountModal}>
              {account.displayName}
              {account.displayBalance ? ` (${account.displayBalance})` : ""}
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
