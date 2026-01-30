"use client";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  createProduct,
  CreateProductData,
  deleteProduct,
  getProducts,
  ProductApiResponse,
  updateProduct,
  UpdateProductData,
} from "@/lib/api/products";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Product } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, pagination.limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProducts({
        page: pagination.page,
        limit: pagination.limit,
        orderBy: "desc",
        sortBy: "createdAt",
      });

      // Map API response to Product type
      const productsData: Product[] = response.data.products.map(
        (p: ProductApiResponse) => ({
          ...p,
          brandName: p.brand?.name,
          shopName: p.shop?.name,
        }),
      );

      setProducts(productsData);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách sản phẩm";
      setError(errorMessage);
      toast.error(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (data: CreateProductData) => {
    try {
      await createProduct(data);
      toast.success("Tạo sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      console.error("Failed to create product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể tạo sản phẩm";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateProduct = async (data: UpdateProductData) => {
    try {
      await updateProduct(data);
      toast.success("Cập nhật sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể cập nhật sản phẩm";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      // TODO: Replace with actual user ID from auth context
      await deleteProduct(
        productToDelete.id,
        "admin-user-id",
        productToDelete.shopId,
      );
      toast.success("Xóa sản phẩm thành công");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể xóa sản phẩm";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (
    data: CreateProductData | UpdateProductData,
  ) => {
    if ("id" in data) {
      await handleUpdateProduct(data);
    } else {
      await handleCreateProduct(data);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Hoạt động</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case "DRAFT":
        return <Badge variant="warning">Nháp</Badge>;
      case "BANNED":
        return <Badge variant="destructive">Bị cấm</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns: ColumnDef<Product>[] = [
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
      accessorKey: "images",
      header: "Ảnh",
      cell: ({ row }) => (
        <div className="h-12 w-12 relative rounded overflow-hidden bg-muted">
          {row.original.images && row.original.images.length > 0 ? (
            <img
              src={row.original.images[0]}
              alt={row.original.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = "";
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No img</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Tên sản phẩm",
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <p className="font-medium truncate">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground truncate">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "brand.name",
      header: "Thương hiệu",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.brand?.name || "-"}</span>
      ),
    },
    {
      accessorKey: "shop.name",
      header: "Shop",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.shop?.name || "-"}</span>
      ),
    },
    {
      accessorKey: "basePrice",
      header: "Giá",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {formatCurrency(row.original.basePrice)}
          </p>
          {row.original.virtualPrice &&
            row.original.virtualPrice !== row.original.basePrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatCurrency(row.original.virtualPrice)}
              </p>
            )}
        </div>
      ),
    },
    {
      accessorKey: "skus",
      header: "SKUs",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.skus?.length || 0} SKU
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProduct(row.original);
              setDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  // Loading State
  if (loading && products.length === 0) {
    return (
      <div>
        <Breadcrumb items={[{ label: "Sản phẩm" }]} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
            <p className="text-muted-foreground">
              Quản lý sản phẩm trên nền tảng
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && products.length === 0) {
    return (
      <div>
        <Breadcrumb items={[{ label: "Sản phẩm" }]} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
            <p className="text-muted-foreground">
              Quản lý sản phẩm trên nền tảng
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Không thể tải dữ liệu
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>
            <Button onClick={fetchProducts} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Sản phẩm" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý sản phẩm trên nền tảng ({pagination.totalItems} sản phẩm)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProducts} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && !error ? (
        <div className="flex items-center justify-center py-12 border rounded-lg bg-muted/50">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Chưa có sản phẩm</h3>
            <p className="text-muted-foreground mb-4">
              Bắt đầu bằng cách tạo sản phẩm đầu tiên
            </p>
            <Button
              onClick={() => {
                setSelectedProduct(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo sản phẩm đầu tiên
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Tìm sản phẩm..."
          pagination={{
            pageIndex: pagination.page - 1,
            pageSize: pagination.limit,
            pageCount: pagination.totalPages,
            total: pagination.totalItems,
            onPageChange: (newPageIndex) => {
              setPagination((prev) => ({ ...prev, page: newPageIndex + 1 }));
            },
            onPageSizeChange: (newPageSize) => {
              setPagination((prev) => ({
                ...prev,
                limit: newPageSize,
                page: 1,
              }));
            },
          }}
        />
      )}

      {/* Pagination Info */}
      {products.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Trang {pagination.page} / {pagination.totalPages} • Tổng{" "}
          {pagination.totalItems} sản phẩm
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"? Hành động này không thể hoàn tác.`}
        loading={deleteLoading}
      />
    </div>
  );
}
