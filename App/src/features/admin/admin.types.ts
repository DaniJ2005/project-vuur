import type { Product } from "@/features/products/products.types";

export interface AdminTable {
  name: string;
  canDelete: boolean;
  rows: AdminRow[];
}

/** All column values from the backend are primitives or null */
export type AdminRowValue = string | number | boolean | null;
export type AdminRow = Record<string, AdminRowValue>;

/**
 * The edit form always holds string values because HTML inputs work with strings.
 * The hook converts them back to the correct primitive types before sending to the API.
 */
export type EditForm = Record<string, string>;

/**
 * A single field change captured before the user confirms an edit.
 */
export interface FieldChange {
  key: string;
  before: string;
  after: string;
}

/**
 * The postgres PATCH/POST payload: the same primitive union as AdminRow
 * but omitting 'id' (auto-generated) so we use Omit on a mapped type.
 */
export type AdminRowPayload = Record<string, AdminRowValue>;

export interface AdminRefreshToken {
  token: string;
  tokenPreview: string;
  userId: string;
  expiresAt: string | null;
}

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

export interface AdminActivityEntry {
  id: string;
  timestamp: string;
  description: string;
}

export interface AdminDataSnapshot {
  postgresTables: AdminTable[];
  mongoProducts: Product[];
  refreshTokens: AdminRefreshToken[];
}
