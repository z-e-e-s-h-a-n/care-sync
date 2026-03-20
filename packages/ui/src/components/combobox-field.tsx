"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";

import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { FormField, type BaseFieldProps } from "./form";
import type { ApiException } from "@workspace/sdk";
import type { BaseQueryResponse, BaseResponse } from "@workspace/contracts";

export type ComboboxOption<TData, TValue = TData[keyof TData] & string> = {
  id?: string;
  key: TValue & string;
  value: TValue;
  label: string | React.ReactNode;
  content: string | React.ReactNode;
};

export type UseEntitiesResult<TKey extends string, TData> = {
  data?: BaseQueryResponse & {
    [K in TKey]: TData[];
  };
  isFetching: boolean;
  fetchError: ApiException | null;
};

interface ComboboxFieldProps<
  TFormData,
  TData,
  TQuery,
  TKey extends string,
> extends BaseFieldProps<TFormData> {
  dataKey: TKey;
  useQuery: (args?: TQuery) => UseEntitiesResult<TKey, TData>;
  queryArgs?: TQuery;

  getOption: (item: TData) => ComboboxOption<TData>;

  disabled?: boolean;
  placeholder?: string;
  multiple?: boolean;
}

export function ComboboxField<
  TFormData,
  TData extends BaseResponse,
  TQuery,
  TKey extends string,
>({
  dataKey,
  useQuery,
  queryArgs,
  getOption,
  disabled,
  multiple = false,
  ...props
}: ComboboxFieldProps<TFormData, TData, TQuery, TKey>) {
  const [open, setOpen] = React.useState(false);

  const { data, isFetching } = useQuery(queryArgs);

  const options = React.useMemo(() => {
    if (!data) return [];
    return data[dataKey]?.map((d) => {
      const option = getOption(d);
      return { ...option, id: option.id ?? d.id };
    });
  }, [data, dataKey, getOption]);

  const optionMap = React.useMemo(() => {
    const map = new Map<string, (typeof options)[number]>();
    for (const o of options) {
      map.set(o.id, o);
    }
    return map;
  }, [options]);

  return (
    <FormField {...props}>
      {(field) => {
        const fieldValue = field.value;
        const selectedIds = multiple
          ? Array.isArray(fieldValue)
            ? fieldValue
            : []
          : [fieldValue];

        const selectedOptions = selectedIds
          .map((id) => optionMap.get(id))
          .filter(Boolean);

        const displayLabel = multiple
          ? selectedOptions.map((o) => o?.label).join(", ")
          : selectedOptions[0]?.label;

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                role="combobox"
                disabled={disabled}
                className={cn(
                  "truncate flex justify-between bg-transparent dark:bg-input/30 border border-input",
                  selectedIds.length === 0 && "text-muted-foreground",
                  open && "border-ring ring-ring/50 ring-[3px]",
                )}
              >
                <span
                  className={cn(
                    "truncate min-w-0",
                    !displayLabel && "text-muted-foreground",
                  )}
                >
                  {!displayLabel ? field.placeholder : displayLabel}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
              <Command>
                <CommandInput placeholder={field.placeholder} />
                <CommandList>
                  <CommandEmpty>
                    {isFetching ? "Loading..." : "No results found."}
                  </CommandEmpty>

                  <CommandGroup>
                    {options.map((option) => {
                      const isSelected = selectedIds.includes(option.id);
                      return (
                        <CommandItem
                          key={option.key}
                          value={option.key}
                          onSelect={() => {
                            if (multiple) {
                              let newValue;
                              if (isSelected) {
                                // remove
                                newValue = field.value.filter(
                                  (v: string) => v !== option.value,
                                );
                              } else {
                                // add
                                newValue = [
                                  ...(field.value || []),
                                  option.value,
                                ];
                              }
                              field.onChange(newValue);
                            } else {
                              field.onChange(option.value);
                              setOpen(false);
                            }
                          }}
                        >
                          {option.content}
                          {isSelected && <Check className="ml-auto size-4" />}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    </FormField>
  );
}
