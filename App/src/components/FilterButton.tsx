import React from "react";

type Props = {
  label: string;
  active: boolean;
  onClick: () => void;
};

const FilterButton: React.FC<Props> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
      active
        ? "bg-[#F25B29]/10 border border-[#F25B29]/40 text-[#F25B29] font-bold"
        : "text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A] border border-transparent"
    }`}
  >
    {label}
  </button>
);

export default FilterButton;
