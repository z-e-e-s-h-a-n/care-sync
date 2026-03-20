import React from "react";
import { type BaseFieldProps, FormField } from "./form";
import { Switch } from "./switch";

interface SwitchFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  options?: string[];
}

export const SwitchField = <TFormData,>(props: SwitchFieldProps<TFormData>) => {
  return (
    <FormField {...props} className="flex-row-reverse items-center">
      {({ isInvalid, ...field }) => (
        <Switch
          {...field}
          checked={field.value}
          aria-invalid={isInvalid}
          className="size-4!"
        />
      )}
    </FormField>
  );
};
