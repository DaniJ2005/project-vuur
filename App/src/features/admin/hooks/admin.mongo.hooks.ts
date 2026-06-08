import { useQuery } from "@tanstack/react-query";
import { adminMongoApi } from "../api/admin.mongo.api";

export const adminMongoKeys = {
  products: ["admin", "mongo", "products"] as const,
};

export function useAdminMongoProducts() {
  return useQuery({
    queryKey: adminMongoKeys.products,
    queryFn: adminMongoApi.getProducts,
  });
}
