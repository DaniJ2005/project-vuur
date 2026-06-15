import React from "react";

export type SegmentedOption = { value: string; label: string; disabled?: boolean };

type Props = {
  name: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
};

const SegmentedRadio: React.FC<Props> = ({ name, options, value, onChange, size = "md", ariaLabel }) => {
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <label
            key={opt.value}
            className={`select-none rounded-lg border font-bold transition-all ${pad} ${
              opt.disabled
                ? "cursor-not-allowed opacity-30 border-[#2A2A2A] text-gray-600"
                : active
                  ? "cursor-pointer border-[#F25B29] bg-[#F25B29]/10 text-[#F25B29] shadow-[0_0_15px_rgba(242,91,41,0.15)]"
                  : "cursor-pointer border-[#2A2A2A] text-gray-400 hover:border-[#F25B29]/40 hover:text-gray-200"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              disabled={opt.disabled}
              onChange={() => !opt.disabled && onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
};

export default SegmentedRadio;
