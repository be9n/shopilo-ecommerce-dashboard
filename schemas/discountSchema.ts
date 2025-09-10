import { z } from "zod";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function useDiscountFormSchema() {

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
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(5).optional(),
    active: z.boolean(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    max_uses: z.number().optional(),
    max_uses_per_user: z.number().optional(),
  };

  return z.object(rules);
}

export type DiscountFormValues = z.infer<
  ReturnType<typeof useDiscountFormSchema>
>;
