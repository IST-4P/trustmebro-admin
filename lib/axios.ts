import axios from "axios";

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "identity", // Tắt gzip/deflate compression
  },
  // Quan trọng: Cho phép gửi và nhận cookies từ server
  withCredentials: true,
});

// Request interceptor - có thể thêm logic xử lý trước khi gửi request
axiosInstance.interceptors.request.use(
  (config) => {
    // Có thể thêm logic như thêm headers, log, etc.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - xử lý response và errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry, và không phải là request refresh token thì mới thử refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token (cookies sẽ tự động được gửi)
        await axiosInstance.post("/api/v1/auth/refresh-token");

        // Retry request ban đầu
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, redirect về login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
