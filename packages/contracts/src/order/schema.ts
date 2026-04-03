import z from "zod";
import {
  OrderStatusEnum,
  DeliveryTypeEnum,
  ShipmentStatusEnum,
  OrderSearchByEnum,
  OrderSortByEnum,
} from "../lib/enums";
import { baseQuerySchema, idSchema, nullableStringSchema } from "../lib/schema";

export const addToCartSchema = z.object({
  productId: idSchema,
  quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

export const createOrderSchema = z.object({
  deliveryType: DeliveryTypeEnum.default("delivery"),
  notes: nullableStringSchema,

  shippingName: z.string().min(2).optional().nullable(),
  shippingPhone: z.string().optional().nullable(),
  shippingStreet: z.string().optional().nullable(),
  shippingCity: z.string().optional().nullable(),
  shippingState: z.string().optional().nullable(),
  shippingPostalCode: z.string().optional().nullable(),
  shippingCountry: z.string().optional().nullable(),
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
