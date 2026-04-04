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

export class CartItemDto extends createZodDto(cartItemSchema) {}
export class UpdateCartItemDto extends createZodDto(updateCartItemSchema) {}
export class SyncCartDto extends createZodDto(syncCartSchema) {}
export class CheckoutDto extends createZodDto(checkoutSchema) {}
export class CreateManualOrderDto extends createZodDto(
  createManualOrderSchema,
) {}
export class UpdateOrderStatusDto extends createZodDto(
  updateOrderStatusSchema,
) {}
export class CreateShipmentDto extends createZodDto(createShipmentSchema) {}
export class UpdateShipmentDto extends createZodDto(updateShipmentSchema) {}
export class OrderQueryDto extends createZodDto(orderQuerySchema) {}
