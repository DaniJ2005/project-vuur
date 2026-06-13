import { api } from "@/lib/apiClient";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductPage,
  ProductFacets,
  ProductQuery,
} from "./products.types";

function toParams(q: ProductQuery): Record<string, string> {
  const p: Record<string, string> = {};
  if (q.limit != null) p.limit = String(q.limit);
  if (q.cursor) p.cursor = q.cursor;
  if (q.sort) p.sort = q.sort;
  if (q.search) p.search = q.search;
  if (q.platform) p.platform = q.platform;
  if (q.format) p.format = q.format;
  if (q.genre) p.genre = q.genre;
  if (q.maxPrice != null) p.maxPrice = String(q.maxPrice);
  if (q.flag) p.flag = q.flag;
  return p;
}

export const productsApi = {
  getPage: (q: ProductQuery) =>
    api.get<ProductPage>("/api/products", { params: toParams(q) }).then((r) => r.data),

  getFacets: () =>
    api.get<ProductFacets>("/api/products/facets").then((r) => r.data),

  getByIds: (ids: string[]) =>
    ids.length === 0
      ? Promise.resolve([] as Product[])
      : api.get<Product[]>("/api/products/by-ids", { params: { ids: ids.join(",") } }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Product>(`/api/products/${id}`).then((r) => r.data),

  create: (body: CreateProductRequest) =>
    api.post<Product>("/api/products", body).then((r) => r.data),

  update: (id: string, body: UpdateProductRequest) =>
    api.put<void>(`/api/products/${id}`, body).then((r) => r.data),

  remove: (id: string) =>
    api.delete<void>(`/api/products/${id}`).then((r) => r.data),
};
