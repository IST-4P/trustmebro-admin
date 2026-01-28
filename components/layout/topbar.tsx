"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LogOut, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { logout, stopAutoRefreshToken } from "@/lib/api/auth";

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export function Topbar({ sidebarCollapsed }: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Tìm kiếm: ${searchQuery}`);
    }
  };

  return (
    <header
      className="fixed top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 transition-all duration-300"
      style={{
        left: sidebarCollapsed ? "4rem" : "16rem",
        right: 0,
      }}
    >
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="flex-col items-start gap-1 py-3">
                <div className="font-medium">Shop mới chờ duyệt</div>
                <div className="text-sm text-muted-foreground">
                  Mỹ Phẩm Korea đang chờ xét duyệt
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-1 py-3">
                <div className="font-medium">Review bị báo cáo</div>
                <div className="text-sm text-muted-foreground">
                  1 đánh giá mới bị báo cáo spam
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-1 py-3">
                <div className="font-medium">Thanh toán thất bại</div>
                <div className="text-sm text-muted-foreground">
                  Đơn hàng #ORD004 thanh toán thất bại
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/admin.jpg" />
                <AvatarFallback>NV</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">Nguyễn Văn Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
