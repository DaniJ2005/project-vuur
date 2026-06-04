import { api } from "@/lib/apiClient";
import type { AdminUser, AdminCreateUserRequest, AdminUpdateUserRequest } from "../admin.types";

export const adminUsersApi = {
  getAll: () =>
    api.get<AdminUser[]>("/api/admin/users").then((r) => r.data),

  create: (payload: AdminCreateUserRequest) =>
    api.post<AdminUser>("/api/admin/users", payload).then((r) => r.data),

  update: (id: string, payload: AdminUpdateUserRequest) =>
    api.put<AdminUser>(`/api/admin/users/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    api.delete<void>(`/api/admin/users/${id}`).then((r) => r.data),
};