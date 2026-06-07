import { useAuth } from "@/features/auth/AuthProvider";
import { useProducts } from "@/features/products/products.hooks";
import { toCatalogGame } from "@/features/products/products.mapper";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GameCard from "../components/GameCard";
import NewReleaseRow from "../components/NewReleaseRow";
import UspCard from "../components/UspCard";
import DataLoading from "../components/DataLoading";
import ArrowRightIcon from "../components/icons/ArrowRightIcon";
import { useCart } from "../context/CartContext";
import { Platforms, USPs } from "../data/homeData";

function Home() {
  const { isAuthenticated } = useAuth();
  const { data: products = [], isLoading } = useProducts();
  const { addToCart, openCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Home - VUUR";
  }, []);

  const games         = useMemo(() => products.map(toCatalogGame), [products]);
  const featuredGames = useMemo(() => games.filter((g) => g.isFeatured).slice(0, 4), [games]);
  const newReleases   = useMemo(() => games.filter((g) => g.isNew).slice(0, 5), [games]);

  const totalCount  = games.length;
  const lowestPrice = games.length > 0 ? Math.min(...games.map((g) => g.price)) : null;

  const statCount = isLoading ? "…" : `${totalCount.toLocaleString("nl-NL")}+`;
  const statPrice = isLoading ? "…" : lowestPrice != null
    ? `€${lowestPrice.toFixed(2).replace(".", ",")}`
    : "–";

  const handleAddToCart = (game: ReturnType<typeof toCatalogGame>) => {
    addToCart(game);
    openCart();
  };

  const handlePlatformClick = (platform: string) => {
    navigate(`/catalog?platform=${encodeURIComponent(platform)}`);
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D0D0D] pt-16">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#F25B29 1px, transparent 1px), linear-gradient(90deg, #F25B29 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
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
              <div className="text-2xl font-black text-white transition-all duration-300">{statCount}</div>
              <div className="text-gray-500 text-xs mt-1">Games</div>
            </div>
            <div className="text-center border-x border-[#1E1E1E]">
              <div className="text-2xl font-black text-white transition-all duration-300">{statPrice}</div>
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
              <h2 className="text-3xl font-black text-white">Vlammende Deals</h2>
              <p className="text-gray-500 mt-1 text-sm">Beperkte tijd. Grijp je kans.</p>
            </div>
            <a href="/deals" className="text-[#F25B29] hover:text-[#d94e22] font-semibold text-sm transition-colors">
              Alle deals →
            </a>
          </div>

          {isLoading ? (
            <DataLoading />
          ) : featuredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Geen featured games beschikbaar.</p>
          )}
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
              <button
                key={platform}
                onClick={() => handlePlatformClick(platform)}
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
              </button>
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

          {isLoading ? (
            <DataLoading />
          ) : newReleases.length > 0 ? (
            <div className="space-y-3">
              {newReleases.map((game) => (
                <NewReleaseRow
                  key={game.id}
                  game={game}
                  onAddToCart={() => handleAddToCart(game)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Geen nieuwe releases beschikbaar.</p>
          )}
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
      {!isAuthenticated && (
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
      )}
    </>
  );
}

export default Home;