import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import GameCard from "../components/GameCard";
import FilterPill from "../components/FilterPill";
import FilterButton from "../components/FilterButton";
import type { CatalogGame } from "../types/game";

type Props = {
  games: CatalogGame[];
};

type SortKey = "title" | "price_asc" | "price_desc" | "rating" | "discount";

type TypeFilter = "all" | "key" | "disc";

const PRICE_RANGES: { label: string; max: number }[] = [
  { label: "Alle prijzen", max: 999 },
  { label: "Onder €10",    max: 10  },
  { label: "Onder €25",   max: 25  },
  { label: "Onder €40",   max: 40  },
  { label: "Onder €60",   max: 60  },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "title",      label: "A–Z"                },
  { value: "price_asc",  label: "Prijs: laag–hoog"   },
  { value: "price_desc", label: "Prijs: hoog–laag"   },
  { value: "rating",     label: "Beoordeling"         },
  { value: "discount",   label: "Meeste korting"      },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all",  label: "Alle"            },
  { value: "key",  label: "Digitale Key" },
  { value: "disc", label: "Fysieke Disc" },
];

// ── Component ──────────────────────────────────────────────────────────────────

const Catalog: React.FC<Props> = ({ games }) => {
  const [searchParams] = useSearchParams();
  const [search, setSearch]             = useState(searchParams.get("q") ?? "");
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [selectedPlatform, setSelectedPlatform] = useState("Alle");
  const [selectedGenre, setSelectedGenre]       = useState("Alle");
  const [maxPrice, setMaxPrice]         = useState(999);
  const [sortBy, setSortBy]             = useState<SortKey>("title");

  const allPlatforms = useMemo(
    () => ["Alle", ...Array.from(new Set(games.map((g) => g.platform))).sort()],
    [games]
  );

  const allGenres = useMemo(
    () => ["Alle", ...Array.from(new Set(games.map((g) => g.genre))).sort()],
    [games]
  );

  const filteredGames = useMemo(() => {
    let result = games.filter((g) => {
      if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedType !== "all" && g.type !== selectedType) return false;
      if (selectedPlatform !== "Alle" && g.platform !== selectedPlatform) return false;
      if (selectedGenre !== "Alle" && g.genre !== selectedGenre) return false;
      if (g.price > maxPrice) return false;
      return true;
    });

    switch (sortBy) {
      case "price_asc":  result = [...result].sort((a, b) => a.price - b.price); break;
      case "price_desc": result = [...result].sort((a, b) => b.price - a.price); break;
      case "rating":     result = [...result].sort((a, b) => b.rating - a.rating); break;
      case "discount":   result = [...result].sort((a, b) => b.discountPercent - a.discountPercent); break;
      default:           result = [...result].sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    return result;
  }, [games, search, selectedType, selectedPlatform, selectedGenre, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearch(""); setSelectedType("all"); setSelectedPlatform("Alle");
    setSelectedGenre("Alle"); setMaxPrice(999); setSortBy("title");
  };

  const hasActiveFilters =
    search || selectedType !== "all" || selectedPlatform !== "Alle" ||
    selectedGenre !== "Alle" || maxPrice !== 999;

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">

      {/* Page Header */}
      <div className="border-b border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1">Game Catalogus</h1>
          <p className="text-gray-500 text-sm">{filteredGames.length} game(s) gevonden</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Sidebar Filters ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">

            {/* Search */}
            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Zoeken</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Titel zoeken..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#111] border border-[#2A2A2A] focus:border-[#F25B29] text-gray-300 placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#F25B29] transition-all"
                />
                <svg className="absolute right-3 top-3 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Type</label>
              <div className="space-y-1.5">
                {TYPE_OPTIONS.map(({ value, label }) => (
                  <FilterButton key={value} label={label} active={selectedType === value} onClick={() => setSelectedType(value)} />
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Platform</label>
              <div className="space-y-1.5">
                {allPlatforms.map((p) => (
                  <FilterButton key={p} label={p} active={selectedPlatform === p} onClick={() => setSelectedPlatform(p)} />
                ))}
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Genre</label>
              <div className="space-y-1.5">
                {allGenres.map((g) => (
                  <FilterButton key={g} label={g} active={selectedGenre === g} onClick={() => setSelectedGenre(g)} />
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Max. Prijs</label>
              <div className="space-y-1.5">
                {PRICE_RANGES.map(({ label, max }) => (
                  <FilterButton key={max} label={label} active={maxPrice === max} onClick={() => setMaxPrice(max)} />
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="w-full border border-[#2A2A2A] hover:border-[#F25B29]/40 text-gray-500 hover:text-[#F25B29] py-2 rounded-lg text-sm transition-all duration-150"
            >
              Filters wissen
            </button>
          </aside>

          {/* ── Game Grid ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

              {/* Active filter pills */}
              <div className="flex flex-wrap gap-2">
                {selectedType !== "all" && (
                  <FilterPill
                    label={selectedType === "key" ? "Key" : "Disc"}
                    onRemove={() => setSelectedType("all")}
                  />
                )}
                {selectedPlatform !== "Alle" && (
                  <FilterPill label={selectedPlatform} onRemove={() => setSelectedPlatform("Alle")} />
                )}
                {selectedGenre !== "Alle" && (
                  <FilterPill label={selectedGenre} onRemove={() => setSelectedGenre("Alle")} />
                )}
                {maxPrice !== 999 && (
                  <FilterPill
                    label={`Max €${maxPrice}`}
                    onRemove={() => setMaxPrice(999)}
                  />
                )}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-[#111] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29] transition-all"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Grid or empty state */}
            {filteredGames.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-400 font-bold">Geen games gevonden</p>
                <p className="text-gray-600 text-sm mt-1">Pas je filters aan</p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-[#F25B29] text-sm hover:underline"
                  >
                    Alle filters wissen
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
