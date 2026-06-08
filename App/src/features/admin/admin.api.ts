import { api } from "@/lib/apiClient";
import type { AdminRow, AdminRowPayload, AdminTable, AdminAnalytics, AdminActivityEntry, AdminRefreshToken } from "./admin.types";
import type { Product } from "@/features/products/products.types";

export const adminApi = {
  getPostgresTables: () =>
    api.get<AdminTable[]>("/api/admin/postgres").then((r) => r.data),

  deletePostgresRow: (tableName: string, id: string) =>
    api.delete<void>(`/api/admin/postgres/${tableName}/${id}`).then((r) => r.data),

  createPostgresRow: (tableName: string, payload: AdminRowPayload) =>
    api.post<AdminRow>(`/api/admin/postgres/${tableName}`, payload).then((r) => r.data),

  updatePostgresRow: (tableName: string, id: string, payload: AdminRowPayload) =>
    api.put<AdminRow>(`/api/admin/postgres/${tableName}/${id}`, payload).then((r) => r.data),

  getMongoProducts: () =>
    api.get<Product[]>("/api/admin/mongo/products").then((r) => r.data),

  getRefreshTokens: () =>
    api.get<AdminRefreshToken[]>("/api/admin/redis/refresh-tokens").then((r) => r.data),

  revokeRefreshToken: (token: string) =>
    api.delete<void>(`/api/admin/redis/refresh-tokens/${token}`).then((r) => r.data),

  getAnalytics: () =>
    api.get<AdminAnalytics>("/api/admin/analytics").then((r) => r.data),

  getActivityLog: () =>
    api.get<AdminActivityEntry[]>("/api/admin/activity").then((r) => r.data),
};