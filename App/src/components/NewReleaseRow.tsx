import React from "react";
import type { CatalogGame } from "../types/game";

const NewReleaseRow: React.FC<{ game: CatalogGame }> = ({ game }) => (
  <div className="group flex items-center gap-4 bg-[#111] hover:bg-[#161616] border border-[#1E1E1E] hover:border-[#F25B29]/30 rounded-xl p-4 transition-all duration-200 cursor-pointer">
    <img
      src={`https://placehold.co/80x80/1a1a1a/F25B29?text=${encodeURIComponent(game.title.charAt(0))}`}
      alt={game.title}
      className="w-16 h-16 rounded-lg object-cover shrink-0"
    />
    <div className="flex-1 min-w-0">
      <h3 className="text-white font-bold text-sm group-hover:text-[#F25B29] transition-colors truncate">
        {game.title}
      </h3>
      <p className="text-gray-500 text-xs mt-0.5">
        {game.genre} · {game.platform}
      </p>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      <span className="hidden sm:block text-gray-500 text-xs">Nieuw</span>
      <span className="text-[#F25B29] font-black">€{game.price.toFixed(2)}</span>
      <button className="border border-[#F25B29] text-[#F25B29] hover:bg-[#F25B29] hover:text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200">
        Kopen
      </button>
    </div>
  </div>
);

export default NewReleaseRow;
