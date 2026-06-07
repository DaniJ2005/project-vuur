import { api } from '@/lib/apiClient';

export interface WishlistItemResponse {
  id: string;
  userId: string;
  productsId: string;
  amount: number;
  createdAt: string;
}

export const wishlistApi = {
  list: () => api.get<WishlistItemResponse[]>('/api/wishlist').then(r => r.data),

  add: (productsId: string) =>
    api.post<WishlistItemResponse>('/api/wishlist', { productsId }).then(r => r.data),

  updateAmount: (productsId: string, amount: number) =>
    api.put<WishlistItemResponse>(`/api/wishlist/${productsId}/amount`, { amount }).then(r => r.data),

  remove: (productsId: string) => api.delete<void>(`/api/wishlist/${productsId}`).then(r => r.data),
};

export default wishlistApi;
