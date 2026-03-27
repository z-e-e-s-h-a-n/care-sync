"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm, type FormValidateOrFn } from "@tanstack/react-form";
import type {
  ArrayItem,
  BaseCUFormProps,
  FormSectionType,
} from "@workspace/contracts";

import type { ApiException } from "@workspace/sdk";
import { getBackPath } from "@workspace/ui/lib/utils";
import { Form, type AnyFormApi } from "@workspace/ui/components/form";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import GenericArrayField, { type ArrayFormItem } from "./GenericArrayField";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";

interface UseQueryResult<TData, TFormData> {
  data?: TData;
  isLoading?: boolean;
  fetchError: ApiException | null;
  mutateAsync: (data: TFormData) => Promise<TData>;
  isPending: boolean;
  mutateError: ApiException | null;
}

interface GenericFormProps<TData, TFormData> extends BaseCUFormProps {
  entityName: string;
  defaultValues: Partial<TFormData>;
  schema: FormValidateOrFn<TFormData>;
  title?: string;
  description?: string;
  submitLabel?: string;
  mapDataToValues?: (data: TData) => TFormData;
  children?: (
    form: AnyFormApi<TFormData>,
    formType: FormSectionType,
    data?: TData,
  ) => React.ReactNode;
  useQuery: (...args: string[]) => UseQueryResult<TData, TFormData>;
  formHeader?: (
    form: AnyFormApi<TFormData>,
    formType: FormSectionType,
    data?: TData,
  ) => React.ReactNode;
  arrayFields?: {
    [K in keyof TFormData]: TFormData[K] extends readonly any[]
      ? {
          name: K & string;
          component: ArrayFormItem<ArrayItem<TFormData[K]>>;
          columns: ColumnConfig<ArrayItem<TFormData[K]>>[];
        }
      : never;
  }[keyof TFormData];
}

export function GenericForm<
  TData extends Record<string, any>,
  TFormData extends Record<string, any>,
>({
  entityId,
  entityName,
  title,
  description,
  submitLabel,
  mapDataToValues,
  formType,
  children,
  defaultValues,
  schema,
  useQuery,
  formHeader,
  arrayFields,
}: GenericFormProps<TData, TFormData>) {
  const router = useRouter();
  const pathname = usePathname();
  const listPath = getBackPath(pathname, formType === "add" ? 1 : 2);
  const { data, mutateAsync, isLoading, isPending } = useQuery(entityId!);
  const [isFormReady, setIsFormReady] = useState(!entityId);

  const form = useForm({
    defaultValues: entityId ? undefined : (defaultValues as TFormData),
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(value);
        toast.success(
          `${entityName} ${entityId ? "updated" : "created"} successfully!`,
        );
        form.reset();
        router.push(listPath);
      } catch (err: any) {
        toast.error(err?.message ?? "Something went wrong.");
      }
    },
  });

  useEffect(() => {
    if (data && !isFormReady) {
      form.reset(
        mapDataToValues
          ? mapDataToValues(data)
          : (data as unknown as TFormData),
      );
      setIsFormReady(true);
    }
  }, [data, form, isFormReady, mapDataToValues]);

  if (isLoading || !isFormReady) return <CUFormSkeleton />;

  return (
    <Form
      form={form}
      header={
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold mb-3">
              {title ??
                `${formType === "add" ? "Add New" : "Update"} ${entityName}`}
            </h2>
          </div>

          {description ? (
            <p className="text-muted-foreground">{description}</p>
          ) : null}
        </div>
      }
    >
      {formHeader && formHeader(form, formType, data)}

      {arrayFields && (
        <GenericArrayField
          form={form}
          name={arrayFields.name}
          FormItem={arrayFields.component}
          columns={arrayFields.columns}
        />
      )}

      {children?.(form, formType)}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(listPath)}
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
          })}
        >
          {({ canSubmit }) => (
            <Button
              type="submit"
              size="lg"
              className="capitalize"
              disabled={isPending || !canSubmit}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                (submitLabel ?? `${formType} ${entityName}`)
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
}
