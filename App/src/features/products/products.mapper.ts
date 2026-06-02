import type { Product } from "./products.types";
import type { CatalogGame } from "@/types/game";

export function toCatalogGame(p: Product): CatalogGame {
  return {
    id: p.id,
    title: p.productName,
    description: p.productDescription,

    price: p.price,
    originalPrice: p.originalPrice,
    discountPercent: p.discountPercent,

    rating: p.rating,
    reviews: 0,

    platform: p.platform,
    genre: p.genre,
    type: p.type as "key" | "disc",

    isNew: p.isNew,
    isFeatured: p.isFeatured,
  };
}