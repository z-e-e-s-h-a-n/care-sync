import { createZodDto } from "nestjs-zod";
import {
  createCategorySchema,
  categoryQuerySchema,
  createProductSchema,
  productQuerySchema,
  addProductImageSchema,
} from "./schema";

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}
export class CategoryQueryDto extends createZodDto(categoryQuerySchema) {}

export class CreateProductDto extends createZodDto(createProductSchema) {}
export class ProductQueryDto extends createZodDto(productQuerySchema) {}

export class AddProductImageDto extends createZodDto(addProductImageSchema) {}
