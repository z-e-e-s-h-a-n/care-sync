import React from "react";
import { FormField, type BaseFieldProps } from "./form";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";

export interface DatePickerFieldProps<
  TFormData,
> extends BaseFieldProps<TFormData> {
  disableBefore?: string;
  mode?: "date" | "range" | "time";
}

export const DatePickerField = <TFormData,>({
  // mode,
  disabled,
  disableBefore,
  ...props
}: DatePickerFieldProps<TFormData>) => {
  const [open, setOpen] = React.useState(false);
  return (
    <FormField {...props}>
      {({ isInvalid, ...field }) => {
        const dateValue = field.value ? new Date(field.value) : undefined;
        const disableDate = disableBefore ? new Date(disableBefore) : undefined;

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between bg-transparent dark:bg-input/30 dark:hover:bg-input/50",
                  (field.value ?? "") === "" && "text-muted-foreground!",
                )}
                id={field.name}
                aria-invalid={isInvalid}
              >
                {dateValue?.toLocaleDateString() || field.placeholder}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                defaultMonth={disableDate ?? dateValue}
                showOutsideDays={false}
                onSelect={(date) => {
                  if (!date) {
                    field.onChange(undefined);
                    setOpen(false);
                    return;
                  }

                  const nextDate = new Date(date);
                  nextDate.setHours(12, 0, 0, 0);
                  field.onChange(nextDate.toISOString());
                  setOpen(false);
                }}
                disabled={disableDate ? { before: disableDate } : undefined}
              />
            </PopoverContent>
          </Popover>
        );
      }}
    </FormField>
  );
};
