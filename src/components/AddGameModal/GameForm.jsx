import React from "react";
import { getDefaultOtherPlatforms } from "./utils";

const MAIN_PLATFORMS = [
  { name: "Steam", icon: "🎮" },
  { name: "Epic Games", icon: "🚀" },
  { name: "PlayStation", icon: "🎮" },
  { name: "Xbox", icon: "🎮" },
];

/**
 * A presentational component for the game adding/editing form.
 * This component is fully controlled by its parent. It receives form data
 * and event handlers as props, making it a "dumb" component.
 *
 * @param {object} props - The component props.
 * @param {object} props.formState - An object containing the current state of the form.
 * @param {string} props.formState.platform - The selected platform.
 * @param {string} props.formState.gameStatus - The current status of the game (e.g., 'playing', 'completed').
 * @param {string} props.formState.totalPlaytime - The total time played.
 * @param {Function} props.handleInputChange - A centralized handler for all form input changes.
 * @param {Array<object>} props.platforms - A list of available platforms, typically from an API.
 * @param {Function} props.setIsCampaignMode - A function to toggle the campaign management view.
 * @param {Array<object>} props.selectedDlcs - A list of selected DLCs for the game.
 * @param {boolean} props.isAddingGame - A flag indicating if the submission process is in progress.
 * @param {Function} props.handleAddGame - The function to call when the form is submitted.
 * @param {boolean} props.editMode - A flag to indicate if the form is in edit mode.
 * @param {string|null} props.error - An error message to display, if any.
 * @returns {JSX.Element} The rendered form.
 */
const GameForm = ({
  formState,
  handleInputChange,
  platforms,
  setIsCampaignMode,
  selectedDlcs,
  isAddingGame,
  handleAddGame,
  editMode,
  error,
}) => {
  const { platform, gameStatus, totalPlaytime } = formState;

  // Combine default platforms with platforms from the API.
  const otherPlatforms = getDefaultOtherPlatforms().concat(
    Array.isArray(platforms)
      ? platforms.map((p) => p?.name).filter(Boolean)
      : [],
  );

  return (
    <div
      className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10"
      data-ers="add-game-modal.game-form"
    >
      <h4 className="font-bold text-white">
        {editMode ? "Oyunu Düzenle" : "Kütüphaneye Ekle"}
      </h4>

      {/* Platform Selection */}
      <div data-ers="add-game-modal.platform-selection">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Platform
        </label>

        {/* Main Platform Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {MAIN_PLATFORMS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() =>
                handleInputChange({ target: { name: "platform", value: p.name } })
              }
              className={`p-3 rounded-lg border transition-all text-left ${
                platform === p.name
                  ? "border-[#00ff88] bg-[#00ff88]/10 text-white"
                  : "border-white/20 bg-white/5 hover:bg-white/10 text-gray-300"
              }`}
              data-ers={`add-game-modal.platform.${p.name.toLowerCase()}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              {platform === p.name && (
                <div className="text-[#00ff88] text-xs mt-1">✓ Seçili</div>
              )}
            </button>
          ))}
        </div>

        {/* Other Platforms Dropdown */}
        <div>
          <select
            name="platform"
            value={MAIN_PLATFORMS.some((p) => p.name === platform) ? "" : platform}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
            data-ers="add-game-modal.other-platforms"
          >
            <option value="" className="bg-gray-800">
              Diğer Platformlar
            </option>
            {otherPlatforms.map((name) => (
              <option key={name} value={name} className="bg-gray-800">
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Total Playtime */}
      <div data-ers="add-game-modal.playtime-input">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Toplam Oynama Süresi
        </label>
        <div className="relative">
          <input
            type="text"
            name="totalPlaytime"
            value={totalPlaytime}
            onChange={handleInputChange}
            placeholder="Örn: 25 saat, 2.5h, 150 dakika"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
            data-ers="add-game-modal.playtime"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
            ⏱️
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          💡 İsteğe bağlı - Oyunu ne kadar süre oynadığınızı girebilirsiniz.
        </p>
      </div>

      {/* Status Selection */}
      <div data-ers="add-game-modal.status-selection">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Durum
        </label>
        <select
          name="gameStatus"
          value={gameStatus}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
          data-ers="add-game-modal.status"
        >
          <option value="backlog" className="bg-gray-800">Backlog</option>
          <option value="playing" className="bg-gray-800">Oynanıyor</option>
          <option value="completed" className="bg-gray-800">Bitti</option>
          <option value="completed_100" className="bg-gray-800">%100 Bitti</option>
          <option value="paused" className="bg-gray-800">Ara Verildi</option>
          <option value="dropped" className="bg-gray-800">Bırakıldı</option>
        </select>
      </div>

      {/* Campaign Management */}
      <div data-ers="add-game-modal.campaign-management">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Campaign Yönetimi
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCampaignMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-white/5 border-white/20 text-gray-300 hover:border-white/40"
              data-ers="add-game-modal.campaign-button"
            >
              🎯 Campaign Yönetimi
            </button>
            <div className="relative">
              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-yellow-500/10 border-yellow-500/30 text-yellow-300 cursor-not-allowed opacity-75"
                title="Çok Yakında!"
                data-ers="add-game-modal.hltb-button"
              >
                🕹️ HLTB Ekle
              </button>
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                Yakında
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
            💡 Bu oyunda birden fazla campaign/hikaye modu varsa campaign ekleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Selected DLCs Summary */}
      {selectedDlcs.length > 0 && (
        <div
          className="p-3 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/30"
          data-ers="add-game-modal.selected-dlcs-summary"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Seçilen DLC'ler</span>
            <span className="text-lg font-bold text-[#00ff88]">{selectedDlcs.length}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            DLC seçildi ve oyunla birlikte eklenecek.
          </p>
        </div>
      )}

      {error && (
        <div
          className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
          data-ers="add-game-modal.form-error"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleAddGame}
        disabled={isAddingGame || !platform}
        className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        data-ers="add-game-modal.submit-button"
      >
        {isAddingGame
          ? editMode
            ? "🎮 Güncelleniyor..."
            : "🎮 Ekleniyor..."
          : editMode
          ? "🎮 Oyunu Düzenle"
          : "🎮 Kütüphaneye Ekle"}
      </button>
    </div>
  );
};

export default GameForm;
