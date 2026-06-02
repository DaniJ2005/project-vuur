/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";
import type { CartGame, CartItem } from "../types/game";

type CartContextValue = {
  cartItems: CartItem[];
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (game: CartGame) => void;
  changeQty: (gameId: string, delta: number) => void;
  removeFromCart: (gameId: string) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback((game: CartGame) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.game.id === game.id);
      if (existing) {
        return prev.map((i) =>
          i.game.id === game.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { game, quantity: 1 }];
    });
  }, []);

  const changeQty = useCallback((gameId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.game.id === gameId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((gameId: string) => {
    setCartItems((prev) => prev.filter((i) => i.game.id !== gameId));
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
