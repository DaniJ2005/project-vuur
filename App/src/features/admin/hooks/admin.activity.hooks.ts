import { useQuery } from "@tanstack/react-query";
import { adminActivityApi } from "../api/admin.activity.api";

export const adminActivityKeys = {
  all: ["admin", "activity"] as const,
};

export function useAdminActivityLog() {
  return useQuery({
    queryKey: adminActivityKeys.all,
    queryFn: adminActivityApi.getActivityLog,
  });
}
