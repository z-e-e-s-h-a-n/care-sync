/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import {
  AddressElement,
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
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
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
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

function StripePaymentSections({
  checkoutResult,
  onComplete,
  onBack,
}: {
  checkoutResult: CheckoutResponse;
  onComplete: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const paymentSession = checkoutResult.paymentSession;
  const [isConfirming, setIsConfirming] = useState(false);
  const [availableExpressMethods, setAvailableExpressMethods] = useState<
    string[]
  >([]);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  const shippingName = checkoutResult.order.shippingName ?? "";
  const [shippingFirstName, ...shippingLastNameParts] = shippingName.split(" ");
  const shippingLastName = shippingLastNameParts.join(" ");

  const confirmPayment = async (
    expressEvent?: StripeExpressCheckoutElementConfirmEvent,
  ) => {
    if (!stripe || !elements || !paymentSession) return;

    setIsConfirming(true);

    try {
      const submitResult = await elements.submit();

      if (submitResult.error) {
        expressEvent?.paymentFailed({
          reason: "fail",
          message: submitResult.error.message,
        });

        toast.error("Payment failed", {
          description: submitResult.error.message,
        });
        return;
      }

      const billingAddressElement = elements.getElement(AddressElement);
      const billingAddressValue =
        !useShippingAsBilling && billingAddressElement
          ? await billingAddressElement.getValue()
          : undefined;

      const result = await stripe.confirmPayment({
        elements,
        clientSecret: paymentSession.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${checkoutResult.order.id}`,
          payment_method_data: {
            billing_details: useShippingAsBilling
              ? {
                  name: checkoutResult.order.shippingName ?? undefined,
                  phone: checkoutResult.order.shippingPhone ?? undefined,
                  address: checkoutResult.order.shippingStreet
                    ? {
                        line1: checkoutResult.order.shippingStreet,
                        city: checkoutResult.order.shippingCity ?? "",
                        state: checkoutResult.order.shippingState ?? "",
                        postal_code:
                          checkoutResult.order.shippingPostalCode ?? "",
                        country: checkoutResult.order.shippingCountry ?? "",
                      }
                    : undefined,
                }
              : billingAddressValue?.complete
                ? {
                    name: billingAddressValue.value.name || undefined,
                    phone: billingAddressValue.value.phone || undefined,
                    address: {
                      line1: billingAddressValue.value.address.line1,
                      line2:
                        billingAddressValue.value.address.line2 ?? undefined,
                      city: billingAddressValue.value.address.city,
                      state: billingAddressValue.value.address.state,
                      postal_code:
                        billingAddressValue.value.address.postal_code,
                      country: billingAddressValue.value.address.country,
                    },
                  }
                : undefined,
          },
        },
        redirect: "if_required",
      });

      if (result.error) {
        expressEvent?.paymentFailed({
          reason: "fail",
          message: result.error.message,
        });

        toast.error("Payment failed", {
          description: result.error.message,
        });
        return;
      }

      if (
        result.paymentIntent?.status === "succeeded" ||
        result.paymentIntent?.status === "processing"
      ) {
        await onComplete();
        return;
      }

      toast.message("Payment confirmation is still processing.");
    } catch (error: any) {
      expressEvent?.paymentFailed({
        reason: "fail",
        message: error?.message,
      });

      toast.error("Payment failed", {
        description:
          error?.message ?? "Something went wrong while confirming payment.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Express Checkout"
        description="Use a faster option like PayPal, Apple Pay, Google Pay, or Link when available."
        className="grid-cols-1"
      >
        <div className="space-y-3 md:col-span-2">
          <div className="rounded-xl border bg-card/60 p-4">
            <ExpressCheckoutElement
              onConfirm={(event) => void confirmPayment(event)}
              onReady={(event) => {
                const methods = Object.entries(
                  event.availablePaymentMethods ?? {},
                )
                  .filter(([, isAvailable]) => isAvailable)
                  .map(([method]) => method);

                setAvailableExpressMethods(methods);
              }}
              options={{
                buttonHeight: 48,
                buttonTheme: {
                  paypal: "gold",
                  googlePay: "black",
                  applePay: "black",
                },
                buttonType: {
                  paypal: "checkout",
                  googlePay: "checkout",
                  applePay: "check-out",
                },
                layout: {
                  maxColumns: 3,
                  maxRows: 1,
                  overflow: "auto",
                },
                paymentMethods: {
                  paypal: "auto",
                  applePay: "always",
                  googlePay: "always",
                  link: "auto",
                },
                emailRequired: true,
                billingAddressRequired: !useShippingAsBilling,
              }}
            />
          </div>

          {!availableExpressMethods.length && (
            <InfoNotice
              variant="info"
              message="Express checkout options appear automatically when they are available for this device and payment intent."
            />
          )}
        </div>
      </FormSection>

      <FormSection
        title="Payment"
        description="Enter your card details inline without leaving this page."
      >
        <div className="space-y-4 md:col-span-2">
          <div className="rounded-xl border bg-card/60 p-4">
            <PaymentElement
              options={{
                layout: "tabs",
              }}
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border p-3">
            <Checkbox
              checked={useShippingAsBilling}
              onCheckedChange={(checked) =>
                setUseShippingAsBilling(checked === true)
              }
            />
            <span className="text-sm font-medium">
              Use shipping details as billing address
            </span>
          </label>

          {!useShippingAsBilling && (
            <div className="space-y-3 rounded-xl border bg-card/60 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Billing address</p>
                <p className="text-sm text-muted-foreground">
                  Enter the billing address for this payment method.
                </p>
              </div>

              <AddressElement
                options={{
                  mode: "billing",
                  display: {
                    name: "split",
                  },
                  fields: {
                    phone: "always",
                  },
                  validation: {
                    phone: {
                      required: "always",
                    },
                  },
                  defaultValues: {
                    firstName: shippingFirstName || null,
                    lastName: shippingLastName || null,
                    phone: checkoutResult.order.shippingPhone ?? null,
                    address: {
                      line1: checkoutResult.order.shippingStreet ?? null,
                      city: checkoutResult.order.shippingCity ?? null,
                      state: checkoutResult.order.shippingState ?? null,
                      postal_code:
                        checkoutResult.order.shippingPostalCode ?? null,
                      country: checkoutResult.order.shippingCountry ?? "US",
                    },
                  },
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isConfirming}
            >
              Back to Checkout
            </Button>

            <Button
              type="button"
              onClick={() => void confirmPayment()}
              disabled={!stripe || !elements || isConfirming}
            >
              {isConfirming ? "Confirming Payment..." : "Pay Securely"}
            </Button>
          </div>
        </div>
      </FormSection>
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
  const paymentSession = checkoutResult?.paymentSession;
  const stripePromise = useMemo(
    () =>
      paymentSession
        ? loadStripe(paymentSession.publishableKey)
        : Promise.resolve(null),
    [paymentSession],
  );

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
      <Form form={form}>
        {paymentSession ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentSession.clientSecret,
            }}
          >
            <StripePaymentSections
              checkoutResult={checkoutResult}
              onComplete={handleStripeComplete}
              onBack={() => setCheckoutResult(null)}
            />
          </Elements>
        ) : null}

        {!paymentSession ? (
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
        ) : null}

        {!paymentSession ? (
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
        ) : null}

        {!paymentSession ? (
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
        ) : null}

        {!paymentSession ? (
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
        ) : null}
      </Form>

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
