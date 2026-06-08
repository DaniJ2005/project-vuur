import { api } from "@/lib/apiClient";
import type { AdminOrder, OrderStatus } from "../admin.types";

export const adminOrdersApi = {
  getAll: () =>
    api.get<AdminOrder[]>("/api/admin/orders").then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<AdminOrder>(`/api/admin/orders/${id}/status`, { status }).then((r) => r.data),

  delete: (id: string) =>
    api.delete<void>(`/api/admin/orders/${id}`).then((r) => r.data),
};