import { api } from "@/lib/apiClient";
import type { Product } from "@/features/products/products.types";

export const adminMongoApi = {
  getProducts: () =>
    api.get<Product[]>("/api/admin/mongo/products").then((r) => r.data),
};
