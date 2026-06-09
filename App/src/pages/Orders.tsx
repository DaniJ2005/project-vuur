import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
// import type { Order, OrderStatus } from "../data/ordersData";
import type { OrderStatus } from "@/features/orders/orders.types"
import BoxIcon from "../components/icons/BoxIcon";
import { useOrders } from "../context/OrderContext";
import OrderRow from "@/components/OrderRow";

const STATUS_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "In behandeling", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  paid: { label: "Betaald",      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  fulfilled: { label: "Voltooid",    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Verzonden",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
};

const Orders: React.FC = () => {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const {orders, isLoading} = useOrders();

  useEffect(() => {
    document.title = "Mijn Bestellingen - VUUR";
  }, []);

  const filtered_orders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return filter === "all" ? sorted : sorted.filter((o) => o.status === filter);
  }, [filter, orders]);

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-white mt-4">Bestellingen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1">Mijn Bestellingen</h1>
          <p className="text-gray-500 text-sm">
            {orders.length} bestelling(en) in totaal
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "pending", "paid", "fulfilled", "cancelled"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                filter === key
                  ? "bg-[#F25B29] text-white border-[#F25B29]"
                  : "bg-[#111] text-gray-400 border-[#2A2A2A] hover:border-[#F25B29]/40 hover:text-white"
              }`}
            >
              {key === "all" ? "Alles" : STATUS_STYLES[key].label}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <BoxIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 font-bold">Geen bestellingen gevonden</p>
            <p className="text-gray-600 text-sm mt-1">Pas je filter aan of ga winkelen</p>
            <Link to="/catalog" className="inline-block mt-4 text-[#F25B29] text-sm hover:underline">
              Naar catalogus →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered_orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
