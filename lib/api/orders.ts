import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export type OrderStatus =
  | "CREATING"
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type PaymentMethod = "COD" | "WALLET" | "ONLINE";

export interface OrderListItem {
  id: string;
  code: string;
  shopId: string;
  shopName: string;
  status: OrderStatus;
  itemTotal: number;
  grandTotal: number;
  firstProductImage: string;
  firstProductName: string;
}

export interface OrderItemSnapshot {
  id: string;
  productId: string;
  productImage: string;
  productName: string;
  skuValue: string;
  quantity: number;
  price: number;
}

export interface OrderTimeline {
  status: string;
  at: string;
}

export interface OrderReceiver {
  name: string;
  phone: string;
  address: string;
}

export interface OrderDetail {
  id: string;
  code: string;
  userId: string;
  shopId: string;
  shopName: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId: string;
  itemTotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  receiver: OrderReceiver;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  timeline: OrderTimeline[];
  itemsSnapshot: OrderItemSnapshot[];
  firstProductName: string;
  firstProductImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  paymentId?: string;
  status?: OrderStatus;
  userId?: string;
  shopId?: string;
}

export interface GetManyOrdersResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    orders: OrderListItem[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface GetOrderResponse {
  data: OrderDetail;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface UpdateOrderStatusData {
  id: string;
  status: OrderStatus;
  shopId: string;
}

// ===== API FUNCTIONS =====

/**
 * GET /order - Lấy danh sách đơn hàng với pagination và filters
 */
export async function getOrders(
  params?: GetOrdersParams,
): Promise<GetManyOrdersResponse> {
  const response = await axiosInstance.get<GetManyOrdersResponse>(
    "/api/v1/order",
    { params },
  );
  return response.data;
}

/**
 * GET /order/{orderId} - Lấy chi tiết đơn hàng theo ID
 */
export async function getOrderById(orderId: string): Promise<GetOrderResponse> {
  const response = await axiosInstance.get<GetOrderResponse>(
    `/api/v1/order/${orderId}`,
  );
  return response.data;
}

/**
 * PUT /order - Cập nhật trạng thái đơn hàng
 */
export async function updateOrderStatus(
  data: UpdateOrderStatusData,
): Promise<void> {
  await axiosInstance.put("/api/v1/order", data);
}

/**
 * DELETE /order/{orderId} - Hủy đơn hàng
 */
export async function cancelOrder(
  orderId: string,
  shopId?: string,
): Promise<void> {
  await axiosInstance.delete(`/api/v1/order/${orderId}`, {
    params: shopId ? { shopId } : undefined,
  });
}

// Helper functions
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    CREATING: "Đang tạo",
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
    REFUNDED: "Đã hoàn tiền",
  };
  return labels[status] || status;
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING: "Chưa thanh toán",
    SUCCESS: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
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
