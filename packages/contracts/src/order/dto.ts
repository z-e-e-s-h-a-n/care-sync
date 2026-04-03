import { createZodDto } from "nestjs-zod";
import {
  addToCartSchema,
  updateCartItemSchema,
  syncCartSchema,
  checkoutSchema,
  updateOrderStatusSchema,
  createShipmentSchema,
  updateShipmentSchema,
  orderQuerySchema,
} from "./schema";

export class AddToCartDto extends createZodDto(addToCartSchema) {}
export class UpdateCartItemDto extends createZodDto(updateCartItemSchema) {}
export class SyncCartDto extends createZodDto(syncCartSchema) {}
export class CheckoutDto extends createZodDto(checkoutSchema) {}
export class UpdateOrderStatusDto extends createZodDto(updateOrderStatusSchema) {}
export class CreateShipmentDto extends createZodDto(createShipmentSchema) {}
export class UpdateShipmentDto extends createZodDto(updateShipmentSchema) {}
export class OrderQueryDto extends createZodDto(orderQuerySchema) {}
