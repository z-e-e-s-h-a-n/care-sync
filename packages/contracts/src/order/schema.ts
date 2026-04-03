import z from "zod";
import {
  OrderStatusEnum,
  DeliveryTypeEnum,
  ShipmentStatusEnum,
  OrderSearchByEnum,
  OrderSortByEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  emailSchema,
  idSchema,
  nameSchema,
  nullableStringSchema,
  phoneSchema,
} from "../lib/schema";

export const addToCartSchema = z.object({
  productId: idSchema,
  quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

const orderAddressSchema = {
  deliveryType: DeliveryTypeEnum.default("delivery"),
  notes: nullableStringSchema,
  shippingName: z.string().min(2).optional(),
  shippingPhone: z.string().optional(),
  shippingStreet: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().optional(),
};

export const checkoutSchema = z.object({
  ...orderAddressSchema,
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  items: z
    .array(
      z.object({
        productId: idSchema,
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
  notes: nullableStringSchema,
});

export const createShipmentSchema = z.object({
  provider: nullableStringSchema,
  trackingNumber: nullableStringSchema,
  trackingUrl: nullableStringSchema,
});

export const updateShipmentSchema = z.object({
  status: ShipmentStatusEnum,
  provider: nullableStringSchema,
  trackingNumber: nullableStringSchema,
  trackingUrl: nullableStringSchema,
});

export const orderQuerySchema = baseQuerySchema(
  OrderSortByEnum,
  OrderSearchByEnum,
).extend({
  status: OrderStatusEnum.optional(),
  deliveryType: DeliveryTypeEnum.optional(),
  userId: idSchema.optional(),
});
