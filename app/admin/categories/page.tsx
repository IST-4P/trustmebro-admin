"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryListItem,
} from "@/lib/api/categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryListItem[]>([]); // For selector
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryListItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter
  const [parentFilter, setParentFilter] = useState<string>("all");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    parentCategoryId: "",
  });

  // Fetch all categories for selector (only once on mount)
  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Fetch filtered categories for table
  useEffect(() => {
    fetchCategories();
  }, [parentFilter]);

  const fetchAllCategories = async () => {
    try {
      const response = await getCategories();
      const categoriesData = Array.isArray(response.data?.categories) ? response.data.categories : [];
      setAllCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch all categories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { parentCategoryId?: string } = {};
      if (parentFilter && parentFilter !== "all") {
        params.parentCategoryId = parentFilter;
      }

      const response = await getCategories(params);
      const categoriesData = Array.isArray(response.data?.categories) ? response.data.categories : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách danh mục";
      setError(errorMessage);
      toast.error(errorMessage);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    if (!formData.logo.trim()) {
      toast.error("Vui lòng nhập URL logo");
      return;
    }

    try {
      setSaving(true);
      await createCategory({
        name: formData.name,
        logo: formData.logo,
        createdById: "", // Backend sẽ lấy từ session
        parentCategoryId: formData.parentCategoryId || null,
      });

      toast.success("Đã tạo danh mục thành công");
      setIsCreateOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Failed to create category:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo danh mục";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setSaving(true);
      await updateCategory({
        id: selectedCategory.id,
        name: formData.name,
        logo: formData.logo || undefined,
        parentCategoryId: formData.parentCategoryId || null,
      });

      toast.success("Đã cập nhật danh mục");
      setIsEditOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Failed to update category:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật danh mục";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setSaving(true);
      await deleteCategory({
        id: selectedCategory.id,
      });

      toast.success("Đã xóa danh mục");
      setIsDeleteOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể xóa danh mục";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = async (category: CategoryListItem) => {
    try {
      const response = await getCategoryById(category.id);
      setSelectedCategory(response.data);
      setFormData({
        name: response.data.name,
        logo: response.data.logo || "",
        parentCategoryId: response.data.parentCategoryId || "",
      });
      setIsEditOpen(true);
    } catch (error) {
      console.error("Failed to fetch category detail:", error);
      toast.error("Không thể tải thông tin danh mục");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      parentCategoryId: "",
    });
    setSelectedCategory(null);
  };

  // Get root categories for parent selection (level 0)
  const rootCategories = allCategories.filter((cat) => cat.level === 0);

  const columns: ColumnDef<CategoryListItem>[] = [
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
      header: "Tên danh mục",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(category)}>
                <Pencil className="mr-2 h-4 w-4" />
                Sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCategory(category);
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
          { label: "Danh mục" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý danh mục sản phẩm trên hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCategories} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="w-[250px]">
          <Label>Lọc theo danh mục cha</Label>
          <Select
            value={parentFilter}
            onValueChange={(value) => setParentFilter(value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {rootCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        data={categories}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Tìm kiếm danh mục..."
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Tạo danh mục sản phẩm mới cho hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên danh mục"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">URL Logo *</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Danh mục cha</Label>
              <Select
                value={formData.parentCategoryId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentCategoryId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Không có (danh mục gốc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Tạo danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa danh mục</DialogTitle>
            <DialogDescription>Cập nhật thông tin danh mục</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên danh mục *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-logo">URL Logo</Label>
              <Input
                id="edit-logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Danh mục cha</Label>
              <Select
                value={formData.parentCategoryId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentCategoryId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Không có (danh mục gốc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                  {allCategories
                    .filter((cat) => cat.id !== selectedCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
            <DialogTitle>Xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{selectedCategory?.name}"?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedCategory(null);
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
