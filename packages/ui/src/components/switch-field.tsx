import { type BaseFieldProps, FormField } from "./form";
import { Switch } from "./switch";
import { cn } from "../lib/utils";

interface SwitchFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  options?: string[];
}

export const SwitchField = <TFormData,>(props: SwitchFieldProps<TFormData>) => {
  const { label, desc, className, ...rest } = props;

  return (
    <FormField
      {...rest}
      className={cn(
        "rounded-md border border-input p-4 bg-transparent dark:bg-input/30 dark:hover:bg-input/50",
        className,
      )}
    >
      {({ isInvalid, onChange, ...field }) => (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {label && <p className="font-medium leading-none">{label}</p>}
            {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
          </div>
          <Switch
            {...field}
            onCheckedChange={onChange}
            checked={field.value}
            aria-invalid={isInvalid}
            className="mt-0.5"
          />
        </div>
      )}
    </FormField>
  );
};
