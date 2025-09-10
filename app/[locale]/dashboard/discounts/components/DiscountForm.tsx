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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { ApiError, SuccessApiResponse } from "@/types/global";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import ProductFormSkeleton from "./DiscountFormSkeleton";
import { setFormValidationErrors } from "@/lib/form-utils";
import FormButtons from "@/components/FormButtons";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  useDiscountFormSchema,
  DiscountFormValues,
} from "@/schemas/discountSchema";
import { EditDiscount } from "@/types/discounts";
import { createDiscount, updateDiscount } from "@/services/discounts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import NumberInput from "@/components/NumberInput";
import { FormSwitchField } from "@/components/FormSwitchField";

type DiscountFormProps = {
  discount?: EditDiscount | null;
  isLoading?: boolean;
};

export default function DiscountForm({
  discount,
  isLoading,
}: DiscountFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const discountFormSchema = useDiscountFormSchema();
  const tGlobal = useTranslations("global");

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    values: {
      active: discount?.active ?? true,
      name: {
        en: discount?.name.en ?? "",
        ar: discount?.name.ar ?? "",
      },
      description: {
        en: discount?.description?.en ?? "",
        ar: discount?.description?.ar ?? "",
      },
      type: discount?.type ?? "fixed",
      value: discount?.value ?? undefined,
      start_date: discount?.start_date ?? undefined,
      end_date: discount?.end_date ?? undefined,
      max_uses: discount?.max_uses ?? undefined,
      max_uses_per_user: discount?.max_uses_per_user ?? undefined,
    },
    mode: "onChange",
  });

  const {
    formState: { isSubmitting, errors },
  } = form;

  const createDiscountMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: (res: SuccessApiResponse) => handleSuccess(res),
    onError: (error: ApiError) => handleError(error),
  });

  const updateDiscountMutation = useMutation({
    mutationFn: updateDiscount,
    onSuccess: (res: SuccessApiResponse) => handleSuccess(res),
    onError: (error: ApiError) => handleError(error),
  });

  const handleSuccess = (res: SuccessApiResponse) => {
    queryClient.invalidateQueries({
      queryKey: ["discounts"],
    });

    if (discount?.id) {
      queryClient.invalidateQueries({
        queryKey: [`discount_${discount.id}`],
      });
    }

    router.push("/dashboard/discounts");
    toast.success(res.message || "Discount saved successfully!");
  };

  const handleError = (apiError: ApiError) => {
    setFormValidationErrors(form, apiError);
    toast.error("Something went wrong!", {
      description:
        apiError.message || "An error occurred while saving the discount",
    });
  };

  const onSubmit = async (data: DiscountFormValues) => {
    // console.log(data);

    try {
      if (discount) {
        await updateDiscountMutation.mutateAsync({
          data,
          discountId: discount.id,
        });
      } else {
        await createDiscountMutation.mutateAsync({ data });
      }
    } catch {}
  };

  return isLoading ? (
    <ProductFormSkeleton />
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-4 lg:col-span-2">
          <Tabs defaultValue="ar" className="w-full">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Enter decimal number"
                        decimalScale={4}
                        {...field}
                        value={field.value ? Number(field.value) : undefined}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value !== "" && isNaN(+value)) {
                            return;
                          }

                          field.onChange(+value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <FormField
                control={form.control}
                name="max_uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Max Uses"
                        defaultValue={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(+value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_uses_per_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses Per User</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Max Uses Per User"
                        defaultValue={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(+value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal cursor-pointer",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal cursor-pointer",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <FormSwitchField
                control={form.control}
                name="active"
                label="Active"
              />
            </div>
          </div>

          <FormButtons
            isSubmitting={isSubmitting}
            onCancel={() => redirect("/dashboard/discounts")}
          />
        </Card>
      </form>
    </Form>
  );
}
