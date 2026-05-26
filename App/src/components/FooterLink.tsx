import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
};

const FooterLink: React.FC<Props> = ({ href, children }) => (
  <li>
    <a
      href={href}
      className="text-gray-500 hover:text-[#F25B29] text-sm transition-colors duration-200"
    >
      {children}
    </a>
  </li>
);

export default FooterLink;
