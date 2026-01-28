import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export type ReportTargetType =
  | "USER"
  | "SELLER"
  | "PRODUCT"
  | "ORDER"
  | "MESSAGE"
  | "REVIEW";

export type ReportCategory =
  | "SCAM"
  | "FRAUD"
  | "FAKE"
  | "HARASSMENT"
  | "SPAM";

export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";

export interface ReportListItem {
  id: string;
  reporterId: string;
  targetId?: string;
  targetType: ReportTargetType;
  category: ReportCategory;
  title: string;
  status: ReportStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetReportsParams {
  page?: number;
  limit?: number;
  reporterId?: string;
  targetId?: string;
  targetType?: ReportTargetType;
  category?: ReportCategory;
  status?: ReportStatus;
}

export interface GetManyReportsResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    reports: ReportListItem[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface GetReportResponse {
  data: ReportListItem;
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface UpdateReportStatusData {
  id: string;
  newStatus: ReportStatus;
  note: string;
}

export interface MessageResponse {
  message: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

// ===== API FUNCTIONS =====

/**
 * GET /report - Lấy danh sách báo cáo
 */
export async function getReports(
  params?: GetReportsParams
): Promise<GetManyReportsResponse> {
  const response = await axiosInstance.get<GetManyReportsResponse>(
    "/api/v1/report",
    { params }
  );
  return response.data;
}

/**
 * GET /report/:id - Lấy chi tiết báo cáo
 */
export async function getReportById(id: string): Promise<GetReportResponse> {
  const response = await axiosInstance.get<GetReportResponse>(
    `/api/v1/report/${id}`
  );
  return response.data;
}

/**
 * PUT /report - Cập nhật trạng thái báo cáo
 */
export async function updateReportStatus(
  data: UpdateReportStatusData
): Promise<MessageResponse> {
  const response = await axiosInstance.put<MessageResponse>(
    "/api/v1/report",
    data
  );
  return response.data;
}

/**
 * DELETE /report/:id - Xóa báo cáo
 */
export async function deleteReport(id: string): Promise<MessageResponse> {
  const response = await axiosInstance.delete<MessageResponse>(
    `/api/v1/report/${id}`
  );
  return response.data;
}

// ===== HELPER FUNCTIONS =====

export function getReportStatusLabel(status: ReportStatus): string {
  const labels: Record<ReportStatus, string> = {
    PENDING: "Chờ xử lý",
    REVIEWING: "Đang xem xét",
    RESOLVED: "Đã giải quyết",
    REJECTED: "Đã từ chối",
  };
  return labels[status] || status;
}

export function getReportCategoryLabel(category: ReportCategory): string {
  const labels: Record<ReportCategory, string> = {
    SCAM: "Lừa đảo",
    FRAUD: "Gian lận",
    FAKE: "Giả mạo",
    HARASSMENT: "Quấy rối",
    SPAM: "Spam",
  };
  return labels[category] || category;
}

export function getReportTargetTypeLabel(type: ReportTargetType): string {
  const labels: Record<ReportTargetType, string> = {
    USER: "Người dùng",
    SELLER: "Người bán",
    PRODUCT: "Sản phẩm",
    ORDER: "Đơn hàng",
    MESSAGE: "Tin nhắn",
    REVIEW: "Đánh giá",
  };
  return labels[type] || type;
}
