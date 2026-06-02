import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { useLogout } from "@/features/auth/auth.hooks";
import { useWishlist } from "../context/WishlistContext";

const MENU_ITEMS: { to: string; label: string }[] = [
  { to: "/orders",   label: "Mijn Bestellingen" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/settings", label: "Instellingen" },
  { to: "/admin",    label: "Admin Dashboard" },
];

const ProfileDropdown: React.FC = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logout.mutate();
    navigate("/");
  };

  const initial = user.firstName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 cursor-pointer rounded-full p-1 pr-2.5 border border-[#2A2A2A] hover:border-[#F25B29]/40 transition-all"
        aria-label="Profielmenu openen"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-[#F25B29] flex items-center justify-center text-white font-black text-sm">
          {initial}
        </div>
        <span className="text-gray-300 text-sm font-medium hidden sm:inline">
          {user.firstName}
        </span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-[#111] border border-[#1E1E1E] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          {/* User header */}
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <p className="text-white text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
            <p className="text-gray-500 text-xs truncate">{user.email}</p>
          </div>

          {/* TODO ICONS TOEVOEGEN AAN ELKE MENU ITEM */}

          {/* Menu items */}
          <div className="py-1">
            {MENU_ITEMS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#F25B29]/10 hover:text-[#F25B29] text-sm transition-all"
              >
                <span className="flex items-center gap-3">
                  {/* <span className="text-base">{icon}</span> */}
                  {label}
                </span>
                {to === "/wishlist" && wishlistCount > 0 && (
                  <span className="bg-[#F25B29]/20 text-[#F25B29] text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-[#1A1A1A] py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-all cursor-pointer"
            >
              {/* TODO "Return" icon toevoegen */}
              {/* <span className="text-base">HIER RETURN ICON TOEVOEGEN</span> */}
              Uitloggen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
