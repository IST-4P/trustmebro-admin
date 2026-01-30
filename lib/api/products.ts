import axiosInstance from "@/lib/axios";

export interface ProductVariant {
  value: string;
  options: string[];
}

export interface ProductSKU {
  id?: string;
  value: string;
  price: number;
  stock: number;
  image?: string;
}

export interface GetProductsParams {
  name?: string;
  status?: "ACTIVE" | "INACTIVE" | "BANNED" | "DRAFT";
  brandIds?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  shopId?: string;
  provinceId?: number;
  orderBy?: "asc" | "desc";
  sortBy?: "price" | "createdAt" | "sale";
  page?: number;
  limit?: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface CreateProductData {
  name: string;
  basePrice: number;
  virtualPrice?: number;
  brandId?: string | null;
  images: string[];
  variants?: ProductVariant[];
  shopId: string;
  description?: string;
  sizeGuide?: string;
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  wardId?: number;
  wardName?: string;
  status?: "ACTIVE" | "INACTIVE" | "BANNED" | "DRAFT";
  categories: string[];
  skus: ProductSKU[];
  attributes?: ProductAttribute[];
  isApproved?: boolean;
  createdById?: string | null;
  updatedById?: string | null;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
  soldCount?: number;
  processId?: string;
}

// API Response types matching backend schema
export interface ProductApiResponse {
  id: string;
  name: string;
  basePrice: number;
  virtualPrice?: number;
  brandId: string;
  brand?: {
    id: string;
    name: string;
  };
  shopId: string;
  shop?: {
    id: string;
    name: string;
  };
  images: string[];
  variants?: ProductVariant[];
  description?: string;
  sizeGuide?: string;
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  wardId?: number;
  wardName?: string;
  status: "ACTIVE" | "INACTIVE" | "BANNED" | "DRAFT";
  categoryIds?: string[];
  categories?: Array<{
    id: string;
    name: string;
    logo?: string;
  }>;
  skus?: ProductSKU[];
  attributes?: ProductAttribute[];
  isApproved?: boolean;
  isHidden?: boolean;
  soldCount?: number;
  viewCount?: number;
  likeCount?: number;
  ratingCount?: number;
  averageRate?: number;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
  deletedAt?: string | null;
  deletedById?: string | null;
}

export interface GetProductsResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    products: ProductApiResponse[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface GetProductByIdResponse {
  data: ProductApiResponse;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

// ===== API FUNCTIONS =====

/**
 * GET /product - Lấy danh sách sản phẩm với pagination và filters
 */
export async function getProducts(
  params?: GetProductsParams,
): Promise<GetProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
  }

  const url = `/api/v1/product${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  try {
    const response = await axiosInstance.get<GetProductsResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error("getProducts error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch products",
    );
  }
}

/**
 * GET /api/v1/product/{id} - Lấy chi tiết một sản phẩm
 */
export async function getProductById(
  id: string,
): Promise<GetProductByIdResponse> {
  try {
    const response = await axiosInstance.get<GetProductByIdResponse>(
      `/api/v1/product/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("getProductById error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
}

/**
 * POST /api/v1/product - Tạo sản phẩm mới
 */
export async function createProduct(
  data: CreateProductData,
): Promise<GetProductByIdResponse> {
  try {
    const response = await axiosInstance.post<GetProductByIdResponse>(
      "/api/v1/product",
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error("createProduct error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create product",
    );
  }
}

/**
 * PUT /api/v1/product - Cập nhật sản phẩm
 */
export async function updateProduct(
  data: UpdateProductData,
): Promise<GetProductByIdResponse> {
  try {
    const response = await axiosInstance.put<GetProductByIdResponse>(
      "/api/v1/product",
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error("updateProduct error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update product",
    );
  }
}

/**
 * DELETE /api/v1/product/{id} - Xóa sản phẩm
 */
export async function deleteProduct(
  id: string,
  deletedById: string,
  shopId: string,
): Promise<{ message: string }> {
  try {
    const response = await axiosInstance.delete<{ message: string }>(
      `/api/v1/product/${id}`,
      {
        data: { deletedById, shopId },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error("deleteProduct error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete product",
    );
  }
}
