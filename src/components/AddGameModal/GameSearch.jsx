import React from "react";
import { formatRelevanceScore } from "../../utils/searchUtils";
import { getImageUrl } from "./utils";

/**
 * Oyun arama ve sonuçları için sunum bileşeni.
 * Bu bileşen "aptal" (dumb) bir bileşendir ve kendi state'ini yönetmez.
 * Tüm veri ve fonksiyonları props aracılığıyla alır.
 *
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Arama input'unun mevcut değeri.
 * @param {Function} props.onSearchChange - Arama input'u değiştiğinde çağrılan fonksiyon.
 * @param {Function} props.onSearchSubmit - Arama butonu tıklandığında veya Enter'a basıldığında çağrılan fonksiyon.
 * @param {Array} props.searchResults - Gösterilecek arama sonuçları dizisi.
 * @param {boolean} props.isSearching - Bir aramanın devam edip etmediğini belirten boolean.
 * @param {string|null} props.error - Gösterilecek hata mesajı.
 * @param {Function} props.onGameSelect - Arama sonucundan bir oyun seçildiğinde çağrılan fonksiyon.
 * @param {Function} props.onEditGame - Kütüphanedeki bir oyun için "Düzenle" butonuna tıklandığında çağrılan fonksiyon.
 * @returns {JSX.Element} Render edilmiş GameSearch bileşeni.
 */
const GameSearch = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  searchResults,
  isSearching,
  error,
  onGameSelect,
  onEditGame,
}) => {
  /**
   * Enter tuşuna basıldığında aramayı tetikler.
   * @param {React.KeyboardEvent} e - Klavye olayı.
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="space-y-6" data-ers="add-game-modal.search">
      {/* Arama Kutusu */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            onKeyPress={handleKeyPress}
            placeholder="Oyun adı girin..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00ff88]/50"
            data-ers="add-game-modal.search-input"
          />
          <button
            onClick={onSearchSubmit}
            disabled={isSearching || !searchTerm.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            data-ers="add-game-modal.search-button"
          >
            {isSearching ? "🔍 Arıyor..." : "🔍 Ara"}
          </button>
        </div>

        {error && (
          <div
            className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
            data-ers="add-game-modal.search-error"
          >
            {error}
          </div>
        )}
      </div>

      {/* Arama Sonuçları */}
      {searchResults.length > 0 && (
        <div className="space-y-4" data-ers="add-game-modal.search-results">
          <h3 className="text-lg font-bold text-white">Arama Sonuçları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {searchResults.map((game, index) => (
              <div
                key={game.id}
                className="bg-white/5 rounded-lg border border-white/10 hover:border-[#00ff88]/50 transition-all group relative"
                data-ers={`add-game-modal.search-result.${index + 1}`}
              >
                {/* Kütüphane Durumu Badge */}
                {game.isInLibrary && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-[#00ff88] text-black text-xs font-bold px-2 py-1 rounded-full">
                      ✓ Kütüphanede
                    </span>
                  </div>
                )}

                <div
                  onClick={() => !game.isInLibrary && onGameSelect(game)}
                  className={`${
                    !game.isInLibrary ? "cursor-pointer" : "cursor-default"
                  }`}
                  data-ers={`add-game-modal.search-result-card.${index + 1}`}
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(game.cover, "cover_big")}
                      alt={game.name}
                      className={`w-full h-full object-cover transition-transform ${
                        !game.isInLibrary ? "group-hover:scale-105" : ""
                      }`}
                    />
                  </div>
                  <div className="p-3">
                    <h4
                      className={`font-bold text-sm truncate transition-colors ${
                        !game.isInLibrary
                          ? "text-white group-hover:text-[#00ff88]"
                          : "text-gray-300"
                      }`}
                    >
                      {game.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {game.first_release_date
                        ? new Date(
                            game.first_release_date * 1000,
                          ).getFullYear()
                        : "Bilinmiyor"}
                    </p>

                    {/* Relevance Score Göstergesi */}
                    {game.relevanceScore && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-[#00ff88]">🎯</span>
                        <span
                          className={`text-xs font-medium ${
                            formatRelevanceScore(game.relevanceScore).color
                          }`}
                        >
                          %{Math.round(game.relevanceScore)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelevanceScore(game.relevanceScore).label}
                        </span>
                      </div>
                    )}

                    {game.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-yellow-400">⭐</span>
                        <span className="text-xs text-gray-300">
                          {Math.round(game.rating)}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Düzenle Butonu - Sadece kütüphanede olan oyunlar için */}
                {game.isInLibrary && (
                  <div className="p-3 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEditGame) {
                          onEditGame(game.id);
                        }
                      }}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      data-ers={`add-game-modal.edit-button.${index + 1}`}
                    >
                      <span>✏️</span>
                      Düzenle
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSearch;
