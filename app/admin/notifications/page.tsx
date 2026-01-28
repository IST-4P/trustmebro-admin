"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Plus, Send, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  getNotifications,
  createNotification,
  getNotificationTypeLabel,
  NotificationListItem,
  NotificationType,
  CreateNotificationData,
} from "@/lib/api/notifications";

export default function NotificationsPage() {
  // State
  const [notifications, setNotifications] = useState<NotificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userIdFilter, setUserIdFilter] = useState<string>("");

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState<CreateNotificationData>({
    title: "",
    description: "",
    userId: "",
    type: "ORDER_UPDATE",
    link: "",
    image: "",
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userIdFilter) {
      setNotifications([]);
      setTotalItems(0);
      setTotalPages(1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit, userId: userIdFilter };
      if (typeFilter !== "all") params.type = typeFilter;

      const response = await getNotifications(params as { page?: number; limit?: number; type?: NotificationType; userId: string });
      setNotifications(response.data.notifications || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải danh sách thông báo");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, typeFilter, userIdFilter]);

  useEffect(() => {
    if (userIdFilter) {
      fetchNotifications();
    }
  }, [fetchNotifications, userIdFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, userIdFilter]);

  // Handle create notification
  const handleCreate = async () => {
    if (!formData.title || !formData.description || !formData.userId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSending(true);
    try {
      await createNotification(formData);
      toast.success("Gửi thông báo thành công");
      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        userId: "",
        type: "ORDER_UPDATE",
        link: "",
        image: "",
      });
      if (userIdFilter === formData.userId) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Không thể gửi thông báo");
    } finally {
      setIsSending(false);
    }
  };

  // Get type badge variant
  const getTypeVariant = (type: NotificationType) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "default";
      case "PROMOTION":
        return "success";
      case "WALLET_UPDATE":
        return "warning";
      case "TRUST_ME_BRO_UPDATE":
        return "secondary";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<NotificationListItem>[] = [
    {
      accessorKey: "title",
      header: "Tiêu đề",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <p className="font-medium truncate">{row.original.title}</p>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Nội dung",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="text-sm text-muted-foreground truncate">
            {row.original.description}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) => (
        <Badge variant={getTypeVariant(row.original.type)}>
          {getNotificationTypeLabel(row.original.type)}
        </Badge>
      ),
    },
    {
      accessorKey: "userId",
      header: "User ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.userId.slice(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Thông báo" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thông báo</h1>
          <p className="text-muted-foreground">
            Xem và gửi thông báo đến người dùng ({totalItems} thông báo)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchNotifications}
            disabled={isLoading || !userIdFilter}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Gửi thông báo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="space-y-2">
          <Label>User ID (bắt buộc)</Label>
          <Input
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Nhập User ID..."
            className="w-[300px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Loại thông báo</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="ORDER_UPDATE">Cập nhật đơn hàng</SelectItem>
              <SelectItem value="PROMOTION">Khuyến mãi</SelectItem>
              <SelectItem value="WALLET_UPDATE">Cập nhật ví</SelectItem>
              <SelectItem value="TRUST_ME_BRO_UPDATE">TrustMeBro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={fetchNotifications}
          disabled={!userIdFilter || isLoading}
        >
          Tìm kiếm
        </Button>
      </div>

      {!userIdFilter ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nhập User ID để xem thông báo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            API yêu cầu User ID để lấy danh sách thông báo
          </p>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <DataTable
            columns={columns}
            data={notifications}
            searchKey="title"
            searchPlaceholder="Tìm tiêu đề..."
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Trang trước
              </Button>
              <span className="text-sm">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Notification Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gửi thông báo mới</DialogTitle>
            <DialogDescription>
              Gửi thông báo đến người dùng cụ thể
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="UUID của người dùng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Tiêu đề thông báo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Nội dung *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nội dung chi tiết"
              />
            </div>

            <div className="space-y-2">
              <Label>Loại thông báo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as NotificationType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER_UPDATE">Cập nhật đơn hàng</SelectItem>
                  <SelectItem value="PROMOTION">Khuyến mãi</SelectItem>
                  <SelectItem value="WALLET_UPDATE">Cập nhật ví</SelectItem>
                  <SelectItem value="TRUST_ME_BRO_UPDATE">TrustMeBro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (tùy chọn)</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Hình ảnh URL (tùy chọn)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSending}
            >
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={isSending}>
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Đang gửi..." : "Gửi thông báo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
