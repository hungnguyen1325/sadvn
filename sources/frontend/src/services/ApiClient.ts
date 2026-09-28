export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[] | string>;
  message?: string;
}

export class ApiRequestError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.data = data;
  }
}

declare global {
  interface Window {
    __ENV__?: {
      NEXT_PUBLIC_API_URL?: string;
    };
  }
}

// ─── Base URL resolution (Synchronous) ─────────────────────────────────────────

function getBaseUrl(): string {
  const normalize = (url: string) => url.trim().replace(/\/+$/, "");

  // 1. Client-side: đọc từ window.__ENV__ do SSR inject sẵn vào <head>
  if (typeof window !== "undefined" && window.__ENV__?.NEXT_PUBLIC_API_URL?.trim()) {
    return normalize(window.__ENV__.NEXT_PUBLIC_API_URL);
  }

  // 2. Server-side hoặc biến build-time mặc định của Next.js
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl?.trim()) {
    return normalize(envUrl);
  }

  return "";
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function buildUrl(baseUrl: string, endpoint: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") ?? null;
}

function buildHeaders(custom: HeadersInit = {}): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return { ...headers, ...(custom as Record<string, string>) };
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const json: Record<string, unknown> | null = isJson
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    // Token hết hạn hoặc không hợp lệ → tự động logout & redirect về login
    if (res.status === 401 && typeof window !== "undefined") {
      const { authService } = await import("./authService");
      authService.handleTokenExpired();
      throw new ApiRequestError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401, json);
    }

    const message =
      (json?.detail as string) ??
      (json?.message as string) ??
      (json?.title as string) ??
      `Yêu cầu thất bại với mã lỗi ${res.status}`;
    throw new ApiRequestError(message, res.status, json);
  }

  // Spring Boot SuccessResponse<T>: { success, message, data }
  if (json && "success" in json) {
    return json as unknown as ApiResponse<T>;
  }

  return { success: true, message: "Thành công", data: json as unknown as T };
}

// ─── ApiClient ────────────────────────────────────────────────────────────────

export class ApiClient {
  static async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const url = buildUrl(getBaseUrl(), endpoint);
    return handleResponse<T>(
      await fetch(url, { method: "GET", headers: buildHeaders(headers) })
    );
  }

  static async post<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const url = buildUrl(getBaseUrl(), endpoint);
    return handleResponse<T>(
      await fetch(url, {
        method: "POST",
        headers: buildHeaders(headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    );
  }

  static async put<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const url = buildUrl(getBaseUrl(), endpoint);
    return handleResponse<T>(
      await fetch(url, {
        method: "PUT",
        headers: buildHeaders(headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    );
  }

  static async patch<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const url = buildUrl(getBaseUrl(), endpoint);
    return handleResponse<T>(
      await fetch(url, {
        method: "PATCH",
        headers: buildHeaders(headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    );
  }

  static async delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const url = buildUrl(getBaseUrl(), endpoint);
    return handleResponse<T>(
      await fetch(url, { method: "DELETE", headers: buildHeaders(headers) })
    );
  }
}