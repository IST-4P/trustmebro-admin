"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { startAutoRefreshToken, stopAutoRefreshToken } from "@/lib/api/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Bắt đầu auto refresh token khi vào trang admin
  useEffect(() => {
    startAutoRefreshToken();

    // Cleanup khi unmount
    return () => {
      stopAutoRefreshToken();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Topbar sidebarCollapsed={sidebarCollapsed} />
      <main
        className="pt-16 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? "4rem" : "16rem",
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
