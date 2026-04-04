"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  type CreateManualOrderType,
  createManualOrderSchema,
} from "@workspace/contracts/order";
import { formatPrice } from "@workspace/shared/utils";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Form, FormField, FormSection } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { InputField } from "@workspace/ui/components/input-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import SectionCard from "@workspace/ui/shared/SectionCard";

import PageIntro from "@/components/dashboard/PageIntro";
import { useCreateOrder } from "@/hooks/order";
import { usePatients } from "@/hooks/patient";
import { useProductList } from "@/hooks/product";

const OrderForm = () => {
  const router = useRouter();
  const { createOrder, isPending } = useCreateOrder();
  const { data: patientsData } = usePatients({
    page: 1,
    limit: 100,
    sortBy: "displayName",
    sortOrder: "asc",
    searchBy: "displayName",
  });
  const { data: productsData, isLoading: isProductsLoading } = useProductList({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    searchBy: "name",
    status: "active",
  });

  const form = useForm({
    defaultValues: {
      patientId: "",
      deliveryType: "delivery",
      shippingName: "",
      shippingPhone: "",
      shippingStreet: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingCountry: "",
      notes: "",
      items: [{ productId: "", quantity: 1 }],
    } as CreateManualOrderType,
    validators: {
      onSubmit: createManualOrderSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await createOrder(value);
        toast.success("Order created successfully.");
        router.push(`/orders/${response.data.id}`);
      } catch (error: any) {
        toast.error("Failed to create order", {
          description: error?.message,
        });
      }
    },
  });

  const patientId = useStore(form.store, (state) => state.values.patientId);
  const deliveryType = useStore(
    form.store,
    (state) => state.values.deliveryType,
  );
  const items = useStore(form.store, (state) => state.values.items);

  const patients = patientsData?.patients ?? [];
  const products = productsData?.products ?? [];

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId),
    [patientId, patients],
  );

  useEffect(() => {
    if (!selectedPatient) return;

    form.setFieldValue(
      "shippingName",
      selectedPatient.user.displayName ?? "",
    );
    form.setFieldValue("shippingPhone", selectedPatient.user.phone ?? "");
  }, [form, selectedPatient]);

  const subtotal = useMemo(
    () =>
      (items ?? []).reduce((sum, item) => {
        const product = productMap.get(item.productId);
        if (!product) return sum;
        return sum + Number(product.sellPrice) * item.quantity;
      }, 0),
    [items, productMap],
  );

  const setItems = (nextItems: CreateManualOrderType["items"]) => {
    form.setFieldValue("items", nextItems);
  };

  const addItem = () => {
    setItems([...(items ?? []), { productId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const nextItems = (items ?? []).filter((_, itemIndex) => itemIndex !== index);
    setItems(nextItems.length ? nextItems : [{ productId: "", quantity: 1 }]);
  };

  const updateItem = (
    index: number,
    patch: Partial<CreateManualOrderType["items"][number]>,
  ) => {
    setItems(
      (items ?? []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <Form
        form={form}
        header={
          <PageIntro
            title="Create Order"
            description="Create a manual order for a patient and build the line items before checkout."
          />
        }
      >
        <FormSection
          title="Patient"
          description="Choose the patient account that this order belongs to."
        >
          <ComboboxField
            form={form}
            name="patientId"
            label="Patient"
            placeholder="Choose a patient"
            dataKey="patients"
            useQuery={usePatients}
            queryArgs={{
              page: 1,
              limit: 100,
              sortBy: "displayName",
              sortOrder: "asc",
              searchBy: "displayName",
            }}
            getOption={(patient) => ({
              key: patient.id,
              value: patient.id,
              label: patient.user.displayName ?? patient.id,
              content: (
                <div className="flex flex-col">
                  <span className="font-medium">
                    {patient.user.displayName ?? patient.id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {patient.user.email ?? patient.user.phone ?? "No contact"}
                  </span>
                </div>
              ),
            })}
          />
        </FormSection>

        <FormSection
          title="Order Items"
          description="Select active products and set the quantity for each line item."
          className="md:grid-cols-1"
        >
          <div className="space-y-4">
            {(items ?? []).map((item, index) => {
              const selectedProduct = productMap.get(item.productId);

              return (
                <div
                  key={`${item.productId}-${index}`}
                  className="grid gap-4 rounded-xl border border-border/60 p-4 md:grid-cols-[minmax(0,1fr)_140px_auto]"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product</label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) =>
                        updateItem(index, { productId: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isProductsLoading
                              ? "Loading products..."
                              : "Select a product"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProduct && (
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(selectedProduct.sellPrice)} each ·{" "}
                        {selectedProduct.stockCount} in stock
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, {
                          quantity: Math.max(
                            1,
                            Number(event.target.value || 1),
                          ),
                        })
                      }
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="mr-2 size-4" />
              Add Product
            </Button>
          </div>
        </FormSection>

        <FormSection
          title="Delivery"
          description="Choose whether this order will be delivered or picked up."
        >
          <FormField form={form} name="deliveryType" label="Delivery Type">
            {({ value, onChange, isInvalid }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger aria-invalid={isInvalid}>
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            )}
          </FormField>
          <InputField
            form={form}
            name="notes"
            label="Order Notes"
            type="textarea"
            rows={4}
            className="md:col-span-2"
            placeholder="Optional internal notes for this order."
          />
        </FormSection>

        <FormSection
          title={deliveryType === "delivery" ? "Shipping Details" : "Order Contact"}
          description={
            deliveryType === "delivery"
              ? "Capture the delivery contact and address snapshot for this order."
              : "Capture the contact details for this pickup order."
          }
        >
          <InputField form={form} name="shippingName" label="Contact Name" />
          <InputField
            form={form}
            name="shippingPhone"
            label="Contact Phone"
            type="tel"
          />
          {deliveryType === "delivery" && (
            <>
              <InputField
                form={form}
                name="shippingStreet"
                label="Street"
                className="md:col-span-2"
              />
              <InputField form={form} name="shippingCity" label="City" />
              <InputField form={form} name="shippingState" label="State" />
              <InputField
                form={form}
                name="shippingPostalCode"
                label="Postal Code"
              />
              <InputField
                form={form}
                name="shippingCountry"
                label="Country"
              />
            </>
          )}
        </FormSection>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/orders")}
            disabled={isPending}
          >
            Cancel
          </Button>

          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending ? "Creating..." : "Create Order"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </Form>

      <SectionCard
        title="Order Summary"
        description="Review the current line items before saving the order."
        contentClassName="space-y-3"
        className="shadow-sm"
      >
        {(items ?? []).map((item, index) => {
          const product = productMap.get(item.productId);
          if (!product) return null;

          return (
            <div
              key={`${product.id}-${index}`}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-muted-foreground">
                  {item.quantity} × {formatPrice(product.sellPrice)}
                </p>
              </div>
              <p className="font-medium">
                {formatPrice(Number(product.sellPrice) * item.quantity)}
              </p>
            </div>
          );
        })}

        <div className="flex items-center justify-between border-t border-border/60 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </SectionCard>
    </div>
  );
};

export default OrderForm;
