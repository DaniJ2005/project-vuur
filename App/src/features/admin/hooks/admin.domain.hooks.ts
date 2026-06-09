import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUsersApi } from "../api/admin.users.api";
import { adminOrdersApi } from "../api/admin.orders.api";
import { adminAddressesApi } from "../api/admin.addresses.api";
import { adminWishlistApi } from "../api/admin.wishlist.api";
import type { AdminCreateUserRequest, AdminUpdateUserRequest, OrderStatus } from "../admin.types";

// ── Query keys

export const adminKeys = {
  users:     ["admin", "users"]     as const,
  orders:    ["admin", "orders"]    as const,
  addresses: ["admin", "addresses"] as const,
  wishlist:  ["admin", "wishlist"]  as const,
};

// ── Users

export function useAdminUsers() {
  return useQuery({ queryKey: adminKeys.users, queryFn: adminUsersApi.getAll });
}

export function useAdminCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCreateUserRequest) => adminUsersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateUserRequest }) =>
      adminUsersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

// ── Orders

export function useAdminOrders() {
  return useQuery({ queryKey: adminKeys.orders, queryFn: adminOrdersApi.getAll });
}

export function useAdminUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminOrdersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.orders }),
  });
}

export function useAdminDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminOrdersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.orders }),
  });
}

// ── Addresses

export function useAdminAddresses() {
  return useQuery({ queryKey: adminKeys.addresses, queryFn: adminAddressesApi.getAll });
}

export function useAdminDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAddressesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.addresses }),
  });
}

// ── Wishlist

export function useAdminWishlist() {
  return useQuery({ queryKey: adminKeys.wishlist, queryFn: adminWishlistApi.getAll });
}

export function useAdminDeleteWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminWishlistApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.wishlist }),
  });
}