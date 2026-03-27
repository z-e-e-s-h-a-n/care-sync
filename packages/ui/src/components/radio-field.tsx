"use client";

import { FieldContent, FieldDescription, FieldTitle } from "./field";
import { FormField, type BaseFieldProps } from "./form";
import { RadioGroup, RadioGroupItem } from "./radio-group";

interface RadioFieldOption {
  label: string;
  value: string;
  description?: string;
}

interface RadioFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  options: RadioFieldOption[];
  variant?: "default" | "card";
}

export const RadioField = <TFormData,>({
  options,
  variant = "default",
  ...props
}: RadioFieldProps<TFormData>) => {
  return (
    <FormField {...props}>
      {({ isInvalid, ...field }) => (
        <RadioGroup
          value={field.value ?? ""}
          onValueChange={field.onChange}
          aria-invalid={isInvalid}
          className="grid gap-3 grid-cols-3"
        >
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 rounded-md cursor-pointer border border-input p-2 bg-transparent dark:bg-input/30 dark:hover:bg-input/50"
            >
              {variant === "card" ? (
                <>
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                    <FieldDescription>{option.description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={option.value} />
                </>
              ) : (
                <>
                  <RadioGroupItem value={option.value} />
                  <span className="block text-sm font-medium">
                    {option.label}
                  </span>
                </>
              )}
            </label>
          ))}
        </RadioGroup>
      )}
    </FormField>
  );
};
