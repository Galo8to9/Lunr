// app/components/layout/DashboardSidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  Users,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
LayoutDashboard, ShieldCheck, Wallet, FileText, BarChart3, Telescope, LifeBuoy } from "lucide-react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

type User = { name?: string; email?: string; imageUrl?: string } | null;

type DashboardSidebarProps = {
  /** Mobile drawer open state — controlled by parent (Navbar’s onToggleSidebar) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional user (mirrors navbar) */
  user?: User;
  /** Start collapsed on desktop */
  defaultCollapsed?: boolean;
  /** Optional: extra items to append */
  footerContent?: React.ReactNode;
};

const navItems = [
  { href: "/dashboard/overview",  label: "Generate Proof",      icon: LayoutDashboard },
  { href: "/dashboard/proofs",    label: "Search Liquidity",        icon: ShieldCheck },     // generate & view solvency proofs
  { href: "/dashboard/wallets",   label: "Wallets",       icon: Wallet },          // managed addresses & chains

  // footer
  { href: "https://github.com/Galo8to9/Lunr",                label: "Docs",          icon: LifeBuoy, footer: true },
  { href: "/dashboard/settings",            label: "Settings",      icon: Settings,  footer: true },
];

// Small file icon to avoid another import; reusing lucide path
function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export default function DashboardSidebar({
  open,
  onOpenChange,
  user,
  defaultCollapsed = false,
  footerContent,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

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
 
    


      <Link href="/" className="inline-flex items-center gap-1">
                <Moon
                  className="h-8 w-8 text-foreground/90"
                  aria-hidden="true"
                />
                {!collapsed && <span className="text-foreground text-4xl">Lunr</span>}
  
              </Link>

  );

  // Desktop rail
  const rail = (
    <aside
  className="hidden md:flex fixed top-0 left-0 h-dvh w-64 z-50
             border-r border-white/10 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
>
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between px-3 py-3">
          {brand}
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-auto"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <nav className="px-2 py-3">
            {navItems
              .filter((i) => !i.footer)
              .map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group mb-1 flex items-center gap-3 rounded-md px-2 py-2 text-sm",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    ].join(" ")}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="p-3">
          {/* User block */}
          <div
            className={[
              "flex items-center gap-3 rounded-md px-2 py-2",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <Avatar className="h-8 w-8">
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={user?.name || "User"} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {user?.name || "Your Name"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {user?.email || "you@example.com"}
                </div>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="mt-2">
            {navItems
              .filter((i) => i.footer)
              .map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group mb-1 flex items-center gap-3 rounded-md px-2 py-2 text-sm",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    ].join(" ")}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}

            <Button
              variant="ghost"
              className={[
                "mt-1 w-full justify-start gap-3 text-red-600 hover:text-red-600",
                collapsed ? "px-2" : "",
              ].join(" ")}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Sair</span>}
            </Button>
          </div>

          {footerContent && !collapsed && (
            <div className="mt-3">{footerContent}</div>
          )}
        </div>
      </div>
    </aside>
  );

  // Mobile drawer via Sheet
  const drawer = (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-1">
                <Moon
                  className="h-6 w-6 text-foreground/90"
                  aria-hidden="true"
                />
                <span className="text-foreground text-9xl">Lunr</span>
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
              <div className="truncate text-sm font-medium">
                {user?.name || "Your Name"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.email || "you@example.com"}
              </div>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <nav className="px-2 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  ].join(" ")}
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
      {/* Desktop rail */}
      {rail}
      {/* Mobile drawer */}
      <div className="md:hidden">{drawer}</div>
      {/* Spacer so content doesn’t slide under the rail */}
      <div className={["hidden md:block", collapsed ? "w-[72px]" : "w-64"].join(" ")} />
    </>
  );
}
