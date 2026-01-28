"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Media } from "@/types";
import { mockMedia } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function MediaPage() {
  const [media] = useState<Media[]>(mockMedia);

  const columns: ColumnDef<Media>[] = [
    {
      accessorKey: "url",
      header: "Preview",
      cell: ({ row }) => (
        <div className="h-12 w-12 relative rounded overflow-hidden">
          <img src={row.original.url} alt={row.original.fileName} className="object-cover" />
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "image" ? "default" : "secondary"}>
          {row.original.type === "image" ? "Ảnh" : "Video"}
        </Badge>
      ),
    },
    { accessorKey: "fileName", header: "Tên file" },
    {
      accessorKey: "fileSize",
      header: "Dung lượng",
      cell: ({ row }) => `${(row.original.fileSize / 1024).toFixed(2)} KB`,
    },
    { accessorKey: "uploaderName", header: "Người upload" },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Media" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Media</h1>
          <p className="text-muted-foreground">Quản lý ảnh và video trên hệ thống</p>
        </div>
      </div>
      <DataTable columns={columns} data={media} searchKey="fileName" searchPlaceholder="Tìm file..." />
    </div>
  );
}
