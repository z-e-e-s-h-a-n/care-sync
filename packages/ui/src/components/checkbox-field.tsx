"use client";

import { Checkbox } from "./checkbox";
import { FieldContent, FieldDescription, FieldTitle } from "./field";
import { FormField, type BaseFieldProps } from "./form";
import { cn } from "../lib/utils";
import { Label } from "./label";

interface CheckboxFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  variant?: "card" | "inline";
}

export const CheckboxField = <TFormData,>({
  label,
  desc,
  className,
  variant = "card",
  ...props
}: CheckboxFieldProps<TFormData>) => {
  return (
    <FormField
      {...props}
      className={cn(
        variant === "card" &&
          "rounded-md border border-input p-4 bg-transparent dark:bg-input/30 dark:hover:bg-input/50",
        className,
      )}
    >
      {({ isInvalid, value, onChange, ...field }) => (
        <Label
          className={cn(
            "flex cursor-pointer items-start gap-3",
            variant === "inline" && "items-center",
            variant === "card" && "justify-between",
          )}
        >
          {variant === "card" ? (
            <>
              <Checkbox
                {...field}
                checked={!!value}
                onCheckedChange={onChange}
                aria-invalid={isInvalid}
              />

              <FieldContent>
                {label && <FieldTitle>{label}</FieldTitle>}
                {desc && (
                  <FieldDescription className="max-w-10/12">
                    {desc}
                  </FieldDescription>
                )}
              </FieldContent>
            </>
          ) : (
            <>
              <Checkbox
                {...field}
                checked={!!value}
                onCheckedChange={onChange}
                aria-invalid={isInvalid}
              />

              <div className="space-y-1">
                {label && <span className="text-sm font-medium">{label}</span>}
                {desc && (
                  <p className="text-sm text-muted-foreground">{desc}</p>
                )}
              </div>
            </>
          )}
        </Label>
      )}
    </FormField>
  );
};
