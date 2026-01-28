"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { mockAdmins } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function AdminAccountsPage() {
  const [admins] = useState<User[]>(mockAdmins);

  const columns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Họ tên" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "SĐT" },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "success" : "destructive"}>
          {row.original.status === "active" ? "Hoạt động" : "Bị khóa"}
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
      <Breadcrumb items={[{ label: "Tài khoản" }, { label: "Admin" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tài khoản Admin</h1>
          <p className="text-muted-foreground">Quản lý tài khoản quản trị viên</p>
        </div>
      </div>
      <DataTable columns={columns} data={admins} searchKey="name" searchPlaceholder="Tìm admin..." />
    </div>
  );
}
