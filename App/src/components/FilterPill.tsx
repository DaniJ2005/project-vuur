import React from "react";

type Props = {
  label: string;
  onRemove: () => void;
};

const FilterPill: React.FC<Props> = ({ label, onRemove }) => (
  <span className="flex items-center gap-1.5 bg-[#F25B29]/10 border border-[#F25B29]/30 text-[#F25B29] text-xs px-3 py-1 rounded-full font-medium">
    {label}
    <button onClick={onRemove} className="hover:text-white ml-0.5" aria-label="Filter verwijderen">✕</button>
  </span>
);

export default FilterPill;
