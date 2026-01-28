"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderTree,
  Tag,
  Package,
  Store,
  ShoppingCart,
  CreditCard,
  Ticket,
  Star,
  Users,
  Image,
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  Bell,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Tổng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Danh mục",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Thương hiệu",
    href: "/admin/brands",
    icon: Tag,
  },
  {
    title: "Sản phẩm",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Cửa hàng",
    href: "/admin/shops",
    icon: Store,
  },
  {
    title: "Đơn hàng",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Thanh toán",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Mã giảm giá",
    href: "/admin/promotions",
    icon: Ticket,
  },
  {
    title: "Đánh giá",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Báo cáo vi phạm",
    href: "/admin/reports",
    icon: Flag,
  },
  {
    title: "Thông báo",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Tài khoản",
    href: "/admin/accounts",
    icon: Users,
  },
  {
    title: "Media",
    href: "/admin/media",
    icon: Image,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Tài khoản"]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-white">T</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">trustmebro</span>
            <span className="text-xs text-muted-foreground">admin</span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-2">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={() => toggleExpand(item.title)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {expandedItems.includes(item.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>
                {!collapsed && expandedItems.includes(item.title) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Button
                        key={child.href}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-2",
                          isActive(child.href) &&
                            "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                        asChild
                      >
                        <Link href={child.href!}>
                          <child.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{child.title}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  collapsed && "justify-center px-2",
                  isActive(item.href) &&
                    "bg-primary/10 text-primary hover:bg-primary/20"
                )}
                asChild
              >
                <Link href={item.href!}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
                </Link>
              </Button>
            )}
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed && "justify-center px-2")}
          onClick={onToggle}
        >
          <Menu className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Thu gọn</span>}
        </Button>
      </div>
    </aside>
  );
}
