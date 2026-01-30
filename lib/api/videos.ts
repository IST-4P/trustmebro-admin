import axiosInstance from "@/lib/axios";

export interface Video {
  id: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  status:
    | "UPLOADING"
    | "UPLOADED"
    | "PROCESSING"
    | "READY"
    | "FAILED"
    | "DELETED";
  title: string;
  likeCount: number;
  commentCount: number;
  authorId: string;
  productId?: string;
  authorUsername?: string | null;
  authorAvatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetVideosParams {
  userId?: string;
  status?:
    | "UPLOADING"
    | "UPLOADED"
    | "PROCESSING"
    | "READY"
    | "FAILED"
    | "DELETED";
  title?: string;
  page?: number;
  limit?: number;
}

export interface GetVideosResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    videos: Video[];
  };
  message?: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

export async function getVideos(
  params?: GetVideosParams,
): Promise<GetVideosResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const url = `/api/v1/video${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  try {
    const response = await axiosInstance.get<GetVideosResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error("getVideos error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch videos");
  }
}
