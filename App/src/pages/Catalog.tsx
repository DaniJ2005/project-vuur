import React, { useEffect, useRef, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GameCard from "../components/GameCard";
import FilterPill from "../components/FilterPill";
import FilterButton from "../components/FilterButton";
import { useProducts } from "@/features/products/products.hooks";
import { toCatalogGame } from "@/features/products/products.mapper";

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
  { value: "title",      label: "A–Z"              },
  { value: "price_asc",  label: "Prijs: laag–hoog" },
  { value: "price_desc", label: "Prijs: hoog–laag" },
  { value: "rating",     label: "Beoordeling"       },
  { value: "discount",   label: "Meeste korting"    },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all",  label: "Alle"         },
  { value: "key",  label: "Digitale Key" },
  { value: "disc", label: "Fysieke Disc" },
];

const PAGE_SIZE = 20;

// ── Pagination component

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageInputRef = useRef<HTMLInputElement>(null);

  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = parseInt(pageInputRef.current?.value ?? "", 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed);
    } else if (pageInputRef.current) {
      pageInputRef.current.value = String(currentPage);
    }
  };

  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const btnBase =
    "h-9 min-w-[36px] px-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed";
  const btnActive = "bg-[#F25B29] text-white";
  const btnInactive = "border border-[#2A2A2A] text-gray-400 hover:border-[#F25B29]/50 hover:text-[#F25B29]";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
      <button
        className={`${btnBase} ${btnInactive}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Vorige pagina"
      >
        ←
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="h-9 px-1 flex items-center text-gray-600 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
            onClick={() => onPageChange(p as number)}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={`${btnBase} ${btnInactive}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Volgende pagina"
      >
        →
      </button>

      <span className="h-6 w-px bg-[#2A2A2A] mx-1" />

      <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
        <span className="text-gray-600 text-sm">Ga naar</span>
        <input
          ref={pageInputRef}
          type="number"
          min={1}
          max={totalPages}
          defaultValue={currentPage}
          key={currentPage}
          onBlur={() => handleInputSubmit()}
          onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
          className="w-14 h-9 bg-[#111] border border-[#2A2A2A] focus:border-[#F25B29] text-gray-300 rounded-lg px-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#F25B29] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-gray-600 text-sm">/ {totalPages}</span>
      </form>
    </div>
  );
};

// ── Main component

const Catalog: React.FC = () => {
  const { data: products = [], isLoading } = useProducts();

  const [searchParams] = useSearchParams();

  // Initialise filters from URL params so links from Home work immediately
  const [search, setSearch]                     = useState(searchParams.get("q") ?? "");
  const [selectedType, setSelectedType]         = useState<TypeFilter>("all");
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get("platform") ?? "Alle");
  const [selectedGenre, setSelectedGenre]       = useState("Alle");
  const [maxPrice, setMaxPrice]                 = useState(999);
  const [sortBy, setSortBy]                     = useState<SortKey>("title");
  const [currentPage, setCurrentPage]           = useState(1);

  useEffect(() => {
    document.title = "Catalogus - VUUR";
  }, []);

  const games = useMemo(
    () => products.map(toCatalogGame),
    [products]
  );

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

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));

  const pagedGames = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredGames.slice(start, start + PAGE_SIZE);
  }, [filteredGames, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange   = (value: string)     => { setSearch(value);           setCurrentPage(1); };
  const handleTypeChange     = (value: TypeFilter) => { setSelectedType(value);     setCurrentPage(1); };
  const handlePlatformChange = (value: string)     => { setSelectedPlatform(value); setCurrentPage(1); };
  const handleGenreChange    = (value: string)     => { setSelectedGenre(value);    setCurrentPage(1); };
  const handlePriceChange    = (value: number)     => { setMaxPrice(value);         setCurrentPage(1); };
  const handleSortChange     = (value: SortKey)    => { setSortBy(value);           setCurrentPage(1); };

  const resetFilters = () => {
    setSearch(""); setSelectedType("all"); setSelectedPlatform("Alle");
    setSelectedGenre("Alle"); setMaxPrice(999); setSortBy("title");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search || selectedType !== "all" || selectedPlatform !== "Alle" ||
    selectedGenre !== "Alle" || maxPrice !== 999;

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-white mt-4">Producten laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">

      {/* Page Header */}
      <div className="border-b border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1">Game Catalogus</h1>
          <p className="text-gray-500 text-sm">
            {filteredGames.length} game(s) gevonden
            {totalPages > 1 && (
              <span> · pagina {currentPage} van {totalPages}</span>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Sidebar Filters ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Zoeken</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Titel zoeken..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-[#111] border border-[#2A2A2A] focus:border-[#F25B29] text-gray-300 placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#F25B29] transition-all"
                />
                <svg className="absolute right-3 top-3 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Type</label>
              <div className="space-y-1.5">
                {TYPE_OPTIONS.map(({ value, label }) => (
                  <FilterButton key={value} label={label} active={selectedType === value} onClick={() => handleTypeChange(value)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Platform</label>
              <div className="space-y-1.5">
                {allPlatforms.map((p) => (
                  <FilterButton key={p} label={p} active={selectedPlatform === p} onClick={() => handlePlatformChange(p)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Genre</label>
              <div className="space-y-1.5">
                {allGenres.map((g) => (
                  <FilterButton key={g} label={g} active={selectedGenre === g} onClick={() => handleGenreChange(g)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Max. Prijs</label>
              <div className="space-y-1.5">
                {PRICE_RANGES.map(({ label, max }) => (
                  <FilterButton key={max} label={label} active={maxPrice === max} onClick={() => handlePriceChange(max)} />
                ))}
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="w-full border border-[#2A2A2A] hover:border-[#F25B29]/40 text-gray-500 hover:text-[#F25B29] py-2 rounded-lg text-sm transition-all duration-150"
            >
              Filters wissen
            </button>
          </aside>

          {/* ── Game Grid ── */}
          <div className="flex-1 min-w-0">

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap gap-2">
                {selectedType !== "all" && (
                  <FilterPill label={selectedType === "key" ? "Key" : "Disc"} onRemove={() => handleTypeChange("all")} />
                )}
                {selectedPlatform !== "Alle" && (
                  <FilterPill label={selectedPlatform} onRemove={() => handlePlatformChange("Alle")} />
                )}
                {selectedGenre !== "Alle" && (
                  <FilterPill label={selectedGenre} onRemove={() => handleGenreChange("Alle")} />
                )}
                {maxPrice !== 999 && (
                  <FilterPill label={`Max €${maxPrice}`} onRemove={() => handlePriceChange(999)} />
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortKey)}
                className="bg-[#111] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29] transition-all"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {filteredGames.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-400 font-bold">Geen games gevonden</p>
                <p className="text-gray-600 text-sm mt-1">Pas je filters aan</p>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="mt-4 text-[#F25B29] text-sm hover:underline">
                    Alle filters wissen
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pagedGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>

                <Pagination
                  currentPage={Math.min(currentPage, totalPages)}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;