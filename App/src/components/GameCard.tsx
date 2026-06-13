import React from "react";
import { Link } from "react-router-dom";
import type { CatalogGame } from "../types/game";
import { useCart } from "../context/CartContext";
import { useAuth } from "@/features/auth/AuthProvider";
import { useWishlist } from "../context/WishlistContext";
import StarRating from "./StarRating";

type Props = {
  game: CatalogGame;
};

const GameCard: React.FC<Props> = ({ game }) => {
  const { addToCart, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(game.id);

  const multiVariant = game.platforms.length > 1 || game.formats.length > 1;

  const quickAdd = () => {
    addToCart({
      id: game.id,
      title: game.title,
      platform: game.defaultVariant.platform,
      format: game.defaultVariant.format,
      price: game.defaultVariant.price,
    });
    openCart();
  };

  return (
    <div className="group bg-[#111] border border-[#1E1E1E] hover:border-[#F25B29]/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(242,91,41,0.15)] hover:-translate-y-1 flex flex-col">
      {/* Thumbnail */}
      <Link to={`/game/${game.id}`} className="block relative aspect-3/4 bg-[#1A1A1A] overflow-hidden shrink-0">
        <img
          src={`https://placehold.co/300x400/111111/F25B29?text=${encodeURIComponent(game.title)}`}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.bestDiscountPercent > 0 && (
            <span className="bg-[#F25B29] text-white text-xs font-black px-2 py-0.5 rounded">
              -{Math.round(game.bestDiscountPercent)}%
            </span>
          )}
          {game.isNew && (
            <span className="bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded">NIEUW</span>
          )}
        </div>

        {/* Platform badges top-right */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {game.platforms.slice(0, 2).map((p) => (
            <span key={p} className="bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#333] text-gray-300 text-[10px] px-2 py-0.5 rounded">
              {p}
            </span>
          ))}
          {game.platforms.length > 2 && (
            <span className="bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#333] text-gray-400 text-[10px] px-2 py-0.5 rounded">
              +{game.platforms.length - 2}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        {isAuthenticated && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(game.id); }}
            className={`absolute bottom-2 left-2 w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all cursor-pointer ${
              inWishlist
                ? "bg-[#F25B29]/20 border-[#F25B29]/60 text-[#F25B29]"
                : "bg-[#0D0D0D]/70 border-[#333] text-gray-400 hover:text-[#F25B29] hover:border-[#F25B29]/40"
            }`}
            aria-label={inWishlist ? "Verwijderen van wishlist" : "Toevoegen aan wishlist"}
            aria-pressed={inWishlist}
          >
            <svg className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Format availability bottom-right */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {game.formats.includes("key") && (
            <span className="bg-[#1A1A2E]/90 border border-blue-500/40 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">KEY</span>
          )}
          {game.formats.includes("disc") && (
            <span className="bg-[#1A1A1A]/90 border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">DISC</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/game/${game.id}`} className="block">
          <h3 className="text-white font-bold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-[#F25B29] transition-colors">
            {game.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-xs mb-2">{game.genre}</p>

        {game.rating > 0 ? (
          <div className="flex items-center gap-1 mb-3">
            <StarRating rating={game.rating} />
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-gray-600 text-xs italic">Nog geen reviews</span>
          </div>
        )}

        {/* Price + Button */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            {game.bestOriginalPrice > game.minPrice && (
              <span className="text-gray-600 text-xs line-through block">
                €{game.bestOriginalPrice.toFixed(2)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              {multiVariant && <span className="text-gray-500 text-[10px]">vanaf</span>}
              <span className="text-[#F25B29] font-black text-xl">€{game.minPrice.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={quickAdd}
            className="bg-[#F25B29] hover:bg-[#d94e22] text-white text-xs font-bold px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            + Kopen
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
