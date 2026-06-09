import { useQuery } from "@tanstack/react-query";
import { adminAnalyticsApi } from "../api/admin.analytics.api";

export const adminAnalyticsKeys = {
  all: ["admin", "analytics"] as const,
};

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminAnalyticsKeys.all,
    queryFn: adminAnalyticsApi.getAnalytics,
  });
}
