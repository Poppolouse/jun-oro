import React from "react";
import {
  FaGamepad,
  FaHeart,
  FaCode,
  FaRocket,
  FaGem,
  FaCoffee,
} from "react-icons/fa";

// --- Constants ---
const CURRENT_YEAR = new Date().getFullYear();
const APP_VERSION = "v1.0.0";
const BRAND_NAME = "Jun Oro";
const BRAND_SUBTITLE = "Gaming Library Manager";

// Debug overlay and in-file debug mode have been removed.


/**
 * Renders the site-wide footer.
 * Includes branding, navigation links, copyright information, and an optional,
 * admin-only debug toolkit for inspecting UI elements.
 * @returns {JSX.Element} The rendered footer component.
 */
const SiteFooter = () => {
  // Footer no longer manages debug mode; simplified per Design Editor plan.

  const quickLinks = [
    { name: "Kütüphane", href: "#" },
    { name: "Dashboard", href: "#" },
    { name: "İstatistikler", href: "#" },
    { name: "Ayarlar", href: "#" },
  ];

  const helpLinks = [
    { name: "Dokümantasyon", href: "#" },
    { name: "SSS", href: "/faq" },
    { name: "İletişim", href: "#" },
    { name: "Geri Bildirim", href: "#" },
  ];

  return (
    <>
      {/* Debug overlay removed */}
      <footer
        className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-t border-[#00ff88]/20 mt-auto relative"
        data-registry="F"
        id="site-footer"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-lg flex items-center justify-center">
                  <FaGamepad className="text-black text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{BRAND_NAME}</h3>
                  <p className="text-sm text-gray-400">{BRAND_SUBTITLE}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Oyun kütüphanenizi organize edin, oyun deneyimlerinizi takip
                edin ve gaming yolculuğunuzda her anı kaydedin.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Made with</span>
                <FaHeart className="text-red-500 animate-pulse" />
                <span>and</span>
                <FaCoffee className="text-amber-500" />
                <span>by developers</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2 line-through opacity-60">
                <FaRocket className="text-[#00ff88]" />
                Hızlı Erişim
              </h4>
              <ul className="space-y-2 opacity-60">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2 line-through">
                      <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaGem className="text-[#00d4ff]" />
                Yardım
              </h4>
              <ul className="space-y-2">
                {helpLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>© {CURRENT_YEAR} {BRAND_NAME}. Tüm hakları saklıdır.</span>
              <div className="hidden md:flex items-center gap-1">
                <FaCode className="text-[#00ff88]" />
                <span>{APP_VERSION}</span>
              </div>
            </div>
            {/* Tech Stack */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#61dafb] rounded-full"></div>
                <span>React</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#06b6d4] rounded-full"></div>
                <span>Tailwind</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#646cff] rounded-full"></div>
                <span>Vite</span>
              </div>
            </div>
          </div>

          {/* Debug controls removed */}
        </div>

        {/* Admin debug toggles removed */}
      </footer>
    </>
  );
};

export default SiteFooter;
