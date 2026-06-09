import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useWishlistQuery } from "../features/wishlist/wishlist.hooks";
import { useProducts } from "../features/products/products.hooks";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";
import type { Product } from "../features/products/products.types";

const Wishlist: React.FC = () => {
  const { removeFromWishlist } = useWishlist();
  const { data: wishlistItems = [], isLoading: isWishlistLoading, isError: isWishlistError } = useWishlistQuery();
  const { data: allProducts = [], isLoading: isProductsLoading, isError: isProductsError } = useProducts();
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    document.title = "Wishlist – VUUR";
  }, []);

  const wishlistProducts = useMemo(
    () =>
      wishlistItems
        .map((item) => ({
          wishlistItem: item,
          product: allProducts.find((p) => p.id === item.productsId),
        })),
    [wishlistItems, allProducts]
  );

  const moveToCart = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.productName,
      platform: product.platform,
      price: product.price,
      type: product.type as "key" | "disc",
    });
    removeFromWishlist(product.id);
    openCart();
  };

  const isLoading = isWishlistLoading || isProductsLoading;
  const isError = isWishlistError || isProductsError;

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
            Mijn Wishlist
          </h1>
          <p className="text-gray-500 text-sm">
            {wishlistItems.length} game(s) opgeslagen
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-24 text-gray-400">Laden...</div>
        ) : isError ? (
          <div className="text-center py-24 text-red-400">Er is iets misgegaan bij het laden van je wishlist.</div>
        ) : wishlistItems.length === 0 ? (
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
            {wishlistProducts.map(({ wishlistItem, product }) => (
              <div
                key={wishlistItem.productsId}
                className="flex items-center gap-4 bg-[#111] border border-[#1E1E1E] hover:border-[#F25B29]/40 rounded-xl p-3 transition-all"
              >
                {/* Thumb */}
                {product ? (
                  <div className="w-20 h-24 bg-[#1A1A1A] rounded-lg overflow-hidden flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center px-2">{product.productName}</span>
                  </div>
                ) : (
                  <div className="w-20 h-24 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-xs text-gray-400 text-center px-2">
                    Productinformatie niet beschikbaar
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {product ? (
                    <>
                      <Link to={`/game/${product.id}`} className="block">
                        <h3 className="text-white font-bold text-sm hover:text-[#F25B29] transition-colors truncate">
                          {product.productName}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-gray-500 text-xs">{product.platform}</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-gray-500 text-xs">{product.genre}</span>
                        <span className="text-gray-700">·</span>
                        <span className={product.type === "key" ? "text-blue-400 text-xs" : "text-amber-400 text-xs"}>
                          {product.type === "key" ? "Key" : "Disc"}
                        </span>
                      </div>
                      {product.rating > 0 && (
                        <div className="mt-1.5">
                          <StarRating rating={product.rating} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="text-white font-bold text-sm truncate">
                        Onbekend product
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">Deze product is niet langer beschikbaar.</p>
                    </>
                  )}
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  {product ? (
                    <>
                      {product.originalPrice > product.price && (
                        <span className="text-gray-600 text-xs line-through block">
                          €{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[#F25B29] font-black text-lg">€{product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">Prijs onbekend</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => product && moveToCart(product)}
                    disabled={!product}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
