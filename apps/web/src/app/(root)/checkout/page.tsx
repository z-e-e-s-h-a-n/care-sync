/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  ChevronLeft,
  CreditCard,
  MapPin,
  ShoppingBag,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import {
  checkoutSchema,
  type CheckoutResponse,
  type CheckoutType,
} from "@workspace/contracts/order";
import { formatPricePrecise } from "@workspace/shared/utils";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import useUser from "@workspace/ui/hooks/use-user";
import { InfoNotice } from "@workspace/ui/shared/InfoNotice";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { useBranches, usePlaceOrder } from "@/hooks/healthcare";
import { useCart } from "@/hooks/use-cart";
import { CheckboxField } from "@workspace/ui/components/checkbox-field";
import { ComboboxField } from "@workspace/ui/components/combobox-field";

const EmptyCartState = () => {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">
      <ShoppingBag className="size-10 text-muted-foreground" />
      <p className="font-medium">Your cart is empty</p>
      <Button variant="outline" asChild>
        <Link href="/shop">Browse Shop</Link>
      </Button>
    </div>
  );
};

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
            {formatPricePrecise(item.unitPrice * item.quantity)}
          </span>
        </div>
      ))}
      <Separator />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatPricePrecise(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span className="text-muted-foreground">Calculated next</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Estimated Total</span>
        <span>{formatPricePrecise(subtotal)}</span>
      </div>
    </SectionCard>
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
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(
    null,
  );
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  const form = useForm({
    defaultValues: {
      email: "",
      deliveryType: "delivery",
      shippingFirstName: "",
      shippingLastName: "",
      shippingPhone: "",
      shippingStreet: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingCountry: "",
      pickupBranchId: "",
      saveInformation: false,
      notes: "",
      paymentProvider: "stripe",
      paymentMethodType: "card",
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

  useEffect(() => {
    if (!currentUser) return;

    form.setFieldValue("email", currentUser.email ?? "");
    form.setFieldValue("shippingFirstName", currentUser.firstName ?? "");
    form.setFieldValue("shippingLastName", currentUser.lastName ?? "");
    form.setFieldValue("shippingPhone", currentUser.phone ?? "");
  }, [currentUser, form]);

  const { deliveryType, pickupBranchId } = useStore(form.store, (state) => ({
    deliveryType: state.values.deliveryType,
    pickupBranchId:
      state.values.deliveryType === "pickup"
        ? state.values.pickupBranchId
        : undefined,
  }));

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
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-180 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!count || !displayItems.length) return <EmptyCartState />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {checkoutResult?.paymentSession ? (
        <StripeCheckoutStep
          checkoutResult={checkoutResult}
          onComplete={handleStripeComplete}
        />
      ) : (
        <Form form={form}>
          <FormSection
            title="Your Details"
            description={
              <div className="flex items-center justify-between gap-3">
                <span>Use your email to continue with this order.</span>
                {!isLoggedIn && (
                  <Link
                    href="/auth/sign-in"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            }
          >
            <InputField
              form={form}
              name="email"
              type="email"
              label="Email"
              placeholder="jane@example.com"
              disabled={isLoggedIn}
              className="md:col-span-2"
            />
          </FormSection>

          <FormSection
            title="Shipping Details"
            description="Choose delivery or pickup, then complete the order contact details."
            className="grid-cols-1 space-y-4"
          >
            <Tabs
              value={deliveryType}
              onValueChange={(value) =>
                form.setFieldValue(
                  "deliveryType",
                  value as CheckoutType["deliveryType"],
                )
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="delivery">
                  <MapPin className="size-4" />
                  Ship
                </TabsTrigger>
                <TabsTrigger value="pickup">
                  <Store className="size-4" />
                  Pickup
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="delivery"
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <InputField
                  form={form}
                  name="shippingCountry"
                  label="Country"
                  placeholder="United States"
                  className="col-span-2"
                />
                <InputField
                  form={form}
                  name="shippingFirstName"
                  label="First Name"
                  placeholder="Jane"
                />
                <InputField
                  form={form}
                  name="shippingLastName"
                  label="Last Name"
                  placeholder="Smith"
                />
                <InputField
                  form={form}
                  name="shippingStreet"
                  label="Address"
                  placeholder="123 Main St"
                  className="col-span-2"
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
                  label="State / Region"
                  placeholder="CA"
                />
                <InputField
                  form={form}
                  name="shippingPostalCode"
                  label="Postal Code / ZIP"
                  placeholder="90001"
                />
                <InputField
                  form={form}
                  name="shippingPhone"
                  label="Phone"
                  placeholder="+1 555 000 0000"
                />
              </TabsContent>

              <TabsContent
                value="pickup"
                className="grid gap-4 md:grid-cols-2 pt-2"
              >
                <ComboboxField
                  form={form}
                  name="pickupBranchId"
                  label="Pickup Branch"
                  className="md:col-span-2"
                  dataKey="branches"
                  useQuery={useBranches}
                  queryArgs={{}}
                  getOption={(b) => ({
                    key: b.id,
                    label: b.name,
                    value: b.id,
                    content: (
                      <div className="space-y-1">
                        <p className="font-medium">{b.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {[b.city, b.state, b.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    ),
                  })}
                />
                <InputField
                  form={form}
                  name="shippingFirstName"
                  label="First Name"
                  placeholder="Jane"
                />
                <InputField
                  form={form}
                  name="shippingLastName"
                  label="Last Name"
                  placeholder="Smith"
                />
                <InputField
                  form={form}
                  name="shippingPhone"
                  label="Phone"
                  placeholder="+1 555 000 0000"
                  className="md:col-span-2"
                />
              </TabsContent>
            </Tabs>

            <CheckboxField
              form={form}
              variant="inline"
              name="saveInformation"
              label="Save this information for next time"
            />
          </FormSection>

          <FormSection
            title="Payment"
            description="Pay securely on this page. Stripe will handle your card details after you continue."
          >
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-xl border bg-card/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <CreditCard className="size-4.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Credit and debit card</p>
                    <p className="text-sm text-muted-foreground">
                      Continue to Stripe’s secure embedded payment form without
                      leaving this page.
                    </p>
                  </div>
                </div>
              </div>

              <CheckboxField
                form={form}
                variant="inline"
                name="saveInformation"
                label="Use shipping details as billing details"
              />

              {!useShippingAsBilling && (
                <InfoNotice
                  variant="info"
                  message="Billing details editing can be added next. For now, we’ll use your checkout contact details during payment."
                />
              )}
            </div>
          </FormSection>

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

      <div className="space-y-4">
        <OrderSummary items={summaryItems} subtotal={summarySubtotal} />
        <InfoNotice
          variant="default"
          message="Taxes, delivery charges, and pickup instructions are confirmed after you continue to payment."
        />
      </div>
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
