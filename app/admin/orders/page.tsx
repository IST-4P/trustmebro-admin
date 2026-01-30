"use client";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  getOrderById,
  getOrders,
  GetOrdersParams,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  updateOrderStatus,
} from "@/lib/api/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Loader2,
  MapPin,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  Save,
  Store,
  Truck,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Fallback image component
function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-xs text-muted-foreground ${className}`}
      >
        <Package className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // Order detail dialog
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<OrderDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Update status
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetOrdersParams = {
        page,
        limit,
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const response = await getOrders(params);
      setOrders(response.data.orders || []);
      setTotalItems(response.data.totalItems);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Không thể tải danh sách đơn hàng");
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  const fetchOrderDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      const response = await getOrderById(orderId);
      setSelectedOrderDetail(response.data);
      setNewStatus(response.data.status);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch order detail:", err);
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrderDetail || !newStatus) return;

    try {
      setUpdatingStatus(true);
      await updateOrderStatus({
        id: selectedOrderDetail.id,
        status: newStatus,
        shopId: selectedOrderDetail.shopId,
      });
      toast.success("Cập nhật trạng thái thành công");

      // Refresh order detail and list
      const response = await getOrderById(selectedOrderDetail.id);
      setSelectedOrderDetail(response.data);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as OrderStatus | "ALL");
    setPage(1);
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "CANCELLED":
      case "REFUNDED":
        return "destructive";
      case "PENDING":
      case "CREATING":
        return "warning";
      case "CONFIRMED":
      case "SHIPPING":
        return "default";
      default:
        return "secondary";
    }
  };

  const columns: ColumnDef<OrderListItem>[] = [
    {
      accessorKey: "code",
      header: "Mã đơn",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "firstProductImage",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-md border text-muted-foreground flex items-center justify-center bg-muted">
            <ProductImage
              src={row.original.firstProductImage}
              alt={row.original.firstProductName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="max-w-[200px]">
            <p className="truncate font-medium text-sm text-foreground">
              {row.original.firstProductName}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "shopName",
      header: "Shop",
    },
    {
      accessorKey: "itemTotal",
      header: "Tiền hàng",
      cell: ({ row }) => formatCurrency(row.original.itemTotal),
    },
    {
      accessorKey: "grandTotal",
      header: "Tổng tiền",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatCurrency(row.original.grandTotal)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {getOrderStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchOrderDetail(row.original.id)}
          disabled={loadingDetail}
        >
          {loadingDetail ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Đơn hàng" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Đơn hàng</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý đơn hàng ({totalItems} đơn)
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="space-y-1">
          <Label>Trạng thái</Label>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="CREATING">Đang tạo</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="SHIPPING">Đang giao</SelectItem>
              <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Đang tải đơn hàng...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchOrders}>Thử lại</Button>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && (
        <>
          <DataTable
            columns={columns}
            data={orders}
            searchKey="shopName"
            searchPlaceholder="Tìm theo tên shop..."
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Trang {page} / {totalPages} (Tổng: {totalItems} đơn hàng)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Chi tiết đơn hàng
            </DialogTitle>
          </DialogHeader>

          {selectedOrderDetail && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-mono font-semibold text-lg">
                    {selectedOrderDetail.code}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getStatusBadgeVariant(selectedOrderDetail.status)}
                    className="text-sm px-3 py-1"
                  >
                    {getOrderStatusLabel(selectedOrderDetail.status)}
                  </Badge>
                </div>
              </div>

              {/* Update Status Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    Cập nhật trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs text-muted-foreground mb-1">
                        Chọn trạng thái mới
                      </Label>
                      <Select
                        value={newStatus}
                        onValueChange={(value) =>
                          setNewStatus(value as OrderStatus)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CREATING">Đang tạo</SelectItem>
                          <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                          <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                          <SelectItem value="SHIPPING">Đang giao</SelectItem>
                          <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
                          <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                          <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={
                        updatingStatus ||
                        newStatus === selectedOrderDetail.status
                      }
                    >
                      {updatingStatus ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Cập nhật
                    </Button>
                  </div>
                  {newStatus !== selectedOrderDetail.status && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Thay đổi:{" "}
                      {getOrderStatusLabel(selectedOrderDetail.status)} →{" "}
                      {getOrderStatusLabel(newStatus as OrderStatus)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Shop & Date Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      Thông tin Shop
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">
                      {selectedOrderDetail.shopName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      ID: {selectedOrderDetail.shopId.slice(0, 8)}...
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Thời gian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Tạo: </span>
                      {formatDate(selectedOrderDetail.createdAt)}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Cập nhật: </span>
                      {formatDate(selectedOrderDetail.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Receiver Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Thông tin người nhận
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {selectedOrderDetail.receiverName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrderDetail.receiverPhone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">
                      {selectedOrderDetail.receiverAddress}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Phương thức
                      </p>
                      <p className="font-medium">
                        {getPaymentMethodLabel(
                          selectedOrderDetail.paymentMethod,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Trạng thái
                      </p>
                      <Badge
                        variant={
                          selectedOrderDetail.paymentStatus === "SUCCESS"
                            ? "success"
                            : selectedOrderDetail.paymentStatus === "FAILED"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {getPaymentStatusLabel(
                          selectedOrderDetail.paymentStatus,
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Sản phẩm ({selectedOrderDetail.itemsSnapshot?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrderDetail.itemsSnapshot?.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center gap-4 p-3 border rounded-lg"
                      >
                        <div className="h-16 w-16 rounded-md overflow-hidden border shrink-0">
                          <ProductImage
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.productName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phân loại: {item.skuValue}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm">
                              {formatCurrency(item.price)} x {item.quantity}
                            </span>
                            <span className="font-semibold text-primary">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Tổng kết đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiền hàng</span>
                      <span>
                        {formatCurrency(selectedOrderDetail.itemTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Phí vận chuyển
                      </span>
                      <span>
                        {formatCurrency(selectedOrderDetail.shippingFee || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span
                        className={
                          selectedOrderDetail.discount > 0
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {selectedOrderDetail.discount > 0 ? "-" : ""}
                        {formatCurrency(selectedOrderDetail.discount || 0)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Tổng cộng</span>
                      <span className="text-primary">
                        {formatCurrency(selectedOrderDetail.grandTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
