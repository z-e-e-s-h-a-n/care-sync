"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useForm, useStore } from "@tanstack/react-form";
import {
  createOrderSchema,
  guestCheckoutSchema,
  type CreateOrderType,
  type GuestCheckoutType,
} from "@workspace/contracts/order";
import { Button } from "@workspace/ui/components/button";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { InfoNotice } from "@workspace/ui/shared/InfoNotice";
import useUser from "@workspace/ui/hooks/use-user";
import {
  useServerCart,
  usePlaceOrder,
  useGuestCheckout,
  useShopProduct,
} from "@/hooks/healthcare";
import { useLocalCart, clearLocalCart } from "@/hooks/use-local-cart";

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

const deliveryTypeOptions = [
  { label: "Delivery — Ship to my address", value: "delivery" },
  { label: "Pickup — I'll collect in person", value: "pickup" },
];

const addressFields = (
  <>
    <InputField name="shippingName" label="Full Name" placeholder="Jane Smith" />
    <InputField name="shippingPhone" label="Phone Number" placeholder="+1 555 000 0000" />
    <InputField name="shippingStreet" label="Street Address" placeholder="123 Main St" className="md:col-span-2" />
    <InputField name="shippingCity" label="City" placeholder="Los Angeles" />
    <InputField name="shippingState" label="State" placeholder="CA" />
    <InputField name="shippingPostalCode" label="Postal Code" placeholder="90001" />
    <InputField name="shippingCountry" label="Country" placeholder="United States" />
  </>
);

// ── Guest Checkout Form ────────────────────────────────────

function GuestCheckoutForm() {
  const router = useRouter();
  const { items: localItems, count } = useLocalCart();
  const { guestCheckout, isPending } = useGuestCheckout();

  const form = useForm({
    defaultValues: {
      deliveryType: "delivery",
      notes: "",
      shippingName: "",
      shippingPhone: "",
      shippingStreet: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingCountry: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      items: localItems,
    } as GuestCheckoutType,
    validators: { onSubmit: guestCheckoutSchema },
    onSubmit: async ({ value }) => {
      if (!localItems.length) {
        toast.error("Your cart is empty.");
        return;
      }
      try {
        const result = await guestCheckout({
          ...value,
          items: localItems,
        });
        clearLocalCart();
        router.push(`/checkout/success?orderId=${result.data.id}`);
      } catch (error: any) {
        toast.error("Could not place order", { description: error?.message });
      }
    },
  });

  const deliveryType = useStore(form.store, (s) => s.values.deliveryType);

  if (!count) return <EmptyCartState />;

  return (
    <Form form={form}>
      <FormSection
        title="Your Details"
        description="We'll create an account for you to track your order."
      >
        <InputField form={form} name="firstName" label="First Name" placeholder="Jane" />
        <InputField form={form} name="lastName" label="Last Name" placeholder="Smith" />
        <InputField form={form} name="email" label="Email" type="email" placeholder="jane@example.com" />
        <InputField form={form} name="phone" label="Phone (optional)" placeholder="+1 555 000 0000" />
      </FormSection>

      <FormSection title="Delivery Method" description="Choose how you'd like to receive your order.">
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
        <FormSection title="Shipping Address" description="Enter the address where we should deliver your order.">
          {addressFields}
        </FormSection>
      )}

      <FormSection title="Order Notes" description="Optional notes for your order.">
        <InputField form={form} name="notes" label="Notes" type="textarea" rows={3} placeholder="Anything we should know?" className="md:col-span-2" />
      </FormSection>

      <InfoNotice variant="info" message="Payment is processed manually after order confirmation. Our team will contact you to complete payment." />

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="secondary" onClick={() => router.push("/cart")} disabled={isPending}>
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
  );
}

// ── Authenticated Checkout Form ───────────────────────────

function AuthCheckoutForm() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { data: cart, isLoading: cartLoading } = useServerCart(true);
  const { placeOrder, isPending } = usePlaceOrder();

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const form = useForm({
    defaultValues: {
      deliveryType: "delivery",
      notes: "",
      shippingName: currentUser?.displayName ?? "",
      shippingPhone: currentUser?.phone ?? "",
      shippingStreet: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingCountry: "",
    } as CreateOrderType,
    validators: { onSubmit: createOrderSchema },
    onSubmit: async ({ value }) => {
      if (!items.length) {
        toast.error("Your cart is empty.");
        return;
      }
      try {
        const orderResult = await placeOrder(value);
        router.push(`/checkout/success?orderId=${orderResult.data.id}`);
      } catch (error: any) {
        toast.error("Could not place order", { description: error?.message });
      }
    },
  });

  const deliveryType = useStore(form.store, (s) => s.values.deliveryType);

  if (cartLoading)
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );

  if (!items.length) return <EmptyCartState />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Form form={form}>
        <FormSection title="Delivery Method" description="Choose how you'd like to receive your order.">
          <SelectField form={form} name="deliveryType" label="Delivery Type" options={deliveryTypeOptions} placeholder="Select delivery type" className="md:col-span-2" />
        </FormSection>

        {deliveryType === "delivery" && (
          <FormSection title="Shipping Address" description="Enter the address where we should deliver your order.">
            {addressFields}
          </FormSection>
        )}

        <FormSection title="Order Notes" description="Optional notes for your order.">
          <InputField form={form} name="notes" label="Notes" type="textarea" rows={3} placeholder="Anything we should know?" className="md:col-span-2" />
        </FormSection>

        <InfoNotice variant="info" message="Payment is processed manually after order confirmation. Our team will contact you to complete payment." />

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/cart")} disabled={isPending}>
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

      <SectionCard title="Order Summary" contentClassName="space-y-3" className="shadow-sm">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground line-clamp-1 flex-1 pr-2">
              {item.product.name} × {item.quantity}
            </span>
            <span className="shrink-0 font-medium">
              {formatAmount(Number(item.product.price) * item.quantity)}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatAmount(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">TBD</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Estimated Total</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
      </SectionCard>
    </div>
  );
}

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

// ── Page ──────────────────────────────────────────────────

export default function CheckoutPage() {
  const { currentUser } = useUser();

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

      {currentUser ? <AuthCheckoutForm /> : <GuestCheckoutForm />}
    </div>
  );
}
