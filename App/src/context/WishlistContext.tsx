/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

type WishlistContextValue = {
  wishlist: number[];
  count: number;
  isInWishlist: (id: number) => boolean;
  addToWishlist: (id: number) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (id: number) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

// Seed with a couple of titles so the UI is not empty on first load.
// TODO: replace with GET /api/wishlist when backend exists.
const INITIAL_WISHLIST: number[] = [5, 8, 13];

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<number[]>(INITIAL_WISHLIST);

  const isInWishlist = useCallback((id: number) => wishlist.includes(id), [wishlist]);

  const addToWishlist = useCallback((id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlist((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleWishlist = useCallback((id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clear = useCallback(() => setWishlist([]), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clear,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
