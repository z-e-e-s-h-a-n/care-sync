"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { ProductStatusEnum, type BaseCUFormProps } from "@workspace/contracts";
import {
  createProductSchema,
  type CreateProductType,
} from "@workspace/contracts/product";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";
import { SwitchField } from "@workspace/ui/components/switch-field";

import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import { useProduct, useSaveProduct, useCategoryList } from "@/hooks/product";

const ProductForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const { data, isLoading } = useProduct(entityId);
  const { saveProduct, isPending } = useSaveProduct(entityId);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      compareAtPrice: null,
      stockCount: 0,
      requiresShipping: true,
      status: "draft",
      categoryId: null,
    } as CreateProductType,
    validators: {
      onSubmit: createProductSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await saveProduct(value);
        toast.success(
          `Product ${formType === "add" ? "created" : "updated"} successfully.`,
        );
        router.push("/admin/products");
      } catch (error: any) {
        toast.error("Failed to save product", {
          description: error?.message,
        });
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
          {formType === "add" ? "Add Product" : "Update Product"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Fill in the product details, pricing, and inventory information.
        </p>
      </div>

      <FormSection
        title="Basic Information"
        description="Product name, slug, and category."
      >
        <InputField
          form={form}
          name="name"
          label="Product Name"
          placeholder="e.g. Vitamin D3 Supplement"
        />
        <InputField
          form={form}
          name="slug"
          label="Slug"
          placeholder="e.g. vitamin-d3-supplement"
        />
        <ComboboxField
          form={form}
          name="categoryId"
          label="Category"
          placeholder="Choose a category"
          dataKey="categories"
          useQuery={useCategoryList}
          queryArgs={{
            page: 1,
            limit: 100,
            sortBy: "name",
            sortOrder: "asc",
            searchBy: "name",
            isActive: true,
          }}
          getOption={(cat) => ({
            key: cat.id,
            value: cat.id,
            label: cat.name,
            content: (
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{cat.name}</span>
                {cat.description && (
                  <span className="text-xs text-muted-foreground">
                    {cat.description}
                  </span>
                )}
              </div>
            ),
          })}
        />
        <InputField
          form={form}
          name="description"
          label="Description"
          type="textarea"
          rows={4}
          className="md:col-span-2"
          placeholder="Describe the product."
        />
      </FormSection>

      <FormSection
        title="Pricing & Inventory"
        description="Set price, compare-at price, and stock level."
      >
        <InputField
          form={form}
          name="price"
          label="Price ($)"
          type="number"
          placeholder="0.00"
        />
        <InputField
          form={form}
          name="compareAtPrice"
          label="Compare-at Price ($)"
          type="number"
          placeholder="0.00"
        />
        <InputField
          form={form}
          name="stockCount"
          label="Stock Count"
          type="number"
          placeholder="0"
        />
        <SelectField
          form={form}
          name="status"
          label="Status"
          placeholder="Select status"
          options={ProductStatusEnum.options}
        />
      </FormSection>

      <FormSection
        title="Settings"
        description="Shipping and visibility options."
      >
        <SwitchField
          form={form}
          name="requiresShipping"
          label="Requires Shipping"
          desc="Enable if this product needs to be physically shipped."
          className="md:col-span-2"
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
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
                  ? "Create Product"
                  : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default ProductForm;
