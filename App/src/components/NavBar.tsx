import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { cartCount } from "../types/game";
import GamepadIcon from "./icons/GamepadIcon";
import SearchIcon from "./icons/SearchIcon";
import CartIcon from "./icons/CartIcon";
import HamburgerIcon from "./icons/HamburgerIcon";

// ── Nav link data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalogus" },
  { href: "/deals", label: "Deals" },
  { href: "/library", label: "Mijn Library" },
] as const;

// ── Component ──────────────────────────────────────────────────────────────────

const NavBar: React.FC = () => {
  const { cartItems, openCart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const doSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q) navigate(`/catalog?q=${encodeURIComponent(q)}`);
  }, [searchQuery, navigate]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D] border-b border-[#F25B29]/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#F25B29] rounded flex items-center justify-center shrink-0">
              <GamepadIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-[#F25B29] transition-colors duration-200">
              VU<span className="text-[#F25B29]">UR</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className="text-gray-300 hover:text-[#F25B29] hover:bg-[#F25B29]/10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                {label}
              </Link>
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
                <SearchIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-300 hover:text-[#F25B29] transition-colors duration-200 cursor-pointer"
              aria-label="Winkelwagen openen"
            >
              <CartIcon className="w-6 h-6" />
              {cartCount(cartItems) > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F25B29] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount(cartItems)}
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
              <HamburgerIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1A1A1A] py-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className="block px-4 py-2 text-gray-300 hover:text-[#F25B29] text-sm font-medium"
              >
                {label}
              </Link>
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
