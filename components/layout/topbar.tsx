"use client";

import { Button } from "@/components/ui/button";
import { logout, stopAutoRefreshToken } from "@/lib/api/auth";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export function Topbar({ sidebarCollapsed }: TopbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Dừng auto refresh token
      stopAutoRefreshToken();
      // Gọi API logout
      await logout();
      toast.success("Đã đăng xuất thành công");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn redirect về login dù có lỗi
      toast.error("Có lỗi xảy ra khi đăng xuất");
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header
      className="fixed top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-background px-4 transition-all duration-300"
      style={{
        left: sidebarCollapsed ? "4rem" : "16rem",
        right: 0,
      }}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          variant="outline"
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </Button>
      </div>
    </header>
  );
}
