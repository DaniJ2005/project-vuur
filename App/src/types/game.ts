// ── Shared game types ──────────────────────────────────────────────────────────
// Used by GameCard, Catalog, CartSidebar, and homeData.
 
export type GameType = "key" | "disc";
 
/** Full game model — used in the catalog and game detail page */
export type CatalogGame = {
  id: number;
  title: string;
  description?: string;
  platform: string;
  genre: string;
  type: GameType;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviews: number;
  isNew: boolean;
  isFeatured: boolean;
};
 
/** Minimal model for the cart — subset of CatalogGame */
export type CartGame = {
  id: number;
  title: string;
  platform: string;
  price: number;
  type: GameType;
};
 
export function toCatalogGame(g: CatalogGame): CartGame {
  return { id: g.id, title: g.title, platform: g.platform, price: g.price, type: g.type };
}
 