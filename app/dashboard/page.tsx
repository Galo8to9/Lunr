import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import OwnedWallets from "@/components/dashboard/OwnedWallets";
import PriceFeed from "@/components/dashboard/PriceFeed";
import Navbar from "@/components/Navbar";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import React from "react";

const page = () => {
  return (
<div className="flex flex-col">
<PriceFeed/>
</div>
  );
};

export default page;
