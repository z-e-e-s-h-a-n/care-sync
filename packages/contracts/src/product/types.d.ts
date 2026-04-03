import type z from "zod";
import type { Product, ProductCategory } from "@workspace/db/browser";
import type {
  createCategorySchema,
  categoryQuerySchema,
  createProductSchema,
  productQuerySchema,
} from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { MediaResponse } from "../media/types";

export type CreateCategoryType = z.input<typeof createCategorySchema>;
export type CategoryQueryType = z.input<typeof categoryQuerySchema>;

export type CreateProductType = z.input<typeof createProductSchema>;
export type ProductQueryType = z.input<typeof productQuerySchema>;

export type ProductCategoryResponse = Sanitize<ProductCategory> & {
  parent?: ProductCategoryResponse;
  children?: ProductCategoryResponse[];
};

export type ProductResponse = Sanitize<Product> & {
  category?: ProductCategoryResponse;
  images: MediaResponse[];
};

export interface ProductQueryResponse extends BaseQueryResponse {
  products: ProductResponse[];
}

export interface CategoryQueryResponse extends BaseQueryResponse {
  categories: ProductCategoryResponse[];
}
