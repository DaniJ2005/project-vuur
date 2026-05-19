import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mockOrders, type Order, type OrderStatus } from "../data/ordersData";

const STATUS_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  delivered:  { label: "Bezorgd",     cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  shipped:    { label: "Verzonden",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  processing: { label: "In behandeling", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  completed:  { label: "Voltooid",    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "long", year: "numeric" });

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const status = STATUS_STYLES[order.status];

  useEffect(() => {
    if (!copiedKey) return;
    const t = window.setTimeout(() => setCopiedKey(null), 1500);
    return () => window.clearTimeout(t);
  }, [copiedKey]);

  const copy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-[#161616] transition-all cursor-pointer text-left"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[#F25B29] font-mono font-bold text-sm">#{order.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded border font-bold ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <p className="text-gray-500 text-xs">
            {formatDate(order.date)} · {order.items.length} item(s) · {order.paymentMethod}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#F25B29] font-black text-lg">€{order.total.toFixed(2)}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Details */}
      {open && (
        <div className="border-t border-[#1A1A1A] px-5 py-4 space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.gameId} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                  {item.type === "disc" ? "Disc" : "Key"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Link
                      to={`/game/${item.gameId}`}
                      className="text-white text-sm font-bold hover:text-[#F25B29] transition-colors"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[#F25B29] text-sm font-black">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {item.platform} · {item.type === "key" ? "Digitale Key" : "Fysieke Disc"} · ×{item.quantity}
                  </p>
                  {item.key && (
                    <button
                      type="button"
                      onClick={() => copy(item.key!)}
                      className="mt-2 w-full bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#F25B29]/50 cursor-pointer rounded-lg px-3 py-2 font-mono text-[#F25B29] text-xs tracking-widest text-center transition-all"
                    >
                      {item.key}
                    </button>
                  )}
                  {item.key && (
                    <p className={`text-xs mt-1 ${copiedKey === item.key ? "text-emerald-400" : "text-gray-600"}`}>
                      {copiedKey === item.key ? "Gekopieerd!" : "Klik om te kopiëren"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping summary */}
          {order.shippingAddress && (
            <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-4">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Bezorgd op</p>
              <p className="text-gray-300 text-sm">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-gray-500 text-sm">
                {order.shippingAddress.street} {order.shippingAddress.houseNumber}
                {order.shippingAddress.houseExt}, {order.shippingAddress.postCode} {order.shippingAddress.city}
              </p>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-[#1A1A1A] pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotaal</span>
              <span className="text-gray-300">€{order.subtotal.toFixed(2)}</span>
            </div>
            {order.shippingPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Verzending</span>
                <span className="text-gray-300">€{order.shippingPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black pt-1">
              <span className="text-white">Totaal</span>
              <span className="text-[#F25B29]">€{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Orders: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    document.title = "Mijn Bestellingen – VUUR";
  }, []);

  const orders = useMemo(() => {
    const sorted = [...mockOrders].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    return filter === "all" ? sorted : sorted.filter((o) => o.status === filter);
  }, [filter]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1">Mijn Bestellingen</h1>
          <p className="text-gray-500 text-sm">
            {mockOrders.length} bestelling(en) in totaal
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "completed", "delivered", "shipped", "processing"] as const).map((key) => (
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
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-400 font-bold">Geen bestellingen gevonden</p>
            <p className="text-gray-600 text-sm mt-1">Pas je filter aan of ga winkelen</p>
            <Link to="/catalog" className="inline-block mt-4 text-[#F25B29] text-sm hover:underline">
              Naar catalogus →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
