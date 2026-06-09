import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import type { Order, OrderStatus } from "../data/ordersData";
import type { Order, OrderStatus } from "@/features/orders/orders.types";

const STATUS_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "In behandeling", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  paid: { label: "Betaald",      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  fulfilled: { label: "Voltooid",    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Verzonden",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
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
            {formatDate(order.createdAt)} · {order.items.length} item(s) · { /*{order.paymentMethod}*/ }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#F25B29] font-black text-lg">€{order.totalAmount.toFixed(2)}</span>
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
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                  {item.productType === "disc" ? "Disc" : "Key"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Link
                      to={`/game/${item.id}`}
                      className="text-white text-sm font-bold hover:text-[#F25B29] transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <span className="text-[#F25B29] text-sm font-black">
                      €{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {item.platform} · {item.productType === "key" ? "Digitale Key" : "Fysieke Disc"} · ×{item.quantity}
                  </p>

                  {item.keys?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {item.keys.map((key) => (
                      <div key={key}>
                        <button
                          type="button"
                          onClick={() => copy(key)}
                          className="w-full bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#F25B29]/50 cursor-pointer rounded-lg px-3 py-2 font-mono text-[#F25B29] text-xs tracking-widest text-center transition-all"
                        >
                          {key}
                        </button>

                        <p
                          className={`text-xs mt-1 ${
                            copiedKey === key ? "text-emerald-400" : "text-gray-600"
                          }`}
                        >
                          {copiedKey === key ? "Gekopieerd!" : "Klik om te kopiëren"}
                        </p>
                      </div>
                    ))}
                  </div>
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
                {order.customerFirstName} {order.customerLastName}
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
              <span className="text-gray-300">€{order.totalAmount.toFixed(2)}</span>
            </div>
            {order.shippingPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Verzending</span>
                <span className="text-gray-300">€{order.shippingPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black pt-1">
              <span className="text-white">Totaal</span>
              <span className="text-[#F25B29]">€{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default OrderRow;