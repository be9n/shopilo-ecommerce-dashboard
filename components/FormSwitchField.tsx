"use client";

import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormSwitchFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  className?: string;
  switchClassName?: string;
  disabled?: boolean;
}

export function FormSwitchField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ control, name, label = "Active", className, switchClassName, disabled }: FormSwitchFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Switch
              className={cn("cursor-pointer data-[state=checked]:bg-green-500", switchClassName)}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


