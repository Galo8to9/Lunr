// app/(dashboard)/layout.tsx
"use client";
import * as React from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { cookies } from "next/headers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    
    <div className="min-h-dvh">
      {/* Fixed sidebar (desktop) + mobile drawer control */}
      <DashboardSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        user={{ name: "Rafael", email: "rafael@junitec.pt" }}
        defaultCollapsed={false}
      />

      {/* Fixed navbar that starts after the rail on md+ */}
      <DashboardNavbar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        user={{ name: "Rafael", email: "rafael@junitec.pt" }}
      />

      {/* Page content: push below navbar (h-14) and right of rail (w-64) on md+ */}
      <div className="pt-14 md:pl-64">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
