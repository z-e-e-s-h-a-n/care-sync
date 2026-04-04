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
  optionalStringSchema,
  positiveIntSchema,
  phoneSchema,
} from "../lib/schema";

export const cartItemSchema = z.object({
  productId: idSchema,
  quantity: positiveIntSchema,
});

export const updateCartItemSchema = z.object({
  quantity: positiveIntSchema,
});

export const syncCartSchema = z.object({
  items: z.array(cartItemSchema).default([]),
});

const orderAddressSchema = {
  deliveryType: DeliveryTypeEnum.default("delivery"),
  notes: optionalStringSchema,
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
        quantity: positiveIntSchema,
      }),
    )
    .optional(),
});

export const createManualOrderSchema = z
  .object({
    patientId: idSchema,
    ...orderAddressSchema,
    items: z.array(cartItemSchema).min(1, "Add at least one product."),
  })
  .superRefine((value, ctx) => {
    if (value.deliveryType !== "delivery") return;

    if (!value.shippingName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingName"],
        message: "Shipping name is required for delivery orders.",
      });
    }

    if (!value.shippingPhone?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingPhone"],
        message: "Shipping phone is required for delivery orders.",
      });
    }

    if (!value.shippingStreet?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingStreet"],
        message: "Street is required for delivery orders.",
      });
    }

    if (!value.shippingCity?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingCity"],
        message: "City is required for delivery orders.",
      });
    }

    if (!value.shippingCountry?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingCountry"],
        message: "Country is required for delivery orders.",
      });
    }
  });

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
