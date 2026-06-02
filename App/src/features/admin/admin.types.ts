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

export interface AdminDataSnapshot {
  postgresTables: AdminTable[];
  mongoProducts: Product[];
  refreshTokens: AdminRefreshToken[];
}
