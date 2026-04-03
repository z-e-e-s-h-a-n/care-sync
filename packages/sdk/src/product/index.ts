import apiClient, { executeApi } from "../lib/api-client";
import type {
  CreateCategoryType,
  CategoryQueryType,
  CategoryQueryResponse,
  ProductCategoryResponse,
  CreateProductType,
  ProductQueryType,
  ProductQueryResponse,
  ProductResponse,
  AddProductImageType,
} from "@workspace/contracts/product";

// ── Categories ────────────────────────────────────────────

export const listCategories = (params?: CategoryQueryType) =>
  executeApi<CategoryQueryResponse>(() =>
    apiClient.get("/products/categories", { params }),
  );

export const getCategory = (identifier: string) =>
  executeApi<ProductCategoryResponse>(() =>
    apiClient.get(`/products/categories/${identifier}`),
  );

export const createCategory = (data: CreateCategoryType) =>
  executeApi<ProductCategoryResponse>(() =>
    apiClient.post("/products/categories", data),
  );

export const updateCategory = (id: string, data: CreateCategoryType) =>
  executeApi<ProductCategoryResponse>(() =>
    apiClient.put(`/products/categories/${id}`, data),
  );

// ── Products ──────────────────────────────────────────────

export const listProducts = (params?: ProductQueryType) =>
  executeApi<ProductQueryResponse>(() =>
    apiClient.get("/products", { params }),
  );

export const getProduct = (identifier: string) =>
  executeApi<ProductResponse>(() => apiClient.get(`/products/${identifier}`));

export const createProduct = (data: CreateProductType) =>
  executeApi<ProductResponse>(() => apiClient.post("/products", data));

export const updateProduct = (id: string, data: CreateProductType) =>
  executeApi<ProductResponse>(() => apiClient.put(`/products/${id}`, data));

export const deleteProduct = (id: string) =>
  executeApi<void>(() => apiClient.delete(`/products/${id}`));

export const addProductImage = (productId: string, data: AddProductImageType) =>
  executeApi<void>(() =>
    apiClient.post(`/products/${productId}/images`, data),
  );

export const removeProductImage = (productId: string, imageId: string) =>
  executeApi<void>(() =>
    apiClient.delete(`/products/${productId}/images/${imageId}`),
  );
