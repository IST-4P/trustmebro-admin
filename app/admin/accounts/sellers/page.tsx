"use client";

import { useState } from "react";
import { ColumnDef } from "@tantml:stack-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { mockSellers } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function SellerAccountsPage() {
  const [sellers] = useState<User[]>(mockSellers);

  const columns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Họ tên" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "SĐT" },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "success" : row.original.status === "pending" ? "warning" : "destructive"}>
          {row.original.status === "active" ? "Hoạt động" : row.original.status === "pending" ? "Chờ duyệt" : "Bị khóa"}
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
      <Breadcrumb items={[{ label: "Tài khoản" }, { label: "Người bán" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tài khoản Người bán</h1>
          <p className="text-muted-foreground">Quản lý tài khoản người bán hàng</p>
        </div>
      </div>
      <DataTable columns={columns} data={sellers} searchKey="name" searchPlaceholder="Tìm người bán..." />
    </div>
  );
}
