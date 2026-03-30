import z from "zod";
import {
  OrderSearchByEnum,
  OrderSortByEnum,
  OrderStatusEnum,
  PaymentStatusEnum,
  ProductSearchByEnum,
  ProductSortByEnum,
  ShipmentStatusEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  numberSchema,
  nullableStringSchema,
  slugSchema,
} from "../lib/schema";

export const productCategorySchema = z.object({
  name: z.string().min(2),
  slug: slugSchema,
  description: nullableStringSchema,
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  categoryId: idSchema.optional(),
  imageId: idSchema.optional(),
  name: z.string().min(2),
  slug: slugSchema,
  sku: z.string().min(2),
  description: nullableStringSchema,
  price: numberSchema,
  salePrice: numberSchema.optional(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const addCartItemSchema = z.object({
  productId: idSchema,
  quantity: z.coerce.number().int().min(1),
});

export const createOrderSchema = z.object({
  patientId: idSchema,
  notes: nullableStringSchema,
  shippingAddress: z.record(z.string(), z.unknown()).optional(),
  billingAddress: z.record(z.string(), z.unknown()).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: idSchema,
  status: OrderStatusEnum,
  paymentStatus: PaymentStatusEnum.optional(),
  shipmentStatus: ShipmentStatusEnum.optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  carrier: z.string().optional(),
});

export const productQuerySchema = baseQuerySchema(
  ProductSortByEnum,
  ProductSearchByEnum,
).extend({
  categoryId: idSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export const orderQuerySchema = baseQuerySchema(
  OrderSortByEnum,
  OrderSearchByEnum,
).extend({
  patientId: idSchema.optional(),
  status: OrderStatusEnum.optional(),
});
