import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useWishlistQuery } from "../features/wishlist/wishlist.hooks";
import { useProductsByIds } from "../features/products/products.hooks";
import { toCatalogGame } from "../features/products/products.mapper";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";
import StarIcon from "../components/icons/StarIcon";
import type { CatalogGame } from "../types/game";

const Wishlist: React.FC = () => {
  const { removeFromWishlist } = useWishlist();
  const { data: wishlistItems = [], isLoading: isWishlistLoading, isError: isWishlistError } = useWishlistQuery();
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    document.title = "Wishlist – VUUR";
  }, []);

  const ids = useMemo(() => wishlistItems.map((i) => i.productsId), [wishlistItems]);
  const { data: products = [], isLoading: isProductsLoading, isError: isProductsError } = useProductsByIds(ids);

  const gamesById = useMemo(() => {
    const map = new Map<string, CatalogGame>();
    for (const p of products) map.set(p.id, toCatalogGame(p));
    return map;
  }, [products]);

  const moveToCart = (game: CatalogGame) => {
    addToCart({
      id: game.id,
      title: game.title,
      platform: game.defaultVariant.platform,
      format: game.defaultVariant.format,
      price: game.defaultVariant.price,
    });
    removeFromWishlist(game.id);
    openCart();
  };

  const isLoading = isWishlistLoading || (ids.length > 0 && isProductsLoading);
  const isError = isWishlistError || isProductsError;

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">Mijn Wishlist</h1>
          <p className="text-gray-500 text-sm">{wishlistItems.length} game(s) opgeslagen</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-24 text-gray-400">Laden...</div>
        ) : isError ? (
          <div className="text-center py-24 text-red-400">Er is iets misgegaan bij het laden van je wishlist.</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-24">
            <StarIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 font-bold">Je wishlist is leeg</p>
            <p className="text-gray-600 text-sm mt-1">Klik op het hartje bij een game om hem toe te voegen</p>
            <Link to="/catalog" className="inline-block mt-4 text-[#F25B29] text-sm hover:underline">
              Naar catalogus →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistItems.map((wishlistItem) => {
              const game = gamesById.get(wishlistItem.productsId);
              return (
                <div
                  key={wishlistItem.productsId}
                  className="flex items-center gap-4 bg-[#111] border border-[#1E1E1E] hover:border-[#F25B29]/40 rounded-xl p-3 transition-all"
                >
                  {/* Thumb */}
                  <div className="w-20 h-24 bg-[#1A1A1A] rounded-lg overflow-hidden flex items-center justify-center text-xs text-gray-400 text-center px-2">
                    {game ? game.title : "Productinformatie niet beschikbaar"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {game ? (
                      <>
                        <Link to={`/game/${game.id}`} className="block">
                          <h3 className="text-white font-bold text-sm hover:text-[#F25B29] transition-colors truncate">
                            {game.title}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-gray-500 text-xs">{game.platforms.join(" / ")}</span>
                          <span className="text-gray-700">·</span>
                          <span className="text-gray-500 text-xs">{game.genre}</span>
                          <span className="text-gray-700">·</span>
                          <span className="text-gray-500 text-xs">
                            {game.formats.map((f) => (f === "key" ? "Key" : "Disc")).join(" / ")}
                          </span>
                        </div>
                        {game.rating > 0 && (
                          <div className="mt-1.5">
                            <StarRating rating={game.rating} />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="text-white font-bold text-sm truncate">Onbekend product</h3>
                        <p className="text-gray-500 text-xs mt-1">Dit product is niet langer beschikbaar.</p>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    {game ? (
                      <>
                        {game.bestOriginalPrice > game.minPrice && (
                          <span className="text-gray-600 text-xs line-through block">
                            €{game.bestOriginalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-[#F25B29] font-black text-lg">
                          {game.platforms.length > 1 || game.formats.length > 1 ? "vanaf " : ""}
                          €{game.minPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">Prijs onbekend</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => game && moveToCart(game)}
                      disabled={!game}
                      className="bg-[#F25B29] hover:bg-[#d94e22] text-white text-xs font-bold px-4 py-2 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + In winkelwagen
                    </button>
                    <button
                      onClick={() => removeFromWishlist(wishlistItem.productsId)}
                      className="border border-[#2A2A2A] hover:border-red-500/40 text-gray-500 hover:text-red-400 text-xs px-4 py-2 rounded-md transition-all cursor-pointer"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
