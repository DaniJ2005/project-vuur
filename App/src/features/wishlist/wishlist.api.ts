import { api } from '@/lib/apiClient';

export interface WishlistItemResponse {
  id: string;
  userId: string;
  productsId: string;
  createdAt: string;
}

export const wishlistApi = {
  list: () => api.get<WishlistItemResponse[]>('/api/wishlist').then(r => r.data),

  add: (productsId: string) =>
    api.post<WishlistItemResponse>('/api/wishlist', { productsId }).then(r => r.data),

  remove: (productsId: string) => api.delete<void>(`/api/wishlist/${productsId}`).then(r => r.data),
};

export default wishlistApi;
