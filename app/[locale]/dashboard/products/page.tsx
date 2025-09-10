"use client";

import React, { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import DataTable from "./data-table/DataTable";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useErrorNotification } from "@/hooks/useErrorNotification";
import { ApiError } from "../../../../types/global";
import { getProducts } from "../../../../services/products";
import useFilters from "@/hooks/useFilters";
import { PaginatedProducts } from "@/types/products";

export default function ProductsPage() {
  const t = useTranslations("products");
  const searchParams = useSearchParams();
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const { getPreparedFiltersObject } = useFilters();

  const queryParams = {
    page: searchParams.get("page") || "",
    sort_by: searchParams.get("sort_by") || "",
    sort_dir: searchParams.get("sort_dir") || "",
    search: searchParams.get("search") || "",
    ...getPreparedFiltersObject(),
  };

  const {
    data: products,
    isLoading,
    isFetching,
    error,
    isError,
  } = useQuery<PaginatedProducts | null, ApiError>({
    queryKey: ["products", { queryParams }],
    queryFn: () => getProducts(queryParams),
    placeholderData: keepPreviousData,
    gcTime: 0,
    staleTime: 0,
  });

  useErrorNotification({
    isError,
    title: "Something went wrong",
    description: error?.message || "",
  });

  return (
    <div className="mx-auto relative py-8 px-3 lg:px-4">
      <div className="flex items-center">
        <h2 className="font-bold text-lg md:text-2xl">{t("title")}</h2>
        <Button className="ms-auto" asChild>
          <Link href={"/dashboard/products/create"}>{t("createProduct")}</Link>
        </Button>
      </div>

      <DataTable
        data={products?.data}
        pagination={products?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        selectedProductIds={selectedProductIds}
        setSelectedProductIds={setSelectedProductIds}
      />
    </div>
  );
}
