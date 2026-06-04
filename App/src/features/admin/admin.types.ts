import type { Product } from "@/features/products/products.types";

// ── Generic table types

export type AdminRowValue = string | number | boolean | null;
export type AdminRow = Record<string, AdminRowValue>;
export type EditForm = Record<string, string>;

export interface FieldChange {
  key: string;
  before: string;
  after: string;
}

// ── Users
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "customer" | "admin";
}

export interface AdminUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "customer" | "admin";
}

// ── Orders
export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export interface AdminOrder {
  id: string;
  userId: string | null;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  status: OrderStatus;
  requiresShipping: boolean;
  shippingMethod: string | null;
  shippingPrice: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Addresses
export interface AdminAddress {
  id: string;
  userId: string;
  userEmail: string;
  label: string;
  street: string;
  houseNumber: string;
  houseExt: string;
  postCode: string;
  city: string;
  countryCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Wishlist 
export interface AdminWishlistItem {
  id: string;
  userId: string;
  userEmail: string;
  productsId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Redis 
export interface AdminRefreshToken {
  token: string;
  tokenPreview: string;
  userId: string;
  expiresAt: string | null;
}

// ── Analytics
export interface AdminAnalyticsTopProduct {
  productId: string;
  productName: string;
  orderCount: number;
}

export interface AdminAnalytics {
  totalOrders: number;
  totalPayments: number;
  totalWishlistItems: number;
  totalUsers: number;
  totalProducts: number;
  totalDistinctOrderedProducts: number;
  totalPageViews: number;
  topProducts: AdminAnalyticsTopProduct[];
}

// ── Activity
export interface AdminActivityEntry {
  id: string;
  timestamp: string;
  description: string;
}

export interface AdminDataSnapshot {
  mongoProducts: Product[];
  refreshTokens: AdminRefreshToken[];
}