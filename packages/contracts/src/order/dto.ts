import { createZodDto } from "nestjs-zod";
import {
  cartItemSchema,
  updateCartItemSchema,
  syncCartSchema,
  checkoutSchema,
  createManualOrderSchema,
  updateOrderStatusSchema,
  createShipmentSchema,
  updateShipmentSchema,
  orderQuerySchema,
} from "./schema";
import { createUZodDto } from "../lib/utils";

export class CartItemDto extends createZodDto(cartItemSchema) {}
export class UpdateCartItemDto extends createZodDto(updateCartItemSchema) {}
export class SyncCartDto extends createZodDto(syncCartSchema) {}
export class CheckoutDto extends createUZodDto(checkoutSchema) {}
export class CreateManualOrderDto extends createUZodDto(
  createManualOrderSchema,
) {}
export class UpdateOrderStatusDto extends createZodDto(
  updateOrderStatusSchema,
) {}
export class CreateShipmentDto extends createZodDto(createShipmentSchema) {}
export class UpdateShipmentDto extends createZodDto(updateShipmentSchema) {}
export class OrderQueryDto extends createZodDto(orderQuerySchema) {}
