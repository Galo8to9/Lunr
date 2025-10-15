"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ConnectButton, WalletButton } from "@rainbow-me/rainbowkit";

/**
 * DashboardNavbar
 * - Compact top bar for authenticated dashboard pages.
 * - Mobile: hamburger toggles sidebar (parent controls state via prop).
 * - Includes search, notifications, theme toggle, and user menu.
 */

type DashboardNavbarProps = {
  onToggleSidebar?: () => void;
  user?: { name?: string; email?: string; imageUrl?: string } | null;
};

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  onToggleSidebar,
  user,
}) => {
  const pathname = usePathname();
  const initials = React.useMemo(() => {
    const n = user?.name?.trim() || user?.email || "U";
    return n
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name, user?.email]);

  const router = useRouter();
  const { disconnect } = useDisconnect();

  const logout = async () => {
    await fetch('/api/siwe/logout', { method: 'POST' });
    disconnect()
    router.refresh();           // re-render server components without the session
    router.push('/');           // optional redirect
  };

 

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-14 z-40
                   border-b border-white/10 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">


      <div className="mx-auto w-full  px-4 sm:px-6">
        <div className="flex h-14 items-center gap-3">
          {/* Left: Mobile burger + Brand */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle sidebar"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            
          </div>

          {/* Center: Search */}
          <div className="flex flex-1 items-center justify-center md:justify-start">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
              <Input
                type="search"
                placeholder="Search…"
                className="pl-9 pr-24"
                aria-label="Search"
              />
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:block">
                ⌘K
              </div>
            </div>
          </div>

         

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Breadcrumb-ish current section (desktop) */}
            <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
              <span className="truncate max-w-[14ch]">{pathname}</span>
            </div>

            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Theme toggle placeholder - wire to your theme provider */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="hidden sm:inline-flex"
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="hidden h-5 w-5 dark:inline" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-6 w-6">
                    {user?.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={user?.name || "User"} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden text-sm md:inline-block">
                    {user?.name || user?.email || "Account"}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <ConnectButton/>
                </DropdownMenuLabel>
      
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={logout} >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
