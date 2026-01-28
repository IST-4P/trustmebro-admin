import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type PaymentMethod = "COD" | "WALLET" | "ONLINE";

export interface PaymentListItem {
  id: string;
  code: string;
  userId: string;
  orderId: string[];
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  updatedById?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  userId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  amount?: number;
  code?: string;
  createdAt?: string;
}

export interface GetManyPaymentsResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    payments: PaymentListItem[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface PaymentResponse {
  data: PaymentListItem;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface UpdatePaymentStatusData {
  id: string;
  status: PaymentStatus;
}

// ===== API FUNCTIONS =====

/**
 * GET /payment - Lấy danh sách thanh toán với pagination và filters
 */
export async function getPayments(
  params?: GetPaymentsParams
): Promise<GetManyPaymentsResponse> {
  const response = await axiosInstance.get<GetManyPaymentsResponse>(
    "/api/v1/payment",
    { params }
  );
  return response.data;
}

/**
 * PUT /payment - Cập nhật trạng thái thanh toán
 */
export async function updatePaymentStatus(
  data: UpdatePaymentStatusData
): Promise<PaymentResponse> {
  const response = await axiosInstance.put<PaymentResponse>(
    "/api/v1/payment",
    data
  );
  return response.data;
}

// Helper functions
export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING: "Chờ thanh toán",
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    CANCELLED: "Đã hủy",
  };
  return labels[status] || status;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    COD: "Thanh toán khi nhận hàng",
    WALLET: "Ví điện tử",
    ONLINE: "Thanh toán online",
  };
  return labels[method] || method;
}
