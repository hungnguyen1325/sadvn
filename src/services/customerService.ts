import { searchCustomersAction, getCustomerStatsAction } from "@/actions/customerActions";

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

export interface MultiDbStats {
  totalBangGiaVang: number;
  totalSadVietNam: number;
  totalDb3: number;
  totalAll: number;
  activeSources: string[];
}

const STORAGE_KEY = "sadvn_manual_customers";

function getLocalManualCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalManualCustomers(list: Customer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export const customerService = {
  clearCache: () => {},

  searchMultiDb: async (
    query: string = "",
    source: string = "ALL",
    limit: number = 5000,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    forceRefresh: boolean = false
  ): Promise<Customer[]> => {
    try {
      const sqlResults = await searchCustomersAction(query, source, limit);
      const manualCustomers = getLocalManualCustomers().filter((item) => {
        const q = query.toLowerCase().trim();
        const matchQ =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q);
        const matchSource = source === "ALL" || item.source === source;
        return matchQ && matchSource;
      });
      return [...manualCustomers, ...sqlResults];
    } catch (err) {
      console.error("searchMultiDb error, fallback to local:", err);
      return customerService.getAllLocal(query, source);
    }
  },

  getStats: async (): Promise<MultiDbStats | null> => {
    try {
      const stats = await getCustomerStatsAction();
      const manualCount = getLocalManualCustomers().length;
      return {
        ...stats,
        totalAll: stats.totalAll + manualCount,
      };
    } catch {
      return {
        totalBangGiaVang: 0,
        totalSadVietNam: 0,
        totalDb3: 0,
        totalAll: getLocalManualCustomers().length,
        activeSources: ["BangGiaVang", "SADVietNam"],
      };
    }
  },

  getAllLocal: (query: string = "", source: string = "ALL"): Customer[] => {
    const list = getLocalManualCustomers();
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
  },

  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const list = getLocalManualCustomers();
    const newId = `CUST-${Date.now()}`;
    const newCode = `KH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCustomer: Customer = {
      ...data,
      id: newId,
      code: newCode,
      source: "Manual",
      sourceLabel: "Thêm thủ công",
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newCustomer, ...list];
    saveLocalManualCustomers(updatedList);
    return newCustomer;
  },

  update: async (data: UpdateCustomerRequest): Promise<Customer> => {
    const list = getLocalManualCustomers();
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
    saveLocalManualCustomers(list);
    return updatedCustomer;
  },

  toggleStatus: async (id: string | number): Promise<Customer> => {
    const list = getLocalManualCustomers();
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
    const list = getLocalManualCustomers();
    const filtered = list.filter((c) => String(c.id) !== String(id));
    saveLocalManualCustomers(filtered);
    return "Đã xóa khách hàng thành công!";
  },
};
