import apiClient, { executeApi } from "../lib/api-client";
import type {
  AddToCartType,
  UpdateCartItemType,
  CreateOrderType,
  UpdateOrderStatusType,
  CreateShipmentType,
  UpdateShipmentType,
  OrderQueryType,
  CartItemResponse,
  OrderResponse,
  OrderQueryResponse,
  ShipmentResponse,
} from "@workspace/contracts/order";

// ── Cart ──────────────────────────────────────────────────

export const getCart = () =>
  executeApi<{ items: CartItemResponse[] }>(() =>
    apiClient.get("/orders/cart"),
  );

export const addToCart = (data: AddToCartType) =>
  executeApi<CartItemResponse>(() => apiClient.post("/orders/cart", data));

export const updateCartItem = (itemId: string, data: UpdateCartItemType) =>
  executeApi<CartItemResponse>(() =>
    apiClient.put(`/orders/cart/${itemId}`, data),
  );

export const removeCartItem = (itemId: string) =>
  executeApi<void>(() => apiClient.delete(`/orders/cart/${itemId}`));

export const clearCart = () =>
  executeApi<void>(() => apiClient.delete("/orders/cart"));

// ── Orders ────────────────────────────────────────────────

export const createOrder = (data: CreateOrderType) =>
  executeApi<OrderResponse>(() => apiClient.post("/orders", data));

export const listOrders = (params?: OrderQueryType) =>
  executeApi<OrderQueryResponse>(() =>
    apiClient.get("/orders", { params }),
  );

export const getOrder = (orderId: string) =>
  executeApi<OrderResponse>(() => apiClient.get(`/orders/${orderId}`));

export const updateOrderStatus = (orderId: string, data: UpdateOrderStatusType) =>
  executeApi<OrderResponse>(() =>
    apiClient.patch(`/orders/${orderId}/status`, data),
  );

// ── Shipments ─────────────────────────────────────────────

export const createShipment = (orderId: string, data: CreateShipmentType) =>
  executeApi<ShipmentResponse>(() =>
    apiClient.post(`/orders/${orderId}/shipments`, data),
  );

export const updateShipment = (shipmentId: string, data: UpdateShipmentType) =>
  executeApi<ShipmentResponse>(() =>
    apiClient.patch(`/orders/shipments/${shipmentId}`, data),
  );
