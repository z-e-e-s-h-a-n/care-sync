import { createZodDto } from "nestjs-zod";
import {
  addCartItemSchema,
  createOrderSchema,
  orderQuerySchema,
  productCategorySchema,
  productQuerySchema,
  productSchema,
  updateOrderStatusSchema,
} from "./schema";

export class ProductCategoryDto extends createZodDto(productCategorySchema) {}
export class ProductDto extends createZodDto(productSchema) {}
export class ProductQueryDto extends createZodDto(productQuerySchema) {}
export class AddCartItemDto extends createZodDto(addCartItemSchema) {}
export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class OrderQueryDto extends createZodDto(orderQuerySchema) {}
export class UpdateOrderStatusDto extends createZodDto(updateOrderStatusSchema) {}
