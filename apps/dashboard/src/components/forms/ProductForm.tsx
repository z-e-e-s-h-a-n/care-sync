"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { ProductStatusEnum, type BaseCUFormProps } from "@workspace/contracts";
import {
  createProductSchema,
  type CreateProductType,
} from "@workspace/contracts/product";
import type { MediaResponse } from "@workspace/contracts/media";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";
import { SwitchField } from "@workspace/ui/components/switch-field";
import { useMediaLibrary } from "@workspace/ui/hooks/use-media";

import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import { useProduct, useSaveProduct, useCategoryList } from "@/hooks/product";

const ProductForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const { data, isLoading } = useProduct(entityId);
  const { saveProduct, isPending } = useSaveProduct(entityId);
  const { onMediaSelect } = useMediaLibrary();
  const [selectedImages, setSelectedImages] = useState<MediaResponse[]>([]);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      stockCount: 0,
      requiresShipping: true,
      status: "draft",
      imageIds: [],
      costPrice: 0,
      sellPrice: 0,
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
        router.push("/products");
      } catch (error: any) {
        toast.error("Failed to save product", {
          description: error?.message,
        });
      }
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      ...data,
      imageIds: data.images?.map((image) => image.id) ?? [],
    });
    setSelectedImages(data.images ?? []);
  }, [data, form]);

  const addImage = () => {
    onMediaSelect((media) => {
      setSelectedImages((prev) => {
        if (prev.some((image) => image.id === media.id)) return prev;
        const next = [...prev, media];
        form.setFieldValue(
          "imageIds",
          next.map((image) => image.id),
        );
        return next;
      });
    });
  };

  const removeImage = (mediaId: string) => {
    setSelectedImages((prev) => {
      const next = prev.filter((image) => image.id !== mediaId);
      form.setFieldValue(
        "imageIds",
        next.map((image) => image.id),
      );
      return next;
    });
  };

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
        description="Set sell price, cost price, compare-at price, and stock level."
      >
        <InputField
          form={form}
          name="sellPrice"
          label="Price ($)"
          type="number"
          placeholder="0.00"
        />
        <InputField
          form={form}
          name="costPrice"
          label="Cost Price ($)"
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

      <FormSection
        title="Product Media"
        description="Select product images from the media library. Uploads still go through the shared media module."
      >
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Images</p>
              <p className="text-sm text-muted-foreground">
                Choose one or more media items to display for this product.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addImage}>
              <ImagePlus className="mr-2 size-4" />
              Add Image
            </Button>
          </div>

          {selectedImages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {selectedImages.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-xl border bg-background"
                >
                  <div className="relative aspect-4/3 bg-muted">
                    <Image
                      src={image.url}
                      alt={image.altText || image.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {image.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {image.altText || image.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(image.id)}
                      aria-label={`Remove ${image.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No images selected yet. Use the media library to upload or choose
              product images.
            </div>
          )}
        </div>
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/products")}
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
