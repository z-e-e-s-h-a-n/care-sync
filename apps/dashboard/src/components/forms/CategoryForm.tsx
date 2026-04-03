"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import type { BaseCUFormProps } from "@workspace/contracts";
import {
  createCategorySchema,
  type CreateCategoryType,
} from "@workspace/contracts/product";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { SwitchField } from "@workspace/ui/components/switch-field";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import { useCategory, useSaveCategory, useCategoryList } from "@/hooks/product";

const CategoryForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const { data, isLoading } = useCategory(entityId);
  const { saveCategory, isPending } = useSaveCategory(entityId);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: null,
      isActive: true,
    } as CreateCategoryType,
    validators: { onSubmit: createCategorySchema },
    onSubmit: async ({ value }) => {
      try {
        await saveCategory(value);
        toast.success(
          `Category ${formType === "add" ? "created" : "updated"} successfully.`,
        );
        router.push("/categories");
      } catch (error: any) {
        toast.error("Failed to save category", { description: error?.message });
      }
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset(data);
  }, [data, form]);

  if (isLoading) return <CUFormSkeleton />;

  return (
    <Form form={form}>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {formType === "add" ? "Add Category" : "Update Category"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Fill in the category details below.
        </p>
      </div>

      <FormSection
        title="Category Details"
        description="Name, slug, parent category, and description."
      >
        <InputField
          form={form}
          name="name"
          label="Category Name"
          placeholder="e.g. Supplements"
        />
        <InputField
          form={form}
          name="slug"
          label="Slug"
          placeholder="e.g. supplements"
        />
        <ComboboxField
          form={form}
          name="parentId"
          label="Parent Category"
          placeholder="None (top-level)"
          dataKey="categories"
          useQuery={useCategoryList}
          queryArgs={{
            page: 1,
            limit: 100,
            sortBy: "name",
            sortOrder: "asc",
            searchBy: "name",
          }}
          getOption={(cat) => ({
            key: cat.id,
            value: cat.id,
            label: cat.name,
            content: (
              <span className="font-medium text-sm">{cat.name}</span>
            ),
          })}
        />
        <InputField
          form={form}
          name="description"
          label="Description"
          type="textarea"
          rows={3}
          className="md:col-span-2"
          placeholder="Optional description for this category."
        />
        <SwitchField
          form={form}
          name="isActive"
          label="Active"
          desc="Inactive categories are hidden from the shop."
          className="md:col-span-2"
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/categories")}
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending
                ? "Saving..."
                : formType === "add"
                  ? "Create Category"
                  : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default CategoryForm;
