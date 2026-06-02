import { api } from "@/lib/apiClient";
import type { AdminTable, AdminRow, AdminRowPayload } from "../admin.types";

export const adminPostgresApi = {
  getTables: () =>
    api.get<AdminTable[]>("/api/admin/postgres").then((r) => r.data),

  deleteRow: (tableName: string, id: string) =>
    api.delete<void>(`/api/admin/postgres/${tableName}/${id}`).then((r) => r.data),

  createRow: (tableName: string, payload: AdminRowPayload) =>
    api.post<AdminRow>(`/api/admin/postgres/${tableName}`, payload).then((r) => r.data),

  updateRow: (tableName: string, id: string, payload: AdminRowPayload) =>
    api.put<AdminRow>(`/api/admin/postgres/${tableName}/${id}`, payload).then((r) => r.data),
};
