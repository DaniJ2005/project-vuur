import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPostgresApi } from "../api/admin.postgres.api";
import type { AdminRowPayload } from "../admin.types";

export const adminPostgresKeys = {
  all: ["admin", "postgres"] as const,
};

export function useAdminPostgresTables() {
  return useQuery({
    queryKey: adminPostgresKeys.all,
    queryFn: adminPostgresApi.getTables,
  });
}

export function useDeleteAdminPostgresRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableName, id }: { tableName: string; id: string }) =>
      adminPostgresApi.deleteRow(tableName, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminPostgresKeys.all }),
  });
}

export function useCreateAdminPostgresRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableName, payload }: { tableName: string; payload: AdminRowPayload }) =>
      adminPostgresApi.createRow(tableName, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminPostgresKeys.all }),
  });
}

export function useUpdateAdminPostgresRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableName, id, payload }: { tableName: string; id: string; payload: AdminRowPayload }) =>
      adminPostgresApi.updateRow(tableName, id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminPostgresKeys.all }),
  });
}
