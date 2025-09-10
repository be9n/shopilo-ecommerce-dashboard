import { z } from "zod";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function useProductFormSchema(isUpdating = false) {
  const tForm = useTranslations("global.from");
  const tGlobal = useTranslations("global");

  // Create a dynamic name schema object first
  const nameFields: Record<string, z.ZodString> = {};
  const descriptionFields: Record<string, z.ZodString> = {};

  // Add validation for each locale
  routing.locales.forEach((locale) => {
    nameFields[locale] = z.string().min(1, {
      message: tForm("translatedNameRequired", { locale: tGlobal(locale) }),
    });

    descriptionFields[locale] = z.string().max(255, {
      message: tForm("maxDescriptionLength", {
        length: 255,
      }),
    });
  });

  const rules = {
    name: z.object(nameFields),
    description: z.object(descriptionFields),
    price: z.number().min(0, { message: tForm("priceRequired") }),
    category_id: z.number().min(1, { message: tForm("categoryRequired") }),
    images: isUpdating
      ? z.array(z.instanceof(File)).optional()
      : z.array(z.instanceof(File)).min(1, {
          message: tGlobal("imagesRequired"),
        }),
    active: z.boolean(),
    discount_id: z.number().nullish(),
  };

  return z.object(rules);
}

export type ProductFormValues = z.infer<
  ReturnType<typeof useProductFormSchema>
>;
