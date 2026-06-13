import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "@/features/auth/AuthProvider";
import { useWishlist } from "../context/WishlistContext";
import GameCard from "../components/GameCard";

import { useProduct, useProducts } from "@/features/products/products.hooks";
import { toCatalogGame } from "@/features/products/products.mapper";

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useProduct(id!);
  const game = product ? toCatalogGame(product) : null;
  const { addToCart, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const inWishlist = game ? isInWishlist(game.id) : false;

  useEffect(() => {
    if (!addedFeedback) return;
    const t = window.setTimeout(() => setAddedFeedback(false), 2000);
    return () => window.clearTimeout(t);
  }, [addedFeedback]);

  useEffect(() => {
    if (game) document.title = `${game.title} – VUUR`;
  }, [game]);

  const { data: allProducts = [] } = useProducts();

  const relatedGames = useMemo(() => {
    if (!game) return [];

    return allProducts
      .map(toCatalogGame)
      .filter(
        (g) =>
          g.id !== game.id &&
          (
            g.genre === game.genre ||
            g.platform === game.platform
          )
      )
      .slice(0, 5);
  }, [allProducts, game]);

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>

          <p className="text-white mt-4">Game laden...</p>
        </div>
      </div>
    );
  }
  if (!game) {
    return (
      <div className="pt-16 min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-bold text-xl">Game niet gevonden</p>
          <Link to="/catalog" className="text-[#F25B29] hover:underline text-sm mt-2 block">
            ← Terug naar catalogus
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(game);
    openCart();
    setAddedFeedback(true);
  };

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      {/* Breadcrumb */}
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:text-[#F25B29] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-[#F25B29] transition-colors">Catalogus</Link>
            <span>/</span>
            <span className="text-gray-300">{game.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Cover */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl overflow-hidden aspect-3/4 bg-[#111] border border-[#1E1E1E]">
              <img
                src={`https://placehold.co/400x533/111111/F25B29?text=${encodeURIComponent(game.title)}`}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              {game.discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#F25B29] text-white font-black px-3 py-1 rounded-lg text-sm">
                  -{game.discountPercent}%
                </div>
              )}
              {game.isNew && (
                <div className={`absolute top-4 ${game.discountPercent > 0 ? "left-20" : "left-4"} bg-emerald-500 text-white font-black px-3 py-1 rounded-lg text-sm`}>
                  NIEUW
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-[#111] border border-[#1E1E1E] hover:border-[#F25B29]/40 rounded-lg overflow-hidden cursor-pointer transition-all"
                >
                  <img
                    src={`https://placehold.co/100x60/111111/333333?text=IMG${i}`}
                    alt="Screenshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 text-xs px-2 py-0.5 rounded">
                  {game.platform}
                </span>
                <span className="bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 text-xs px-2 py-0.5 rounded">
                  {game.genre}
                </span>
                {game.type === "key" ? (
                  <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-2 py-0.5 rounded font-bold">
                    Digitale Key
                  </span>
                ) : (
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2 py-0.5 rounded font-bold">
                    Fysieke Disc
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-black text-white leading-tight mb-3">{game.title}</h1>

              {game.reviews > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex text-[#F25B29]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-xl">{i <= Math.floor(game.rating) ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">{game.rating.toFixed(1)} / 5.0</span>
                  <span className="text-gray-600 text-sm">({game.reviews.toLocaleString("nl-NL")} reviews)</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-5">
              <h2 className="text-white font-bold mb-2 text-sm uppercase tracking-wider">Over dit spel</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{game.description}</p>
            </div>

            {/* Type uitleg banner */}
            {game.type === "key" ? (
              <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <div>
                  <p className="text-blue-400 font-bold text-sm">Digitale Game Key</p>
                  <p className="text-blue-400/70 text-xs mt-0.5 leading-relaxed">
                    Na betaling ontvang je direct een activatiecode in je account. Activeer op {game.platform} en
                    je kan meteen spelen. Geen wachttijd, geen verzendkosten.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div>
                  <p className="text-amber-400 font-bold text-sm">Fysieke Disc</p>
                  <p className="text-amber-400/70 text-xs mt-0.5 leading-relaxed">
                    Dit is een fysiek product dat per post wordt verzonden. Tijdens het afrekenen vragen we om
                    een bezorgadres. Verwachte levertijd: 2-4 werkdagen.
                  </p>
                </div>
              </div>
            )}

            {/* Buy Box */}
            <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-6">
              <div className="flex items-end gap-3 mb-5">
                {game.originalPrice > game.price && (
                  <>
                    <span className="text-gray-600 text-lg line-through">€{game.originalPrice.toFixed(2)}</span>
                    <span className="bg-[#F25B29]/10 border border-[#F25B29]/30 text-[#F25B29] text-sm font-black px-2 py-0.5 rounded">
                      -{game.discountPercent}%
                    </span>
                  </>
                )}
                <span className="text-[#F25B29] font-black text-4xl">€{game.price.toFixed(2)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] text-white font-black py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-[0_0_25px_rgba(242,91,41,0.35)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.5 5m0 0h13" />
                  </svg>
                  In winkelwagen
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => toggleWishlist(game.id)}
                    className={`sm:w-14 h-14 cursor-pointer border rounded-xl flex items-center justify-center transition-all duration-200 ${
                      inWishlist
                        ? "border-[#F25B29]/60 bg-[#F25B29]/10 text-[#F25B29]"
                        : "border-[#2A2A2A] hover:border-[#F25B29]/40 text-gray-500 hover:text-[#F25B29]"
                    }`}
                    aria-label={inWishlist ? "Verwijderen van wishlist" : "Toevoegen aan wishlist"}
                    aria-pressed={inWishlist}
                  >
                    <svg className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {addedFeedback && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Toegevoegd aan je winkelwagen!
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="bg-[#111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider px-5 py-3 border-b border-[#1E1E1E]">
                Productinformatie
              </h2>
              {[
                ["Platform", game.platform],
                ["Genre", game.genre],
                ["Type", game.type === "key" ? "Digitale Key" : "Fysieke Disc"],
                ["Taal", "Nederlands / Engels"],
                ["Regio", "Global"],
              ].map(([label, value]) => (
                <div key={label} className="flex px-5 py-3 border-b border-[#1A1A1A] last:border-0">
                  <span className="text-gray-500 text-sm w-32 shrink-0">{label}</span>
                  <span className="text-gray-300 text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Games */}
        {relatedGames.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-white mb-6">Vergelijkbare games</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedGames.map((related) => (
                <GameCard key={related.id} game={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;
