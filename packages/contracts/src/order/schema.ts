import z from "zod";
import {
  OrderStatusEnum,
  DeliveryTypeEnum,
  ShipmentStatusEnum,
  OrderSearchByEnum,
  OrderSortByEnum,
  PaymentProviderEnum,
  PaymentMethodTypeEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  nameSchema,
  optionalStringSchema,
  positiveIntSchema,
  phoneSchema,
  emailSchema,
} from "../lib/schema";

export const cartItemSchema = z.object({
  productId: idSchema,
  quantity: positiveIntSchema,
});

export const updateCartItemSchema = z.object({
  quantity: positiveIntSchema,
});

export const cartSyncModeEnum = z.enum(["merge", "replace"]);

export const syncCartSchema = z.object({
  items: z.array(cartItemSchema).default([]),
  mode: cartSyncModeEnum.default("merge"),
});

const orderContactSchema = z.object({
  shippingFirstName: nameSchema,
  shippingLastName: nameSchema.optional(),
  shippingPhone: phoneSchema,
});

const deliveryOrderSchema = z.object({
  deliveryType: z.literal("delivery"),
  shippingCountry: z.string().trim().min(2),
  shippingStreet: z.string().trim().min(3),
  shippingCity: z.string().trim().min(2),
  shippingState: optionalStringSchema,
  shippingPostalCode: z.string().trim().min(2),
});

const pickupOrderSchema = z.object({
  deliveryType: z.literal("pickup"),
  pickupBranchId: idSchema,
});

export const orderAddressSchema = z.discriminatedUnion("deliveryType", [
  deliveryOrderSchema,
  pickupOrderSchema,
]);

export const checkoutSchema = z.intersection(
  z.object({
    email: emailSchema,
    paymentProvider: PaymentProviderEnum,
    paymentMethodType: PaymentMethodTypeEnum,
    saveInformation: z.boolean().default(false),
    notes: optionalStringSchema,
    items: z
      .array(
        z.object({
          productId: idSchema,
          quantity: positiveIntSchema,
        }),
      )
      .optional(),
  }),
  z.intersection(orderContactSchema, orderAddressSchema),
);

export const createManualOrderSchema = z.intersection(
  z.object({
    patientId: idSchema,
    notes: optionalStringSchema,
    items: z.array(cartItemSchema).min(1, "Add at least one product."),
  }),
  z.intersection(orderContactSchema, orderAddressSchema),
);

export const updateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
  notes: optionalStringSchema,
});

export const createShipmentSchema = z.object({
  provider: z.string().trim().min(1),
  trackingNumber: z.string().trim().min(1),
  trackingUrl: z.url().optional(),
});

export const updateShipmentSchema = z.object({
  status: ShipmentStatusEnum,
  provider: z.string().trim().min(1).optional(),
  trackingNumber: z.string().trim().min(1).optional(),
  trackingUrl: z.url().optional(),
});

export const orderQuerySchema = baseQuerySchema(
  OrderSortByEnum,
  OrderSearchByEnum,
).extend({
  status: OrderStatusEnum.optional(),
  deliveryType: DeliveryTypeEnum.optional(),
  userId: idSchema.optional(),
});
