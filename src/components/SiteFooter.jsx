import React, { useState, useEffect, useRef } from "react";
import {
  FaGamepad,
  FaHeart,
  FaCode,
  FaRocket,
  FaGem,
  FaCoffee,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import elementRegistry from "../../elementRegistry.json";

// --- Constants ---
const CURRENT_YEAR = new Date().getFullYear();
const APP_VERSION = "v1.0.0";
const BRAND_NAME = "Jun Oro";
const BRAND_SUBTITLE = "Gaming Library Manager";

// --- Helper & Debug Components (within the same file due to constraints) ---

/**
 * A custom hook to manage the state and logic for the in-app debug mode.
 * This is kept within the SiteFooter file to adhere to the task constraints.
 * @param {boolean} isEnabled - Whether the debug mode is globally enabled.
 * @returns {object} - The state and elements for the debug UI.
 */
const useDebugMode = (isEnabled) => {
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showProperties, setShowProperties] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const [measureStart, setMeasureStart] = useState(null);
  const [measureEnd, setMeasureEnd] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  // --- Utility Functions ---

  const getElementName = (element) => {
    if (!element) return "";
    let name = element.tagName.toLowerCase();
    if (element.id) name += `#${element.id}`;
    if (element.className && typeof element.className === "string") {
      const classes = element.className
        .split(" ")
        .filter((c) => c && !c.startsWith("debug-"));
      if (classes.length > 0) name += `.${classes.join(".")}`;
    }
    return name;
  };

  const getERSInfo = (element) => {
    if (!element) return null;
    const elementId = element.id;
    const registryAttr = element.getAttribute("data-registry");
    return elementRegistry.elements.find(
      (item) =>
        item.selector === `#${elementId}` ||
        item.registryId === registryAttr ||
        item.registryId === elementId
    );
  };
  
  const getElementProperties = (element) => {
    if (!element) return {};
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const ersInfo = getERSInfo(element);
    const classNameStr =
      element.className && typeof element.className === "string"
        ? element.className
        : "";

    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || "yok",
      classes: classNameStr.split(" ").filter((c) => c && !c.startsWith("debug-")),
      ers: ersInfo ? {
        registryId: ersInfo.registryId,
        label: ersInfo.label,
        component: ersInfo.metadata?.component,
        feature: ersInfo.metadata?.feature,
      } : null,
      dimensions: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left),
      },
      styles: {
        display: computedStyle.display,
        position: computedStyle.position,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        font: `${computedStyle.fontSize} ${computedStyle.fontFamily}`,
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        border: computedStyle.border,
        zIndex: computedStyle.zIndex,
      },
    };
  };

  const showToast = (message, isError = false) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${isError ? '#ff6b6b' : '#00ff88'};
      color: black; padding: 12px 20px; border-radius: 8px;
      font-weight: bold; z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // --- Event Handlers ---

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    const element = document.elementFromPoint(e.clientX, e.clientY);

    if (
      !element ||
      element.closest("#debug-overlay, footer, #debug-properties-panel")
    ) {
      return;
    }

    document.querySelectorAll(".debug-highlight").forEach((el) => el.classList.remove("debug-highlight"));
    if (element !== selectedElement) {
      element.classList.add("debug-highlight");
    }
    setHoveredElement(element);

    if (measureMode && measureStart) {
      setMeasureEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || element.closest("#debug-overlay, footer, #debug-properties-panel")) return;

    if (measureMode) {
      if (!measureStart) {
        setMeasureStart({ x: e.clientX, y: e.clientY });
      } else {
        setMeasureEnd({ x: e.clientX, y: e.clientY });
        setMeasureMode(false);
      }
      return;
    }

    if (selectedElement === element) {
      selectedElement.classList.remove("debug-selected");
      setSelectedElement(null);
      setShowProperties(false);
    } else {
      selectedElement?.classList.remove("debug-selected");
      element.classList.add("debug-selected");
      setSelectedElement(element);
      setShowProperties(true);
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || element.closest("#debug-overlay, footer")) return;

    const uniqueId = element.getAttribute("data-registry") || element.id;
    if (uniqueId) {
      navigator.clipboard.writeText(uniqueId);
      showToast(`🆔 ID kopyalandı: ${uniqueId}`);
    } else {
      showToast("❌ Bu elementin unique ID'si yok.", true);
    }
  };

  // --- Effects ---

  useEffect(() => {
    if (isEnabled) {
      const overlay = document.createElement("div");
      overlay.id = "debug-overlay";
      overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9998;`;
      document.body.appendChild(overlay);
      overlayRef.current = overlay;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("click", handleClick, true);
      document.addEventListener("contextmenu", handleRightClick);
    }

    return () => {
      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("contextmenu", handleRightClick);
      document.querySelectorAll(".debug-highlight, .debug-selected").forEach((el) => {
        el.classList.remove("debug-highlight", "debug-selected");
      });
    };
  }, [isEnabled]);

  const properties = selectedElement ? getElementProperties(selectedElement) : null;
  const distance = measureStart && measureEnd ? Math.round(Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2))) : 0;

  return {
    properties,
    hoveredElement,
    selectedElement,
    measureMode,
    measureStart,
    measureEnd,
    distance,
    mousePosition,
    showProperties,
    setMeasureMode,
    setMeasureStart,
    setMeasureEnd,
    setShowProperties,
    getElementName,
  };
};

const DebugOverlay = ({ debug }) => {
  const {
    properties,
    hoveredElement,
    selectedElement,
    measureMode,
    measureStart,
    measureEnd,
    distance,
    mousePosition,
    showProperties,
    setShowProperties,
    getElementName,
  } = debug;

  if (!debug) return null;

  return (
    <>
      {/* Styles */}
      <style>{`
        .debug-highlight { outline: 2px solid #00ff88 !important; outline-offset: -2px !important; background-color: rgba(0, 255, 136, 0.1) !important; }
        .debug-selected { outline: 3px solid #ff6b6b !important; outline-offset: -3px !important; background-color: rgba(255, 107, 107, 0.1) !important; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Measure Line */}
      {measureMode && measureStart && measureEnd && (
        <>
          <div style={{ position: 'fixed', left: `${measureStart.x}px`, top: `${measureStart.y}px`, width: `${distance}px`, height: '2px', background: '#00ff88', transformOrigin: '0 50%', transform: `rotate(${Math.atan2(measureEnd.y - measureStart.y, measureEnd.x - measureStart.x)}rad)`, zIndex: 9999 }} />
          <div style={{ position: 'fixed', left: `${(measureStart.x + measureEnd.x) / 2}px`, top: `${(measureStart.y + measureEnd.y) / 2}px`, transform: 'translate(-50%, -50%)', background: '#00ff88', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10000 }}>
            {distance}px
          </div>
        </>
      )}

      {/* Properties Panel */}
      {showProperties && properties && (
        <div id="debug-properties-panel" style={{ position: 'fixed', top: '20px', right: '20px', width: '350px', maxHeight: '80vh', background: 'rgba(26, 26, 46, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '12px', padding: '20px', color: 'white', fontSize: '14px', zIndex: 10000, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#00ff88' }}>Element Özellikleri</h3>
            <button onClick={() => setShowProperties(false)} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: '18px', cursor: 'pointer' }}>×</button>
          </div>
          {Object.entries(properties).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#00d4ff', textTransform: 'capitalize' }}>{key}:</strong>
              <div style={{ marginTop: '4px', fontSize: '12px', wordBreak: 'break-all' }}>
                {typeof value === 'object' && value !== null ? (
                  <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  <span>{value.toString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredElement && !selectedElement && (
        <div style={{ position: 'fixed', left: `${mousePosition.x + 15}px`, top: `${mousePosition.y + 15}px`, background: 'rgba(0, 0, 0, 0.9)', color: '#00ff88', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', zIndex: 10001, pointerEvents: 'none' }}>
          {getElementName(hoveredElement)}
        </div>
      )}
    </>
  );
};


/**
 * Renders the site-wide footer.
 * Includes branding, navigation links, copyright information, and an optional,
 * admin-only debug toolkit for inspecting UI elements.
 * @returns {JSX.Element} The rendered footer component.
 */
const SiteFooter = () => {
  const { user } = useAuth();
  const isAdminUser = user?.role === "admin";
  const [isDebugMode, setIsDebugMode] = useState(false);
  
  const debug = useDebugMode(isDebugMode && isAdminUser);

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
      {isAdminUser && <DebugOverlay debug={debug} />}
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
          
          {/* Debug Controls */}
          {isDebugMode && isAdminUser && (
            <div className="border-t border-gray-700 pt-4 mt-4 flex flex-wrap items-center gap-4 text-sm">
              <button
                onClick={() => {
                  debug.setMeasureMode(!debug.measureMode);
                  debug.setMeasureStart(null);
                  debug.setMeasureEnd(null);
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${debug.measureMode ? "bg-[#00d4ff] text-black" : "bg-gray-700 text-white hover:bg-gray-600"}`}
              >
                📏 Ölçü
              </button>
              <div className="flex-1 text-xs text-gray-400">
                {debug.hoveredElement && <span className="text-[#00ff88]">Hover: {debug.getElementName(debug.hoveredElement)}</span>}
                {debug.selectedElement && <span className="text-[#ff6b6b] ml-4">Seçili: {debug.getElementName(debug.selectedElement)}</span>}
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div>Sol tık: Özellikler | Sağ tık: ID kopyala</div>
              </div>
            </div>
          )}
        </div>

        {/* Debug Toggle Button */}
        {isAdminUser && (
          <div className="absolute bottom-4 left-4">
            <button
              onClick={() => setIsDebugMode(!isDebugMode)}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${isDebugMode ? "bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20" : "bg-gray-700 text-white hover:bg-gray-600"}`}
            >
              🐛 Debug {isDebugMode ? "ON" : "OFF"}
            </button>
          </div>
        )}
      </footer>
    </>
  );
};

export default SiteFooter;
