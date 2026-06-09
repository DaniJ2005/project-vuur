/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext } from "react";
import { useWishlistQuery, useAddWishlist, useRemoveWishlist } from '@/features/wishlist/wishlist.hooks';

type WishlistContextValue = {
  wishlist: string[];
  count: number;
  isInWishlist: (id: string) => boolean;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: items = [] } = useWishlistQuery();
  const addMutation = useAddWishlist();
  const removeMutation = useRemoveWishlist();

  const wishlist = items.map((i) => i.productsId);

  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const addToWishlist = useCallback((id: string) => {
    addMutation.mutate(id);
  }, [addMutation]);

  const removeFromWishlist = useCallback((id: string) => {
    removeMutation.mutate(id);
  }, [removeMutation]);

  const toggleWishlist = useCallback((id: string) => {
    if (wishlist.includes(id)) removeMutation.mutate(id);
    else addMutation.mutate(id);
  }, [wishlist, addMutation, removeMutation]);

  const clear = useCallback(async () => {
    await Promise.all(items.map((i) => removeMutation.mutateAsync(i.productsId)));
  }, [items, removeMutation]);

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
