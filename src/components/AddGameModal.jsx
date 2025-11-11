import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import igdbApi from "../services/igdbApi";
import steamApi from "../services/steamApi";
import cacheService from "../services/cacheService";
import userLibrary from "../services/userLibrary";
import userPreferences from "../services/userPreferences";
import {
  sortGamesByRelevance,
  formatRelevanceScore,
} from "../utils/searchUtils";
import GameSearch from "./AddGameModal/GameSearch";
import GameDetails from "./AddGameModal/GameDetails";
import DLCSelection from "./AddGameModal/DLCSelection";
import GameForm from "./AddGameModal/GameForm";
import CampaignManagement from "./AddGameModal/CampaignManagement";

/**
 * AddGameModal Component - Oyun ekleme/düzenleme modal'ı
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal açık mı
 * @param {Function} props.onClose - Modal kapatma fonksiyonu
 * @param {Function} props.onGameAdded - Oyun eklendi callback'i
 * @param {Function} props.onEditGame - Oyun düzenlendi callback'i
 * @param {boolean} props.editMode - Düzenleme modu mu
 * @param {Object} props.editGame - Düzenlenecek oyun
 */
const AddGameModal = ({
  isOpen,
  onClose,
  onGameAdded,
  onEditGame,
  editMode = false,
  editGame = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [error, setError] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Platform ve durum için state'ler
  const [platform, setPlatform] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [gameStatus, setGameStatus] = useState("backlog");
  const [totalPlaytime, setTotalPlaytime] = useState("");

  // Edition/DLC seçimi için state'ler
  const [showVariants, setShowVariants] = useState(false);
  const [gameVariants, setGameVariants] = useState({
    dlcs: [],
    expansions: [],
    editions: [],
  });
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedDlcs, setSelectedDlcs] = useState([]);
  const [steamDlcs, setSteamDlcs] = useState([]);

  // Campaign modu için state'ler
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  // Modal konumu için ref
  const modalRef = useRef(null);

  /**
   * Diğer platformlar için varsayılan liste
   */
  const defaultOtherPlatforms = [
    "GOG",
    "Nintendo Switch",
    "Origin",
    "Ubisoft Connect",
    "Battle.net",
    "Microsoft Store",
    "Mac App Store",
    "Itch.io",
    "Fiziksel Kopya",
    "Diğer",
  ];

  /**
   * Diğer platformlar listesi
   */
  const otherPlatforms = useMemo(() => {
    const igdbNames = Array.isArray(platforms)
      ? platforms.map((p) => p?.name).filter(Boolean)
      : [];
    const merged = Array.from(
      new Set([...igdbNames, ...defaultOtherPlatforms]),
    );
    return merged;
  }, [platforms]);

  /**
   * Platform listesini yükler
   */
  const loadPlatforms = async () => {
    try {
      const platformData = await igdbApi.getPlatforms();
      const uniqueNames = Array.from(
        new Set((platformData || []).map((p) => p?.name).filter(Boolean)),
      );
      const normalized = uniqueNames.map((name) => ({ name }));
      setPlatforms(normalized);
    } catch (error) {
      console.error("Platform yükleme hatası:", error);
      const fallback = defaultOtherPlatforms.map((name) => ({ name }));
      setPlatforms(fallback);
    }
  };

  /**
   * Modal kapandığında temizlik yapar
   */
  const handleModalClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedGame(null);
    setError("");
    setGameStatus("backlog");
    setPlatform("");
    setTotalPlaytime("");
    setShowVariants(false);
    setGameVariants({ dlcs: [], expansions: [], editions: [] });
    setSelectedVariant(null);
    setSelectedDlcs([]);
    setSteamDlcs([]);
    setIsCampaignMode(false);
    setCampaigns([]);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }

    onClose();
  };

  /**
   * Oyunu kütüphaneye ekler
   */
  const handleAddGame = async () => {
    if (!selectedGame || !platform) {
      setError("Lütfen platform seçin.");
      return;
    }

    // Campaign zorunluluğu kontrolü
    if (isCampaignMode && campaigns.length === 0) {
      setError(
        'Oyunu kütüphaneye eklemek için en az 1 campaign eklemelisiniz. Campaign eklemek için "🎯 Campaign Yönetimi" butonuna tıklayın.',
      );
      return;
    }

    setIsAddingGame(true);
    setError("");

    try {
      // Seçilen variant varsa onu kullan, yoksa ana oyunu kullan
      const gameToAdd = selectedVariant || selectedGame;

      // Seçili platform ve durum bilgilerini ekle
      gameToAdd.status = gameStatus;
      gameToAdd.platform = platform;
      gameToAdd.totalPlaytime = totalPlaytime;

      // Campaign bilgilerini ekle
      if (campaigns.length > 0) {
        gameToAdd.campaigns = campaigns;
      }

      // DLC ve versiyon bilgilerini ekle
      if (selectedDlcs.length > 0) {
        gameToAdd.selectedDlcs = selectedDlcs;
      }

      if (
        gameVariants &&
        (gameVariants.dlcs?.length > 0 ||
          gameVariants.expansions?.length > 0 ||
          gameVariants.editions?.length > 0)
      ) {
        gameToAdd.gameVariants = gameVariants;
      }

      if (steamDlcs.length > 0) {
        gameToAdd.steamDlcs = steamDlcs;
      }

      // Kullanıcı tercihlerini kaydet
      const formData = {
        platform: platform,
        status: gameStatus,
        includeDLCs: selectedDlcs.length > 0,
        selectedDLCs: selectedDlcs,
        selectedCampaigns: campaigns,
        version: selectedVariant ? selectedVariant.name : "",
      };

      userPreferences.saveGameFormPreferences(
        gameToAdd.id,
        gameToAdd.name,
        formData,
      );

      // Callback'i çağır
      if (editMode && onEditGame) {
        onEditGame(gameToAdd);
      } else if (onGameAdded) {
        onGameAdded(gameToAdd);
      }

      handleModalClose();
    } catch (error) {
      setError("Oyun eklenirken hata oluştu: " + error.message);
    } finally {
      setIsAddingGame(false);
    }
  };

  /**
   * Campaign moduna geçiş
   */
  const handleCampaignMode = () => {
    setIsCampaignMode(true);
  };

  /**
   * Oyun ekleme moduna geçiş
   */
  const handleBackToGameMode = () => {
    setIsCampaignMode(false);
  };

  // Effect'ler
  useEffect(() => {
    if (isOpen) {
      loadPlatforms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editMode && editGame) {
        // Düzenleme modu için verileri yükle
        const gamePrefs = userPreferences.getGameFormPreferences(editGame.id);
        setSelectedGame({
          id: editGame.id,
          name: editGame.title,
          cover: editGame.coverUrl
            ? { image_id: editGame.coverUrl.split("/").pop().split(".")[0] }
            : null,
          platforms: editGame.platform ? [{ name: editGame.platform }] : [],
          genres: editGame.genre ? [{ name: editGame.genre }] : [],
          first_release_date: editGame.releaseYear
            ? new Date(editGame.releaseYear, 0, 1).getTime() / 1000
            : null,
          rating:
            editGame.rating !== "N/A" ? parseFloat(editGame.rating) * 10 : null,
        });
        setSearchTerm(editGame.title || "");
        setPlatform(gamePrefs.platform || editGame.platform || "");
        setGameStatus(gamePrefs.status || editGame.status || "backlog");
        setTotalPlaytime(editGame.totalPlaytime || editGame.playtime || "");
        setCampaigns(gamePrefs.selectedCampaigns || editGame.campaigns || []);
        setSelectedDlcs(gamePrefs.selectedDLCs || editGame.selectedDlcs || []);

        if (editGame.gameVariants) setGameVariants(editGame.gameVariants);
        if (editGame.steamDlcs) setSteamDlcs(editGame.steamDlcs);

        const hasVariants =
          editGame.gameVariants &&
          (editGame.gameVariants.dlcs?.length || 0) +
            (editGame.gameVariants.expansions?.length || 0) +
            (editGame.gameVariants.editions?.length || 0) >
          0;
        const hasSteamDlcs =
          editGame.steamDlcs && editGame.steamDlcs.length > 0;
        if (hasVariants || hasSteamDlcs) {
          setShowVariants(true);
        }
      } else {
        // Ekleme modu için genel tercihler
        const generalPrefs = userPreferences.getGameFormPreferences();
        setPlatform(generalPrefs.platform || "");
        setGameStatus(generalPrefs.status || "backlog");
        setSelectedDlcs(generalPrefs.selectedDLCs || []);
        setCampaigns(generalPrefs.selectedCampaigns || []);
      }
    }
  }, [isOpen, editMode, editGame]);

  // Modal açık değilse render etme
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" data-ers="add-game-modal.overlay">
      <div className="relative w-full max-w-4xl mx-auto" data-ers="add-game-modal.container">
        <div
          ref={modalRef}
          className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          data-ers="add-game-modal.content"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10" data-ers="add-game-modal.header">
            <div className="flex items-center gap-4">
              {isCampaignMode && (
                <button
                  onClick={handleBackToGameMode}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  data-ers="add-game-modal.back-to-game"
                >
                  ←
                </button>
              )}
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent" data-ers="add-game-modal.title">
                {isCampaignMode
                  ? "Campaign yönetimi"
                  : editMode
                    ? "Oyun Düzenle"
                    : "Oyun Ekle"}
              </h2>
            </div>
            <button
              onClick={handleModalClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              data-ers="add-game-modal.close-button"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]" data-ers="add-game-modal.body">
            {isCampaignMode ? (
              // Campaign Modu
              <CampaignManagement
                campaigns={campaigns}
                setCampaigns={setCampaigns}
                selectedGame={selectedGame}
                onBack={handleBackToGameMode}
              />
            ) : !selectedGame ? (
              // Arama Ekranı
              <GameSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                error={error}
                setError={setError}
                onGameSelect={setSelectedGame}
                searchTimeout={searchTimeout}
                setSearchTimeout={setSearchTimeout}
              />
            ) : (
              // Oyun Detayları ve Ekleme Ekranı
              <div className="space-y-6" data-ers="add-game-modal.game-details-section">
                <div className="flex items-center gap-4">
                  {!editMode && (
                    <button
                      onClick={() => setSelectedGame(null)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      data-ers="add-game-modal.back-to-search"
                    >
                      ← Geri dön
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-ers="add-game-modal.game-content">
                  {/* Sol: Oyun Görseli ve Bilgileri */}
                  <GameDetails
                    selectedGame={selectedGame}
                    gameVariants={gameVariants}
                    showVariants={showVariants}
                    isLoadingVariants={isLoadingVariants}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                  />

                  {/* Sağ: Oyun Formu */}
                  <div className="lg:col-span-2" data-ers="add-game-modal.form-section">
                    <GameForm
                      selectedGame={selectedGame}
                      platform={platform}
                      setPlatform={setPlatform}
                      gameStatus={gameStatus}
                      setGameStatus={setGameStatus}
                      totalPlaytime={totalPlaytime}
                      setTotalPlaytime={setTotalPlaytime}
                      otherPlatforms={otherPlatforms}
                      showVariants={showVariants}
                      gameVariants={gameVariants}
                      isLoadingVariants={isLoadingVariants}
                      selectedDlcs={selectedDlcs}
                      setSelectedDlcs={setSelectedDlcs}
                      steamDlcs={steamDlcs}
                      isCampaignMode={isCampaignMode}
                      campaigns={campaigns}
                      setCampaigns={setCampaigns}
                      handleCampaignMode={handleCampaignMode}
                      error={error}
                      setError={setError}
                      isAddingGame={isAddingGame}
                      handleAddGame={handleAddGame}
                      editMode={editMode}
                    />
                  </div>
                </div>

                {/* DLC Seçimi - Tam Genişlik */}
                {showVariants && !isLoadingVariants && (
                  <div className="lg:col-span-3" data-ers="add-game-modal.dlc-section">
                    <DLCSelection
                      gameVariants={gameVariants}
                      selectedDlcs={selectedDlcs}
                      setSelectedDlcs={setSelectedDlcs}
                      steamDlcs={steamDlcs}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddGameModal;
