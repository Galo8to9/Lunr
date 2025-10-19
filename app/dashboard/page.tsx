import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import OwnedWallets from "@/components/dashboard/OwnedWallets";
import Navbar from "@/components/Navbar";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex w-full justify-between">
        <h1 className="text-5xl">Welcome back</h1>
        {/* <h1 className="text-4xl">Welcome Back</h1> */}
      </div>
      <div></div>
    </div>
  );
};

export default page;
