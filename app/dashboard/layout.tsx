"use client";
import * as React from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-dvh">
      <DashboardSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        user={{ name: "Regulator", email: "Demo Tester" }}
        collapsed={sidebarCollapsed}
      />

      <DashboardNavbar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        user={{ name: "Rafael", email: "rafael@junitec.pt" }}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div 
        className={`pt-14 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:pl-[72px]" : "md:pl-64"
        }`}
      >
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}