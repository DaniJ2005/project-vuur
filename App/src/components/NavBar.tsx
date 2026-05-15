import React, { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  cartCount: number;
  onCartOpen: () => void;
};

// ── Icons ──────────────────────────────────────────────────────────────────────

const GamepadIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 10 18.5 10s1.5.67 1.5 1.5S19.33 12 18.5 12z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6m-3-6v6" />
  </svg>
);

const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// ── Nav link data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalogus" },
  { href: "/deals", label: "Deals" },
  { href: "/library", label: "Mijn Library" },
] as const;

// ── Component ──────────────────────────────────────────────────────────────────

const NavBar: React.FC<Props> = ({ cartCount, onCartOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const doSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q) window.location.href = `/catalog?q=${encodeURIComponent(q)}`;
  }, [searchQuery]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D] border-b border-[#F25B29]/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#F25B29] rounded flex items-center justify-center flex-shrink-0">
              <GamepadIcon />
            </div>
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-[#F25B29] transition-colors duration-200">
              VU<span className="text-[#F25B29]">UR</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-gray-300 hover:text-[#F25B29] hover:bg-[#F25B29]/10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Zoek een game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onKeyDown}
                className="w-full bg-[#1A1A1A] border border-[#333] text-gray-300 placeholder-gray-500 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-[#F25B29] focus:ring-1 focus:ring-[#F25B29] transition-all duration-200"
              />
              <button
                onClick={doSearch}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-[#F25B29] transition-colors"
                aria-label="Zoeken"
              >
                <SearchIcon />
              </button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={onCartOpen}
              className="relative p-2 text-gray-300 hover:text-[#F25B29] transition-colors duration-200 cursor-pointer"
              aria-label="Winkelwagen openen"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F25B29] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login / Register */}
            <a
              href="/login"
              className="hidden md:inline-flex items-center gap-2 border border-[#F25B29] text-[#F25B29] hover:bg-[#F25B29] hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            >
              Inloggen
            </a>
            <a
              href="/register"
              className="hidden md:inline-flex items-center gap-2 bg-[#F25B29] hover:bg-[#d94e22] text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            >
              Registreren
            </a>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 text-gray-300 hover:text-[#F25B29] transition-colors duration-200"
              aria-label="Menu openen"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1A1A1A] py-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="block px-4 py-2 text-gray-300 hover:text-[#F25B29] text-sm font-medium"
              >
                {label}
              </a>
            ))}
            <div className="px-4 pt-2 flex gap-2">
              <a href="/login" className="flex-1 text-center border border-[#F25B29] text-[#F25B29] py-2 rounded-md text-sm font-medium">
                Inloggen
              </a>
              <a href="/register" className="flex-1 text-center bg-[#F25B29] text-white py-2 rounded-md text-sm font-medium">
                Registreren
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
