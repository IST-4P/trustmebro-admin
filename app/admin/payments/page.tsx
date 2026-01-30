"use client";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPaymentMethodLabel,
  getPayments,
  getPaymentStatusLabel,
  PaymentListItem,
  PaymentMethod,
  PaymentStatus,
  updatePaymentStatus,
} from "@/lib/api/payments";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function PaymentsPage() {
  // State
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  // Detail dialog
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Update status dialog
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [paymentToUpdate, setPaymentToUpdate] =
    useState<PaymentListItem | null>(null);
  const [newStatus, setNewStatus] = useState<PaymentStatus>("PENDING");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (statusFilter !== "all") params.status = statusFilter;
      if (methodFilter !== "all") params.method = methodFilter;

      const response = await getPayments(params);
      setPayments(response.data.payments || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Không thể tải danh sách thanh toán");
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, methodFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, methodFilter]);

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!paymentToUpdate) return;

    setIsUpdating(true);
    try {
      await updatePaymentStatus({
        id: paymentToUpdate.id,
        status: newStatus,
      });
      toast.success("Cập nhật trạng thái thành công");
      setIsUpdateStatusOpen(false);
      setPaymentToUpdate(null);
      fetchPayments();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open update status dialog
  const openUpdateStatusDialog = (payment: PaymentListItem) => {
    setPaymentToUpdate(payment);
    setNewStatus(payment.status);
    setIsUpdateStatusOpen(true);
  };

  // Get status badge variant
  const getStatusVariant = (status: PaymentStatus) => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "FAILED":
        return "destructive";
      case "CANCELLED":
        return "secondary";
      default:
        return "warning";
    }
  };

  // Get method badge variant
  const getMethodVariant = (method: PaymentMethod) => {
    switch (method) {
      case "COD":
        return "outline";
      case "WALLET":
        return "secondary";
      case "ONLINE":
        return "default";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<PaymentListItem>[] = [
    {
      accessorKey: "code",
      header: "Mã thanh toán",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Đơn hàng",
      cell: ({ row }) => {
        const orderIds = row.original.orderId;
        // Ensure orderIds is an array
        const orderIdArray = Array.isArray(orderIds)
          ? orderIds
          : orderIds
            ? [orderIds]
            : [];
        if (orderIdArray.length === 0)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-col gap-1">
            {orderIdArray.slice(0, 2).map((id, index) => (
              <span key={index} className="font-mono text-xs">
                {typeof id === "string" ? `${id.slice(0, 8)}...` : "-"}
              </span>
            ))}
            {orderIdArray.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{orderIdArray.length - 2} đơn khác
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Số tiền",
      cell: ({ row }) => (
        <span className="font-medium text-primary">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "method",
      header: "Phương thức",
      cell: ({ row }) => (
        <Badge variant={getMethodVariant(row.original.method)}>
          {getPaymentMethodLabel(row.original.method)}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {getPaymentStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex items-center gap-2">
            {payment.status === "PENDING" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setPaymentToUpdate(payment);
                    setNewStatus("SUCCESS");
                    setIsUpdateStatusOpen(true);
                  }}
                  title="Xác nhận thành công"
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setPaymentToUpdate(payment);
                    setNewStatus("FAILED");
                    setIsUpdateStatusOpen(true);
                  }}
                  title="Đánh dấu thất bại"
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Thanh toán" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thanh toán</h1>
          <p className="text-muted-foreground">
            Theo dõi giao dịch thanh toán ({totalItems} giao dịch)
          </p>
        </div>
        <Button variant="outline" onClick={fetchPayments} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Trạng thái:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
              <SelectItem value="SUCCESS">Thành công</SelectItem>
              <SelectItem value="FAILED">Thất bại</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Phương thức:</span>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="COD">Thanh toán khi nhận hàng</SelectItem>
              <SelectItem value="WALLET">Ví điện tử</SelectItem>
              <SelectItem value="ONLINE">Thanh toán online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={payments}
        searchKey="code"
        searchPlaceholder="Tìm mã thanh toán..."
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

      {/* Payment Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết giao dịch thanh toán
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã thanh toán</p>
                  <p className="font-mono font-medium">
                    {selectedPayment.code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-mono text-xs">{selectedPayment.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Số tiền</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={getStatusVariant(selectedPayment.status)}>
                    {getPaymentStatusLabel(selectedPayment.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phương thức</p>
                <Badge variant={getMethodVariant(selectedPayment.method)}>
                  {getPaymentMethodLabel(selectedPayment.method)}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{selectedPayment.userId}</p>
              </div>

              {selectedPayment.orderId &&
                selectedPayment.orderId.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Đơn hàng liên quan ({selectedPayment.orderId.length})
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedPayment.orderId.map((id, index) => (
                        <p
                          key={index}
                          className="font-mono text-xs bg-muted p-1 rounded"
                        >
                          {id}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="text-sm">
                    {formatDate(selectedPayment.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-sm">
                    {formatDate(selectedPayment.updatedAt)}
                  </p>
                </div>
              </div>

              {selectedPayment.status === "PENDING" && (
                <div className="pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsDetailOpen(false);
                      openUpdateStatusDialog(selectedPayment);
                    }}
                  >
                    Cập nhật trạng thái
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
            <DialogDescription>
              Mã thanh toán: {paymentToUpdate?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Trạng thái mới</label>
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as PaymentStatus)}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                <SelectItem value="SUCCESS">Thành công</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateStatusOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
