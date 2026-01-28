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
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Plus, RefreshCw, Pencil, Trash2, Eye } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { toast } from "sonner";
import {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionStatusLabel,
  getPromotionScopeLabel,
  getDiscountTypeLabel,
  PromotionListItem,
  PromotionDetail,
  PromotionStatus,
  PromotionScope,
  PromotionDiscountType,
  CreatePromotionData,
} from "@/lib/api/promotions";

export default function PromotionsPage() {
  // State
  const [promotions, setPromotions] = useState<PromotionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");

  // Form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreatePromotionData>({
    code: "",
    name: "",
    description: "",
    status: "DRAFT",
    startsAt: "",
    endsAt: "",
    scope: "ORDER",
    minOrderSubtotal: 0,
    discountType: "PERCENT",
    discountValue: 0,
    maxDiscount: 0,
    totalLimit: 0,
  });

  // Detail dialog
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (statusFilter !== "all") params.status = statusFilter;
      if (scopeFilter !== "all") params.scope = scopeFilter;

      const response = await getPromotions(params);
      setPromotions(response.data.promotions || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Không thể tải danh sách mã giảm giá");
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, scopeFilter]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, scopeFilter]);

  // View detail
  const handleViewDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    try {
      const response = await getPromotionById(id);
      setSelectedPromotion(response.data);
    } catch (error) {
      console.error("Error fetching promotion detail:", error);
      toast.error("Không thể tải chi tiết mã giảm giá");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Open form for create
  const openCreateForm = () => {
    setIsEditing(false);
    setEditingPromotion(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      status: "DRAFT",
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      scope: "ORDER",
      minOrderSubtotal: 0,
      discountType: "PERCENT",
      discountValue: 0,
      maxDiscount: 0,
      totalLimit: 100,
    });
    setIsFormOpen(true);
  };

  // Open form for edit
  const openEditForm = async (id: string) => {
    try {
      const response = await getPromotionById(id);
      const promotion = response.data;
      setIsEditing(true);
      setEditingPromotion(promotion);
      setFormData({
        code: promotion.code,
        name: promotion.name,
        description: promotion.description || "",
        status: promotion.status,
        startsAt: new Date(promotion.startsAt).toISOString().slice(0, 16),
        endsAt: new Date(promotion.endsAt).toISOString().slice(0, 16),
        scope: promotion.scope,
        minOrderSubtotal: promotion.minOrderSubtotal,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscount: promotion.maxDiscount || 0,
        totalLimit: promotion.totalLimit || 0,
      });
      setIsFormOpen(true);
    } catch (error) {
      console.error("Error fetching promotion:", error);
      toast.error("Không thể tải thông tin mã giảm giá");
    }
  };

  // Save promotion
  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSaving(true);
    try {
      // Convert datetime-local format to ISO-8601
      const dataToSend = {
        ...formData,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
      };

      if (isEditing && editingPromotion) {
        await updatePromotion({
          id: editingPromotion.id,
          ...dataToSend,
        });
        toast.success("Cập nhật mã giảm giá thành công");
      } else {
        await createPromotion(dataToSend);
        toast.success("Tạo mã giảm giá thành công");
      }
      setIsFormOpen(false);
      fetchPromotions();
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast.error(isEditing ? "Không thể cập nhật mã giảm giá" : "Không thể tạo mã giảm giá");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete promotion
  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deletePromotion(deleteId);
      toast.success("Xóa mã giảm giá thành công");
      setDeleteId(null);
      fetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Không thể xóa mã giảm giá");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: PromotionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PAUSED":
        return "warning";
      case "ENDED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const columns: ColumnDef<PromotionListItem>[] = [
    {
      accessorKey: "code",
      header: "Mã",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "scope",
      header: "Phạm vi",
      cell: ({ row }) => (
        <Badge variant="outline">
          {getPromotionScopeLabel(row.original.scope)}
        </Badge>
      ),
    },
    {
      accessorKey: "discountType",
      header: "Loại",
      cell: ({ row }) => getDiscountTypeLabel(row.original.discountType),
    },
    {
      accessorKey: "startsAt",
      header: "Bắt đầu",
      cell: ({ row }) => formatDateShort(row.original.startsAt),
    },
    {
      accessorKey: "endsAt",
      header: "Kết thúc",
      cell: ({ row }) => formatDateShort(row.original.endsAt),
    },
    {
      accessorKey: "totalLimit",
      header: "Giới hạn",
      cell: ({ row }) => row.original.totalLimit || "Không giới hạn",
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {getPromotionStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const promotion = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewDetail(promotion.id)}
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditForm(promotion.id)}
              title="Sửa"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(promotion.id)}
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
      <Breadcrumb items={[{ label: "Mã giảm giá" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Mã giảm giá</h1>
          <p className="text-muted-foreground">
            Quản lý chương trình khuyến mãi ({totalItems} mã)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPromotions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo mã giảm giá
          </Button>
        </div>
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
              <SelectItem value="DRAFT">Nháp</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="PAUSED">Tạm dừng</SelectItem>
              <SelectItem value="ENDED">Đã kết thúc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Phạm vi:</span>
          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="ORDER">Đơn hàng</SelectItem>
              <SelectItem value="SHIPPING">Vận chuyển</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={promotions}
        searchKey="code"
        searchPlaceholder="Tìm mã giảm giá..."
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

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Cập nhật thông tin mã giảm giá" : "Điền thông tin để tạo mã giảm giá mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: SALE50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Giảm 50% Black Friday"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về mã giảm giá"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Ngày bắt đầu *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endsAt">Ngày kết thúc *</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Trạng thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as PromotionStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                    <SelectItem value="ENDED">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phạm vi *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) => setFormData({ ...formData, scope: value as PromotionScope })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORDER">Đơn hàng</SelectItem>
                    <SelectItem value="SHIPPING">Vận chuyển</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loại giảm giá *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => setFormData({ ...formData, discountType: value as PromotionDiscountType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                    <SelectItem value="AMOUNT">Số tiền cố định</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Giá trị giảm {formData.discountType === "PERCENT" ? "(%)" : "(VND)"} *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  placeholder={formData.discountType === "PERCENT" ? "VD: 50" : "VD: 100000"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Giảm tối đa (VND)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                  placeholder="VD: 500000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderSubtotal">Đơn tối thiểu (VND) *</Label>
                <Input
                  id="minOrderSubtotal"
                  type="number"
                  value={formData.minOrderSubtotal}
                  onChange={(e) => setFormData({ ...formData, minOrderSubtotal: Number(e.target.value) })}
                  placeholder="VD: 200000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalLimit">Giới hạn sử dụng</Label>
                <Input
                  id="totalLimit"
                  type="number"
                  value={formData.totalLimit}
                  onChange={(e) => setFormData({ ...formData, totalLimit: Number(e.target.value) })}
                  placeholder="VD: 100"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết mã giảm giá</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về chương trình khuyến mãi
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : selectedPromotion ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã code</p>
                  <p className="font-mono font-bold text-lg">{selectedPromotion.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={getStatusVariant(selectedPromotion.status)}>
                    {getPromotionStatusLabel(selectedPromotion.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tên chương trình</p>
                <p className="font-medium">{selectedPromotion.name}</p>
              </div>

              {selectedPromotion.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Mô tả</p>
                  <p className="text-sm">{selectedPromotion.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phạm vi</p>
                  <Badge variant="outline">
                    {getPromotionScopeLabel(selectedPromotion.scope)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại giảm giá</p>
                  <p className="font-medium">{getDiscountTypeLabel(selectedPromotion.discountType)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Giá trị giảm</p>
                  <p className="text-lg font-bold text-primary">
                    {selectedPromotion.discountType === "PERCENT"
                      ? `${selectedPromotion.discountValue}%`
                      : formatCurrency(selectedPromotion.discountValue)}
                  </p>
                </div>
                {selectedPromotion.maxDiscount !== undefined && selectedPromotion.maxDiscount > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Giảm tối đa</p>
                    <p className="font-medium">{formatCurrency(selectedPromotion.maxDiscount)}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Đơn tối thiểu</p>
                  <p className="font-medium">{formatCurrency(selectedPromotion.minOrderSubtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đã sử dụng / Giới hạn</p>
                  <p className="font-medium">
                    {selectedPromotion.usedCount} / {selectedPromotion.totalLimit || "∞"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Bắt đầu</p>
                  <p className="text-sm">{formatDateShort(selectedPromotion.startsAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kết thúc</p>
                  <p className="text-sm">{formatDateShort(selectedPromotion.endsAt)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Xóa mã giảm giá"
        description="Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
