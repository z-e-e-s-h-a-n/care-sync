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
  nullableStringSchema,
  slugSchema,
} from "../lib/schema";

export const createCategorySchema = z.object({
  parentId: idSchema.optional().nullable(),
  name: z.string().min(2),
  slug: slugSchema,
  description: nullableStringSchema,
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
  categoryId: idSchema.optional().nullable(),
  name: z.string().min(2),
  slug: slugSchema,
  description: nullableStringSchema,
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  stockCount: z.coerce.number().int().min(0).default(0),
  requiresShipping: z.boolean().default(true),
  status: ProductStatusEnum.default("draft"),
});

export const productQuerySchema = baseQuerySchema(
  ProductSortByEnum,
  ProductSearchByEnum,
).extend({
  categoryId: idSchema.optional(),
  status: ProductStatusEnum.optional(),
  inventoryStatus: InventoryStatusEnum.optional(),
});

export const addProductImageSchema = z.object({
  mediaId: idSchema,
});
