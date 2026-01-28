"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shop } from "@/types";
import { mockShops } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Star, CheckCircle, XCircle } from "lucide-react";

export default function ShopsPage() {
  const [shops] = useState<Shop[]>(mockShops);

  const columns: ColumnDef<Shop>[] = [
    { accessorKey: "id", header: "Mã Shop" },
    { accessorKey: "name", header: "Tên shop" },
    { accessorKey: "ownerName", header: "Chủ shop" },
    {
      accessorKey: "verification",
      header: "Xác minh",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.verification === "verified" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400" />
          )}
          <span>{row.original.verification === "verified" ? "Đã xác minh" : "Chưa xác minh"}</span>
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
    { accessorKey: "totalProducts", header: "Sản phẩm" },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "active"
              ? "success"
              : row.original.status === "pending"
              ? "warning"
              : "destructive"
          }
        >
          {row.original.status === "active" ? "Hoạt động" : row.original.status === "pending" ? "Chờ duyệt" : "Tạm khóa"}
        </Badge>
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
      <Breadcrumb items={[{ label: "Cửa hàng" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Cửa hàng</h1>
          <p className="text-muted-foreground">Quản lý cửa hàng trên nền tảng</p>
        </div>
      </div>
      <DataTable columns={columns} data={shops} searchKey="name" searchPlaceholder="Tìm cửa hàng..." />
    </div>
  );
}
