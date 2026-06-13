import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "@/features/auth/AuthProvider";
import { useWishlist } from "../context/WishlistContext";
import GameCard from "../components/GameCard";
import SegmentedRadio from "../components/SegmentedRadio";

import { useProduct, useProductsQuery } from "@/features/products/products.hooks";
import { toCatalogGame, distinctPlatforms, formatsFor, findVariant } from "@/features/products/products.mapper";
import type { GameType } from "@/types/game";

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useProduct(id!);
  const { addToCart, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<GameType>("key");

  // Initialise the selection to the cheapest variant when the product loads.
  useEffect(() => {
    if (!product || product.variants.length === 0) return;
    const cheapest = product.variants.reduce((m, v) => (v.price < m.price ? v : m), product.variants[0]);
    setSelectedPlatform(cheapest.platform);
    setSelectedFormat(cheapest.format);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    if (!addedFeedback) return;
    const t = window.setTimeout(() => setAddedFeedback(false), 2000);
    return () => window.clearTimeout(t);
  }, [addedFeedback]);

  useEffect(() => {
    if (product) document.title = `${product.productName} – VUUR`;
  }, [product]);

  const platforms = product ? distinctPlatforms(product) : [];
  const availableFormats = product ? formatsFor(product, selectedPlatform) : [];
  const selectedVariant = product ? findVariant(product, selectedPlatform, selectedFormat) : undefined;

  const { data: relatedPage } = useProductsQuery(
    product ? { genre: product.genre, limit: 6 } : { limit: 0 },
  );
  const relatedGames = useMemo(() => {
    if (!product || !relatedPage) return [];
    return relatedPage.items.filter((p) => p.id !== product.id).slice(0, 5).map(toCatalogGame);
  }, [relatedPage, product]);

  const inWishlist = product ? isInWishlist(product.id) : false;

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

  if (!product) {
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

  const isNew = product.flags.includes("isNew");
  const price = selectedVariant?.price ?? product.minPrice;
  const originalPrice = selectedVariant?.originalPrice ?? price;
  const discountPercent = selectedVariant?.discountPercent ?? 0;

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    const formats = formatsFor(product, platform);
    if (!formats.includes(selectedFormat)) setSelectedFormat(formats[0] ?? "key");
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      id: product.id,
      title: product.productName,
      platform: selectedPlatform,
      format: selectedFormat,
      price: selectedVariant.price,
    });
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
            <span className="text-gray-300">{product.productName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Cover */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl overflow-hidden aspect-3/4 bg-[#111] border border-[#1E1E1E]">
              <img
                src={`https://placehold.co/400x533/111111/F25B29?text=${encodeURIComponent(product.productName)}`}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#F25B29] text-white font-black px-3 py-1 rounded-lg text-sm">
                  -{Math.round(discountPercent)}%
                </div>
              )}
              {isNew && (
                <div className={`absolute top-4 ${discountPercent > 0 ? "left-20" : "left-4"} bg-emerald-500 text-white font-black px-3 py-1 rounded-lg text-sm`}>
                  NIEUW
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video bg-[#111] border border-[#1E1E1E] hover:border-[#F25B29]/40 rounded-lg overflow-hidden cursor-pointer transition-all">
                  <img src={`https://placehold.co/100x60/111111/333333?text=IMG${i}`} alt="Screenshot" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 text-xs px-2 py-0.5 rounded">{product.genre}</span>
                {product.flags.includes("isFeatured") && (
                  <span className="bg-[#F25B29]/10 border border-[#F25B29]/30 text-[#F25B29] text-xs px-2 py-0.5 rounded font-bold">Featured</span>
                )}
              </div>

              <h1 className="text-4xl font-black text-white leading-tight mb-3">{product.productName}</h1>

              <div className="flex items-center gap-2">
                <div className="flex text-[#F25B29]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-xl">{i <= Math.round(product.rating) ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">{product.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-5">
              <h2 className="text-white font-bold mb-2 text-sm uppercase tracking-wider">Over dit spel</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{product.productDescription}</p>
            </div>

            {/* Variant selection */}
            <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-5 space-y-5">
              <div>
                <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Platform</h3>
                <SegmentedRadio
                  name="platform"
                  ariaLabel="Kies platform"
                  options={platforms.map((p) => ({ value: p, label: p }))}
                  value={selectedPlatform}
                  onChange={handlePlatformChange}
                />
              </div>

              <div>
                <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Uitvoering</h3>
                <SegmentedRadio
                  name="format"
                  ariaLabel="Kies uitvoering"
                  options={[
                    { value: "key", label: "Digitale Key", disabled: !availableFormats.includes("key") },
                    { value: "disc", label: "Fysieke Disc", disabled: !availableFormats.includes("disc") },
                  ]}
                  value={selectedFormat}
                  onChange={(v) => setSelectedFormat(v as GameType)}
                />
              </div>
            </div>

            {/* Format info banner */}
            {selectedFormat === "key" ? (
              <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <div>
                  <p className="text-blue-400 font-bold text-sm">Digitale Game Key</p>
                  <p className="text-blue-400/70 text-xs mt-0.5 leading-relaxed">
                    Na betaling ontvang je direct een activatiecode in je account. Activeer op {selectedPlatform} en
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
                {originalPrice > price && (
                  <>
                    <span className="text-gray-600 text-lg line-through">€{originalPrice.toFixed(2)}</span>
                    <span className="bg-[#F25B29]/10 border border-[#F25B29]/30 text-[#F25B29] text-sm font-black px-2 py-0.5 rounded">
                      -{Math.round(discountPercent)}%
                    </span>
                  </>
                )}
                <span className="text-[#F25B29] font-black text-4xl">€{price.toFixed(2)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className="flex-1 cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-[0_0_25px_rgba(242,91,41,0.35)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.5 5m0 0h13" />
                  </svg>
                  In winkelwagen
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => toggleWishlist(product.id)}
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
                ["Beschikbare platforms", platforms.join(", ")],
                ["Gekozen platform", selectedPlatform],
                ["Uitvoering", selectedFormat === "key" ? "Digitale Key" : "Fysieke Disc"],
                ["Genre", product.genre],
                ["Taal", "Nederlands / Engels"],
                ["Regio", "Global"],
              ].map(([label, value]) => (
                <div key={label} className="flex px-5 py-3 border-b border-[#1A1A1A] last:border-0">
                  <span className="text-gray-500 text-sm w-40 shrink-0">{label}</span>
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
