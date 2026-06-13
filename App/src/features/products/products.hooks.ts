import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { productsApi } from "./products.api";
import type { ProductQuery } from "./products.types";

export const productsKey = ["products"] as const;
export const productKey = (id: string) => ["products", id] as const;

/** Catalog: cursor-paginated infinite list. Changing `filters` starts a fresh query. */
export function useProductsInfinite(
  filters: Omit<ProductQuery, "cursor" | "limit">,
  limit = 20,
) {
  return useInfiniteQuery({
    queryKey: ["products", "page", { ...filters, limit }],
    queryFn: ({ pageParam }) =>
      productsApi.getPage({ ...filters, limit, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  });
}

/** Single page fetch — for Home sections, related games, etc. */
export function useProductsQuery(filters: ProductQuery) {
  return useQuery({
    queryKey: ["products", "query", filters],
    queryFn: () => productsApi.getPage(filters),
    staleTime: 60_000,
  });
}

export function useProductFacets() {
  return useQuery({
    queryKey: ["products", "facets"],
    queryFn: productsApi.getFacets,
    staleTime: 10 * 60_000,
  });
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: ["products", "byIds", [...ids].sort()],
    queryFn: () => productsApi.getByIds(ids),
    enabled: ids.length > 0,
    staleTime: 60_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKey(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: productsKey }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productsApi.update>[1] }) =>
      productsApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: productsKey });
      qc.invalidateQueries({ queryKey: productKey(vars.id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: productsKey }),
  });
}
