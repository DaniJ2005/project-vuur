import { api } from "@/lib/apiClient";
import type { Product } from "@/features/products/products.types";
import type { AdminRefreshToken, AdminTable } from "./admin.types";

export const adminApi = {
  getPostgresTables: () =>
    api.get<AdminTable[]>("/api/admin/postgres").then((r) => r.data),

  deletePostgresRow: (tableName: string, id: string) =>
    api.delete<void>(`/api/admin/postgres/${tableName}/${id}`).then((r) => r.data),

  getMongoProducts: () =>
    api.get<Product[]>("/api/admin/mongo/products").then((r) => r.data),

  getRefreshTokens: () =>
    api.get<AdminRefreshToken[]>("/api/admin/redis/refresh-tokens").then((r) => r.data),

  revokeRefreshToken: (token: string) =>
    api.delete<void>(`/api/admin/redis/refresh-tokens/${encodeURIComponent(token)}`).then((r) => r.data),
};
