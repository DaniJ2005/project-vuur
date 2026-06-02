/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext } from "react";
import { useOrdersQuery, useCreateOrder } from "@/features/orders/orders.hooks";
import type { Order, CreateOrderRequest } from "@/features/orders/orders.types";

type OrderContextValue = {
  orders: Order[];
  isLoading: boolean;
  // Het maken van een order is async (POST naar de backend), dus geef de
  // resulterende Order terug zodat de pagina bv. kan redirecten naar /orders/:id.
  createOrder: (body: CreateOrderRequest) => Promise<Order>;
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  // GET /api/orders geeft de orders van de ingelogde user terug (admin ziet alles).
  const { data, isLoading } = useOrdersQuery();
  const createMutation = useCreateOrder();

  const orders = data ?? [];

  const createOrder = useCallback(
    (body: CreateOrderRequest) => createMutation.mutateAsync(body),
    [createMutation],
  );

  return (
    <OrderContext.Provider value={{ orders, isLoading, createOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used inside OrderProvider");
  return ctx;
}
