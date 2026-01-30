"use client";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { getShops } from "@/lib/api/shops";
import { formatDate } from "@/lib/utils";
import { ShopDto } from "@/types/shop";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Star, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getShops({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (response && response.data) {
        setShops(response.data.shops);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page]); // Depend on page change if I had pagination controls, currently DataTable handles it? Or simple fetch on mount.
  // Note: Standard DataTable in this project might assume full client side or specific logic.
  // For now, I fetch once. If I want server side pagination, I need to pass props to DataTable.
  // Assuming basic client side table for the list for now or just fetch page 1.
  // I will just fetch on mount.

  const columns: ColumnDef<ShopDto>[] = [
    { accessorKey: "id", header: "Mã Shop" },
    { accessorKey: "name", header: "Tên shop" },
    { accessorKey: "ownerId", header: "Chủ shop (ID)" },
    {
      accessorKey: "isOpen",
      header: "Tình trạng",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.isOpen ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400" />
          )}
          <span>{row.original.isOpen ? "Mở cửa" : "Đóng cửa"}</span>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Đánh giá",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{row.original.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
    },
    {
      accessorKey: "phone",
      header: "SĐT",
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Cửa hàng" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Cửa hàng</h1>
          <p className="text-muted-foreground">
            Quản lý cửa hàng trên nền tảng
          </p>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={shops}
        searchKey="name"
        searchPlaceholder="Tìm cửa hàng..."
      />
    </div>
  );
}
