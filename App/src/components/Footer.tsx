import React from "react";
import GamepadIcon from "./icons/GamepadIcon";
import TwitterIcon from "./icons/TwitterIcon";
import DiscordIcon from "./icons/DiscordIcon";
import TikTokIcon from "./icons/TikTokIcon";
import FooterLink from "./FooterLink";
import SocialButton from "./SocialButton";

const PAYMENT_METHODS = ["iDEAL", "VISA", "MC", "PayPal"] as const;

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
              <FooterLink href="/catalog">Alle Games</FooterLink>
              <FooterLink href="/deals">Deals &amp; Aanbiedingen</FooterLink>
              <FooterLink href="/catalog?type=digital">Digitale Keys</FooterLink>
              <FooterLink href="/catalog?type=physical">Fysieke Games</FooterLink>
              <FooterLink href="/catalog?platform=pc">PC Games</FooterLink>
              <FooterLink href="/catalog?platform=console">Console Games</FooterLink>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Mijn Account</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/login">Inloggen</FooterLink>
              <FooterLink href="/register">Registreren</FooterLink>
              <FooterLink href="/account">Accountinstellingen</FooterLink>
              <FooterLink href="/orders">Mijn Bestellingen</FooterLink>
              <FooterLink href="/library">Game Library</FooterLink>
              <FooterLink href="/wishlist">Wishlist</FooterLink>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Ondersteuning</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/faq">Veelgestelde Vragen</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacybeleid</FooterLink>
              <FooterLink href="/terms">Algemene Voorwaarden</FooterLink>
              <FooterLink href="/returns">Retourbeleid</FooterLink>
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
