"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Moon,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  LifeBuoy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Utils
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Types
export type User = { name?: string; email?: string; imageUrl?: string } | null;

export type DashboardSidebarProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  user?: User;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  footerContent?: React.ReactNode;
  onLogout?: () => void;
};

// Navigation config
const navItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  footer?: boolean;
}> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/generateproofs", label: "Generate Proof", icon: ShieldCheck },
  { href: "/dashboard/wallets", label: "Wallets", icon: Wallet },
  { href: "https://github.com/Galo8to9/Lunr", label: "Docs", icon: LifeBuoy, footer: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, footer: true },
];

export default function DashboardSidebar({
  open,
  onOpenChange,
  user,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  footerContent,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  
  // Use controlled collapsed state if provided, otherwise use internal state
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  

  const initials = React.useMemo(() => {
    const n = user?.name?.trim() || user?.email || "U";
    return n
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name, user?.email]);

  const brand = (
    <Link href="/" className="inline-flex items-center gap-2">
      <Moon className="h-7 w-7 text-foreground/90" aria-hidden="true" />
      {!collapsed && (
        <span className="text-foreground text-3xl tracking-tight whitespace-nowrap">
          Lunr
        </span>
      )}
    </Link>
  );

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    const active = pathname === href || pathname?.startsWith(href + "/");

    const item = (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group mb-1 flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
          active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center"
        )}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate whitespace-nowrap">{label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return item;
  }

  const rail = (
    <aside
      className={cn(
        "hidden md:flex fixed top-0 left-0 h-screen z-50 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-3 min-h-[60px]">
          <div className={cn("overflow-hidden", collapsed ? "w-6" : "w-auto")}>
            {brand}
          </div>
        </div>
        
        <Separator />
        
        <ScrollArea className="flex-1">
          <nav className="px-2 py-3">
            {navItems
              .filter((i) => !i.footer)
              .map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
          </nav>
        </ScrollArea>
        
        <Separator />
        
        <div className="p-3">
          <div className={cn("flex items-center gap-3 rounded-md px-2 py-2", collapsed && "justify-center")}>
            <Avatar className="h-8 w-8 shrink-0">
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={user?.name || "User"} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="truncate text-sm font-medium">{user?.name || "Your Name"}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email || "you@example.com"}</div>
              </div>
            )}
          </div>

          <div className="mt-2">
            {navItems
              .filter((i) => i.footer)
              .map((item) => (
                <NavLink key={item.href} {...item} />
              ))}

            
          </div>

          {footerContent && !collapsed && <div className="mt-3">{footerContent}</div>}
        </div>
      </div>
    </aside>
  );

  const drawer = (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-64">
        <SheetHeader className="px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <Moon className="h-6 w-6 text-foreground/90" aria-hidden="true" />
              <span className="text-foreground text-lg font-semibold tracking-tight">Lunr</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        
        <Separator />
        
        <div className="px-3 pb-3 pt-2">
          <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar className="h-8 w-8">
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={user?.name || "User"} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.name || "Your Name"}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email || "you@example.com"}</div>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          <nav className="px-2 pb-4">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => onOpenChange?.(false)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        
        <Separator />
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {rail}
      <div className="md:hidden">{drawer}</div>
    </>
  );
}