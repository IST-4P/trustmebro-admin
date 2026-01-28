"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { RefreshCw, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getReportStatusLabel,
  getReportCategoryLabel,
  getReportTargetTypeLabel,
  ReportListItem,
  ReportStatus,
  ReportCategory,
  ReportTargetType,
} from "@/lib/api/reports";

export default function ReportsPage() {
  // State
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");

  // Detail dialog
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Update status dialog
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [reportToUpdate, setReportToUpdate] = useState<ReportListItem | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>("PENDING");
  const [updateNote, setUpdateNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (targetTypeFilter !== "all") params.targetType = targetTypeFilter;

      const response = await getReports(params);
      setReports(response.data.reports || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Không thể tải danh sách báo cáo");
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, categoryFilter, targetTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, categoryFilter, targetTypeFilter]);

  // View detail
  const handleViewDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    try {
      const response = await getReportById(id);
      setSelectedReport(response.data);
    } catch (error) {
      console.error("Error fetching report detail:", error);
      toast.error("Không thể tải chi tiết báo cáo");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Open update status dialog
  const openUpdateDialog = (report: ReportListItem, status?: ReportStatus) => {
    setReportToUpdate(report);
    setNewStatus(status || report.status);
    setUpdateNote("");
    setIsUpdateOpen(true);
  };

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!reportToUpdate || !updateNote.trim()) {
      toast.error("Vui lòng nhập ghi chú");
      return;
    }

    setIsUpdating(true);
    try {
      await updateReportStatus({
        id: reportToUpdate.id,
        newStatus,
        note: updateNote,
      });
      toast.success("Cập nhật trạng thái thành công");
      setIsUpdateOpen(false);
      setReportToUpdate(null);
      fetchReports();
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteReport(deleteId);
      toast.success("Xóa báo cáo thành công");
      setDeleteId(null);
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Không thể xóa báo cáo");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: ReportStatus) => {
    switch (status) {
      case "RESOLVED":
        return "success";
      case "REJECTED":
        return "destructive";
      case "REVIEWING":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Get category badge variant
  const getCategoryVariant = (category: ReportCategory) => {
    switch (category) {
      case "SCAM":
      case "FRAUD":
        return "destructive";
      case "HARASSMENT":
        return "warning";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<ReportListItem>[] = [
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
      accessorKey: "targetType",
      header: "Đối tượng",
      cell: ({ row }) => (
        <Badge variant="outline">
          {getReportTargetTypeLabel(row.original.targetType)}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "Phân loại",
      cell: ({ row }) => (
        <Badge variant={getCategoryVariant(row.original.category)}>
          {getReportCategoryLabel(row.original.category)}
        </Badge>
      ),
    },
    {
      accessorKey: "reporterId",
      header: "Người báo cáo",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.reporterId.slice(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {getReportStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewDetail(report.id)}
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {report.status === "PENDING" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openUpdateDialog(report, "RESOLVED")}
                  title="Giải quyết"
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openUpdateDialog(report, "REJECTED")}
                  title="Từ chối"
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(report.id)}
              title="Xóa"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Báo cáo vi phạm" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Báo cáo vi phạm</h1>
          <p className="text-muted-foreground">
            Xử lý các báo cáo từ người dùng ({totalItems} báo cáo)
          </p>
        </div>
        <Button variant="outline" onClick={fetchReports} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Trạng thái:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
              <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
              <SelectItem value="REJECTED">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Phân loại:</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="SCAM">Lừa đảo</SelectItem>
              <SelectItem value="FRAUD">Gian lận</SelectItem>
              <SelectItem value="FAKE">Giả mạo</SelectItem>
              <SelectItem value="HARASSMENT">Quấy rối</SelectItem>
              <SelectItem value="SPAM">Spam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Đối tượng:</span>
          <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="USER">Người dùng</SelectItem>
              <SelectItem value="SELLER">Người bán</SelectItem>
              <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
              <SelectItem value="ORDER">Đơn hàng</SelectItem>
              <SelectItem value="MESSAGE">Tin nhắn</SelectItem>
              <SelectItem value="REVIEW">Đánh giá</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={reports}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
            <DialogDescription>Thông tin chi tiết về báo cáo vi phạm</DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : selectedReport ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Tiêu đề</p>
                <p className="font-medium">{selectedReport.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Đối tượng bị báo cáo</p>
                  <Badge variant="outline">
                    {getReportTargetTypeLabel(selectedReport.targetType)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phân loại</p>
                  <Badge variant={getCategoryVariant(selectedReport.category)}>
                    {getReportCategoryLabel(selectedReport.category)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={getStatusVariant(selectedReport.status)}>
                    {getReportStatusLabel(selectedReport.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Người báo cáo</p>
                  <p className="font-mono text-sm">{selectedReport.reporterId}</p>
                </div>
              </div>

              {selectedReport.targetId && (
                <div>
                  <p className="text-sm text-muted-foreground">ID đối tượng</p>
                  <p className="font-mono text-sm">{selectedReport.targetId}</p>
                </div>
              )}

              {selectedReport.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Mô tả</p>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.status === "PENDING" && (
                <div className="pt-4 border-t flex gap-2">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      setIsDetailOpen(false);
                      openUpdateDialog(selectedReport, "RESOLVED");
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Giải quyết
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      setIsDetailOpen(false);
                      openUpdateDialog(selectedReport, "REJECTED");
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái báo cáo</DialogTitle>
            <DialogDescription>
              {reportToUpdate?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Trạng thái mới</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as ReportStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
                  <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                  <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú *</Label>
              <Input
                id="note"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="Lý do cập nhật trạng thái..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateOpen(false)}
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

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Xóa báo cáo"
        description="Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
