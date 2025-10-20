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
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  PanelLeftIcon,
  PanelRightIcon,
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

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
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  onToggleSidebar,
  user,
  sidebarCollapsed = false,
  onToggleCollapse,
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

  // Generate breadcrumb items from pathname
  const breadcrumbItems = React.useMemo(() => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      return { href, label, isLast: index === paths.length - 1 };
    });
  }, [pathname]);

  return (
    <header className={`fixed top-0 right-0 h-16 z-40 transition-all duration-300 ease-in-out
                    bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70
                    ${sidebarCollapsed ? 'md:left-[72px]' : 'md:left-64'} left-0`}>


      <div className="mx-auto w-full px-4 sm:px-6">
        <div className="flex h-16 items-center gap-3">
          {/* Left: Mobile burger + Collapse button + Breadcrumb */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden flex-shrink-0"
              aria-label="Toggle sidebar"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Collapse Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex flex-shrink-0"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleCollapse}
            >
             
                <PanelLeftIcon className="h-5 w-5" />
         
           

            </Button>

            {/* Breadcrumb */}
            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {item.isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Search + Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <div className="relative w-full max-w-xs hidden lg:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
              <Input
                type="search"
                placeholder="Search…"
                className="pl-9 pr-16 w-full"
                aria-label="Search"
              />
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ⌘K
              </div>
            </div>

            {/* Search icon for mobile/tablet */}
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>

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