import axiosInstance from "@/lib/axios";
import { GetManyShopsResponse } from "@/types/shop";

export interface GetManyShopsParams {
  page?: number;
  limit?: number;
  isOpen?: boolean;
}

export async function getShops(
  params?: GetManyShopsParams,
): Promise<GetManyShopsResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.limit !== undefined)
      searchParams.append("limit", params.limit.toString());
    if (params.isOpen !== undefined)
      searchParams.append("isOpen", params.isOpen.toString());
  }

  const url = `/api/v1/shop${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  try {
    const response = await axiosInstance.get<GetManyShopsResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error("getShops error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch shops");
  }
}
