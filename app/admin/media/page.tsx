"use client";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, getVideos } from "@/lib/api/videos";
import { formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Video as VideoIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function MediaPage() {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  // Debounce search to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVideos({
        page,
        limit: pageSize,
        title: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : (status as any),
      });
      setData(response.data.videos);
      setTotalItems(response.data.totalItems);
      setPageCount(response.data.totalPages);
    } catch (error) {
      toast("Không thể tải danh sách video");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnDef<Video>[] = [
    {
      accessorKey: "preview",
      header: "Preview",
      cell: () => (
        <div className="h-12 w-12 relative rounded overflow-hidden bg-muted flex items-center justify-center">
          <VideoIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === "READY" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    { accessorKey: "title", header: "Tên file" },
    {
      accessorKey: "size",
      header: "Dung lượng",
      cell: ({ row }) => `${(row.original.size / (1024 * 1024)).toFixed(2)} MB`,
    },
    {
      accessorKey: "authorUsername",
      header: "Người upload",
      cell: ({ row }) => row.original.authorUsername || "N/A",
    },
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
          <p className="text-muted-foreground">Quản lý video trên hệ thống</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm video..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="UPLOADING">Uploading</SelectItem>
            <SelectItem value="UPLOADED">Uploaded</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={{
          pageIndex: page - 1, // DataTable expects 0-indexed
          pageSize,
          pageCount, // DataTable might use this for "canNextPage" logic? No, definitions say pageCount is total pages.
          total: totalItems,
          onPageChange: (newPage) => setPage(newPage + 1), // DataTable passes new 0-indexed page
          onPageSizeChange: setPageSize,
        }}
        // Remove client-side search props
        // searchKey="title"
        // searchPlaceholder="Tìm video..."
      />
    </div>
  );
}
