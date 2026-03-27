import type z from "zod";
import type {
  Cart,
  Order,
  Product,
  ProductCategory,
} from "@workspace/db/browser";
import type {
  addCartItemSchema,
  createOrderSchema,
  orderQuerySchema,
  productCategorySchema,
  productQuerySchema,
  productSchema,
  updateOrderStatusSchema,
} from "./schema";
import type { BaseQueryResponse, Sanitize } from "../lib/types";
import type { MediaResponse } from "../media/types";
import type { PaymentResponse } from "../payment/types";
import type { PatientProfileResponse } from "../patient/types";

export type ProductCategoryType = z.input<typeof productCategorySchema>;
export type ProductType = z.input<typeof productSchema>;
export type ProductQueryType = z.input<typeof productQuerySchema>;
export type AddCartItemType = z.input<typeof addCartItemSchema>;
export type CreateOrderType = z.input<typeof createOrderSchema>;
export type OrderQueryType = z.input<typeof orderQuerySchema>;
export type UpdateOrderStatusType = z.input<typeof updateOrderStatusSchema>;

export type ProductResponse = Sanitize<Product> & {
  category?: ProductCategoryResponse;
  image?: MediaResponse;
};

export type ProductCategoryResponse = Sanitize<ProductCategory>;

export type CartResponse = Sanitize<Cart> & {
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: ProductResponse;
  }>;
};

export type OrderResponse = Sanitize<Order> & {
  items?: Array<{
    id: string;
    productId?: string;
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  patient?: PatientProfileResponse;
  shipment?: {
    id: string;
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
  };
  payments?: PaymentResponse[];
};

export interface ProductQueryResponse extends BaseQueryResponse {
  products: ProductResponse[];
}

export interface OrderQueryResponse extends BaseQueryResponse {
  orders: OrderResponse[];
}
