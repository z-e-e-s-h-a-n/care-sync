import type { ComponentProps } from "react";
import { cn } from "../lib/utils";
import { Checkbox } from "./checkbox";
import { FormField, type BaseFieldProps } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";

type InputExtraProps =
  | {
      type?: "text" | "email" | "tel" | "url" | "password";
      inputMode?: ComponentProps<typeof Input>["inputMode"];
      autoComplete?: string;
    }
  | {
      type: "number";
      min?: number;
      max?: number;
      step?: number;
    }
  | { type: "time" }
  | {
      type: "textarea";
      rows?: number;
      maxLength?: number;
      resize?: "none" | "both" | "horizontal" | "vertical";
    }
  | { type: "checkbox" };

export type InputFieldProps<TFormData> = BaseFieldProps<TFormData> &
  InputExtraProps;

export const InputField = <TFormData,>(props: InputFieldProps<TFormData>) => {
  const { className, ...rest } = props;

  return (
    <FormField
      className={cn(
        rest.type === "checkbox" &&
          "flex-row-reverse items-center cursor-pointer",
        className,
      )}
      {...rest}
    >
      {({ isInvalid, ...field }) => {
        switch (rest.type) {
          case "textarea": {
            const { rows, maxLength, resize } = rest;

            return (
              <Textarea
                {...field}
                aria-invalid={isInvalid}
                rows={rows}
                maxLength={maxLength}
                className={cn(resize && `resize-${resize}`)}
              />
            );
          }

          case "checkbox": {
            return (
              <Checkbox
                {...field}
                aria-invalid={isInvalid}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            );
          }

          case "number": {
            const { min, max, step } = rest;

            return (
              <Input
                {...field}
                type="number"
                aria-invalid={isInvalid}
                min={min ?? 0}
                max={max}
                step={step}
                onWheel={(e) => e.currentTarget.blur()}
              />
            );
          }

          case "time": {
            return (
              <Input
                {...field}
                type="time"
                aria-invalid={isInvalid}
                className="bg-background appearance-none
        [&::-webkit-calendar-picker-indicator]:hidden
        [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            );
          }

          default: {
            const { autoComplete, inputMode } = rest;
            return (
              <Input
                {...field}
                type={rest.type || "text"}
                aria-invalid={isInvalid}
                autoComplete={autoComplete}
                inputMode={inputMode}
              />
            );
          }
        }
      }}
    </FormField>
  );
};
