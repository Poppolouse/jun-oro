import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useAddGameForm } from "../hooks/useAddGameForm";
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
 * Oyun ekleme, düzenleme ve kütüphaneye ekleme işlemlerini yöneten modal bileşeni.
 *
 * Bu bileşen, IGDB'den oyun arama, oyun detaylarını görüntüleme, platform ve durum seçme,
 * DLC'leri ve campaign'leri yönetme gibi işlevleri bir araya getirir. State yönetimi için
 * `useAddGameForm` hook'unu ve ek state'ler için `useState`'i kullanır.
 *
 * @param {object} props - Bileşen props'ları.
 * @param {boolean} props.isOpen - Modal'ın görünür olup olmadığını kontrol eder.
 * @param {Function} props.onClose - Modal'ı kapatma fonksiyonu.
 * @param {Function} props.onGameAdded - Yeni bir oyun kütüphaneye eklendiğinde tetiklenen callback.
 * @param {Function} props.onEditGame - Bir oyun düzenlendiğinde tetiklenen callback.
 * @param {boolean} [props.editMode=false] - Modal'ın düzenleme modunda olup olmadığını belirtir.
 * @param {object|null} [props.editGame=null] - Düzenleme modundaysa, düzenlenecek oyunun verileri.
 * @returns {JSX.Element|null} Modal açıksa JSX elementini, değilse null döner.
 */
const AddGameModal = ({
  isOpen,
  onClose,
  onGameAdded,
  onEditGame,
  editMode = false,
  editGame = null,
}) => {
  const { formState, dispatch } = useAddGameForm();
  const { searchTerm, searchResults, selectedGame, status: gameStatus, error } = formState;

  // Hook tarafından yönetilmeyen state'ler
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [platform, setPlatform] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [totalPlaytime, setTotalPlaytime] = useState("");
  const [showVariants, setShowVariants] = useState(false);
  const [gameVariants, setGameVariants] = useState({ dlcs: [], expansions: [], editions: [] });
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedDlcs, setSelectedDlcs] = useState([]);
  const [steamDlcs, setSteamDlcs] = useState([]);
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const modalRef = useRef(null);

  // Form inputlarını tek yerden yönet
  const handleFormInputChange = (e) => {
    const { name, value } = e.target || e;
    switch (name) {
      case "platform":
        setPlatform(value);
        break;
      case "totalPlaytime":
        setTotalPlaytime(value);
        break;
      case "gameStatus":
        dispatch({ type: 'field_update', field: 'status', payload: value });
        break;
      default:
        // diğer alanlar için genişletilebilir
        break;
    }
  };

  // Arama girişi değiştiğinde state'i güncelle ve debounce ile arama yap
  const handleSearchChange = (e) => {
    const value = e.target.value;
    dispatch({ type: 'field_update', field: 'searchTerm', payload: value });
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    const to = setTimeout(() => {
      handleSearchSubmit();
    }, 400);
    setSearchTimeout(to);
  };

  const handleSearchSubmit = async () => {
    const term = (searchTerm || '').trim();
    if (!term) return;
    setIsSearching(true);
    dispatch({ type: 'field_update', field: 'error', payload: null });
    try {
      const results = await igdbApi.searchGames(term, 12);
      const normalized = Array.isArray(results) ? results : [];
      const withFlags = normalized.map((g) => ({
        ...g,
        isInLibrary: false, // kütüphane kontrolü ileride eklenebilir
      }));
      const sorted = sortGamesByRelevance(withFlags, term);
      dispatch({ type: 'set_search_results', payload: sorted });
    } catch (err) {
      dispatch({ type: 'field_update', field: 'error', payload: err.message || 'Arama sırasında hata oluştu' });
    } finally {
      setIsSearching(false);
    }
  };

  const defaultOtherPlatforms = useMemo(() => [
    "GOG", "Nintendo Switch", "Origin", "Ubisoft Connect", "Battle.net",
    "Microsoft Store", "Mac App Store", "Itch.io", "Fiziksel Kopya", "Diğer",
  ], []);

  const otherPlatforms = useMemo(() => {
    const igdbNames = Array.isArray(platforms)
      ? platforms.map((p) => p?.name).filter(Boolean)
      : [];
    return Array.from(new Set([...igdbNames, ...defaultOtherPlatforms]));
  }, [platforms, defaultOtherPlatforms]);

  /**
   * IGDB'den mevcut platformların listesini yükler.
   */
  const loadPlatforms = async () => {
    try {
      const platformData = await igdbApi.getPlatforms();
      const uniqueNames = Array.from(new Set((platformData || []).map((p) => p?.name).filter(Boolean)));
      setPlatforms(uniqueNames.map((name) => ({ name })));
    } catch (err) {
      console.error("Platform yükleme hatası:", err);
      setPlatforms(defaultOtherPlatforms.map((name) => ({ name })));
    }
  };

  /**
   * Modal kapandığında tüm state'leri sıfırlar.
   */
  const handleModalClose = () => {
    dispatch({ type: "reset_form" });
    setPlatform("");
    setTotalPlaytime("");
    setShowVariants(false);
    setGameVariants({ dlcs: [], expansions: [], editions: [] });
    setSelectedVariant(null);
    setSelectedDlcs([]);
    setSteamDlcs([]);
    setIsCampaignMode(false);
    setCampaigns([]);
    setIsSearching(false);
    setIsAddingGame(false);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    onClose();
  };

  /**
   * Seçilen oyunu ve form verilerini kütüphaneye ekler veya günceller.
   */
  const handleAddGame = async () => {
    if (!selectedGame || !platform) {
      dispatch({ type: 'field_update', field: 'error', payload: "Lütfen platform seçin." });
      return;
    }
    if (isCampaignMode && campaigns.length === 0) {
      dispatch({ type: 'field_update', field: 'error', payload: 'Campaign modunda en az 1 campaign eklemelisiniz.' });
      return;
    }

    setIsAddingGame(true);
    dispatch({ type: 'field_update', field: 'error', payload: null });

    try {
      const gameToAdd = { ...(selectedVariant || selectedGame) };
      gameToAdd.status = gameStatus;
      gameToAdd.platform = platform;
      gameToAdd.totalPlaytime = totalPlaytime;
      if (campaigns.length > 0) gameToAdd.campaigns = campaigns;
      if (selectedDlcs.length > 0) gameToAdd.selectedDlcs = selectedDlcs;
      if (gameVariants && (gameVariants.dlcs?.length > 0 || gameVariants.expansions?.length > 0 || gameVariants.editions?.length > 0)) {
        gameToAdd.gameVariants = gameVariants;
      }
      if (steamDlcs.length > 0) gameToAdd.steamDlcs = steamDlcs;

      const formData = {
        platform,
        status: gameStatus,
        includeDLCs: selectedDlcs.length > 0,
        selectedDLCs: selectedDlcs,
        selectedCampaigns: campaigns,
        version: selectedVariant ? selectedVariant.name : "",
      };
      userPreferences.saveGameFormPreferences(gameToAdd.id, gameToAdd.name, formData);

      if (editMode && onEditGame) {
        onEditGame(gameToAdd);
      } else if (onGameAdded) {
        onGameAdded(gameToAdd);
      }

      handleModalClose();
    } catch (err) {
      dispatch({ type: 'field_update', field: 'error', payload: `Oyun eklenirken hata oluştu: ${err.message}` });
    } finally {
      setIsAddingGame(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPlatforms();
      if (editMode && editGame) {
        const gamePrefs = userPreferences.getGameFormPreferences(editGame.id);
        const gameData = {
          id: editGame.id,
          name: editGame.title,
          cover: editGame.coverUrl ? { image_id: editGame.coverUrl.split("/").pop().split(".")[0] } : null,
          platforms: editGame.platform ? [{ name: editGame.platform }] : [],
          genres: editGame.genre ? [{ name: editGame.genre }] : [],
          first_release_date: editGame.releaseYear ? new Date(editGame.releaseYear, 0, 1).getTime() / 1000 : null,
          rating: editGame.rating !== "N/A" ? parseFloat(editGame.rating) * 10 : null,
        };
        dispatch({ type: 'select_game', payload: gameData });
        dispatch({ type: 'field_update', field: 'searchTerm', payload: editGame.title || "" });
        dispatch({ type: 'field_update', field: 'status', payload: gamePrefs.status || editGame.status || "backlog" });
        
        setPlatform(gamePrefs.platform || editGame.platform || "");
        setTotalPlaytime(editGame.totalPlaytime || editGame.playtime || "");
        setCampaigns(gamePrefs.selectedCampaigns || editGame.campaigns || []);
        setSelectedDlcs(gamePrefs.selectedDLCs || editGame.selectedDlcs || []);
        if (editGame.gameVariants) setGameVariants(editGame.gameVariants);
        if (editGame.steamDlcs) setSteamDlcs(editGame.steamDlcs);

        const hasVariants = editGame.gameVariants && (editGame.gameVariants.dlcs?.length || 0) + (editGame.gameVariants.expansions?.length || 0) + (editGame.gameVariants.editions?.length || 0) > 0;
        const hasSteamDlcs = editGame.steamDlcs && editGame.steamDlcs.length > 0;
        if (hasVariants || hasSteamDlcs) {
          setShowVariants(true);
        }
      } else {
        const generalPrefs = userPreferences.getGameFormPreferences();
        dispatch({ type: 'field_update', field: 'status', payload: generalPrefs.status || "backlog" });
        setPlatform(generalPrefs.platform || "");
        setSelectedDlcs(generalPrefs.selectedDLCs || []);
        setCampaigns(generalPrefs.selectedCampaigns || []);
      }
    }
  }, [isOpen, editMode, editGame, dispatch]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" data-ers="add-game-modal.overlay">
      <div className="relative w-full max-w-4xl mx-auto" data-ers="add-game-modal.container">
        <div ref={modalRef} className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden" data-ers="add-game-modal.content">
          <div className="flex items-center justify-between p-6 border-b border-white/10" data-ers="add-game-modal.header">
            <div className="flex items-center gap-4">
              {isCampaignMode && (
                <button onClick={() => setIsCampaignMode(false)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" data-ers="add-game-modal.back-to-game">
                  ←
                </button>
              )}
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent" data-ers="add-game-modal.title">
                {isCampaignMode ? "Campaign Yönetimi" : editMode ? "Oyun Düzenle" : "Oyun Ekle"}
              </h2>
            </div>
            <button onClick={handleModalClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" data-ers="add-game-modal.close-button">
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]" data-ers="add-game-modal.body">
            {isCampaignMode ? (
              <CampaignManagement campaigns={campaigns} setCampaigns={setCampaigns} selectedGame={selectedGame} onBack={() => setIsCampaignMode(false)} />
            ) : !selectedGame ? (
              <GameSearch
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                searchResults={searchResults}
                isSearching={isSearching}
                error={error}
                onGameSelect={(game) => dispatch({ type: 'select_game', payload: game })}
                onEditGame={onEditGame}
              />
            ) : (
              <div className="space-y-6" data-ers="add-game-modal.game-details-section">
                <div className="flex items-center gap-4">
                  {!editMode && (
                    <button onClick={() => dispatch({ type: 'select_game', payload: null })} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors" data-ers="add-game-modal.back-to-search">
                      ← Geri dön
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-ers="add-game-modal.game-content">
                  <GameDetails selectedGame={selectedGame} gameVariants={gameVariants} showVariants={showVariants} isLoadingVariants={isLoadingVariants} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant} />
                  <div className="lg:col-span-2" data-ers="add-game-modal.form-section">
                    <GameForm
                      formState={{ platform, gameStatus, totalPlaytime }}
                      handleInputChange={handleFormInputChange}
                      platforms={platforms}
                      setIsCampaignMode={setIsCampaignMode}
                      selectedDlcs={selectedDlcs}
                      isAddingGame={isAddingGame}
                      handleAddGame={handleAddGame}
                      editMode={editMode}
                      error={error}
                    />
                  </div>
                </div>
                {showVariants && !isLoadingVariants && (
                  <div className="lg:col-span-3" data-ers="add-game-modal.dlc-section">
                    <DLCSelection gameVariants={gameVariants} selectedDlcs={selectedDlcs} setSelectedDlcs={setSelectedDlcs} steamDlcs={steamDlcs} />
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
