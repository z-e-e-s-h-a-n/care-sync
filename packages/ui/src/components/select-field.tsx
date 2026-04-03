import { FormField, type BaseFieldProps } from "./form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "./combobox";
import React from "react";

interface SelectOptions {
  label: string;
  value: string;
}

interface MultiSelectFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  options: SelectOptions[];
}

export function MultiSelectField<TFormData>({
  options,
  ...props
}: MultiSelectFieldProps<TFormData>) {
  const items = React.useMemo(() => options.map((o) => o.value), [options]);

  const labelMap = React.useMemo(
    () => Object.fromEntries(options.map((o) => [o.value, o.label])),
    [options],
  );

  return (
    <FormField {...props}>
      {({ isInvalid, ...field }) => (
        <Combobox
          name={field.name}
          multiple
          autoHighlight
          items={items}
          value={field.value}
          onValueChange={field.onChange}
          disabled={field.disabled}
        >
          <ComboboxChips>
            <ComboboxValue>
              {field.value.map((v: string) => (
                <ComboboxChip key={v}>{labelMap[v]}</ComboboxChip>
              ))}
            </ComboboxValue>

            <ComboboxChipsInput
              placeholder={field.placeholder}
              aria-invalid={isInvalid}
            />
          </ComboboxChips>

          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(value) => (
                <ComboboxItem key={value} value={value}>
                  {labelMap[value]}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </FormField>
  );
}

interface SelectFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  options: string[] | SelectOptions[];
  multiple?: boolean;
}

export const SelectField = <TFormData,>({
  options,
  disabled,
  multiple,
  ...props
}: SelectFieldProps<TFormData>) => {
  const normalizedOptions = React.useMemo<SelectOptions[]>(
    () =>
      options.map((option) =>
        typeof option === "string" ? { label: option, value: option } : option,
      ),
    [options],
  );

  return (
    <FormField {...props}>
      {({ isInvalid, ...field }) => {
        const value = field.value ?? (multiple ? [] : "");

        const handleChange = (v: string) => {
          if (!multiple) {
            field.onChange(v);
            return;
          }

          const arr = Array.isArray(value) ? value : [];

          field.onChange(
            arr.includes(v) ? arr.filter((i) => i !== v) : [...arr, v],
          );
        };

        const displayValue = multiple
          ? Array.isArray(value) && value.length
            ? normalizedOptions
                .filter((option) => value.includes(option.value))
                .map((option) => option.label)
                .join(", ")
            : undefined
          : (normalizedOptions.find((option) => option.value === value)
              ?.label ?? value);

        return (
          <Select
            name={field.name}
            value={multiple ? undefined : value}
            onValueChange={handleChange}
            disabled={disabled ?? field.disabled}
          >
            <SelectTrigger
              id={field.name}
              aria-invalid={isInvalid}
              className="w-full capitalize"
            >
              <SelectValue placeholder={field.placeholder}>
                {displayValue?.length ? displayValue : field.placeholder}
              </SelectValue>
            </SelectTrigger>

            <SelectContent position="popper">
              {normalizedOptions.map((option) => {
                const checked =
                  multiple &&
                  Array.isArray(value) &&
                  value.includes(option.value);

                return (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      multiple &&
                        "flex items-center justify-between capitalize",
                    )}
                    onSelect={() => {
                      if (multiple) {
                        handleChange(option.value);
                      }
                    }}
                  >
                    <span>{option.label}</span>

                    {multiple && checked && (
                      <Check className="size-4 text-primary" />
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      }}
    </FormField>
  );
};
