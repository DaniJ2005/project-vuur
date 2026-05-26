import React from "react";
import type { CartItem } from "../types/game";
import { cartTotal } from "../types/game";

type Props = {
  items: CartItem[];
  shippingPrice?: number;
  showShipping?: boolean;
};

const OrderSummary: React.FC<Props> = ({ items, shippingPrice = 0, showShipping = false }) => {
  const subtotal = cartTotal(items);
  const total = subtotal + shippingPrice;

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-5 sticky top-20">
        <h3 className="text-white font-black text-base mb-4">Jouw bestelling</h3>
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.game.id} className="flex gap-3">
              <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src={`https://placehold.co/40x40/111111/F25B29?text=${encodeURIComponent(item.game.title.charAt(0))}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{item.game.title}</p>
                <p className="text-gray-500 text-xs">
                  {item.game.type === "disc" ? "Disc" : "Key"} · ×{item.quantity}
                </p>
              </div>
              <span className="text-[#F25B29] text-xs font-black">
                €{(item.game.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#1A1A1A] pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotaal</span>
            <span className="text-gray-300">€{subtotal.toFixed(2)}</span>
          </div>
          {showShipping && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Verzending</span>
              <span className="text-gray-300">
                {shippingPrice === 0 ? "Gratis" : `€${shippingPrice.toFixed(2)}`}
              </span>
            </div>
          )}
          <div className="flex justify-between font-black pt-2 border-t border-[#1A1A1A]">
            <span className="text-white">Totaal</span>
            <span className="text-[#F25B29]">€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
