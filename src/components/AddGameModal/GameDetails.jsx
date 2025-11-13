import React from "react";
import { getImageUrl } from "./utils";

/**
 * Seçilen oyunun detaylarını props'tan alarak gösteren bir sunum bileşeni.
 *
 * Bu bileşen, kendi içinde state veya mantık barındırmaz. Tüm verileri ve
 * eylemleri props aracılığıyla alır, bu da onu yeniden kullanılabilir ve test edilebilir kılar.
 *
 * @param {object} props - Component props.
 * @param {object} props.selectedGame - Görüntülenecek oyunun tüm detayları.
 *   Geliştirici ve yayımcı bilgileri bu nesne içinde hazır olarak bulunmalıdır.
 * @param {Function} props.onClearSelection - Oyun seçimini temizleyip arama görünümüne
 *   geri dönmek için çağrılacak fonksiyon.
 * @returns {JSX.Element|null} Render edilecek component veya oyun seçilmemişse null.
 */
const GameDetails = ({ selectedGame, onClearSelection }) => {
  if (!selectedGame) return null;

  // Geliştirici ve yayımcı bilgileri artık doğrudan parent component'ten geliyor.
  const { developer, publisher } = selectedGame;

  return (
    <div className="space-y-6" data-ers="add-game-modal.game-details">
      {/* Seçimi Temizle Butonu */}
      <button
        onClick={onClearSelection}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        data-ers="add-game-modal.clear-selection-button"
      >
        ← Seçimi Temizle
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Oyun Görseli */}
        <div className="lg:col-span-1 space-y-4">
          <img
            src={getImageUrl(selectedGame.cover, "1080p")}
            alt={selectedGame.name}
            className="w-full aspect-[2/3] object-cover rounded-lg"
            data-ers="add-game-modal.game-cover"
          />

          {/* Hızlı İstatistikler */}
          <div
            className="bg-white/5 rounded-lg p-3 border border-white/10"
            data-ers="add-game-modal.quick-stats"
          >
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Hızlı Bilgiler
            </h4>
            <div className="space-y-2 text-xs">
              {selectedGame.first_release_date && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Çıkış:</span>
                  <span className="text-white">
                    {new Date(
                      selectedGame.first_release_date * 1000,
                    ).getFullYear()}
                  </span>
                </div>
              )}

              {selectedGame.platforms && selectedGame.platforms.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Platformlar:</span>
                  <span className="text-white">
                    {selectedGame.platforms.length}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-400">Geliştirici:</span>
                <span className="text-white text-xs">{developer}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Yayımcı:</span>
                <span className="text-white text-xs">{publisher}</span>
              </div>
            </div>
          </div>

          {/* Türler */}
          {selectedGame.genres && selectedGame.genres.length > 0 && (
            <div
              className="bg-white/5 rounded-lg p-3 border border-white/10"
              data-ers="add-game-modal.genres"
            >
              <h4 className="text-sm font-medium text-gray-300 mb-2">Türler</h4>
              <div className="flex flex-wrap gap-1">
                {selectedGame.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-2 py-1 bg-gradient-to-r from-[#00ff88]/20 to-[#00d4ff]/20 rounded text-xs text-white border border-[#00ff88]/30"
                    data-ers={`add-game-modal.genre.${genre.id}`}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Oyun Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Oyun Bilgileri */}
          <div data-ers="add-game-modal.game-info">
            <h3 className="text-2xl font-bold text-white mb-2">
              {selectedGame.name}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              {selectedGame.first_release_date && (
                <div>
                  <span className="text-gray-400">Çıkış Tarihi:</span>
                  <span className="text-white ml-2">
                    {new Date(
                      selectedGame.first_release_date * 1000,
                    ).getFullYear()}
                  </span>
                </div>
              )}

              {selectedGame.genres && selectedGame.genres.length > 0 && (
                <div className="col-span-2">
                  <span className="text-gray-400">Türler:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedGame.genres.slice(0, 5).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-white"
                        data-ers={`add-game-modal.genre-detail.${genre.id}`}
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedGame.summary && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedGame.summary.length > 300
                  ? selectedGame.summary.substring(0, 300) + "..."
                  : selectedGame.summary}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
