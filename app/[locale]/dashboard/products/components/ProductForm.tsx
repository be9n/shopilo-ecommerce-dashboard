"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoriesList } from "@/services/categories";
import { cn } from "@/lib/utils";
import { ApiError, SuccessApiResponse } from "@/types/global";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createProduct, updateProduct } from "@/services/products";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import ProductFormSkeleton from "./ProductFormSkeleton";
import { setFormValidationErrors } from "@/lib/form-utils";
import FormButtons from "@/components/FormButtons";
import {
  useProductFormSchema,
  ProductFormValues,
} from "../../../../../schemas/productSchema";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ImageUploader from "@/components/ImageUploader";
import { CategoryListItem } from "@/types/categories";
import { EditProduct } from "@/types/products";
import { FormSwitchField } from "@/components/FormSwitchField";
import { ListDiscount } from "@/types/discounts";
import { getDiscountsList } from "@/services/discounts";

type ProductFormProps = {
  product?: EditProduct | null;
  isLoading?: boolean;
};

export default function ProductForm({ product, isLoading }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const productFormSchema = useProductFormSchema(!!product);
  const tGlobal = useTranslations("global");
  const [activeTab, setActiveTab] = useState<string>("en");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    values: {
      active: product?.active ?? true,
      name: {
        en: product?.name.en ?? "",
        ar: product?.name.ar ?? "",
      },
      description: {
        en: product?.description?.en ?? "",
        ar: product?.description?.ar ?? "",
      },
      price: product?.price ?? 0,
      category_id: product?.category_id ?? 0,
      images: [] as File[],
      discount_id: product?.discount_id ?? null,
    },
    mode: "onChange",
  });

  const {
    formState: { isSubmitting, errors },
  } = form;

  const createProductMutation = useMutation({
    mutationFn: createProduct,
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
  });

  const onSubmit = async (data: ProductFormValues) => {
    console.log(data);
    const mutationPromise = product
      ? updateProductMutation.mutateAsync({ data, productId: product.id })
      : createProductMutation.mutateAsync({ data });

    toast.promise(mutationPromise, {
      loading: product
        ? `Updating product: ${product.name.en}`
        : "Creating product...",
      success: (res: SuccessApiResponse) => {
        queryClient.invalidateQueries({
          queryKey: ["products"],
        });

        queryClient.invalidateQueries({
          queryKey: [`product_${product?.id}`],
        });

        router.push("/dashboard/products");

        return {
          message: res.message || "Product created successfully!",
        };
      },
      error: (error: ApiError) => {
        setFormValidationErrors(form, error);

        return {
          message: "Something went wrong!",
          description:
            error.message || "An error occurred while creating the product",
        };
      },
    });

    try {
      await mutationPromise;
    } catch {}
  };

  // Switch to the first tab with an error when validation fails
  useEffect(() => {
    if (errors.name) {
      // Find the first locale with an error
      const localeWithError = routing.locales.find(
        (locale) => errors.name?.[locale]
      );

      if (localeWithError) {
        setActiveTab(localeWithError);
      }
    }
  }, [errors.name]);

  return isLoading ? (
    <ProductFormSkeleton />
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-start">
          <Card className="p-4 lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-2">
                {routing.locales.map((locale) => (
                  <TabsTrigger
                    className={cn("cursor-pointer", {
                      "text-destructive": errors.name?.[locale],
                    })}
                    key={locale}
                    value={locale}
                  >
                    {tGlobal(locale)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {routing.locales.map((locale) => (
                <TabsContent key={locale} value={locale} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                    <FormField
                      control={form.control}
                      name={`name.${locale}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Product Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`description.${locale}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              className="h-20 resize-none"
                              placeholder="Product Description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value ?? 0}
                        placeholder="35$"
                        onChange={(e) => {
                          const value = e.target.value;

                          field.onChange(value == "" ? 0 : +value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CategorySelect
                form={form}
                parent_category_id={product?.parent_category_id}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DiscountSelect form={form} />

              <FormSwitchField
                control={form.control}
                name="active"
                label="Active"
              />
            </div>

            <FormButtons
              isSubmitting={isSubmitting}
              onCancel={() => redirect("/dashboard/products")}
            />
          </Card>
          <ImageUploader<ProductFormValues>
            form={form}
            uploaded={product?.images}
            inputName="images"
            multiple
          />
        </div>
      </form>
    </Form>
  );
}

const DiscountSelect = ({
  form,
}: {
  form: UseFormReturn<ProductFormValues>;
}) => {
  const { data: discountsList } = useQuery<ListDiscount[] | null>({
    queryKey: ["discounts_list"],
    queryFn: async () => getDiscountsList(),
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <FormField
      control={form.control}
      name="discount_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Discount</FormLabel>
          <Select
            value={field.value == null ? "none" : field.value.toString()}
            onValueChange={(value) => {
              console.log(value);
              field.onChange(value === "none" ? null : Number(value));
            }}
          >
            <FormControl>
              <SelectTrigger className="cursor-pointer max-w-[150px]">
                <SelectValue placeholder="Select Discount" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Select Discount</SelectItem>
              {discountsList?.map((discount) => (
                <SelectItem value={discount.id.toString()} key={discount.id}>
                  {discount.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

const CategorySelect = ({
  form,
  parent_category_id,
}: {
  form: UseFormReturn<ProductFormValues>;
  parent_category_id?: number;
}) => {
  const { data: categoriesList, isLoading } = useQuery<
    CategoryListItem[] | null,
    ApiError
  >({
    queryKey: ["select_categories_list"],
    queryFn: async () =>
      getCategoriesList({ parentCategories: 1, withChildren: 1 }),
    staleTime: 0,
    gcTime: 0,
  });
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<
    number | null
  >(parent_category_id || null);

  useEffect(() => {
    form.setValue("category_id", 0);
  }, [selectedParentCategoryId, form]);

  return (
    <div className="flex gap-4 flex-wrap">
      <ParentCategories
        categories={categoriesList || []}
        isLoading={isLoading}
        selectedParentCategoryId={selectedParentCategoryId}
        setSelectedParentCategoryId={setSelectedParentCategoryId}
      />
      <ChildCategories
        isLoading={isLoading}
        categories={
          categoriesList?.find((cat) => cat.id === selectedParentCategoryId)
            ?.children || []
        }
        form={form}
        disabled={!selectedParentCategoryId}
      />
    </div>
  );
};

const ParentCategories = ({
  isLoading,
  categories,
  selectedParentCategoryId,
  setSelectedParentCategoryId,
}: {
  isLoading?: boolean;
  categories: CategoryListItem[];
  selectedParentCategoryId: number | null;
  setSelectedParentCategoryId: (id: number | null) => void;
}) => {
  return (
    <div>
      <FormLabel className="mb-2">Parent Category</FormLabel>
      <Select
        value={selectedParentCategoryId?.toString() || "none"}
        onValueChange={(value) =>
          setSelectedParentCategoryId(value === "none" ? null : +value)
        }
      >
        <SelectTrigger className="cursor-pointer max-w-[150px]">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <SelectValue placeholder="Select Parent Category" />
          )}
        </SelectTrigger>
        <SelectContent className="w-55">
          <SelectItem className="cursor-pointer" key="clear" value="none">
            Select Parent Category
          </SelectItem>
          {isLoading ? (
            <div className="space-y-2 mt-3">
              <Skeleton className="h-7 w-full bg-gray-200" />
              <Skeleton className="h-7 w-full bg-gray-200" />
              <Skeleton className="h-7 w-full bg-gray-200" />
            </div>
          ) : (
            <>
              <div className="space-y-1 mt-1">
                {(categories || []).map((item) => (
                  <SelectItem
                    className={cn("cursor-pointer w-full", {
                      "bg-gray-100": item.id === selectedParentCategoryId,
                    })}
                    key={item.id}
                    value={item.id.toString()}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </div>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

const ChildCategories = ({
  isLoading,
  categories,
  disabled,
  form,
}: {
  isLoading?: boolean;
  categories: CategoryListItem[];
  form: UseFormReturn<ProductFormValues>;
  disabled: boolean;
}) => {
  return (
    <FormField
      control={form.control}
      name="category_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={(value) => {
              if (value) field.onChange(value === "none" ? 0 : Number(value));
            }}
            value={field.value === 0 ? "none" : field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger className="cursor-pointer max-w-[150px]">
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <SelectValue placeholder="Select Category" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent className="w-50">
              <SelectItem className="cursor-pointer" key="clear" value="none">
                Select Category
              </SelectItem>
              <div className="space-y-1 mt-1">
                {(categories || []).map((item) => (
                  <SelectItem
                    className={cn("cursor-pointer w-full", {
                      "bg-gray-100": item.id === field.value,
                    })}
                    key={item.id}
                    value={item.id.toString()}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
