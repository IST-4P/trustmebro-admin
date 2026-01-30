import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export interface CategoryListItem {
  id: string;
  name: string;
  logo: string;
  level: number;
  parentCategoryId?: string | null;
  parentId?: string | null; // Alias for parentCategoryId
  parentCategory?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
}

// Type alias for convenience
export type Category = CategoryListItem;

export interface CategoryDetail extends CategoryListItem {
  // Additional fields if any
}

export interface GetCategoriesParams {
  processId?: string;
  parentCategoryId?: string;
}

export interface GetManyCategoriesResponse {
  data: {
    categories: CategoryListItem[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface GetCategoryResponse {
  data: CategoryDetail;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface CreateCategoryData {
  name: string;
  logo: string;
  createdById: string;
  parentCategoryId?: string | null;
  processId?: string;
}

export interface UpdateCategoryData {
  id: string;
  name?: string | null;
  logo?: string | null;
  updatedById?: string | null;
  parentCategoryId?: string | null;
  processId?: string;
}

export interface DeleteCategoryParams {
  id: string;
  deletedById?: string | null;
  processId?: string;
}

// ===== API FUNCTIONS =====

/**
 * Lấy danh sách categories
 * GET /api/v1/category
 */
export async function getCategories(
  params?: GetCategoriesParams,
): Promise<GetManyCategoriesResponse> {
  const response = await axiosInstance.get<GetManyCategoriesResponse>(
    "/api/v1/category",
    {
      params,
    },
  );
  return response.data;
}

/**
 * Lấy chi tiết category theo ID
 * GET /api/v1/category/{id}
 */
export async function getCategoryById(
  id: string,
  processId?: string,
): Promise<GetCategoryResponse> {
  const response = await axiosInstance.get<GetCategoryResponse>(
    `/api/v1/category/${id}`,
    {
      params: processId ? { processId } : undefined,
    },
  );
  return response.data;
}

/**
 * Tạo category mới
 * POST /api/v1/category
 */
export async function createCategory(
  data: CreateCategoryData,
): Promise<GetCategoryResponse> {
  const response = await axiosInstance.post<GetCategoryResponse>(
    "/api/v1/category",
    data,
  );
  return response.data;
}

/**
 * Cập nhật category
 * PUT /api/v1/category
 */
export async function updateCategory(
  data: UpdateCategoryData,
): Promise<GetCategoryResponse> {
  const response = await axiosInstance.put<GetCategoryResponse>(
    "/api/v1/category",
    data,
  );
  return response.data;
}

/**
 * Xóa category
 * DELETE /api/v1/category/{id}
 */
export async function deleteCategory(
  params: DeleteCategoryParams,
): Promise<GetCategoryResponse> {
  const { id, deletedById, processId } = params;
  const response = await axiosInstance.delete<GetCategoryResponse>(
    `/api/v1/category/${id}`,
    {
      params: {
        deletedById,
        processId,
      },
    },
  );
  return response.data;
}
