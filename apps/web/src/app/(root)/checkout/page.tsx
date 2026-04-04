"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ChevronLeft, CreditCard, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  checkoutSchema,
  type CheckoutResponse,
  type CheckoutType,
} from "@workspace/contracts/order";
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
import { usePlaceOrder } from "@/hooks/healthcare";
import { useCart } from "@/hooks/use-cart";

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

function OrderSummary({
  items,
  subtotal,
}: {
  items: {
    id: string;
    quantity: number;
    name: string;
    unitPrice: number;
  }[];
  subtotal: number;
}) {
  return (
    <SectionCard
      title="Order Summary"
      contentClassName="space-y-3"
      className="shadow-sm"
    >
      {items.map((item) => (
        <div key={item.id} className="flex justify-between text-sm">
          <span className="flex-1 pr-2 text-muted-foreground line-clamp-1">
            {item.name} × {item.quantity}
          </span>
          <span className="shrink-0 font-medium">
            {formatPrice(item.unitPrice * item.quantity)}
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

function StripeCheckoutStep({
  checkoutResult,
  onComplete,
}: {
  checkoutResult: CheckoutResponse;
  onComplete: () => void;
}) {
  const paymentSession = checkoutResult.paymentSession;
  const stripePromise = useMemo(
    () =>
      paymentSession
        ? loadStripe(paymentSession.publishableKey)
        : Promise.resolve(null),
    [paymentSession],
  );

  if (!paymentSession) return null;

  return (
    <div className="space-y-6">
      <SectionCard className="shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold">Secure payment</h2>
            <p className="text-sm text-muted-foreground">
              Your order has been created. Complete your payment below to
              confirm and process it.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="overflow-hidden p-0 shadow-sm">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret: paymentSession.clientSecret,
            onComplete,
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </SectionCard>
    </div>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const { currentUser, isLoading: userLoading } = useUser();
  const {
    items,
    displayItems,
    count,
    subtotal,
    isLoggedIn,
    isLoading,
    clearCart,
  } = useCart();
  const { placeOrder, isPending } = usePlaceOrder();

  const form = useForm({
    defaultValues: {
      deliveryType: "delivery",
      notes: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      paymentProvider: "stripe",
      paymentMethodType: "card",
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
      if (!items.length) {
        toast.error("Your cart is empty.");
        return;
      }

      try {
        const result = await placeOrder({
          ...value,
          phone: (value.shippingPhone ?? "").trim(),
          shippingPhone: (value.shippingPhone ?? "").trim(),
          items: isLoggedIn ? undefined : items,
        });

        if (result.data.paymentSession) {
          setCheckoutResult(result.data);
          return;
        }

        await clearCart();
        router.push(`/checkout/success?orderId=${result.data.order.id}`);
      } catch (error: any) {
        toast.error("Could not place order", { description: error?.message });
      }
    },
  });

  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(
    null,
  );

  useEffect(() => {
    if (!currentUser) return;

    form.setFieldValue("email", currentUser.email ?? "");
    form.setFieldValue("firstName", currentUser.firstName ?? "");
    form.setFieldValue("lastName", currentUser.lastName ?? "");
    form.setFieldValue("shippingName", currentUser.displayName ?? "");
    form.setFieldValue("shippingPhone", currentUser.phone ?? "");
  }, [currentUser, form]);

  const deliveryType = useStore(form.store, (state) => state.values.deliveryType);

  const summaryItems = checkoutResult
    ? checkoutResult.order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        name: item.productName,
        unitPrice: item.unitPrice,
      }))
    : displayItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        name: item.product.name,
        unitPrice: item.product.sellPrice,
      }));

  const summarySubtotal = checkoutResult
    ? checkoutResult.order.subtotal
    : subtotal;

  const handleStripeComplete = async () => {
    await clearCart();
    router.push(`/checkout/success?orderId=${checkoutResult?.order.id ?? ""}`);
  };

  if (userLoading || isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  if (!count || !displayItems.length) return <EmptyCartState />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {checkoutResult?.paymentSession ? (
        <StripeCheckoutStep
          checkoutResult={checkoutResult}
          onComplete={handleStripeComplete}
        />
      ) : (
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
            message="Secure card payment is handled on this page with Stripe."
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
                  {isPending ? "Preparing Payment..." : "Continue to Payment"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </Form>
      )}

      <OrderSummary items={summaryItems} subtotal={summarySubtotal} />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
