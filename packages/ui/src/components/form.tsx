import { cn } from "../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./field";

import type {
  DeepKeys,
  DeepValue,
  FieldValidators,
  FieldValidateOrFn,
  FieldAsyncValidateOrFn,
  ReactFormExtendedApi,
  FieldListeners,
} from "@tanstack/react-form";

export type AnyFormApi<TFormData> = ReactFormExtendedApi<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

type FieldValidatorsFor<
  TFormData,
  TName extends DeepKeys<TFormData>,
> = FieldValidators<
  TFormData,
  TName,
  DeepValue<TFormData, TName>,
  FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>,
  FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>>
>;

interface FormProps<TFormData> {
  id?: string;
  form: AnyFormApi<TFormData>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export interface BaseFieldProps<
  TFormData,
  TName extends DeepKeys<TFormData> = DeepKeys<TFormData>,
> {
  name: TName & string;
  desc?: string;
  label?: string | React.ReactNode;
  placeholder?: string;
  className?: string;
  form: AnyFormApi<TFormData>;
  disabled?: boolean;
  validators?: FieldValidatorsFor<TFormData, TName>;
  listeners?: FieldListeners<TFormData, TName, DeepValue<TFormData, TName>>;
  handleChange?: (
    value: DeepValue<TFormData, TName>,
    commit: (value: DeepValue<TFormData, TName>) => void,
  ) => void | Promise<void>;
}

export interface FieldChildrenProps<TFormData> {
  name: DeepKeys<TFormData> & string;
  value: any;
  placeholder?: string;
  onBlur: () => void;
  onChange: (e: any) => void;
  isInvalid: boolean;
  disabled?: boolean;
}

export interface FormFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  children: (fieldProps: FieldChildrenProps<TFormData>) => React.ReactNode;
}

export const Form = <TFormData,>({
  id,
  form,
  header,
  footer,
  children,
  className,
}: FormProps<TFormData>) => {
  return (
    <section id={id} className={cn("py-12", className)}>
      {header}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}
        autoComplete="off"
      >
        <FieldGroup className={className}>{children}</FieldGroup>
      </form>
      {footer}
    </section>
  );
};

export const FormSection = ({
  title,
  description,
  children,
}: FormSectionProps) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
  </Card>
);

export const FormField = <TFormData,>({
  name,
  desc,
  label,
  placeholder,
  form,
  className,
  children,
  validators,
  disabled,
  listeners,
  handleChange,
}: FormFieldProps<TFormData> & {
  listeners?: any;
}) => {
  if (!placeholder && typeof label === "string") placeholder = label;

  return (
    <form.Field name={name} validators={validators} listeners={listeners}>
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        const fieldProps = {
          name: field.name,
          placeholder,
          value: field.state.value,
          onBlur: field.handleBlur,
          onChange: async (e: any) => {
            const value = e?.target?.value ?? e;

            if (handleChange) {
              await handleChange(value, field.handleChange);
              return;
            }

            field.handleChange(value);
          },
          isInvalid,
          disabled,
        };

        return (
          <Field data-invalid={isInvalid} className={className}>
            {label && (
              <FieldLabel
                className="w-full flex items-center gap-2"
                htmlFor={field.name}
              >
                {label}
              </FieldLabel>
            )}
            {children(fieldProps)}
            {desc && <FieldDescription>{desc}</FieldDescription>}
            {isInvalid && <FieldError errors={[field.state.meta.errors[0]]} />}
          </Field>
        );
      }}
    </form.Field>
  );
};
