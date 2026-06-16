import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GameCard from "../components/GameCard";
import FilterPill from "../components/FilterPill";
import FilterButton from "../components/FilterButton";
import SearchIcon from "../components/icons/SearchIcon";
import { useProductsInfinite, useProductFacets } from "@/features/products/products.hooks";
import { toCatalogGame } from "@/features/products/products.mapper";
import type { ProductSort } from "@/features/products/products.types";
import type { GameType } from "@/types/game";

type TypeFilter = "all" | GameType;

const PRICE_RANGES: { label: string; max: number }[] = [
  { label: "Alle prijzen", max: 999 },
  { label: "Onder €10", max: 10 },
  { label: "Onder €25", max: 25 },
  { label: "Onder €40", max: 40 },
  { label: "Onder €60", max: 60 },
];

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Nieuwste" },
  { value: "name", label: "A-Z" },
  { value: "price_asc", label: "Prijs: laag-hoog" },
  { value: "price_desc", label: "Prijs: hoog-laag" },
  { value: "rating", label: "Beoordeling" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "key", label: "Digitale Key" },
  { value: "disc", label: "Fysieke Disc" },
];

function normalizeSort(raw: string | null): ProductSort {
  switch (raw) {
    case "new":
    case "newest":
      return "newest";
    case "name":
    case "price_asc":
    case "price_desc":
    case "rating":
      return raw;
    default:
      return "newest";
  }
}

const Catalog: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Controlled input + debounced value that actually drives the query.
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [search, setSearch] = useState(searchInput);
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get("platform") ?? "Alle");
  const [selectedGenre, setSelectedGenre] = useState("Alle");
  const [maxPrice, setMaxPrice] = useState(999);
  const [sortBy, setSortBy] = useState<ProductSort>(normalizeSort(searchParams.get("sort")));

  useEffect(() => {
    document.title = "Catalogus - VUUR";
  }, []);

  // Debounce search input → query value.
  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  // Sync with the navbar search: when the `q` URL param changes (e.g. a search
  // fired while already on this page), update both the input and active query.
  // Adjusted during render rather than in an effect (the recommended pattern):
  // typing in the sidebar search leaves `q` untouched, so it stays independent.
  const queryParam = searchParams.get("q") ?? "";
  const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
  if (queryParam !== prevQueryParam) {
    setPrevQueryParam(queryParam);
    setSearchInput(queryParam);
    setSearch(queryParam);
  }

  const { data: facets } = useProductFacets();
  const allPlatforms = useMemo(() => ["Alle", ...(facets?.platforms ?? [])], [facets]);
  const allGenres = useMemo(() => ["Alle", ...(facets?.genres ?? [])], [facets]);

  const filters = useMemo(
    () => ({
      sort: sortBy,
      search: search || undefined,
      platform: selectedPlatform !== "Alle" ? selectedPlatform : undefined,
      format: selectedType !== "all" ? selectedType : undefined,
      genre: selectedGenre !== "Alle" ? selectedGenre : undefined,
      maxPrice: maxPrice !== 999 ? maxPrice : undefined,
    }),
    [sortBy, search, selectedPlatform, selectedType, selectedGenre, maxPrice],
  );

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductsInfinite(filters);

  const games = useMemo(
    () => (data?.pages.flatMap((p) => p.items) ?? []).map(toCatalogGame),
    [data],
  );
  const total = data?.pages[0]?.total ?? null;

  // Auto-load the next page when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setSelectedType("all");
    setSelectedPlatform("Alle");
    setSelectedGenre("Alle");
    setMaxPrice(999);
    setSortBy("newest");
  };

  const hasActiveFilters =
    !!search ||
    selectedType !== "all" ||
    selectedPlatform !== "Alle" ||
    selectedGenre !== "Alle" ||
    maxPrice !== 999;

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      {/* Page Header */}
      <div className="border-b border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1">Game Catalogus</h1>
          <p className="text-gray-500 text-sm">
            {total != null ? `${total.toLocaleString("nl-NL")} game(s) gevonden` : "Laden…"}
            {games.length > 0 && total != null && <span> · {games.length} geladen</span>}
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
                  <FilterButton key={value} label={label} active={selectedType === value} onClick={() => setSelectedType(value)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Platform</label>
              <div className="space-y-1.5">
                {allPlatforms.map((p) => (
                  <FilterButton key={p} label={p} active={selectedPlatform === p} onClick={() => setSelectedPlatform(p)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Genre</label>
              <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thumb-[#F25B29] scrollbar-track-[#111] pr-1">
                {allGenres.map((g) => (
                  <FilterButton key={g} label={g} active={selectedGenre === g} onClick={() => setSelectedGenre(g)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Max. Prijs</label>
              <div className="space-y-1.5">
                {PRICE_RANGES.map(({ label, max }) => (
                  <FilterButton key={max} label={label} active={maxPrice === max} onClick={() => setMaxPrice(max)} />
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
                  <FilterPill label={selectedType === "key" ? "Key" : "Disc"} onRemove={() => setSelectedType("all")} />
                )}
                {selectedPlatform !== "Alle" && (
                  <FilterPill label={selectedPlatform} onRemove={() => setSelectedPlatform("Alle")} />
                )}
                {selectedGenre !== "Alle" && (
                  <FilterPill label={selectedGenre} onRemove={() => setSelectedGenre("Alle")} />
                )}
                {maxPrice !== 999 && (
                  <FilterPill label={`Max €${maxPrice}`} onRemove={() => setMaxPrice(999)} />
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ProductSort)}
                className="bg-[#111] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29] transition-all"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center py-24">
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <p className="text-white mt-4">Producten laden...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-24 text-red-400">Er ging iets mis bij het laden van de catalogus.</div>
            ) : games.length === 0 ? (
              <div className="text-center py-24">
                <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
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
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>

                {/* Infinite-scroll sentinel + manual fallback */}
                <div ref={sentinelRef} className="h-1" />
                <div className="flex justify-center mt-10">
                  {hasNextPage ? (
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="border border-[#2A2A2A] hover:border-[#F25B29]/50 text-gray-300 hover:text-[#F25B29] px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                    >
                      {isFetchingNextPage ? "Laden…" : "Meer laden"}
                    </button>
                  ) : (
                    <span className="text-gray-600 text-sm">Je hebt alles gezien.</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
