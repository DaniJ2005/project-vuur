import type { Product, ProductVariant } from "./products.types";
import type { CatalogGame, GameType } from "@/types/game";

function cheapestVariant(variants: ProductVariant[]): ProductVariant | undefined {
  return variants.reduce<ProductVariant | undefined>(
    (min, v) => (!min || v.price < min.price ? v : min),
    undefined,
  );
}

/** Product (with variants) → product-level card view model. */
export function toCatalogGame(p: Product): CatalogGame {
  const variants = p.variants ?? [];
  const cheap = cheapestVariant(variants);
  const platforms = Array.from(new Set(variants.map((v) => v.platform)));
  const formats = Array.from(new Set(variants.map((v) => v.format))) as GameType[];
  const flags = p.flags ?? [];

  return {
    id: p.id,
    title: p.productName,
    description: p.productDescription,
    genre: p.genre,
    rating: p.rating,
    reviews: 0,

    minPrice: p.minPrice ?? cheap?.price ?? 0,
    bestOriginalPrice: cheap?.originalPrice ?? cheap?.price ?? 0,
    bestDiscountPercent: cheap?.discountPercent ?? 0,

    platforms,
    formats,

    isNew: flags.includes("isNew"),
    isFeatured: flags.includes("isFeatured"),

    defaultVariant: {
      platform: cheap?.platform ?? platforms[0] ?? "",
      format: cheap?.format ?? formats[0] ?? "key",
      price: cheap?.price ?? p.minPrice ?? 0,
    },
  };
}

// ── Variant helpers for the detail page ──────────────────────────────────────
export function distinctPlatforms(p: Product): string[] {
  return Array.from(new Set((p.variants ?? []).map((v) => v.platform)));
}

export function formatsFor(p: Product, platform: string): GameType[] {
  return Array.from(
    new Set((p.variants ?? []).filter((v) => v.platform === platform).map((v) => v.format)),
  ) as GameType[];
}

export function findVariant(p: Product, platform: string, format: string): ProductVariant | undefined {
  return (p.variants ?? []).find((v) => v.platform === platform && v.format === format);
}
