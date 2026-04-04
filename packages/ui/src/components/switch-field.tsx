import { type BaseFieldProps, FormField } from "./form";
import { Switch } from "./switch";
import { cn } from "../lib/utils";

interface SwitchFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  variant?: "card" | "inline";
}

export const SwitchField = <TFormData,>({
  label,
  desc,
  className,
  variant = "card",
  ...rest
}: SwitchFieldProps<TFormData>) => {
  return (
    <FormField
      {...rest}
      className={cn(
        variant === "card" &&
          "rounded-md border border-input p-4 bg-transparent dark:bg-input/30 dark:hover:bg-input/50",
        className,
      )}
    >
      {({ isInvalid, onChange, ...field }) => (
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            variant === "inline" && "rounded-md",
          )}
        >
          {(label || desc) && (
            <div className="space-y-1">
              {label && <p className="font-medium leading-none">{label}</p>}
              {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
            </div>
          )}

          <Switch
            {...field}
            checked={!!field.value}
            onCheckedChange={onChange}
            aria-invalid={isInvalid}
            className="mt-0.5"
          />
        </div>
      )}
    </FormField>
  );
};
