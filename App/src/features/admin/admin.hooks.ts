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

export function useAdminAnalytics() {
  return useQuery({
    queryKey: [...adminKeys.postgres, "analytics"],
    queryFn: adminApi.getAnalytics,
  });
}

export function useAdminActivityLog() {
  return useQuery({
    queryKey: [...adminKeys.postgres, "activity"],
    queryFn: adminApi.getActivityLog,
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

export function useCreateAdminPostgresRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableName, payload }: { tableName: string; payload: Record<string, any> }) =>
      adminApi.createPostgresRow(tableName, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.postgres }),
  });
}

export function useUpdateAdminPostgresRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableName, id, payload }: { tableName: string; id: string; payload: Record<string, any> }) =>
      adminApi.updatePostgresRow(tableName, id, payload),
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
