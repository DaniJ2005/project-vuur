import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from './wishlist.api';
import { useMe } from '@/features/auth/auth.hooks';

export const wishlistKey = ['wishlist'] as const;

export function useWishlistQuery() {
  const { data: user } = useMe();
  return useQuery({
    queryKey: wishlistKey,
    queryFn: wishlistApi.list,
    enabled: user !== undefined,
    staleTime: 5 * 60_000,
  });
}

export function useAddWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productsId: string) => wishlistApi.add(productsId),
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKey }),
  });
}

export function useRemoveWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productsId: string) => wishlistApi.remove(productsId),
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKey }),
  });
}
