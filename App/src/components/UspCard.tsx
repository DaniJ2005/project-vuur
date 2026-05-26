import React from "react";
import type { USP } from "../data/homeData";

const UspCard: React.FC<{ usp: USP }> = ({ usp }) => (
  <div className="bg-[#0D0D0D] border border-[#1E1E1E] hover:border-[#F25B29]/30 rounded-xl p-6 transition-all duration-300 group">
    {/* TODO: ICON VERVANGEN MET EEN REACT ICON COMPONENT, ICON TIJDELIJK UITGECOMMENT */}

    {/* <div className="w-12 h-12 bg-[#F25B29]/10 border border-[#F25B29]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F25B29]/20 transition-colors">
      <span className="text-2xl">{usp.Icon}</span>
    </div> */}
    <h3 className="text-white font-bold text-lg mb-2">{usp.Title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{usp.Description}</p>
  </div>
);

export default UspCard;
