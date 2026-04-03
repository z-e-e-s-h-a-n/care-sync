import z from "zod";
import {
  ProductStatusEnum,
  InventoryStatusEnum,
  ProductSearchByEnum,
  ProductSortByEnum,
  CategorySearchByEnum,
  CategorySortByEnum,
} from "../lib/enums";
import {
  baseQuerySchema,
  idSchema,
  intNumberSchema,
  optionalStringSchema,
  positiveNumberSchema,
  slugSchema,
} from "../lib/schema";

export const createCategorySchema = z.object({
  parentId: idSchema.optional(),
  name: z.string().min(2),
  slug: slugSchema,
  description: optionalStringSchema,
  isActive: z.boolean().default(true),
});

export const categoryQuerySchema = baseQuerySchema(
  CategorySortByEnum,
  CategorySearchByEnum,
).extend({
  parentId: idSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createProductSchema = z.object({
  categoryId: idSchema.optional(),
  name: z.string().min(2),
  slug: slugSchema,
  description: optionalStringSchema,
  costPrice: positiveNumberSchema,
  sellPrice: positiveNumberSchema,
  compareAtPrice: positiveNumberSchema.optional(),
  stockCount: intNumberSchema,
  requiresShipping: z.boolean().default(true),
  status: ProductStatusEnum.default("draft"),
  imageIds: z.array(idSchema).default([]),
});

export const productQuerySchema = baseQuerySchema(
  ProductSortByEnum,
  ProductSearchByEnum,
).extend({
  productIds: z.array(idSchema).optional(),
  categoryId: idSchema.optional(),
  status: ProductStatusEnum.optional(),
  inventoryStatus: InventoryStatusEnum.optional(),
});
