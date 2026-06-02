import { api } from "@/lib/apiClient";
import type { AdminActivityEntry } from "../admin.types";

export const adminActivityApi = {
  getActivityLog: () =>
    api.get<AdminActivityEntry[]>("/api/admin/activity").then((r) => r.data),
};
