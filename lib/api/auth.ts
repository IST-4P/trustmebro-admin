import axiosInstance from "@/lib/axios";

// ===== TYPES =====
export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  statusCode?: number;
  processId?: string;
  duration?: string;
}

// ===== API FUNCTIONS =====

/**
 * POST /api/v1/auth/login - Đăng nhập
 * Server sẽ tự động set cookies (accessToken, refreshToken)
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await axiosInstance.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  } catch (error: any) {
    console.error("login error:", error);
    throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
  }
}

/**
 * POST /api/v1/auth/refresh-token - Làm mới token
 * Cookies sẽ tự động được gửi và server sẽ set cookies mới
 */
export async function refreshToken(): Promise<AuthResponse> {
  try {
    const response = await axiosInstance.post<AuthResponse>('/api/v1/auth/refresh-token');
    return response.data;
  } catch (error: any) {
    console.error("refreshToken error:", error);
    throw new Error(error.response?.data?.message || "Làm mới token thất bại");
  }
}

/**
 * POST /api/v1/auth/logout - Đăng xuất
 * Server sẽ xóa cookies
 */
export async function logout(): Promise<AuthResponse> {
  try {
    const response = await axiosInstance.post<AuthResponse>('/api/v1/auth/logout');
    return response.data;
  } catch (error: any) {
    console.error("logout error:", error);
    throw new Error(error.response?.data?.message || "Đăng xuất thất bại");
  }
}

// ===== AUTO REFRESH TOKEN =====

let refreshInterval: NodeJS.Timeout | null = null;

/**
 * Bắt đầu tự động refresh token mỗi 10 phút
 */
export function startAutoRefreshToken() {
  // Dừng interval cũ nếu có
  stopAutoRefreshToken();

  // Refresh token mỗi 10 phút (600000 ms)
  const REFRESH_INTERVAL = 10 * 60 * 1000;

  refreshInterval = setInterval(async () => {
    try {
      console.log('[Auth] Auto refreshing token...');
      await refreshToken();
      console.log('[Auth] Token refreshed successfully');
    } catch (error) {
      console.error('[Auth] Auto refresh token failed:', error);
      // Nếu refresh thất bại, redirect về login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, REFRESH_INTERVAL);

  console.log('[Auth] Auto refresh token started (every 10 minutes)');
}

/**
 * Dừng tự động refresh token
 */
export function stopAutoRefreshToken() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('[Auth] Auto refresh token stopped');
  }
}
