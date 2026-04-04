import apiClient, { executeApi } from "../lib/api-client";
import type {
  CartItemType,
  UpdateCartItemType,
  SyncCartType,
  CheckoutType,
  CheckoutResponse,
  CreateManualOrderType,
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

export const addToCart = (data: CartItemType) =>
  executeApi<CartItemResponse>(() => apiClient.post("/orders/cart", data));

export const updateCartItem = (itemId: string, data: UpdateCartItemType) =>
  executeApi<CartItemResponse>(() =>
    apiClient.put(`/orders/cart/${itemId}`, data),
  );

export const syncCart = (data: SyncCartType) =>
  executeApi<{ items: CartItemResponse[] }>(() =>
    apiClient.post("/orders/cart/sync", data),
  );

export const removeCartItem = (itemId: string) =>
  executeApi<void>(() => apiClient.delete(`/orders/cart/${itemId}`));

export const clearCart = () =>
  executeApi<void>(() => apiClient.delete("/orders/cart"));

// ── Orders ────────────────────────────────────────────────

export const checkout = (data: CheckoutType) =>
  executeApi<CheckoutResponse>(() => apiClient.post("/orders", data));

export const createOrder = (data: CreateManualOrderType) =>
  executeApi<OrderResponse>(() => apiClient.post("/orders/manual", data));

export const listOrders = (params?: OrderQueryType) =>
  executeApi<OrderQueryResponse>(() => apiClient.get("/orders", { params }));

export const getOrder = (orderId: string) =>
  executeApi<OrderResponse>(() => apiClient.get(`/orders/${orderId}`));

export const updateOrderStatus = (
  orderId: string,
  data: UpdateOrderStatusType,
) =>
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
