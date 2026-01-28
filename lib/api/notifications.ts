import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export type NotificationType =
  | "ORDER_UPDATE"
  | "PROMOTION"
  | "WALLET_UPDATE"
  | "TRUST_ME_BRO_UPDATE";

export interface NotificationListItem {
  id: string;
  title: string;
  description: string;
  userId: string;
  type: NotificationType;
  link?: string;
  image?: string;
  isRead?: boolean;
  metadata?: {
    orderId?: string;
    articleId?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  userId: string;
  processId?: string;
}

export interface GetManyNotificationsResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    notifications: NotificationListItem[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface CreateNotificationData {
  title: string;
  description: string;
  userId: string;
  type: NotificationType;
  link?: string;
  image?: string;
  metadata?: {
    orderId?: string;
    articleId?: string;
  };
  createdById?: string | null;
  processId?: string;
}

export interface NotificationResponse {
  data: NotificationListItem;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

// ===== API FUNCTIONS =====

/**
 * GET /notification - Lấy danh sách thông báo của user
 */
export async function getNotifications(
  params: GetNotificationsParams
): Promise<GetManyNotificationsResponse> {
  const response = await axiosInstance.get<GetManyNotificationsResponse>(
    "/api/v1/notification",
    { params }
  );
  return response.data;
}

/**
 * POST /notification - Tạo thông báo mới
 */
export async function createNotification(
  data: CreateNotificationData
): Promise<NotificationResponse> {
  const response = await axiosInstance.post<NotificationResponse>(
    "/api/v1/notification",
    data
  );
  return response.data;
}

// ===== HELPER FUNCTIONS =====

export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    ORDER_UPDATE: "Cập nhật đơn hàng",
    PROMOTION: "Khuyến mãi",
    WALLET_UPDATE: "Cập nhật ví",
    TRUST_ME_BRO_UPDATE: "TrustMeBro",
  };
  return labels[type] || type;
}
