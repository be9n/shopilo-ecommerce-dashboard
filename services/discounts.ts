import { serialize } from "object-to-formdata";
import authAxios from "../lib/authAxios";
import { SuccessApiResponse, QueryParams } from "../types/global";
import { EditDiscount, ListDiscount, PaginatedDiscounts } from "@/types/discounts";
import { DiscountFormValues } from "@/schemas/discountSchema";

export const getDiscounts = async (
  params?: QueryParams
): Promise<PaginatedDiscounts | null> => {
  const { data: response } = await authAxios.get(`/discounts`, {
    params,
  });

  return response.data.discounts;
};

export const getDiscountsList = async (): Promise<ListDiscount[] | null> => {
  const { data: response } = await authAxios.get(`/discounts/list`);
  
  return response.data.discounts;
};

export const getDiscount = async (
  discountId: string
): Promise<EditDiscount | null> => {
  const { data: response } = await authAxios.get(`/discounts/${discountId}`);

  return response.data.discount;
};

export const createDiscount = async ({
  data,
}: {
  data: DiscountFormValues;
}): Promise<SuccessApiResponse> => {
  const formData = serialize(data);
  const { data: response } = await authAxios.post("/discounts", formData);

  return response;
};

export const updateDiscount = async ({
  data,
  discountId,
}: {
  data: DiscountFormValues;
  discountId: number;
}): Promise<SuccessApiResponse> => {
  const formData = serialize(data);

  formData.append("_method", "PUT");

  const { data: response } = await authAxios.post(
    `/discounts/${discountId}`,
    formData
  );

  return response;
};

export const deleteDiscount = async (
  discountId: number
): Promise<SuccessApiResponse> => {
  const { data: response } = await authAxios.delete(`/discounts/${discountId}`);

  return response;
};

export const updateDiscountActive = async ({
  discountId,
  active,
}: {
  discountId: number;
  active: boolean;
}): Promise<SuccessApiResponse> => {
  const { data: response } = await authAxios.post(
    `/discounts/${discountId}/change_active`,
    { active }
  );

  return response;
};
