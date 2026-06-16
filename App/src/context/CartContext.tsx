/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";
import type { CartGame, CartItem } from "../types/game";
import { lineKey } from "../types/game";

type CartContextValue = {
  cartItems: CartItem[];
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (game: CartGame) => void;
  changeQty: (key: string, delta: number) => void;
  removeFromCart: (key: string) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  // A cart line is identified by product + platform + format, so the same game on
  // two platforms (or key vs disc) are separate lines.
  const addToCart = useCallback((game: CartGame) => {
    const key = lineKey(game);
    setCartItems((prev) => {
      const existing = prev.find((i) => lineKey(i.game) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i.game) === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { game, quantity: 1 }];
    });
  }, []);

  const changeQty = useCallback((key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (lineKey(i.game) === key ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCartItems((prev) => prev.filter((i) => lineKey(i.game) !== key));
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, cartOpen, openCart, closeCart, addToCart, changeQty, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
