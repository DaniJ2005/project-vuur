import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./admin.api";

export const adminKeys = {
  postgres: ["admin", "postgres"] as const,
  mongoProducts: ["admin", "mongo", "products"] as const,
  redisTokens: ["admin", "redis", "refresh-tokens"] as const,
};

export function useAdminPostgresTables() {
  return useQuery({
    queryKey: adminKeys.postgres,
    queryFn: adminApi.getPostgresTables,
  });
}

export function useAdminMongoProducts() {
  return useQuery({
    queryKey: adminKeys.mongoProducts,
    queryFn: adminApi.getMongoProducts,
  });
}

export function useAdminRefreshTokens() {
  return useQuery({
    queryKey: adminKeys.redisTokens,
    queryFn: adminApi.getRefreshTokens,
  });
}

export function useDeleteAdminPostgresRow() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ tableName, id }: { tableName: string; id: string }) =>
      adminApi.deletePostgresRow(tableName, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.postgres }),
  });
}

export function useRevokeRefreshToken() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: adminApi.revokeRefreshToken,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.redisTokens }),
  });
}
