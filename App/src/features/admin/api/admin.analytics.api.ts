import { api } from "@/lib/apiClient";
import type { AdminAnalytics } from "../admin.types";

export const adminAnalyticsApi = {
  getAnalytics: () =>
    api.get<AdminAnalytics>("/api/admin/analytics").then((r) => r.data),
};
