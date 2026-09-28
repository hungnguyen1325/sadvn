import { ApiClient } from "./ApiClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

const TOKEN_KEY = "auth_token";
const USERNAME_KEY = "auth_username";
const REMEMBER_KEY = "auth_remember";
const SAVED_USERNAME_KEY = "saved_username";
const SAVED_PASSWORD_KEY = "saved_password";

const setAuthCookie = (token: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
};

/**
 * Decode JWT payload (không cần verify signature — chỉ đọc exp để check client-side).
 * Việc verify thật sự vẫn do backend đảm nhiệm khi nhận request.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const authService = {
  async login(credentials: LoginRequest, remember: boolean = false): Promise<string> {
    const response = await ApiClient.post<LoginResponse>("/api/v1/auth/login", credentials);
    const token = response.data?.token;

    if (!token) {
      throw new Error("Không nhận được token xác thực từ máy chủ");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USERNAME_KEY, credentials.username);
      setAuthCookie(token);

      // Lưu tài khoản nếu chọn "Ghi nhớ đăng nhập"
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, "true");
        localStorage.setItem(SAVED_USERNAME_KEY, credentials.username);
        localStorage.setItem(SAVED_PASSWORD_KEY, credentials.password);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem(SAVED_USERNAME_KEY);
        localStorage.removeItem(SAVED_PASSWORD_KEY);
      }
    }

    return token;
  },

  logout(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Giữ lại saved credentials — chỉ xóa session token
  },

  /** Xóa toàn bộ, bao gồm saved credentials */
  logoutFull(): void {
    this.logout();
    if (typeof window === "undefined") return;
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(SAVED_USERNAME_KEY);
    localStorage.removeItem(SAVED_PASSWORD_KEY);
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUsername(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(USERNAME_KEY);
  },

  /**
   * Kiểm tra token có hết hạn chưa bằng cách decode JWT client-side.
   * Trả về true nếu token không tồn tại, không hợp lệ, hoặc đã hết hạn.
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") return true;

    // exp là Unix timestamp (giây), so sánh với thời gian hiện tại
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < nowInSeconds;
  },

  /**
   * Trả về true chỉ khi có token VÀ token chưa hết hạn.
   */
  isAuthenticated(): boolean {
    return !this.isTokenExpired();
  },

  /** Kiểm tra có lưu tài khoản không */
  isRemembered(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(REMEMBER_KEY) === "true";
  },

  /** Lấy thông tin tài khoản đã lưu */
  getSavedCredentials(): { username: string; password: string } | null {
    if (typeof window === "undefined") return null;
    if (localStorage.getItem(REMEMBER_KEY) !== "true") return null;

    const username = localStorage.getItem(SAVED_USERNAME_KEY);
    const password = localStorage.getItem(SAVED_PASSWORD_KEY);

    if (username && password) {
      return { username, password };
    }
    return null;
  },

  /** Gọi khi nhận 401 — token hết hạn, tự logout và redirect về login */
  handleTokenExpired(): void {
    this.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },
};

