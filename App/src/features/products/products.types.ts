import type { GameType } from "@/types/game";

export interface ProductVariant {
  platform: string;
  format: GameType; // "key" | "disc"
  price: number;
  originalPrice: number;
  discountPercent: number;
}

export interface Product {
  id: string;

  productName: string;
  productDescription?: string;
  genre: string;

  variants: ProductVariant[];
  minPrice: number;

  rating: number;
  flags: string[];

  createdAt?: string;
  updatedAt?: string;
}

// ── Admin write models ─────────────────────────────────────────────────────────
export interface ProductVariantInput {
  platform: string;
  format: GameType;
  price: number;
  originalPrice: number;
  discountPercent: number;
}

export interface CreateProductRequest {
  productName: string;
  productDescription?: string;
  genre: string;
  variants: ProductVariantInput[];
  rating: number;
  flags: string[];
}

export interface UpdateProductRequest {
  productName?: string;
  productDescription?: string;
  genre?: string;
  variants?: ProductVariantInput[];
  rating?: number;
  flags?: string[];
}

// ── Catalog query / pagination ───────────────────────────────────────────────
export type ProductSort = "newest" | "price_asc" | "price_desc" | "rating" | "name";

export interface ProductQuery {
  limit?: number;
  cursor?: string | null;
  sort?: ProductSort;
  search?: string;
  platform?: string;
  format?: GameType | "";
  genre?: string;
  maxPrice?: number;
  flag?: string;
}

export interface ProductPage {
  items: Product[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number | null;
}

export interface ProductFacets {
  genres: string[];
  platforms: string[];
}
