import { loginAction } from "@/actions/authActions";

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
  document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const authService = {
  async login(credentials: LoginRequest, remember: boolean = false): Promise<string> {
    const result = await loginAction(credentials.username, credentials.password);
    const token = result.token;

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USERNAME_KEY, result.username);
      setAuthCookie(token);

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
  },

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

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < nowInSeconds;
  },

  isAuthenticated(): boolean {
    return !this.isTokenExpired();
  },

  isRemembered(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(REMEMBER_KEY) === "true";
  },

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

  handleTokenExpired(): void {
    this.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },
};
