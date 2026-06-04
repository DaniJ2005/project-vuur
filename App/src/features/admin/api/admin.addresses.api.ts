import { api } from "@/lib/apiClient";
import type { AdminAddress } from "../admin.types";

export const adminAddressesApi = {
  getAll: () =>
    api.get<AdminAddress[]>("/api/admin/addresses").then((r) => r.data),

  delete: (id: string) =>
    api.delete<void>(`/api/admin/addresses/${id}`).then((r) => r.data),
};