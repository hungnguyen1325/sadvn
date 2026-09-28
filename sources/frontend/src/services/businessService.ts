import { ApiClient } from "./ApiClient";

export interface Business {
  id: number;
  uuid: string;
  name: string;
  taxCode: string;
  address?: string;
  createAt?: string;
  updateAt?: string;
  isActive: boolean;
}

export interface CreateBusinessRequest {
  name: string;
  taxCode: string;
  address?: string;
}

export interface UpdateBusinessRequest {
  id: number;
  name: string;
  taxCode: string;
  address?: string;
  active?: boolean;
}

export interface SearchBusinessRequest {
  name?: string;
  taxCode?: string;
  address?: string;
}

export interface BusinessDetailResponse {
  name: string;
  address: string;
  taxCode: string;
}

const BUSINESS_PATH = "/api/v1/business";
const buildPath = (suffix: string) => `${BUSINESS_PATH}${suffix}`;

export const businessService = {
  getAll: () => ApiClient.get<Business[]>(BUSINESS_PATH).then(({ data }) => data ?? []),

  getById: (id: number) => ApiClient.get<BusinessDetailResponse>(buildPath(`/${id}`)).then(({ data }) => data),

  search: (params: SearchBusinessRequest) =>
    ApiClient.post<Business[]>(buildPath("/search"), params).then(({ data }) => data ?? []),

  create: (data: CreateBusinessRequest) => ApiClient.post<Business>(buildPath("/create"), data).then(({ data }) => data),

  update: (data: UpdateBusinessRequest) => ApiClient.put<Business>(buildPath("/update"), data).then(({ data }) => data),

  delete: async (id: number) => {
    const { message, data } = await ApiClient.delete<string>(buildPath(`/delete/${id}`));
    return message || data || "Đã xóa thành công";
  },
};

