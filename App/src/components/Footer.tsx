import React from "react";

const PAYMENT_METHODS = ["iDEAL", "VISA", "MC", "PayPal"] as const;

const GamepadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 10 18.5 10s1.5.67 1.5 1.5S19.33 12 18.5 12z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.557z" />
  </svg>
);

const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => (
  <li>
    <a
      href={href}
      className="text-gray-500 hover:text-[#F25B29] text-sm transition-colors duration-200"
    >
      {children}
    </a>
  </li>
);

interface SocialButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ href, icon, label }) => (
  <a
    href={href}
    aria-label={label}
    className="w-9 h-9 bg-[#1A1A1A] hover:bg-[#F25B29] border border-[#2A2A2A] hover:border-[#F25B29] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
  >
    {icon}
  </a>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A] mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#F25B29] rounded flex items-center justify-center">
                <GamepadIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                VU<span className="text-[#F25B29]">UR</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              De centrale plek voor al je gamekeys en fysieke games. Snel, veilig en overzichtelijk.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <SocialButton href="#" label="Twitter" icon={<TwitterIcon className="w-4 h-4" />} />
              <SocialButton href="#" label="Discord" icon={<DiscordIcon className="w-4 h-4" />} />
              <SocialButton href="#" label="TikTok" icon={<TikTokIcon className="w-4 h-4" />} />
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Webshop</h4>
            <ul className="space-y-2.5">
              <NavLink href="/catalog">Alle Games</NavLink>
              <NavLink href="/deals">Deals &amp; Aanbiedingen</NavLink>
              <NavLink href="/catalog?type=digital">Digitale Keys</NavLink>
              <NavLink href="/catalog?type=physical">Fysieke Games</NavLink>
              <NavLink href="/catalog?platform=pc">PC Games</NavLink>
              <NavLink href="/catalog?platform=console">Console Games</NavLink>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Mijn Account</h4>
            <ul className="space-y-2.5">
              <NavLink href="/login">Inloggen</NavLink>
              <NavLink href="/register">Registreren</NavLink>
              <NavLink href="/account">Accountinstellingen</NavLink>
              <NavLink href="/orders">Mijn Bestellingen</NavLink>
              <NavLink href="/library">Game Library</NavLink>
              <NavLink href="/wishlist">Wishlist</NavLink>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Ondersteuning</h4>
            <ul className="space-y-2.5">
              <NavLink href="/faq">Veelgestelde Vragen</NavLink>
              <NavLink href="/contact">Contact</NavLink>
              <NavLink href="/privacy">Privacybeleid</NavLink>
              <NavLink href="/terms">Algemene Voorwaarden</NavLink>
              <NavLink href="/returns">Retourbeleid</NavLink>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {currentYear} VUUR. Alle rechten voorbehouden.
          </p>
          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-xs mr-1">Betaalmethoden:</span>
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 text-gray-500 text-xs font-medium"
              >
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;