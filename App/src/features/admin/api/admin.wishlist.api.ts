import { api } from "@/lib/apiClient";
import type { AdminWishlistItem } from "../admin.types";

export const adminWishlistApi = {
  getAll: () =>
    api.get<AdminWishlistItem[]>("/api/admin/wishlist").then((r) => r.data),

  delete: (id: string) =>
    api.delete<void>(`/api/admin/wishlist/${id}`).then((r) => r.data),
};