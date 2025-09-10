import { Pagination } from "./global";

export type PaginatedDiscounts = {
  data: Discount[];
  pagination: Pagination;
};

export type Discount = {
  id: number;
  name: string;
  type: string;
  value: number;
  start_date: string;
  end_date: string;
  max_uses: number;
  used_count: number;
  active: boolean;
  created_at: string;
};

export type ListDiscount = {
  id: number;
  name: string;
  type: string;
  value: number;
};

export type EditDiscount = {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  start_date: string;
  end_date: string;
  max_uses: number;
  max_uses_per_user: number;
};