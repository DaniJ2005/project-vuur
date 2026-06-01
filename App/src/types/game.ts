export type GameType = "key" | "disc";

export type CatalogGame = {
  id: string;          // MongoDB ObjectId (24-char hex) — sent as productId on orders
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

export type CartGame = {
  id: string;          // MongoDB ObjectId (matches CatalogGame.id)
  title: string;
  platform: string;
  price: number;
  type: GameType;
};

export type CartItem = {
  game: CartGame;
  quantity: number;
};

export function toCatalogGame(g: CatalogGame): CartGame {
  return { id: g.id, title: g.title, platform: g.platform, price: g.price, type: g.type };
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.game.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartHasDisc(items: CartItem[]): boolean {
  return items.some((item) => item.game.type === "disc");
}
 