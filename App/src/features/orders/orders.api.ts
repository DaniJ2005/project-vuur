import { api } from '@/lib/apiClient';
import type { Order, CreateOrderRequest } from './orders.types';

export const addressesApi = {
  list: () =>
    api.get<Order[]>('/api/orders').then(r => r.data),

  create: (body: CreateOrderRequest) =>
    api.post<Order>('/api/orders', body).then(r => r.data),
};
