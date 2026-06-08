import { api } from "@/lib/apiClient";
import type { AdminRefreshToken } from "../admin.types";

export const adminRedisApi = {
  getRefreshTokens: () =>
    api.get<AdminRefreshToken[]>("/api/admin/redis/refresh-tokens").then((r) => r.data),

  revokeRefreshToken: (token: string) =>
    api.delete<void>(`/api/admin/redis/refresh-tokens/${encodeURIComponent(token)}`).then((r) => r.data),
};
