import type { Product } from "@/features/products/products.types";

export interface AdminTable {
  name: string;
  canDelete: boolean;
  rows: AdminRow[];
}

export type AdminRow = Record<string, string | number | boolean | null>;

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
