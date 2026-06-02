/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

type WishlistContextValue = {
  wishlist: string[];
  wishlist: string[];
  count: number;
  isInWishlist: (id: string) => boolean;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

// Seed with a couple of titles so the UI is not empty on first load.
// IDs match catalogData: Silksong, Split Fiction, Baldur's Gate 3.
// TODO: replace with GET /api/wishlist when backend exists.
const INITIAL_WISHLIST: string[] = [
  "6650a1b2c3d4e5f600000005",
  "6650a1b2c3d4e5f600000008",
  "6650a1b2c3d4e5f60000000d",
];

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>(INITIAL_WISHLIST);
  const [wishlist, setWishlist] = useState<string[]>(INITIAL_WISHLIST);

  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const addToWishlist = useCallback((id: string) => {
  const addToWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
  const toggleWishlist = useCallback((id: string) => {
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
