import { ApiClient } from "./ApiClient";

export interface Customer {
  id: string | number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  businessId?: number;
  businessName?: string;
  customerType: "individual" | "enterprise";
  tier: "VIP" | "Thân thiết" | "Tiêu chuẩn" | "Đối tác";
  status?: string;
  address?: string;
  notes?: string;
  source?: string;
  sourceLabel?: string;
  avatar?: string;
  roleOrDesc?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  businessId?: number;
  businessName?: string;
  customerType: "individual" | "enterprise";
  tier: "VIP" | "Thân thiết" | "Tiêu chuẩn" | "Đối tác";
  status?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string | number;
}

export interface MultiDbCustomer {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  source: string;
  sourceLabel: string;
  customerType: "individual" | "enterprise";
  tier: "VIP" | "Đối tác" | "Thân thiết" | "Tiêu chuẩn";
  status?: string;
  roleOrDesc?: string;
  avatar?: string;
  createdAt?: string;
}

export interface MultiDbStats {
  totalBangGiaVang: number;
  totalSadVietNam: number;
  totalDb3: number;
  totalAll: number;
  activeSources: string[];
}

const STORAGE_KEY = "sadvn_customers_data";
const clientCache = new Map<string, { timestamp: number; data: Customer[] }>();
let statsCache: { timestamp: number; data: MultiDbStats } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60s client cache

export const customerService = {
  /**
   * Xóa client cache khi cần đồng bộ mới
   */
  clearCache: () => {
    clientCache.clear();
    statsCache = null;
  },

  /**
   * Tìm kiếm khách hàng trực tiếp từ các Database (BangGiaVang, SADVietNam, DB3...)
   */
  searchMultiDb: async (
    query: string = "",
    source: string = "ALL",
    limit: number = 5000,
    forceRefresh: boolean = false
  ): Promise<Customer[]> => {
    const cacheKey = `${query.trim()}_${source}_${limit}`;

    if (!forceRefresh) {
      const cached = clientCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }

    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (source && source !== "ALL") params.append("source", source);
      params.append("limit", String(limit));

      const response = await ApiClient.get<MultiDbCustomer[]>(
        `/api/v1/customer/search?${params.toString()}`
      );

      if (response && response.data && response.data.length > 0) {
        const mapped = response.data.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          phone: item.phone || "",
          email: item.email || "",
          address: item.address || "",
          customerType: item.customerType || "individual",
          tier: item.tier || "Tiêu chuẩn",
          status: item.status,
          source: item.source,
          sourceLabel: item.sourceLabel,
          avatar: item.avatar,
          roleOrDesc: item.roleOrDesc,
          createdAt: item.createdAt || new Date().toISOString(),
        }));

        clientCache.set(cacheKey, { timestamp: Date.now(), data: mapped });
        return mapped;
      }
    } catch (err) {
      console.warn("Backend multi-db search not available or returned empty, falling back:", err);
    }

    // Fallback to local search if backend is restarting
    return customerService.getAllLocal(query, source);
  },

  /**
   * Lấy thống kê số lượng bản ghi từ các Database
   */
  getStats: async (forceRefresh: boolean = false): Promise<MultiDbStats | null> => {
    if (!forceRefresh && statsCache && Date.now() - statsCache.timestamp < CACHE_TTL_MS) {
      return statsCache.data;
    }

    try {
      const response = await ApiClient.get<MultiDbStats>("/api/v1/customer/stats");
      if (response && response.data) {
        statsCache = { timestamp: Date.now(), data: response.data };
        return response.data;
      }
    } catch {
      // Ignored fallback
    }
    return null;
  },

  /**
   * Tìm kiếm local fallback
   */
  getAllLocal: (query: string = "", source: string = "ALL"): Customer[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw) as Customer[];
      const q = query.toLowerCase().trim();
      return list.filter((item) => {
        const matchQ =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q);
        const matchSource =
          source === "ALL" || !item.source || item.source === source;
        return matchQ && matchSource;
      });
    } catch {
      return [];
    }
  },

  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const list = customerService.getAllLocal();
    const newId = `CUST-${Date.now()}`;
    const newCode = `KH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCustomer: Customer = {
      ...data,
      id: newId,
      code: newCode,
      source: "Manual",
      sourceLabel: "Hệ thống SADVN",
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newCustomer, ...list];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    return newCustomer;
  },

  update: async (data: UpdateCustomerRequest): Promise<Customer> => {
    const list = customerService.getAllLocal();
    const index = list.findIndex((c) => String(c.id) === String(data.id));
    if (index === -1) {
      throw new Error("Không tìm thấy thông tin khách hàng");
    }

    const updatedCustomer: Customer = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updatedCustomer;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    return updatedCustomer;
  },

  toggleStatus: async (id: string | number): Promise<Customer> => {
    const list = customerService.getAllLocal();
    const customer = list.find((c) => String(c.id) === String(id));
    if (!customer) {
      throw new Error("Không tìm thấy khách hàng");
    }

    const newStatus = customer.status === "active" ? "inactive" : "active";
    return customerService.update({
      ...customer,
      id: customer.id,
      status: newStatus,
    });
  },

  delete: async (id: string | number): Promise<string> => {
    const list = customerService.getAllLocal();
    const filtered = list.filter((c) => String(c.id) !== String(id));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
    return "Đã xóa khách hàng thành công!";
  },
};
