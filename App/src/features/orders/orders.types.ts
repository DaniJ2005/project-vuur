// Mirrors the backend Order DTOs (Vuur.Api/Features/Orders/OrderModels.cs).
// System.Text.Json serializes camelCase, so field names line up 1:1.
//
// NOTE: productId here is a MongoDB ObjectId (string), whereas the hardcoded
// catalog in src/data/catalogData.ts still uses numeric ids. Wiring orders to
// the real API therefore also depends on the products API. The old types in
// src/data/ordersData.ts are superseded by this file.

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";
export type ProductType = "key" | "disc";

export interface OrderItem {
  id: string;
  productId: string;          // MongoDB ObjectId
  productName: string;        // snapshot at purchase
  productType: ProductType;
  platform?: string | null;
  unitPrice: number;
  quantity: number;
  keys: string[];             // assigned key codes; empty for disc items
}

export interface ShippingAddress {
  street: string;
  houseNumber: string;
  houseExt: string;
  postCode: string;
  city: string;
  countryCode: string;
}

export interface Order {
  id: string;
  userId?: string | null;     // null for guest orders
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  status: OrderStatus;
  requiresShipping: boolean;
  shippingMethod?: string | null;
  shippingPrice: number;
  totalAmount: number;
  shippingAddress?: ShippingAddress | null; // null for key-only orders
  items: OrderItem[];
  createdAt: string;          // ISO datetime
  updatedAt: string;
  // Subtotal isn't stored server-side; derive it: totalAmount - shippingPrice.
  // Payment method lives on the (separate) payment record, not the order.
}

// ─── Request payload for POST /api/orders ────────────────────────────────────

export interface CreateOrderItem {
  productId: string;
  platform: string;          // selects the variant
  format: ProductType;       // "key" | "disc"
  quantity: number;
  // No price/name — the server snapshots those from the chosen variant.
}

export interface CreateOrderShippingAddress {
  street: string;
  houseNumber: string;
  houseExt?: string;
  postCode: string;
  city: string;
  countryCode: string;
}

export interface CreateOrderRequest {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  items: CreateOrderItem[];
  shippingMethod?: string;
  shippingAddress?: CreateOrderShippingAddress | null; // omit for key-only orders
}
