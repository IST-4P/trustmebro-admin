import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export type UserGender = "MALE" | "FEMALE" | "OTHER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type UserRole = "CUSTOMER" | "SELLER" | "MANAGER" | "ADMIN";

export interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: UserGender;
  status: UserStatus;
  roleName: string;
}

export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  avatar: string | null;
  birthday: string | null;
  gender: UserGender;
  status: UserStatus;
  roleId: string;
  roleName: string;
  shop?: {
    id: string;
  };
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
  deletedAt: string | null;
}

export interface GetUsersParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  gender?: UserGender;
  status?: UserStatus;
  roleName?: UserRole;
  page?: number;
  limit?: number;
}

export interface UpdateUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  gender?: UserGender;
  birthday?: string | null;
}

// API Response types
export interface GetManyUsersResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    users: UserListItem[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface GetUserResponse {
  data: UserDetail;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

// ===== API FUNCTIONS =====

/**
 * GET /api/v1/user - Lấy danh sách users với pagination và filters
 */
export async function getUsers(params?: GetUsersParams): Promise<GetManyUsersResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
  }

  const url = `/api/v1/user${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  try {
    const response = await axiosInstance.get<GetManyUsersResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error("getUsers error:", error);
    throw new Error(error.response?.data?.message || "Không thể tải danh sách người dùng");
  }
}

/**
 * GET /api/v1/user/{id} - Lấy chi tiết một user
 */
export async function getUserById(id: string): Promise<GetUserResponse> {
  try {
    const response = await axiosInstance.get<GetUserResponse>(`/api/v1/user/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("getUserById error:", error);
    throw new Error(error.response?.data?.message || "Không thể tải thông tin người dùng");
  }
}

/**
 * PUT /api/v1/user - Cập nhật thông tin user
 */
export async function updateUser(data: UpdateUserData): Promise<GetUserResponse> {
  try {
    const response = await axiosInstance.put<GetUserResponse>("/api/v1/user", data);
    return response.data;
  } catch (error: any) {
    console.error("updateUser error:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật thông tin người dùng");
  }
}
