"use client";

import { Breadcrumb } from "@/components/layout/breadcrumb";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BrandListItem,
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  GetBrandsParams,
  updateBrand,
} from "@/lib/api/brands";
import { formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandListItem | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Search
  const [searchName, setSearchName] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
  });

  useEffect(() => {
    fetchBrands();
  }, [pagination.page, pagination.limit]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetBrandsParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchName) {
        params.name = searchName;
      }

      const response = await getBrands(params);
      const brandsData = Array.isArray(response.data?.brands)
        ? response.data.brands
        : [];
      setBrands(brandsData);

      if (response.data) {
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.totalItems || 0,
          totalPages: response.data.totalPages || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách thương hiệu";
      setError(errorMessage);
      toast.error(errorMessage);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchBrands();
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }
    if (!formData.logo.trim()) {
      toast.error("Vui lòng nhập URL logo");
      return;
    }

    try {
      setSaving(true);
      await createBrand({
        name: formData.name,
        logo: formData.logo,
        createdById: "",
      });

      toast.success("Đã tạo thương hiệu thành công");
      setIsCreateOpen(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error("Failed to create brand:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể tạo thương hiệu";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedBrand) return;
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    try {
      setSaving(true);
      await updateBrand({
        id: selectedBrand.id,
        name: formData.name,
        logo: formData.logo || undefined,
      });

      toast.success("Đã cập nhật thương hiệu");
      setIsEditOpen(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error("Failed to update brand:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thương hiệu";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;

    try {
      setSaving(true);
      await deleteBrand({
        id: selectedBrand.id,
      });

      toast.success("Đã xóa thương hiệu");
      setIsDeleteOpen(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể xóa thương hiệu";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = async (brand: BrandListItem) => {
    try {
      const response = await getBrandById(brand.id);
      setSelectedBrand(response.data);
      setFormData({
        name: response.data.name,
        logo: response.data.logo || "",
      });
      setIsEditOpen(true);
    } catch (error) {
      console.error("Failed to fetch brand detail:", error);
      toast.error("Không thể tải thông tin thương hiệu");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
    });
    setSelectedBrand(null);
  };

  const columns: ColumnDef<BrandListItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "logo",
      header: "Logo",
      cell: ({ row }) =>
        row.original.logo ? (
          <img
            src={row.original.logo}
            alt={row.original.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
        ),
    },
    {
      accessorKey: "name",
      header: "Tên thương hiệu",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const brand = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(brand)}>
                <Pencil className="mr-2 h-4 w-4" />
                Sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBrand(brand);
                  setIsDeleteOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/admin/dashboard" },
          { label: "Thương hiệu" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thương hiệu</h1>
          <p className="text-muted-foreground">Quản lý thương hiệu sản phẩm</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchBrands} variant="outline" disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm thương hiệu
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-end">
        <div className="w-[300px]">
          <Label>Tìm kiếm</Label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Tìm theo tên thương hiệu..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={brands}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Tìm thương hiệu..."
        pagination={{
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit,
          pageCount: pagination.totalPages,
          total: pagination.totalItems,
          onPageChange: (page: any) =>
            setPagination((prev) => ({ ...prev, page: page + 1 })),
          onPageSizeChange: (size: any) =>
            setPagination((prev) => ({ ...prev, limit: size, page: 1 })),
        }}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thương hiệu mới</DialogTitle>
            <DialogDescription>
              Tạo thương hiệu sản phẩm mới cho hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên thương hiệu *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nhập tên thương hiệu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">URL Logo *</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo thương hiệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa thương hiệu</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin thương hiệu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên thương hiệu *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-logo">URL Logo</Label>
              <Input
                id="edit-logo"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                resetForm();
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa thương hiệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thương hiệu "{selectedBrand?.name}"?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedBrand(null);
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
