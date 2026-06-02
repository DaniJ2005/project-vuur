import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/orders.api';
import type { CreateOrderRequest } from '@/features/orders/orders.types';
import { useMe } from "@/features/auth/auth.hooks";


export const ordersKey = ['orders'] as const;

export function useOrdersQuery() {
  const { data: user } = useMe();
  return useQuery({
    queryKey: ordersKey,
    queryFn: ordersApi.list,
    enabled: !!user, // Niet proberen te fetchen zonder token, want dan krijg je een 401 die je moet afhandelen.
    staleTime: 5 * 60_000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderRequest) => ordersApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ordersKey }), // React Query cache invalid maken want er is wat veranderd met de data in de backend.
  });
}