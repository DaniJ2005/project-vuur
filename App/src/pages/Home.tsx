import React from "react";

import GameCard from "../components/GameCard"
import { type CatalogGame, type CartGame } from "../types/game"

// ── Types ──────────────────────────────────────────────────────────────────────

type Game = {
  Title: string;
  Platform: string;
  Genre?: string;
  Price: number;
  OriginalPrice: number;
  DiscountPercent: number;
  Reviews?: number;
};

type NewRelease = {
  Title: string;
  Platform: string;
  Genre?: string;
  Price: number;
};

type USP = {
  Icon: string;
  Title: string;
  Description: string;
};

type Props = {
  FeaturedGames: CatalogGame[];
  NewReleases: NewRelease[];
  Platforms: string[];
  USPs: USP[];
  addToCart: (game: CartGame) => void;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// const GameCard: React.FC<{ game: Game }> = ({ game }) => (
//   <div className="group bg-[#111] border border-[#1E1E1E] hover:border-[#F25B29]/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(242,91,41,0.15)] hover:-translate-y-1">
//     {/* Thumbnail */}
//     <div className="relative aspect-[3/4] bg-[#1A1A1A] overflow-hidden">
//       <img
//         src={`https://placehold.co/300x400/1a1a1a/F25B29?text=${encodeURIComponent(game.Title)}`}
//         alt={game.Title}
//         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//       />
//       {game.DiscountPercent > 0 && (
//         <div className="absolute top-2 left-2 bg-[#F25B29] text-white text-xs font-black px-2 py-1 rounded">
//           -{game.DiscountPercent}%
//         </div>
//       )}
//       <div className="absolute top-2 right-2 bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#333] text-gray-300 text-xs px-2 py-1 rounded">
//         {game.Platform}
//       </div>
//     </div>
//     {/* Info */}
//     <div className="p-4">
//       <h3 className="text-white font-bold text-sm leading-tight mb-1 line-clamp-2">{game.Title}</h3>
//       {game.Reviews !== undefined && (
//         <div className="flex items-center gap-1 mb-3">
//           <div className="flex text-[#F25B29] text-xs">★★★★☆</div>
//           <span className="text-gray-500 text-xs">({game.Reviews})</span>
//         </div>
//       )}
//       <div className="flex items-center justify-between">
//         <div>
//           {game.OriginalPrice > game.Price && (
//             <span className="text-gray-600 text-xs line-through mr-1">
//               €{game.OriginalPrice.toFixed(2)}
//             </span>
//           )}
//           <span className="text-[#F25B29] font-black text-lg">€{game.Price.toFixed(2)}</span>
//         </div>
//         <button className="bg-[#F25B29] hover:bg-[#d94e22] text-white text-xs font-bold px-3 py-2 rounded-md transition-all duration-200 hover:scale-105">
//           + Kopen
//         </button>
//       </div>
//     </div>
//   </div>
// );

const NewReleaseRow: React.FC<{ game: NewRelease }> = ({ game }) => (
  <div className="group flex items-center gap-4 bg-[#111] hover:bg-[#161616] border border-[#1E1E1E] hover:border-[#F25B29]/30 rounded-xl p-4 transition-all duration-200 cursor-pointer">
    <img
      src={`https://placehold.co/80x80/1a1a1a/F25B29?text=${encodeURIComponent(game.Title.charAt(0))}`}
      alt={game.Title}
      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <h3 className="text-white font-bold text-sm group-hover:text-[#F25B29] transition-colors truncate">
        {game.Title}
      </h3>
      <p className="text-gray-500 text-xs mt-0.5">
        {game.Genre} · {game.Platform}
      </p>
    </div>
    <div className="flex items-center gap-4 flex-shrink-0">
      <span className="hidden sm:block text-gray-500 text-xs">Nieuw</span>
      <span className="text-[#F25B29] font-black">€{game.Price.toFixed(2)}</span>
      <button className="border border-[#F25B29] text-[#F25B29] hover:bg-[#F25B29] hover:text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200">
        Kopen
      </button>
    </div>
  </div>
);

const UspCard: React.FC<{ usp: USP }> = ({ usp }) => (
  <div className="bg-[#0D0D0D] border border-[#1E1E1E] hover:border-[#F25B29]/30 rounded-xl p-6 transition-all duration-300 group">
    <div className="w-12 h-12 bg-[#F25B29]/10 border border-[#F25B29]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F25B29]/20 transition-colors">
      <span className="text-2xl">{usp.Icon}</span>
    </div>
    <h3 className="text-white font-bold text-lg mb-2">{usp.Title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{usp.Description}</p>
  </div>
);

// ── Page Component ─────────────────────────────────────────────────────────────

function Home({ FeaturedGames, NewReleases, Platforms, USPs, addToCart}: Props) {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D0D0D] pt-16">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#F25B29 1px, transparent 1px), linear-gradient(90deg, #F25B29 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Orange glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#F25B29] opacity-10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F25B29]/10 border border-[#F25B29]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-pulse" />
            <span className="text-[#F25B29] text-sm font-medium">Honderden games beschikbaar</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Jouw games.<br />
            <span className="text-[#F25B29]">Direct speelbaar.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Koop digitale gamekeys en fysieke games op één centrale plek. Geen gedoe met meerdere platforms — gewoon spelen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/catalog"
              className="w-full sm:w-auto bg-[#F25B29] hover:bg-[#d94e22] text-white font-bold px-8 py-4 rounded-md text-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(242,91,41,0.4)]"
            >
              Bekijk Catalogus
            </a>
            <a
              href="/deals"
              className="w-full sm:w-auto border border-[#333] hover:border-[#F25B29] text-gray-300 hover:text-[#F25B29] font-bold px-8 py-4 rounded-md text-lg transition-all duration-200"
            >
              Bekijk Deals →
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto border border-[#1E1E1E] rounded-xl p-6 bg-[#111]">
            <div className="text-center">
              <div className="text-2xl font-black text-white">2.500+</div>
              <div className="text-gray-500 text-xs mt-1">Games</div>
            </div>
            <div className="text-center border-x border-[#1E1E1E]">
              <div className="text-2xl font-black text-white">€1,99</div>
              <div className="text-gray-500 text-xs mt-1">Vanaf</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">Direct</div>
              <div className="text-gray-500 text-xs mt-1">Levering</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED DEALS ── */}
      <section className="bg-[#0D0D0D] py-20 border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-white">🔥 Hot Deals</h2>
              <p className="text-gray-500 mt-1 text-sm">Beperkte tijd. Grijp je kans.</p>
            </div>
            <a href="/deals" className="text-[#F25B29] hover:text-[#d94e22] font-semibold text-sm transition-colors">
              Alle deals →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FeaturedGames.map((game) => (
              <GameCard key={game.title} game={game} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section className="bg-[#111] py-16 border-y border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-gray-500 text-sm font-semibold uppercase tracking-widest mb-8">
            Beschikbaar op alle platforms
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {Platforms.map((platform) => (
              <div
                key={platform}
                className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[#1A1A1A] group-hover:bg-[#F25B29]/10 border border-[#2A2A2A] group-hover:border-[#F25B29]/30 rounded-xl flex items-center justify-center transition-all duration-200">
                  <img
                    src={`https://placehold.co/32x32/1a1a1a/F25B29?text=${platform.charAt(0)}`}
                    alt={platform}
                    className="w-6 h-6 rounded"
                  />
                </div>
                <span className="text-gray-400 text-xs font-medium">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW RELEASES ── */}
      <section className="bg-[#0D0D0D] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-white">Nieuw Uitgebracht</h2>
              <p className="text-gray-500 mt-1 text-sm">De nieuwste toevoegingen aan onze catalogus.</p>
            </div>
            <a href="/catalog?sort=new" className="text-[#F25B29] hover:text-[#d94e22] font-semibold text-sm transition-colors">
              Alle nieuwe games →
            </a>
          </div>
          <div className="space-y-3">
            {NewReleases.map((game) => (
              <NewReleaseRow key={game.Title} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* ── USPs ── */}
      <section className="bg-[#111] py-20 border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Waarom VUUR?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Alles op één plek. Geen gedoe. Gewoon gamen.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USPs.map((usp) => (
              <UspCard key={usp.Title} usp={usp} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-[#0D0D0D] py-20 border-t border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[#F25B29]/20 to-[#0D0D0D] border border-[#F25B29]/30 rounded-2xl p-12">
            <h2 className="text-4xl font-black text-white mb-4">Klaar om te beginnen?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Maak een gratis account aan en ontdek meer dan 2.500 games.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 bg-[#F25B29] hover:bg-[#d94e22] text-white font-black px-10 py-4 rounded-md text-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(242,91,41,0.4)]"
            >
              Registreer Gratis
              <ArrowRightIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;