import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export type PromotionStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";
export type PromotionScope = "ORDER" | "SHIPPING";
export type PromotionDiscountType = "PERCENT" | "AMOUNT";

export interface PromotionListItem {
  id: string;
  code: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: PromotionStatus;
  scope: PromotionScope;
  discountType: PromotionDiscountType;
  totalLimit?: number;
}

export interface PromotionDetail {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: PromotionStatus;
  startsAt: string;
  endsAt: string;
  scope: PromotionScope;
  minOrderSubtotal: number;
  discountType: PromotionDiscountType;
  discountValue: number;
  maxDiscount?: number;
  totalLimit?: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  updatedById?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
}

export interface GetPromotionsParams {
  page?: number;
  limit?: number;
  code?: string;
  name?: string;
  status?: PromotionStatus;
  scope?: PromotionScope;
  discountType?: PromotionDiscountType;
  startsAt?: string;
  endsAt?: string;
}

export interface GetManyPromotionsResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    promotions: PromotionListItem[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface GetPromotionResponse {
  data: PromotionDetail;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface PromotionResponse {
  data: PromotionDetail;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface CreatePromotionData {
  code: string;
  name: string;
  description?: string;
  status: PromotionStatus;
  startsAt: string;
  endsAt: string;
  scope: PromotionScope;
  minOrderSubtotal: number;
  discountType: PromotionDiscountType;
  discountValue: number;
  maxDiscount?: number;
  totalLimit?: number;
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> {
  id: string;
}

// ===== API FUNCTIONS =====

/**
 * GET /promotion - Lấy danh sách mã giảm giá
 */
export async function getPromotions(
  params?: GetPromotionsParams
): Promise<GetManyPromotionsResponse> {
  const response = await axiosInstance.get<GetManyPromotionsResponse>(
    "/api/v1/promotion",
    { params }
  );
  return response.data;
}

/**
 * GET /promotion/:id - Lấy chi tiết mã giảm giá
 */
export async function getPromotionById(
  id: string
): Promise<GetPromotionResponse> {
  const response = await axiosInstance.get<GetPromotionResponse>(
    `/api/v1/promotion/${id}`
  );
  return response.data;
}

/**
 * POST /promotion - Tạo mã giảm giá mới
 */
export async function createPromotion(
  data: CreatePromotionData
): Promise<PromotionResponse> {
  const response = await axiosInstance.post<PromotionResponse>(
    "/api/v1/promotion",
    data
  );
  return response.data;
}

/**
 * PUT /promotion - Cập nhật mã giảm giá
 */
export async function updatePromotion(
  data: UpdatePromotionData
): Promise<PromotionResponse> {
  const response = await axiosInstance.put<PromotionResponse>(
    "/api/v1/promotion",
    data
  );
  return response.data;
}

/**
 * DELETE /promotion/:id - Xóa mã giảm giá
 */
export async function deletePromotion(id: string): Promise<PromotionResponse> {
  const response = await axiosInstance.delete<PromotionResponse>(
    `/api/v1/promotion/${id}`
  );
  return response.data;
}

// ===== HELPER FUNCTIONS =====

export function getPromotionStatusLabel(status: PromotionStatus): string {
  const labels: Record<PromotionStatus, string> = {
    DRAFT: "Nháp",
    ACTIVE: "Hoạt động",
    PAUSED: "Tạm dừng",
    ENDED: "Đã kết thúc",
  };
  return labels[status] || status;
}

export function getPromotionScopeLabel(scope: PromotionScope): string {
  const labels: Record<PromotionScope, string> = {
    ORDER: "Đơn hàng",
    SHIPPING: "Vận chuyển",
  };
  return labels[scope] || scope;
}

export function getDiscountTypeLabel(type: PromotionDiscountType): string {
  const labels: Record<PromotionDiscountType, string> = {
    PERCENT: "Phần trăm",
    AMOUNT: "Số tiền cố định",
  };
  return labels[type] || type;
}
