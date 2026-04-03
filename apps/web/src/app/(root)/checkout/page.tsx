"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueries } from "@tanstack/react-query";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  checkoutSchema,
  type CheckoutType,
} from "@workspace/contracts/order";
import * as productSdk from "@workspace/sdk/product";
import { formatPrice } from "@workspace/shared/utils";
import { Button } from "@workspace/ui/components/button";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import useUser from "@workspace/ui/hooks/use-user";
import { InfoNotice } from "@workspace/ui/shared/InfoNotice";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { usePlaceOrder, useServerCart } from "@/hooks/healthcare";
import { clearLocalCart, useLocalCart } from "@/hooks/use-local-cart";

const deliveryTypeOptions = [
  { label: "Delivery — Ship to my address", value: "delivery" },
  { label: "Pickup — I'll collect in person", value: "pickup" },
];

const addressFields = (form: any) => (
  <>
    <InputField
      form={form}
      name="shippingName"
      label="Full Name"
      placeholder="Jane Smith"
    />
    <InputField
      form={form}
      name="shippingPhone"
      label="Phone Number"
      placeholder="+1 555 000 0000"
    />
    <InputField
      form={form}
      name="shippingStreet"
      label="Street Address"
      placeholder="123 Main St"
      className="md:col-span-2"
    />
    <InputField
      form={form}
      name="shippingCity"
      label="City"
      placeholder="Los Angeles"
    />
    <InputField
      form={form}
      name="shippingState"
      label="State"
      placeholder="CA"
    />
    <InputField
      form={form}
      name="shippingPostalCode"
      label="Postal Code"
      placeholder="90001"
    />
    <InputField
      form={form}
      name="shippingCountry"
      label="Country"
      placeholder="United States"
    />
  </>
);

function EmptyCartState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">
      <ShoppingBag className="size-10 text-muted-foreground" />
      <p className="font-medium">Your cart is empty</p>
      <Button variant="outline" asChild>
        <Link href="/shop">Browse Shop</Link>
      </Button>
    </div>
  );
}

function GuestCheckoutSummary({
  items,
}: {
  items: { productId: string; quantity: number }[];
}) {
  const productQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: ["products", item.productId],
      queryFn: () => productSdk.getProduct(item.productId),
      select: (res: Awaited<ReturnType<typeof productSdk.getProduct>>) =>
        res.data,
    })),
  });

  if (productQueries.some((query) => query.isLoading)) {
    return <Skeleton className="h-56 rounded-xl" />;
  }

  const summaryItems = productQueries
    .map((query, index) =>
      query.data
        ? {
            id: query.data.id,
            name: query.data.name,
            quantity: items[index]?.quantity ?? 0,
            total: Number(query.data.price) * (items[index]?.quantity ?? 0),
          }
        : null,
    )
    .filter(Boolean) as {
    id: string;
    name: string;
    quantity: number;
    total: number;
  }[];

  const subtotal = summaryItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <SectionCard
      title="Order Summary"
      contentClassName="space-y-3"
      className="shadow-sm"
    >
      {summaryItems.map((item) => (
        <div key={item.id} className="flex justify-between text-sm">
          <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
            {item.name} × {item.quantity}
          </span>
          <span className="shrink-0 font-medium">{formatPrice(item.total)}</span>
        </div>
      ))}
      <Separator />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span className="text-muted-foreground">TBD</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Estimated Total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
    </SectionCard>
  );
}

function IdentitySection({
  form,
  isLoggedIn,
}: {
  form: any;
  isLoggedIn: boolean;
}) {
  return (
    <FormSection
      title="Your Details"
      description={
        isLoggedIn
          ? "Your account identity is linked to this order. You can still update your phone number here."
          : "We'll use these details to create or match your account."
      }
    >
      <InputField
        form={form}
        name="firstName"
        label="First Name"
        placeholder="Jane"
        disabled={isLoggedIn}
      />
      <InputField
        form={form}
        name="lastName"
        label="Last Name"
        placeholder="Smith"
        disabled={isLoggedIn}
      />
      <InputField
        form={form}
        name="email"
        label="Email"
        type="email"
        placeholder="jane@example.com"
        disabled={isLoggedIn}
      />
    </FormSection>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const { currentUser, isLoading: userLoading } = useUser();
  const isLoggedIn = Boolean(currentUser);
  const { items: localItems, count } = useLocalCart();
  const { data: serverCart, isLoading: cartLoading } = useServerCart(isLoggedIn);
  const { placeOrder, isPending } = usePlaceOrder();

  const serverItems = serverCart?.items ?? [];
  const checkoutItems = isLoggedIn
    ? serverItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    : localItems;
  const subtotal = serverItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const form = useForm({
    defaultValues: {
      deliveryType: "delivery",
      notes: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      shippingName: "",
      shippingPhone: "",
      shippingStreet: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingCountry: "",
      items: [],
    } as CheckoutType,
    validators: { onSubmit: checkoutSchema },
    onSubmit: async ({ value }) => {
      if (!checkoutItems.length) {
        toast.error("Your cart is empty.");
        return;
      }

      try {
        const result = await placeOrder({
          ...value,
          phone: (value.shippingPhone ?? "").trim(),
          shippingPhone: (value.shippingPhone ?? "").trim(),
          items: isLoggedIn ? undefined : checkoutItems,
        });

        if (!isLoggedIn) clearLocalCart();
        router.push(`/checkout/success?orderId=${result.data.id}`);
      } catch (error: any) {
        toast.error("Could not place order", { description: error?.message });
      }
    },
  });

  useEffect(() => {
    if (!currentUser) return;

    form.setFieldValue("email", currentUser.email ?? "");
    form.setFieldValue("firstName", currentUser.firstName ?? "");
    form.setFieldValue("lastName", currentUser.lastName ?? "");
    form.setFieldValue("shippingName", currentUser.displayName ?? "");
    form.setFieldValue("shippingPhone", currentUser.phone ?? "");
  }, [currentUser, form]);

  const deliveryType = useStore(form.store, (state) => state.values.deliveryType);

  if (userLoading || (isLoggedIn && cartLoading)) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  if (!count && !serverItems.length) return <EmptyCartState />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Form form={form}>
        <IdentitySection form={form} isLoggedIn={isLoggedIn} />

        <FormSection
          title="Delivery Method"
          description="Choose how you'd like to receive your order."
        >
          <SelectField
            form={form}
            name="deliveryType"
            label="Delivery Type"
            options={deliveryTypeOptions}
            placeholder="Select delivery type"
            className="md:col-span-2"
          />
        </FormSection>

        {deliveryType === "delivery" && (
          <FormSection
            title="Shipping Address"
            description="Enter the address and phone number we should use for this order."
          >
            {addressFields(form)}
          </FormSection>
        )}

        {deliveryType === "pickup" && (
          <FormSection
            title="Order Contact"
            description="Add the best phone number to use for pickup updates."
          >
            <InputField
              form={form}
              name="shippingPhone"
              label="Phone Number"
              placeholder="+1 555 000 0000"
              className="md:col-span-2"
            />
          </FormSection>
        )}

        <FormSection
          title="Order Notes"
          description="Optional notes for your order."
        >
          <InputField
            form={form}
            name="notes"
            label="Notes"
            type="textarea"
            rows={3}
            placeholder="Anything we should know?"
            className="md:col-span-2"
          />
        </FormSection>

        <InfoNotice
          variant="info"
          message="Payment is processed manually after order confirmation. Our team will contact you to complete payment."
        />

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/cart")}
            disabled={isPending}
          >
            Back to Cart
          </Button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending ? "Placing Order..." : "Place Order"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </Form>

      {isLoggedIn ? (
        <SectionCard
          title="Order Summary"
          contentClassName="space-y-3"
          className="shadow-sm"
        >
          {serverItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
                {item.product.name} × {item.quantity}
              </span>
              <span className="shrink-0 font-medium">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-muted-foreground">TBD</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Estimated Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </SectionCard>
      ) : (
        <GuestCheckoutSummary items={checkoutItems} />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Cart
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Complete your order details below.
        </p>
      </div>

      <CheckoutForm />
    </div>
  );
}
