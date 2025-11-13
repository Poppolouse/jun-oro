import React, { useState } from "react";
import {
  mergeDLCsWithoutDuplicates,
  getCategoryName,
  getImageUrl,
} from "./utils";

/**
 * DLCSelection Component - DLC ve edition seçimi
 * @param {Object} props - Component props
 * @param {Object} props.gameVariants - Oyun variantları
 * @param {Array} props.steamDlcs - Steam DLC'leri
 * @param {Array} props.selectedDlcs - Seçilen DLC'ler
 * @param {Function} props.setSelectedDlcs - DLC'leri ayarlar
 * @param {boolean} props.showVariants - Variant'ları göster
 * @param {boolean} props.isLoadingVariants - Yükleniyor mu?
 * @param {Function} props.refreshDLCData - DLC verilerini yeniler
 * @param {Object} props.selectedGame - Seçilen oyun
 * @param {Object} props.selectedVariant - Seçilen variant
 * @param {Function} props.setSelectedVariant - Variant'ı ayarlar
 */
const DLCSelection = ({
  gameVariants,
  steamDlcs,
  selectedDlcs,
  setSelectedDlcs,
  showVariants,
  isLoadingVariants,
  refreshDLCData,
  selectedGame,
  selectedVariant,
  setSelectedVariant,
}) => {
  const [dlcsPerPage] = useState(6); // Sayfa başına DLC sayısı

  /**
   * Tüm DLC'leri seçer
   */
  const selectAllDlcs = () => {
    const allDlcs = mergeDLCsWithoutDuplicates(
      gameVariants.dlcs || [],
      gameVariants.expansions || [],
      steamDlcs || [],
    );
    setSelectedDlcs(allDlcs);
  };

  /**
   * Tüm DLC'leri temizler
   */
  const clearAllDlcs = () => {
    setSelectedDlcs([]);
  };

  /**
   * DLC seçimini değiştirir
   * @param {Object} dlc - DLC objesi
   */
  const toggleDlcSelection = (dlc) => {
    const isSelected = selectedDlcs.some((d) => d.id === dlc.id);
    if (isSelected) {
      setSelectedDlcs(selectedDlcs.filter((d) => d.id !== dlc.id));
    } else {
      setSelectedDlcs([...selectedDlcs, dlc]);
    }
  };

  if (!showVariants) return null;

  return (
    <div
      className="space-y-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
      data-ers="add-game-modal.dlc-selection"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white">DLC Seçimi</h4>
        <div className="flex items-center gap-2">
          {isLoadingVariants && (
            <div className="text-purple-400 text-sm">Yükleniyor...</div>
          )}
          <button
            onClick={refreshDLCData}
            disabled={isLoadingVariants}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            title="DLC verilerini yenile"
            data-ers="add-game-modal.refresh-dlc"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Yükleme Barı */}
      {isLoadingVariants && (
        <div className="space-y-3">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] h-2 rounded-full animate-pulse"
              style={{ width: "100%" }}
            ></div>
          </div>
          <div className="flex justify-center items-center space-x-2">
            <div
              className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <div className="text-center text-gray-400 text-sm">
            DLC'ler aranıyor...
          </div>
        </div>
      )}

      {!isLoadingVariants && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-300 text-sm">
              Bu oyunun DLC'lerini seçin (çoklu seçim yapabilirsiniz):
            </p>
            <div className="flex gap-2">
              <button
                onClick={selectAllDlcs}
                className="px-3 py-1 text-xs bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50 rounded-lg hover:bg-[#00ff88]/30 transition-all"
                data-ers="add-game-modal.select-all-dlc"
              >
                Tümünü Seç
              </button>
              <button
                onClick={clearAllDlcs}
                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all"
                data-ers="add-game-modal.clear-all-dlc"
              >
                Tümünü Temizle
              </button>
            </div>
          </div>

          {/* Birleşik DLC Listesi - IGDB Öncelikli */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(() => {
              // IGDB DLC'lerini ve Steam'den sadece IGDB'de olmayan DLC'leri birleştir
              const mergedDlcs = mergeDLCsWithoutDuplicates(
                gameVariants.dlcs || [],
                gameVariants.expansions || [],
                steamDlcs || [],
              );

              if (mergedDlcs.length === 0) {
                return (
                  <div className="text-center text-gray-400 py-8">
                    Bu oyun için DLC bulunamadı
                  </div>
                );
              }

              return mergedDlcs.map((dlc) => (
                <div
                  key={dlc.id}
                  onClick={() => toggleDlcSelection(dlc)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDlcs.some((d) => d.id === dlc.id)
                      ? "border-[#00ff88] bg-[#00ff88]/10"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                  data-ers={`add-game-modal.dlc-item.${dlc.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                      {dlc.cover?.url && (
                        <img
                          src={
                            dlc.source === "steam"
                              ? dlc.cover.url
                              : getImageUrl(dlc.cover, "cover_small")
                          }
                          alt={dlc.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {dlc.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span>
                          {dlc.source === "steam"
                            ? "Steam DLC"
                            : getCategoryName(dlc.category)}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            dlc.source === "igdb"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {dlc.source === "igdb" ? "IGDB" : "Steam"}
                        </span>
                      </div>
                      {dlc.first_release_date && (
                        <div className="text-xs text-gray-500">
                          {new Date(
                            dlc.first_release_date * 1000,
                          ).getFullYear()}
                        </div>
                      )}
                      {dlc.source === "steam" && dlc.price_overview && (
                        <div className="text-xs text-yellow-400">
                          {dlc.price_overview.final_formatted}
                        </div>
                      )}
                      {dlc.source === "steam" && dlc.description && (
                        <div
                          className="text-xs text-gray-400 mt-1"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {dlc.description}
                        </div>
                      )}
                    </div>
                    {selectedDlcs.some((d) => d.id === dlc.id) && (
                      <div className="text-[#00ff88] text-sm">✓</div>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* DLC İstatistikleri */}
          {(() => {
            const mergedDlcs = mergeDLCsWithoutDuplicates(
              gameVariants.dlcs || [],
              gameVariants.expansions || [],
              steamDlcs || [],
            );
            const igdbCount = mergedDlcs.filter(
              (dlc) => dlc.source === "igdb",
            ).length;
            const steamCount = mergedDlcs.filter(
              (dlc) => dlc.source === "steam",
            ).length;

            return (
              mergedDlcs.length > 0 && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-sm text-gray-300 flex items-center justify-between">
                    <span>Toplam {mergedDlcs.length} DLC bulundu</span>
                    <div className="flex gap-3 text-xs">
                      {igdbCount > 0 && (
                        <span className="text-blue-300">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          IGDB: {igdbCount}
                        </span>
                      )}
                      {steamCount > 0 && (
                        <span className="text-green-300">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Steam: {steamCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            );
          })()}
        </>
      )}
    </div>
  );
};

export default DLCSelection;
