import React from "react";

type Props = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

const SocialButton: React.FC<Props> = ({ href, icon, label }) => (
  <a
    href={href}
    aria-label={label}
    className="w-9 h-9 bg-[#1A1A1A] hover:bg-[#F25B29] border border-[#2A2A2A] hover:border-[#F25B29] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
  >
    {icon}
  </a>
);

export default SocialButton;
