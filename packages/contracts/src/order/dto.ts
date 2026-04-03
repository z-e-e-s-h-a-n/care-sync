import { createZodDto } from "nestjs-zod";
import {
  addToCartSchema,
  updateCartItemSchema,
  createOrderSchema,
  guestCheckoutSchema,
  updateOrderStatusSchema,
  createShipmentSchema,
  updateShipmentSchema,
  orderQuerySchema,
} from "./schema";

export class AddToCartDto extends createZodDto(addToCartSchema) {}
export class UpdateCartItemDto extends createZodDto(updateCartItemSchema) {}
export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class GuestCheckoutDto extends createZodDto(guestCheckoutSchema) {}
export class UpdateOrderStatusDto extends createZodDto(updateOrderStatusSchema) {}
export class CreateShipmentDto extends createZodDto(createShipmentSchema) {}
export class UpdateShipmentDto extends createZodDto(updateShipmentSchema) {}
export class OrderQueryDto extends createZodDto(orderQuerySchema) {}
