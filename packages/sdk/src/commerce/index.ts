import apiClient, { executeApi } from "../lib/api-client";
import type {
  AddCartItemType,
  CartResponse,
  CreateOrderType,
  OrderQueryResponse,
  OrderQueryType,
  OrderResponse,
  ProductCategoryResponse,
  ProductCategoryType,
  ProductQueryResponse,
  ProductQueryType,
  ProductResponse,
  ProductType,
  UpdateOrderStatusType,
} from "@workspace/contracts/commerce";

export const createCategory = (data: ProductCategoryType) =>
  executeApi<ProductCategoryResponse>(() =>
    apiClient.post("/commerce/categories", data),
  );

export const listCategories = () =>
  executeApi<ProductCategoryResponse[]>(() =>
    apiClient.get("/commerce/categories"),
  );

export const createProduct = (data: ProductType) =>
  executeApi<ProductResponse>(() => apiClient.post("/commerce/products", data));

export const listProducts = (params?: ProductQueryType) =>
  executeApi<ProductQueryResponse>(() =>
    apiClient.get("/commerce/products", { params }),
  );

export const getProduct = (id: string) =>
  executeApi<ProductResponse>(() => apiClient.get(`/commerce/products/${id}`));

export const updateProduct = (id: string, data: Partial<ProductType>) =>
  executeApi<ProductResponse>(() =>
    apiClient.put(`/commerce/products/${id}`, data),
  );

export const getCart = () =>
  executeApi<CartResponse>(() => apiClient.get("/commerce/cart"));

export const upsertCartItem = (data: AddCartItemType) =>
  executeApi(() => apiClient.post("/commerce/cart/items", data));

export const removeCartItem = (cartItemId: string) =>
  executeApi(() => apiClient.delete(`/commerce/cart/items/${cartItemId}`));

export const createOrder = (data: CreateOrderType) =>
  executeApi<OrderResponse>(() => apiClient.post("/commerce/orders", data));

export const listOrders = (params?: OrderQueryType) =>
  executeApi<OrderQueryResponse>(() =>
    apiClient.get("/commerce/orders", { params }),
  );

export const getOrder = (id: string) =>
  executeApi<OrderResponse>(() => apiClient.get(`/commerce/orders/${id}`));

export const updateOrderStatus = (id: string, data: UpdateOrderStatusType) =>
  executeApi<OrderResponse>(() =>
    apiClient.patch(`/commerce/orders/${id}/status`, data),
  );
