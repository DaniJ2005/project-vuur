import { api } from "@/lib/apiClient";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest
} from "./products.types";

export const productsApi = {
  getAll: () =>
    api.get<Product[]>("/api/products").then(r => r.data),

  getById: (id: string) =>
    api.get<Product>(`/api/products/${id}`).then(r => r.data),

  create: (body: CreateProductRequest) =>
    api.post<Product>("/api/products", body).then(r => r.data),

  update: (id: string, body: UpdateProductRequest) =>
    api.put<void>(`/api/products/${id}`, body).then(r => r.data),

  remove: (id: string) =>
    api.delete<void>(`/api/products/${id}`).then(r => r.data),
};