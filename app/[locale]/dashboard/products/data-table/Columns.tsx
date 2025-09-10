import { ApiError, TableColumn } from "@/types/global";
import { SortableColumn } from "@/components/SortableColumn";
import SelectRow from "@/components/SelectRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { deleteProduct, updateProductActive } from "@/services/products";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MUTATION_CACHE_UPDATE_DELAY } from "@/constants/timing";
import DeleteDialog from "@/components/DeleteDialog";
import ToggleActive from "@/components/ToggleActive";
import { PaginatedProducts, Product } from "@/types/products";

// Custom hook to get translated columns
export function useColumns(
  selectedProductIds: number[],
  setSelectedProductIds: React.Dispatch<React.SetStateAction<number[]>>,
  allProductIds?: number[]
) {
  const t = useTranslations("products.columns");
  const tGlobal = useTranslations("global");
  const queryClient = useQueryClient();

  const columns: TableColumn<Product>[] = [
    {
      canBeInvisible: false,
      id: "select",
      header: (
        <SelectRow
          selectAll={true}
          allRowIds={allProductIds}
          selectedRowIds={selectedProductIds}
          setSelectedRowIds={setSelectedProductIds}
        />
      ),
      className: "w-8",
      cell: (product: Product) => (
        <SelectRow
          rowId={product.id}
          selectedRowIds={selectedProductIds}
          setSelectedRowIds={setSelectedProductIds}
        />
      ),
    },
    {
      id: "id",
      title: t("id"),
      header: <SortableColumn columnKey="id" title={t("id")} />,
      cell: (product: Product) => product.id,
    },
    {
      canBeInvisible: true,
      id: "name",
      title: t("name"),
      header: <SortableColumn columnKey="name" title={t("name")} />,
      cell: (product: Product) => product.name,
    },
    {
      canBeInvisible: true,
      id: "price",
      title: t("price"),
      header: <SortableColumn columnKey="price" title={t("price")} />,
      cell: (product: Product) => {
        const amount = parseFloat(product.price.toString());
        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return formattedPrice;
      },
    },
    {
      canBeInvisible: true,
      id: "discount_price",
      title: t("discountPrice"),
      header: <SortableColumn columnKey="discount_price" title={t("discountPrice")} />,
      cell: (product: Product) => {
        if(!product.discount_price) return null

        const amount = parseFloat(product.discount_price.toString());
        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return formattedPrice;
      },
    },
    {
      canBeInvisible: true,
      id: "discount_id",
      title: tGlobal("discount_name"),
      header: <SortableColumn columnKey="discount_id" title={tGlobal("discount_name")} />,
      cell: (product: Product) => product.discount_name,
    },
    {
      canBeInvisible: true,
      id: "category_name",
      title: t("categoryName"),
      header: t("categoryName"),
      cell: (product: Product) => product.category_name,
    },
    {
      canBeInvisible: true,
      id: "active",
      title: tGlobal("active"),
      header: tGlobal("active"),
      cell: (product: Product) => {
        return (
          <ToggleActive
            defaultChecked={product.active}
            onChange={async (active: boolean) => {
              await updateProductActive({
                productId: product.id,
                active,
              });

              queryClient.invalidateQueries({
                queryKey: ["products"],
              });
            }}
          />
        );
      },
    },
    {
      canBeInvisible: false,
      id: "actions",
      header: t("actions"),
      cell: (product: Product) => {
        return <ActionsMenu product={product} />;
      },
    },
  ];

  return columns;
}

const ActionsMenu = ({ product }: { product: Product }) => {
  const t = useTranslations("products.columns");
  const menuT = useTranslations("products.menu");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-200"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href={`/dashboard/products/${product.id}/edit`}>
            {menuT("editProduct")}
          </Link>
        </DropdownMenuItem>
        <DeleteProductAction product={product} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DeleteProductAction = ({ product }: { product: Product }) => {
  const menuT = useTranslations("products.menu");
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (res) => {
      setTimeout(() => {
        queryClient.setQueriesData(
          { queryKey: ["products"] },
          (old: PaginatedProducts) => ({
            ...old,
            data: old.data.filter((p: Product) => p.id !== product.id),
          })
        );
      }, MUTATION_CACHE_UPDATE_DELAY);

      toast.success(res.message || "Deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Something went wrong while deleting");
    },
  });

  return (
    <DeleteDialog action={() => deleteMutation.mutateAsync(product.id)}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        className="cursor-pointer"
        variant="destructive"
      >
        {menuT("delete")}
      </DropdownMenuItem>
    </DeleteDialog>
  );
};
