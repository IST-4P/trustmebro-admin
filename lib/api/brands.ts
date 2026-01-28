import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export interface BrandListItem {
  id: string;
  name: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
}

// Type alias for convenience
export type Brand = BrandListItem;

export interface BrandDetail extends BrandListItem {
  // Additional fields if any
}

export interface GetBrandsParams {
  page?: number;
  limit?: number;
  name?: string;
  processId?: string;
}

export interface GetManyBrandsResponse {
  data: {
    brands: BrandListItem[];
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface GetBrandResponse {
  data: BrandDetail;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface CreateBrandData {
  name: string;
  logo: string;
  createdById: string;
  processId?: string;
}

export interface UpdateBrandData {
  id: string;
  name?: string;
  logo?: string;
  updatedById?: string;
  processId?: string;
}

export interface DeleteBrandParams {
  id: string;
  deletedById?: string | null;
}

// ===== API FUNCTIONS =====

/**
 * Lấy danh sách brands
 * GET /api/v1/brand
 */
export async function getBrands(params?: GetBrandsParams): Promise<GetManyBrandsResponse> {
  const response = await axiosInstance.get<GetManyBrandsResponse>("/api/v1/brand", {
    params,
  });
  return response.data;
}

/**
 * Lấy chi tiết brand theo ID
 * GET /api/v1/brand/{id}
 */
export async function getBrandById(id: string, processId?: string): Promise<GetBrandResponse> {
  const response = await axiosInstance.get<GetBrandResponse>(`/api/v1/brand/${id}`, {
    params: processId ? { processId } : undefined,
  });
  return response.data;
}

/**
 * Tạo brand mới
 * POST /api/v1/brand
 */
export async function createBrand(data: CreateBrandData): Promise<GetBrandResponse> {
  const response = await axiosInstance.post<GetBrandResponse>("/api/v1/brand", data);
  return response.data;
}

/**
 * Cập nhật brand
 * PUT /api/v1/brand
 */
export async function updateBrand(data: UpdateBrandData): Promise<GetBrandResponse> {
  const response = await axiosInstance.put<GetBrandResponse>("/api/v1/brand", data);
  return response.data;
}

/**
 * Xóa brand
 * DELETE /api/v1/brand/{id}
 */
export async function deleteBrand(params: DeleteBrandParams): Promise<GetBrandResponse> {
  const { id, deletedById } = params;
  const response = await axiosInstance.delete<GetBrandResponse>(`/api/v1/brand/${id}`, {
    params: {
      deletedById,
    },
  });
  return response.data;
}
