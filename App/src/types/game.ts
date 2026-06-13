export type GameType = "key" | "disc";

/** Product-level view model for cards/lists (one card per game). */
export type CatalogGame = {
  id: string; // MongoDB ObjectId (24-char hex) — sent as productId on orders
  title: string;
  description?: string;
  genre: string;
  rating: number;
  reviews: number;

  // Pricing summary (driven by the cheapest variant).
  minPrice: number;
  bestOriginalPrice: number;
  bestDiscountPercent: number;

  platforms: string[];
  formats: GameType[];

  isNew: boolean;
  isFeatured: boolean;

  // Cheapest variant — used for quick "+ Kopen" from a card.
  defaultVariant: { platform: string; format: GameType; price: number };
};

/** One purchasable variant in the cart (a product + chosen platform + format). */
export type CartGame = {
  id: string; // MongoDB ObjectId (matches CatalogGame.id)
  title: string;
  platform: string;
  format: GameType;
  price: number;
};

export type CartItem = {
  game: CartGame;
  quantity: number;
};

/** Unique identity of a cart line: same game on two platforms/formats are distinct lines. */
export function lineKey(g: CartGame): string {
  return `${g.id}__${g.platform}__${g.format}`;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.game.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartHasDisc(items: CartItem[]): boolean {
  return items.some((item) => item.game.format === "disc");
}
