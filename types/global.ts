import { routing } from "@/i18n/routing";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { IconType } from "react-icons/lib";

export type Pagination = {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  last_page: number;
  per_page: number;
  total_records: number;
  has_pages: boolean;
  has_next_page: boolean;
  has_prev_page: boolean;
  from: number;
  to: number;
  path: string;
};

export type TableColumn<T> = {
  id: string;
  title?: string;
  header: ReactNode;
  className?: string;
  canBeInvisible?: boolean;
  cell?: (data: T) => ReactNode | string | number;
};

export type ApiError = {
  success: boolean;
  message: string;
  code: number;
  data?: [];
  errors?: Record<string, string[]>;
};

export type SidebarItem = {
  title: string;
  url?: string;
  icon?: LucideIcon | IconType;
  children?: SidebarItem[];
  activePatterns?: string[];
  permission?: string;
};

export type IntBoolean = 0 | 1;

export type SuccessApiResponse<T = []> = {
  success: boolean;
  message: string;
  data: T;
};

export type PermissionNode = {
  id: number;
  name: string;
  title: string;
  checked?: boolean;
  children?: PermissionNode[];
};

export type Image = {
  id: number;
  name: string;
  url: string;
};

export type QueryParams = {
  search?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: string;
  per_page?: string;
  [key: string]: string | number | boolean | undefined;
};

// Create a localized name type based on available locales
export type LocalizedString = {
  [key in (typeof routing.locales)[number]]: string;
};
