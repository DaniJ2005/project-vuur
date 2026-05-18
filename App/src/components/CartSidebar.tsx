import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { cartTotal, cartCount, cartHasDisc } from "../types/game";
import CloseIcon from "./icons/CloseIcon";
import TrashIcon from "./icons/TrashIcon";
import ArrowRightIcon from "./icons/ArrowRightIcon";

// ── Component ──────────────────────────────────────────────────────────────────

const CartSidebar: React.FC = () => {
  const { cartItems, cartOpen, closeCart, changeQty, removeFromCart } = useCart();
  const navigate = useNavigate();
  const total = cartTotal(cartItems);
  const hasDisc = cartHasDisc(cartItems);
  const isEmpty = cartItems.length === 0;

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const goToCheckout = () => {
    closeCart();
    navigate(hasDisc ? "/checkout/disc" : "/checkout/key");
  };

  if (!cartOpen) return null;

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes cartSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Sidebar panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-[#111] border-l border-[#1E1E1E] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
        style={{ animation: "cartSlideIn 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E1E]">
          <div>
            <h2 className="text-white font-black text-lg">Winkelwagen</h2>
            <p className="text-gray-500 text-xs mt-0.5">{cartCount(cartItems)} item(s)</p>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 cursor-pointer rounded-lg bg-[#1A1A1A] hover:bg-[#F25B29]/10 border border-[#2A2A2A] hover:border-[#F25B29]/30 flex items-center justify-center text-gray-400 hover:text-[#F25B29] transition-all duration-200"
            aria-label="Sluiten"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-gray-400 font-bold">Je winkelwagen is leeg</p>
              <p className="text-gray-600 text-sm mt-1">Voeg games toe om verder te gaan</p>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.game.id}
                  className="flex gap-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-3 group"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-[#1A1A1A] rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={`https://placehold.co/56x56/1a1a1a/F25B29?text=${encodeURIComponent(item.game.title.charAt(0))}`}
                      alt={item.game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{item.game.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.game.type === "key" ? (
                        <span className="text-blue-400 text-xs">🔑 Key</span>
                      ) : (
                        <span className="text-amber-400 text-xs">💿 Disc</span>
                      )}
                      <span className="text-gray-600 text-xs">{item.game.platform}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#F25B29] font-black text-sm">
                        €{item.game.price.toFixed(2)}
                      </span>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => changeQty(item.game.id, -1)}
                          className="w-6 h-6 cursor-pointer rounded bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#F25B29]/30 text-gray-400 hover:text-white text-xs flex items-center justify-center transition-all"
                        >
                          −
                        </button>
                        <span className="text-white text-xs w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => changeQty(item.game.id, 1)}
                          className="w-6 h-6 cursor-pointer rounded bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#F25B29]/30 text-gray-400 hover:text-white text-xs flex items-center justify-center transition-all"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.game.id)}
                          className="w-6 h-6 cursor-pointer rounded bg-[#1A1A1A] border border-[#2A2A2A] hover:border-red-500/30 text-gray-500 hover:text-red-400 text-xs flex items-center justify-center transition-all ml-1"
                          aria-label="Verwijderen"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Disc warning */}
              {hasDisc && (
                <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mt-2">
                  <span className="text-amber-400 text-lg flex-shrink-0">💿</span>
                  <p className="text-amber-400/80 text-xs leading-relaxed">
                    Je winkelwagen bevat een of meer fysieke discs. Levering vereist een bezorgadres.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer: Total + Checkout */}
        {!isEmpty && (
          <div className="px-6 py-5 border-t border-[#1E1E1E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Subtotaal</span>
              <span className="text-white font-black text-lg">€{total.toFixed(2)}</span>
            </div>
            <p className="text-gray-600 text-xs">Verzendkosten worden berekend tijdens checkout</p>
            <button
              onClick={goToCheckout}
              className="w-full cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] text-white font-black py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(242,91,41,0.3)] active:scale-95 flex items-center justify-center gap-2"
            >
              Afrekenen
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
