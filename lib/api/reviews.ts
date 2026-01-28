import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export interface ReviewReply {
  id: string;
  reviewId: string;
  shopId: string;
  content: string;
  createdAt: string;
}

export interface ReviewListItem {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  username?: string;
  avatar?: string;
  rating: number;
  content: string;
  medias: string[];
  createdAt: string;
  reply?: ReviewReply | null;
}

export interface ReviewRating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  oneStarCount: number;
  twoStarCount: number;
  threeStarCount: number;
  fourStarCount: number;
  fiveStarCount: number;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  productId?: string;
  rating?: number;
  userId?: string;
  shopId?: string;
}

export interface GetManyReviewsResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    reviews?: ReviewListItem[];
    rating?: ReviewRating;
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export interface MessageResponse {
  message: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

// ===== API FUNCTIONS =====

/**
 * GET /review - Lấy danh sách đánh giá sản phẩm
 */
export async function getReviews(
  params?: GetReviewsParams
): Promise<GetManyReviewsResponse> {
  const response = await axiosInstance.get<GetManyReviewsResponse>(
    "/api/v1/review",
    { params }
  );
  return response.data;
}

/**
 * DELETE /review - Xóa đánh giá (cần id và shopId)
 */
export async function deleteReview(
  id: string,
  shopId: string
): Promise<MessageResponse> {
  const response = await axiosInstance.delete<MessageResponse>(
    "/api/v1/review",
    { params: { id, shopId } }
  );
  return response.data;
}

// ===== HELPER FUNCTIONS =====

export function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: "1 sao - Rất tệ",
    2: "2 sao - Tệ",
    3: "3 sao - Bình thường",
    4: "4 sao - Tốt",
    5: "5 sao - Xuất sắc",
  };
  return labels[rating] || `${rating} sao`;
}

export function getRatingStars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}
