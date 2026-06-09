import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminRedisApi } from "../api/admin.redis.api";

export const adminRedisKeys = {
  refreshTokens: ["admin", "redis", "refresh-tokens"] as const,
};

export function useAdminRefreshTokens() {
  return useQuery({
    queryKey: adminRedisKeys.refreshTokens,
    queryFn: adminRedisApi.getRefreshTokens,
  });
}

export function useRevokeRefreshToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminRedisApi.revokeRefreshToken,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminRedisKeys.refreshTokens }),
  });
}
