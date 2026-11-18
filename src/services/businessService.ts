import {
  getAllBusinessesAction,
  getBusinessByIdAction,
  searchBusinessesAction,
  createBusinessAction,
  updateBusinessAction,
  deleteBusinessAction,
} from "@/actions/businessActions";

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

export const businessService = {
  getAll: async (): Promise<Business[]> => {
    return getAllBusinessesAction();
  },

  getById: async (id: number): Promise<BusinessDetailResponse | null> => {
    return getBusinessByIdAction(id);
  },

  search: async (params: SearchBusinessRequest): Promise<Business[]> => {
    return searchBusinessesAction(params);
  },

  create: async (data: CreateBusinessRequest): Promise<Business> => {
    return createBusinessAction(data);
  },

  update: async (data: UpdateBusinessRequest): Promise<Business> => {
    return updateBusinessAction(data);
  },

  delete: async (id: number): Promise<string> => {
    return deleteBusinessAction(id);
  },
};
