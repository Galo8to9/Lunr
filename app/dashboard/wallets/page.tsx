import OwnedWallets from "@/components/dashboard/OwnedWallets";
import WalletManagementTable from "@/components/dashboard/table";
import { Separator } from "@/components/ui/separator";
import React from "react";

const page = () => {
  return <div className="flex flex-col">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold ">Company Wallets</h1>
      <p className="text-neutral-500">Manage all the wallets your company possesses in hand.</p>
    </div>
    <Separator className="mt-4"/>
    <WalletManagementTable/>
  </div>;
};

export default page;
