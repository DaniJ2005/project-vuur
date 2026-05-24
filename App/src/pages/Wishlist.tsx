import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { allGames } from "../data/catalogData";
import { toCatalogGame } from "../types/game";
import StarRating from "../components/StarRating";

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    document.title = "Wishlist – VUUR";
  }, []);

  const games = useMemo(
    () => allGames.filter((g) => wishlist.includes(g.id)),
    [wishlist]
  );

  const moveToCart = (gameId: number) => {
    const game = allGames.find((g) => g.id === gameId);
    if (!game) return;
    addToCart(toCatalogGame(game));
    removeFromWishlist(gameId);
    openCart();
  };

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
            Mijn Wishlist
          </h1>
          <p className="text-gray-500 text-sm">
            {games.length} game(s) opgeslagen
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {games.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-gray-400 font-bold">Je wishlist is leeg</p>
            <p className="text-gray-600 text-sm mt-1">Klik op het hartje bij een game om hem toe te voegen</p>
            <Link to="/catalog" className="inline-block mt-4 text-[#F25B29] text-sm hover:underline">
              Naar catalogus →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-4 bg-[#111] border border-[#1E1E1E] hover:border-[#F25B29]/40 rounded-xl p-3 transition-all"
              >
                {/* Thumb */}
                <Link to={`/game/${game.id}`} className="flex-shrink-0">
                  <div className="w-20 h-24 bg-[#1A1A1A] rounded-lg overflow-hidden">
                    <img
                      src={`https://placehold.co/80x96/111111/F25B29?text=${encodeURIComponent(game.title)}`}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/game/${game.id}`}>
                    <h3 className="text-white font-bold text-sm hover:text-[#F25B29] transition-colors truncate">
                      {game.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-gray-500 text-xs">{game.platform}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-gray-500 text-xs">{game.genre}</span>
                    <span className="text-gray-700">·</span>
                    {game.type === "key" ? (
                      <span className="text-blue-400 text-xs">Key</span>
                    ) : (
                      <span className="text-amber-400 text-xs">Disc</span>
                    )}
                  </div>
                  {game.reviews > 0 && (
                    <div className="mt-1.5">
                      <StarRating rating={game.rating} />
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  {game.originalPrice > game.price && (
                    <span className="text-gray-600 text-xs line-through block">
                      €{game.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[#F25B29] font-black text-lg">€{game.price.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => moveToCart(game.id)}
                    className="bg-[#F25B29] hover:bg-[#d94e22] text-white text-xs font-bold px-4 py-2 rounded-md transition-all cursor-pointer"
                  >
                    + In winkelwagen
                  </button>
                  <button
                    onClick={() => removeFromWishlist(game.id)}
                    className="border border-[#2A2A2A] hover:border-red-500/40 text-gray-500 hover:text-red-400 text-xs px-4 py-2 rounded-md transition-all cursor-pointer"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
