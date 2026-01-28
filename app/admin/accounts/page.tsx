"use client";

import { useState, useEffect } from "react";
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
import { Eye, Pencil, RefreshCw, AlertCircle, Search, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getUsers,
  getUserById,
  updateUser,
  GetUsersParams,
  UserListItem,
  UserDetail,
  UserGender,
  UserStatus,
  UserRole,
} from "@/lib/api/users";
import { toast } from "sonner";

export default function AccountsPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "" as UserGender | "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetUsersParams = {
        ...filters,
      };

      if (searchText) {
        params.username = searchText;
      }
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter as UserStatus;
      }
      if (roleFilter && roleFilter !== "all") {
        params.roleName = roleFilter as UserRole;
      }

      const response = await getUsers(params);

      setUsers(response.data.users);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách người dùng";
      setError(errorMessage);
      toast.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
  };

  const handleViewDetail = async (user: UserListItem) => {
    try {
      setLoadingDetail(true);
      setDetailDialogOpen(true);

      const response = await getUserById(user.id);
      setSelectedUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
      toast.error("Không thể tải thông tin chi tiết");
      setDetailDialogOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = async (user: UserListItem) => {
    try {
      setLoadingDetail(true);

      const response = await getUserById(user.id);
      setEditingUser(response.data);
      setEditForm({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phoneNumber: response.data.phoneNumber || "",
        gender: response.data.gender || "",
      });
      setEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch user for edit:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);

      await updateUser({
        id: editingUser.id,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        gender: editForm.gender as UserGender,
      });

      toast.success("Cập nhật thông tin thành công");
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật thông tin";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Hoạt động</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case "BLOCKED":
        return <Badge variant="destructive">Đã khóa</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGenderText = (gender: UserGender) => {
    switch (gender) {
      case "MALE":
        return "Nam";
      case "FEMALE":
        return "Nữ";
      case "OTHER":
        return "Khác";
      default:
        return gender;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "MANAGER":
        return "Quản lý";
      case "SELLER":
        return "Người bán";
      case "CUSTOMER":
        return "Khách hàng";
      default:
        return role;
    }
  };

  const columns: ColumnDef<UserListItem>[] = [
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
      accessorKey: "name",
      header: "Họ tên",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
    },
    {
      accessorKey: "gender",
      header: "Giới tính",
      cell: ({ row }) => getGenderText(row.original.gender),
    },
    {
      accessorKey: "roleName",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant="outline">{getRoleText(row.original.roleName)}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetail(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/admin/dashboard" },
          { label: "Quản lý tài khoản" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý tài khoản</h1>
        <Button onClick={fetchUsers} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label>Tìm kiếm</Label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Tìm theo username..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-[180px]">
          <Label>Trạng thái</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setFilters({ ...filters, page: 1 });
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              <SelectItem value="BLOCKED">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Label>Vai trò</Label>
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setFilters({ ...filters, page: 1 });
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="ADMIN">Quản trị viên</SelectItem>
              <SelectItem value="MANAGER">Quản lý</SelectItem>
              <SelectItem value="SELLER">Người bán</SelectItem>
              <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
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
        data={users}
        loading={loading}
        pagination={{
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit,
          pageCount: pagination.totalPages,
          total: pagination.totalItems,
          onPageChange: (page: any) => setFilters({ ...filters, page: page + 1 }),
          onPageSizeChange: (size: any) => setFilters({ ...filters, limit: size, page: 1 }),
        }}
      />

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Họ</Label>
                  <p className="font-medium">{selectedUser.firstName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tên</Label>
                  <p className="font-medium">{selectedUser.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số điện thoại</Label>
                  <p className="font-medium">{selectedUser.phoneNumber || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Giới tính</Label>
                  <p className="font-medium">{getGenderText(selectedUser.gender)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày sinh</Label>
                  <p className="font-medium">
                    {selectedUser.birthday ? formatDate(selectedUser.birthday) : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vai trò</Label>
                  <p className="font-medium">{getRoleText(selectedUser.roleName)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Họ</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Tên</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                value={editForm.phoneNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, phoneNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={editForm.gender}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, gender: value as UserGender })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
