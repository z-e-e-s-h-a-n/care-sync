import type z from "zod";
import type { Order, OrderItem, Shipment, CartItem } from "@workspace/db/browser";
import type {
  addToCartSchema,
  updateCartItemSchema,
  checkoutSchema,
  updateOrderStatusSchema,
  createShipmentSchema,
  updateShipmentSchema,
  orderQuerySchema,
} from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { ProductResponse } from "../product/types";
import type { BaseUserResponse } from "../user/types";

export type AddToCartType = z.input<typeof addToCartSchema>;
export type UpdateCartItemType = z.input<typeof updateCartItemSchema>;
export type CheckoutType = z.input<typeof checkoutSchema>;
export type UpdateOrderStatusType = z.input<typeof updateOrderStatusSchema>;
export type CreateShipmentType = z.input<typeof createShipmentSchema>;
export type UpdateShipmentType = z.input<typeof updateShipmentSchema>;
export type OrderQueryType = z.input<typeof orderQuerySchema>;

export type CartItemResponse = Sanitize<CartItem> & {
  product: ProductResponse;
};

export type ShipmentResponse = Sanitize<Shipment>;

export type OrderItemResponse = Sanitize<OrderItem> & {
  product?: ProductResponse | null;
};

export type OrderResponse = Sanitize<Order> & {
  user: BaseUserResponse;
  items: OrderItemResponse[];
  shipments?: ShipmentResponse[];
};

export interface OrderQueryResponse extends BaseQueryResponse {
  orders: OrderResponse[];
}
