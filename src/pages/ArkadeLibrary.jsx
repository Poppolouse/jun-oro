import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ArkadeHeader from "../components/ArkadeHeader";
import ArkadeSidebar from "../components/ArkadeSidebar";
import AddGameModal from "../components/AddGameModal";
import SteamImportModal from "../components/SteamImportModal";
import CampaignSelectionModal from "../components/CampaignSelectionModal";
import userLibrary from "../services/userLibrary";
import SiteFooter from "../components/SiteFooter";
import ElementSelector from "../components/Tutorial/ElementSelector";
import { useActiveSession } from "../contexts/ActiveSessionContext";
import { useAuth } from "../contexts/AuthContext";

function ArkadeLibrary() {
  const navigate = useNavigate();
  const [showCampaignCards, setShowCampaignCards] = useState(false);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex flex-col"
      id="arkade-library"
      data-registry="2.1"
    >
      <ArkadeHeader />
      <div
        className="flex flex-1 min-h-0"
        id="library-layout"
        data-registry="2.1.B"
      >
        <ArkadeSidebar />
        <LibraryContent
          showCampaignCards={showCampaignCards}
          setShowCampaignCards={setShowCampaignCards}
        />
        <LibraryRightSidebar
          showCampaignCards={showCampaignCards}
          setShowCampaignCards={setShowCampaignCards}
        />
      </div>
      <SiteFooter />
      <ElementSelector />
    </div>
  );
}

export default ArkadeLibrary;

function LibraryContent({ showCampaignCards, setShowCampaignCards }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSteamImportOpen, setIsSteamImportOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("games"); // 'games' | 'cycle'
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const [filterOption, setFilterOption] = useState("all");
  const [viewOption, setViewOption] = useState("grid");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIds, setDeleteIds] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedGameForCampaign, setSelectedGameForCampaign] = useState(null);
  // Grid sayfalama: 4 satır limiti
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { startSession, activeSession } = useActiveSession();

  // Campaign sayısı
  const campaignCount = useMemo(() => {
    try {
      let count = 0;
      games.forEach((g) => {
        if (Array.isArray(g.campaigns)) count += g.campaigns.length;
      });
      return count;
    } catch (e) {
      return 0;
    }
  }, [games]);

  // Metin tabanlı süreleri dakikaya çevir
  const parseDurationToMinutes = (text) => {
    if (!text || typeof text !== "string") return 0;
    const s = text.toLowerCase().trim();
    // Aralık varsa ilk değeri kullan (örn: "40-50 saat")
    const rangeParts = s.split("-");
    const primary = rangeParts[0].trim();
    let total = 0;
    // h/m (HLTB) formatları
    const hMatch = primary.match(/(\d+(?:[.,]\d+)?)\s*h/);
    const mMatch = primary.match(/(\d+)\s*m/);
    if (hMatch || mMatch) {
      const hours = hMatch ? parseFloat(hMatch[1].replace(",", ".")) : 0;
      const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
      total = Math.round(hours * 60 + mins);
      return total;
    }
    // Türkçe anahtarlar: saat/dakika/dk
    const saatMatch = primary.match(/(\d+(?:[.,]\d+)?)\s*saat/);
    const dakikaMatch = primary.match(/(\d+)\s*dakika|\b(\d+)\s*dk/);
    if (saatMatch) {
      const hours = parseFloat(saatMatch[1].replace(",", "."));
      total = Math.round(hours * 60);
      return total;
    }
    if (dakikaMatch) {
      const mins = parseInt(dakikaMatch[1] || dakikaMatch[2], 10);
      total = mins;
      return total;
    }
    // Sadece sayı verilmişse saat varsay
    const numberOnly = primary.match(/^(\d+(?:[.,]\d+)?)$/);
    if (numberOnly) {
      const hours = parseFloat(numberOnly[1].replace(",", "."));
      return Math.round(hours * 60);
    }
    return 0;
  };

  // Campaign/HLTB verisinden varsayılan oynanma süresi dakikayı türet
  const deriveDefaultPlaytimeMinutes = (gameData) => {
    try {
      const campaigns = Array.isArray(gameData?.campaigns)
        ? gameData.campaigns
        : [];
      if (campaigns.length > 0) {
        const preferred = ["main story", "main + extra", "completionist"];
        const pick =
          campaigns.find((c) =>
            preferred.includes((c?.name || "").toLowerCase()),
          ) || campaigns[0];
        const dur = pick?.averageDuration || pick?.avgHours || null;
        const mins = parseDurationToMinutes(String(dur || ""));
        if (mins > 0) return mins;
        const hltb = pick?.howLongToBeatData;
        if (hltb) {
          return (
            parseDurationToMinutes(hltb.mainStory) ||
            parseDurationToMinutes(hltb.mainExtra) ||
            parseDurationToMinutes(hltb.completionist) ||
            0
          );
        }
      }
      return 0;
    } catch (e) {
      console.warn("Varsayılan oynanma süresi türetme hatası:", e);
      return 0;
    }
  };

  const handleGameAdded = async (gameData) => {
    try {
      if (editTarget) {
        await userLibrary.updateGameInLibrary(String(gameData.id), gameData);
        setLastAdded(`Güncellendi: ${gameData.name || gameData.title || ""}`);
        setEditTarget(null);
        // Oyun listesini hemen yeniden yükle
        const updatedList =
          (await userLibrary.getLibraryGamesWithDetails()) || [];
        setGames(updatedList);
      } else {
        // Duruma göre kategori belirle
        const categoryMapping = {
          playing: "playing",
          completed: "completed",
          backlog: "wishlist",
          dropped: "dropped",
        };
        const category =
          categoryMapping[(gameData.status || "").toLowerCase()] || "playing";
        const added = await userLibrary.addGameToLibrary(gameData, category);
        // Yeni eklemede campaign/HLTB verisinden oynanma süresini dakikaya çevir ve ayarla
        if (added) {
          const defaultMins = deriveDefaultPlaytimeMinutes(gameData);
          if (defaultMins > 0) {
            await userLibrary.updateGameDetails(String(gameData.id), {
              playtime: defaultMins,
            });
          }
        }
        setLastAdded(gameData.name || gameData.title || "Yeni Oyun");
      }
      setIsAddOpen(false);
    } catch (e) {
      console.error("Oyun ekleme/güncelleme hatası:", e);
    }
  };

  useEffect(() => {
    const loadGames = async () => {
      try {
        const list = (await userLibrary.getLibraryGamesWithDetails()) || [];
        setGames(list);
      } catch (e) {
        console.error("Kütüphane oyunlarını yükleme hatası:", e);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, [lastAdded, isAddOpen]);

  // Grid genişliğine göre kaç kolon var -> 4 satır * kolon = pageSize
  useEffect(() => {
    const computePageSize = () => {
      try {
        const el = listRef.current;
        if (!el) return;
        const containerWidth = el.clientWidth || 0;
        const CARD_WIDTH = 230; // px
        const GAP = 16; // gap-4
        const cols = Math.max(
          1,
          Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)),
        );
        const nextSize = cols * 4;
        setPageSize(nextSize);
      } catch (e) {
        // Sessizce geç
      }
    };
    computePageSize();
    window.addEventListener("resize", computePageSize);
    return () => window.removeEventListener("resize", computePageSize);
  }, []);

  // Filtre/sıralama değiştiğinde sayfayı başa al
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterOption, sortOption, viewOption, games]);

  const isSelected = (id) => selectedIds.has(String(id));

  const toggleSelect = (id, checked) => {
    const next = new Set(selectedIds);
    const key = String(id);
    if (checked) next.add(key);
    else next.delete(key);
    setSelectedIds(next);
  };

  const openEdit = (g) => {
    const category = (
      g.libraryInfo?.category ||
      g.category ||
      "wishlist"
    ).toLowerCase();
    const statusMapping = {
      playing: "playing",
      completed: "completed",
      wishlist: "backlog",
      dropped: "dropped",
    };
    const status = statusMapping[category] || "backlog";
    const releaseYear = g.first_release_date
      ? new Date(
          typeof g.first_release_date === "number"
            ? g.first_release_date * 1000
            : Date.now(),
        ).getFullYear()
      : null;
    const primaryPlatform =
      Array.isArray(g.platforms) && g.platforms.length > 0
        ? g.platforms[0].name || g.platforms[0]
        : "";
    const primaryGenre =
      Array.isArray(g.genres) && g.genres.length > 0
        ? g.genres[0].name || g.genres[0]
        : "";
    const coverUrl = (() => {
      const c = g.cover;
      if (c?.image_id)
        return `https://images.igdb.com/igdb/image/upload/t_thumb/${c.image_id}.jpg`;
      if (typeof c === "string") return c;
      if (typeof c?.url === "string") return c.url;
      return "";
    })();
    const payload = {
      id: g.id,
      title: g.name || g.title || "Bilinmeyen Oyun",
      coverUrl,
      platform: primaryPlatform,
      genre: primaryGenre,
      releaseYear,
      rating: g.rating,
      status,
      campaigns: g.campaigns || [],
      selectedDlcs: g.selectedDlcs || [],
      selectedVariant: g.selectedVariant || null,
      gameVariants: g.gameVariants || null,
      steamDlcs: g.steamDlcs || [],
      dlcSource: g.dlcSource || null,
    };
    setEditTarget(payload);
    setIsAddOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteIds([String(id)]);
    setShowDeleteConfirm(true);
  };

  const performDelete = async (mode) => {
    // mode: 'library' | 'library_and_data'
    try {
      for (const id of deleteIds) {
        await userLibrary.removeGameFromLibrary(String(id));
        // API tabanlı sistemde oyun verileri API'de tutuluyor
      }
      setSelectedIds(new Set());
      setDeleteIds([]);
      setShowDeleteConfirm(false);
      setLastAdded(`Silindi: ${Date.now()}`);
    } catch (e) {
      console.error("Oyun silme hatası:", e);
    }
  };

  const formatPlaytime = (mins) => {
    const m = Number(mins || 0);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h <= 0) return `${mm}m`;
    if (mm === 0) return `${h}h`;
    return `${h}h ${mm}m`;
  };

  const getDeveloper = (g) => {
    // 1) IGDB involved_companies
    const ic = Array.isArray(g.involved_companies) ? g.involved_companies : [];
    const devCompany = ic.find((c) => c?.developer && c?.company?.name);
    if (devCompany?.company?.name) return devCompany.company.name;

    // 2) Doğrudan alanlar (Steam veya manuel eklenen)
    if (typeof g.developer === "string" && g.developer.trim())
      return g.developer.trim();
    if (
      typeof g?.steamData?.developer === "string" &&
      g.steamData.developer.trim()
    )
      return g.steamData.developer.trim();
    if (
      Array.isArray(g.developers) &&
      g.developers.length &&
      typeof g.developers[0] === "string"
    )
      return g.developers[0];

    // 3) Kampanya customProperties ("Geliştirici")
    const cp = Array.isArray(g.campaigns) ? g.campaigns : [];
    for (const c of cp) {
      const props = c?.customProperties || [];
      const p = props.find(
        (p) => (p.name || "").toLowerCase() === "geliştirici",
      );
      if (p?.value) return p.value;
    }

    return "Bilinmiyor";
  };

  const renderGameCard = (g, i) => {
    const coverUrl = (() => {
      const c = g.cover;
      if (c?.image_id)
        return `https://images.igdb.com/igdb/image/upload/t_1080p/${c.image_id}.jpg`;
      if (typeof c === "string")
        return c
          .replace("t_cover_small", "t_1080p")
          .replace("t_thumb", "t_1080p");
      if (typeof c?.url === "string")
        return c.url
          .replace("t_cover_small", "t_1080p")
          .replace("t_thumb", "t_1080p");
      return "/api/placeholder/160/240?text=Arkade";
    })();
    const title = g.name || g.title || "Bilinmeyen Oyun";
    const platform =
      Array.isArray(g.platforms) && g.platforms.length > 0
        ? g.platforms[0].name || g.platforms[0]
        : null;
    const genres =
      Array.isArray(g.genres) && g.genres.length > 0
        ? g.genres[0].name || g.genres[0]
        : null;
    const category = g.libraryInfo?.category || g.category || "wishlist";
    const rating = typeof g.rating === "number" ? Math.round(g.rating) : null;
    const developer = getDeveloper(g);
    const statusLabel =
      {
        playing: "Oynanıyor",
        completed: "Tamamlandı",
        wishlist: "Backlog",
        dropped: "Bırakıldı",
      }[category] || "Backlog";
    const checked = isSelected(g.id);
    return (
      <div
        key={g.id || i}
        className={`group relative w-[230px] h-[346px] rounded-xl overflow-hidden bg-white/5 border transition cursor-pointer ${
          checked
            ? "border-emerald-500/60 ring-2 ring-emerald-500/30"
            : "border-white/10 hover:border-emerald-500/40"
        }`}
        onClick={(e) => {
          // Eğer buton veya input'a tıklanmışsa kart seçimini tetikleme
          if (e.target.closest("button") || e.target.closest("input")) {
            return;
          }
          toggleSelect(g.id, !checked);
        }}
      >
        <img
          src={coverUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        {/* Üst sol: toplu seçim kutusu */}
        <label className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 border border-white/20 text-white text-[10px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => toggleSelect(g.id, e.target.checked)}
            className="appearance-none w-3 h-3 rounded-sm border border-white/40 bg-black/30 checked:bg-emerald-500 checked:border-emerald-400"
          />
          <span>Seç</span>
        </label>
        {/* Üst sağ: düzenle & sil */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(g);
            }}
            className="px-2 py-1 text-[10px] rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 hover:bg-blue-500/40"
            title="Düzenle"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(g.id);
            }}
            className="px-2 py-1 text-[10px] rounded-full bg-red-500/30 border border-red-400/40 text-red-200 hover:bg-red-500/40"
            title="Sil"
          >
            🗑️
          </button>
        </div>

        {/* Ortada küçük play butonu */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const gameData = {
                id: g.id,
                name: title,
                title: title,
                image: coverUrl,
                platform: platform || "PC",
                genre: genres || "Oyun",
                genres: g.genres,
                totalPlaytime: formatPlaytime(g.libraryInfo?.playtime),
                playtime: formatPlaytime(g.libraryInfo?.playtime),
                progress: g.libraryInfo?.progress || 0,
                campaigns: g.campaigns || [],
              };

              // Eğer oyunda campaign'ler varsa campaign seçme modalını aç
              if (g.campaigns && g.campaigns.length > 0) {
                setSelectedGameForCampaign(gameData);
                setShowCampaignModal(true);
              } else {
                // Campaign yoksa direkt başlat
                const result = await startSession(gameData);
                if (result?.success) {
                  navigate("/arkade/session");
                } else if (result?.requiresCampaign) {
                  // Campaign gerekiyorsa modal aç
                  setSelectedGameForCampaign(gameData);
                  setShowCampaignModal(true);
                } else {
                  console.error("Oturum başlatılamadı:", result?.error);
                }
              }
            }}
            disabled={activeSession?.id === g.id}
            className={`w-12 h-12 rounded-full border transition-all duration-300 flex items-center justify-center ${
              activeSession?.id === g.id
                ? "bg-green-500/80 border-green-400 text-green-100 cursor-not-allowed backdrop-blur-sm"
                : "bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 hover:scale-105 backdrop-blur-sm"
            }`}
            title={
              activeSession?.id === g.id
                ? "Zaten oynuyor"
                : g.campaigns && g.campaigns.length > 0
                  ? "Campaign seç ve başlat"
                  : "Oturumu başlat"
            }
          >
            {activeSession?.id === g.id ? (
              <div className="text-sm">🎮</div>
            ) : (
              <svg
                className="w-4 h-4 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Alt içerik */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/65 to-transparent">
          <div className="text-white text-sm font-semibold truncate">
            {title}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-gray-300 truncate max-w-[50%]">
              {developer || "—"}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/90">
              {statusLabel}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-gray-300">
              {formatPlaytime(g.libraryInfo?.playtime)}
            </span>
            {g.campaigns && g.campaigns.length > 0 && (
              <span className="text-[#00ff88] flex items-center gap-1">
                <span>🎯</span>
                <span>{g.campaigns.length} Campaign</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Kütüphane listesini render eden yardımcı fonksiyon
  const renderLibraryListContent = () => {
    let filtered = games || [];
    if (filterOption !== "all") {
      filtered = filtered.filter(
        (g) =>
          (g.libraryInfo?.category || g.category || "").toLowerCase() ===
          filterOption,
      );
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter((g) =>
        (g.name || g.title || "").toLowerCase().includes(q),
      );
    }
    if (sortOption === "name") {
      filtered = [...filtered].sort((a, b) =>
        (a.name || a.title || "").localeCompare(b.name || b.title || ""),
      );
    } else if (sortOption === "rating") {
      filtered = [...filtered].sort(
        (a, b) => (b.rating || 0) - (a.rating || 0),
      );
    } else {
      filtered = [...filtered].sort(
        (a, b) => (b.libraryInfo?.addedAt || 0) - (a.libraryInfo?.addedAt || 0),
      );
    }

    // Seçim bilgileri (ileride kullanılabilir)
    const allSelected =
      filtered.length > 0 &&
      filtered.every((f) => selectedIds.has(String(f.id)));
    const selectedCount = Array.from(selectedIds).filter((id) =>
      filtered.some((f) => String(f.id) === id),
    ).length;

    if (filtered.length === 0) {
      return <p className="text-gray-300">Sonuç bulunamadı.</p>;
    }

    if (viewOption === "list") {
      return (
        <div className="space-y-3">
          {filtered.map((g, i) => (
            <div
              key={g.id || i}
              className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <img
                src={
                  (g.cover && (g.cover.url || g.cover)) ||
                  "/api/placeholder/80/100?text=Arkade"
                }
                alt={g.name || g.title}
                className="w-12 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <div className="text-white font-medium">
                  {g.name || g.title}
                </div>
                <div className="text-xs text-gray-400">
                  {g.libraryInfo?.category || g.category}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {g.rating ? `⭐ ${Math.round(g.rating)}` : ""}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Grid için sayfalama uygula (max 4 satır)
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    return (
      <>
        <div className="flex flex-wrap gap-4">
          {pageItems.map((g, i) => renderGameCard(g, i))}
        </div>
        {totalPages > 1 && (
          <div
            className="mt-4 flex items-center justify-between"
            id="library-pagination"
            data-registry="2.1.B1.2.3"
          >
            <div
              className="text-xs text-gray-300"
              id="pagination-page-label"
              data-registry="2.1.B1.2.3.0"
            >
              Sayfa {safePage} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={`px-3 py-1 rounded-lg text-xs border ${safePage === 1 ? "bg-white/5 text-white/40 border-white/10 cursor-not-allowed" : "bg-white/5 text-white border-white/10 hover:bg-white/10"}`}
                id="pagination-prev-btn"
                data-registry="2.1.B1.2.3.1"
              >
                Önceki
              </button>
              {/* Sayfa numaraları (QoL: ellipsis ile) */}
              <div
                className="flex items-center gap-1"
                id="pagination-number-list"
                data-registry="2.1.B1.2.3.3"
              >
                {(() => {
                  const range = (() => {
                    const total = totalPages;
                    const current = safePage;
                    const sibling = 1;
                    const left = Math.max(current - sibling, 1);
                    const right = Math.min(current + sibling, total);
                    const items = [];
                    if (left > 2) {
                      items.push(1);
                      items.push("left-ellipsis");
                    } else {
                      for (let i = 1; i < left; i++) items.push(i);
                    }
                    for (let i = left; i <= right; i++) items.push(i);
                    if (right < total - 1) {
                      items.push("right-ellipsis");
                      items.push(total);
                    } else {
                      for (let i = right + 1; i <= total; i++) items.push(i);
                    }
                    return items;
                  })();
                  return range.map((item, idx) => {
                    if (typeof item !== "number") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-xs text-gray-400"
                          id={
                            item === "left-ellipsis"
                              ? "pagination-ellipsis-left"
                              : "pagination-ellipsis-right"
                          }
                          data-registry={
                            item === "left-ellipsis"
                              ? "2.1.B1.2.3.3.l"
                              : "2.1.B1.2.3.3.r"
                          }
                        >
                          …
                        </span>
                      );
                    }
                    const isActive = item === safePage;
                    return (
                      <button
                        key={`page-${item}`}
                        onClick={() => setCurrentPage(item)}
                        aria-label={`Sayfa ${item}`}
                        className={`pagination-page-number min-w-[32px] px-2 py-1 rounded-md text-xs border ${isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-white/5 text-white border-white/10 hover:bg-white/10"}`}
                        id={`pagination-page-btn-${item}`}
                        data-registry="2.1.B1.2.3.3"
                        data-page={item}
                      >
                        {item}
                      </button>
                    );
                  });
                })()}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
                className={`px-3 py-1 rounded-lg text-xs border ${safePage === totalPages ? "bg-white/5 text-white/40 border-white/10 cursor-not-allowed" : "bg-white/5 text-white border-white/10 hover:bg-white/10"}`}
                id="pagination-next-btn"
                data-registry="2.1.B1.2.3.2"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className="flex-1 p-8 pr-4 overflow-y-auto"
      id="library-content"
      data-registry="2.1.B1"
    >
      {/* Page Header + Tab Switcher */}
      <div className="mb-6" id="library-header" data-registry="2.1.B1.1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-bold text-white"
              id="library-title"
              data-registry="2.1.B1.1.1"
            >
              Oyun Kütüphanesi
            </h1>
            <span
              className="text-sm text-gray-400"
              id="game-count"
              data-registry="2.1.B1.1.2"
            >
              Toplam {games?.length || 0} oyun
            </span>
          </div>
          <div
            className="flex items-center gap-2"
            id="tab-controls"
            data-registry="2.1.B1.1.3"
          >
            <button
              onClick={() => setActiveTab("games")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${activeTab === "games" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-white/5 text-white border-white/10"}`}
              id="games-tab"
              data-registry="2.1.B1.1.3.1"
            >
              🎮 Oyunlar
            </button>
            <button
              onClick={() => setActiveTab("cycle")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${activeTab === "cycle" ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "bg-white/5 text-white border-white/10"}`}
              id="cycle-tab"
              data-registry="2.1.B1.1.3.2"
            >
              🌀 Döngü Planlayıcısı
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold hover:opacity-90 transition"
              id="add-game-btn"
              data-registry="2.1.B1.1.3.3"
            >
              + Oyun Ekle
            </button>
            <button
              onClick={() => setIsSteamImportOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-black font-semibold hover:opacity-90 transition"
              id="steam-import-btn"
              data-registry="2.1.B1.1.3.4"
            >
              Steam'den İçe Aktar
            </button>
          </div>
        </div>
        {lastAdded && (
          <div
            className="mt-2 text-sm text-emerald-400"
            id="last-added-info"
            data-registry="2.1.B1.1.4"
          >
            Kütüphaneye eklendi: {lastAdded}
          </div>
        )}
      </div>

      {/* Tabs */}
      {activeTab === "games" ? (
        <div id="games-tab-content" data-registry="2.1.B1.2">
          {/* Search + Filters */}
          <div
            className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-4"
            id="filters-panel"
            data-registry="2.1.B1.2.1"
          >
            <div className="flex items-center gap-3">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Oyun ara..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 text-sm"
                id="search-input"
                data-registry="2.1.B1.2.1.1"
              />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                id="sort-select"
                data-registry="2.1.B1.2.1.2"
              >
                <option value="recent" className="bg-gray-800">
                  İtem Sırala: Son eklenen
                </option>
                <option value="name" className="bg-gray-800">
                  İtem Sırala: Ada göre
                </option>
                <option value="rating" className="bg-gray-800">
                  İtem Sırala: Puan
                </option>
              </select>
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                id="filter-select"
                data-registry="2.1.B1.2.1.3"
              >
                <option value="all" className="bg-gray-800">
                  İtem Filtreleme: Hepsi
                </option>
                <option value="backlog" className="bg-gray-800">
                  Backlog
                </option>
                <option value="playing" className="bg-gray-800">
                  Oynanıyor
                </option>
                <option value="completed" className="bg-gray-800">
                  Bitti
                </option>
                <option value="completed_100" className="bg-gray-800">
                  %100 Bitti
                </option>
                <option value="paused" className="bg-gray-800">
                  Ara Verildi
                </option>
                <option value="dropped" className="bg-gray-800">
                  Bırakıldı
                </option>
              </select>
              <select
                value={viewOption}
                onChange={(e) => setViewOption(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                id="view-select"
                data-registry="2.1.B1.2.1.4"
              >
                <option value="grid" className="bg-gray-800">
                  İtem Görünüm: Grid
                </option>
                <option value="list" className="bg-gray-800">
                  Liste
                </option>
              </select>
            </div>

            {/* Toplu seçim kontrolleri */}
            <div
              className="flex items-center gap-6 ml-auto mt-3"
              id="bulk-controls"
              data-registry="2.1.B1.2.1.5"
            >
              {(() => {
                let filtered = games || [];
                if (filterOption !== "all") {
                  filtered = filtered.filter(
                    (g) =>
                      (g.libraryInfo?.category || g.category) === filterOption,
                  );
                }
                if (searchText.trim()) {
                  const q = searchText.toLowerCase();
                  filtered = filtered.filter((g) =>
                    (g.name || g.title || "").toLowerCase().includes(q),
                  );
                }
                const allSelected =
                  filtered.length > 0 &&
                  filtered.every((f) => selectedIds.has(String(f.id)));
                const selectedCount = Array.from(selectedIds).filter((id) =>
                  filtered.some((f) => String(f.id) === id),
                ).length;

                const handleSelectAllChange = (checked) => {
                  if (checked) {
                    const next = new Set(selectedIds);
                    filtered.forEach((f) => next.add(String(f.id)));
                    setSelectedIds(next);
                  } else {
                    const next = new Set(
                      Array.from(selectedIds).filter(
                        (id) => !filtered.some((f) => String(f.id) === id),
                      ),
                    );
                    setSelectedIds(next);
                  }
                };

                const triggerBulkDelete = () => {
                  const idsToDelete = Array.from(selectedIds).filter((id) =>
                    filtered.some((f) => String(f.id) === id),
                  );
                  if (idsToDelete.length > 0) {
                    setDeleteIds(idsToDelete);
                    setShowDeleteConfirm(true);
                  }
                };

                const clearSelection = () => {
                  const next = new Set(
                    Array.from(selectedIds).filter(
                      (id) => !filtered.some((f) => String(f.id) === id),
                    ),
                  );
                  setSelectedIds(next);
                };

                return (
                  <>
                    <label className="inline-flex items-center gap-2 text-xs text-white/80">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) =>
                          handleSelectAllChange(e.target.checked)
                        }
                        className="appearance-none w-4 h-4 rounded-sm border border-white/40 bg-black/30 checked:bg-emerald-500 checked:border-emerald-400"
                      />
                      <span>Tümünü seç</span>
                      {selectedCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/80">
                          {selectedCount} seçili
                        </span>
                      )}
                    </label>
                    <button
                      onClick={triggerBulkDelete}
                      disabled={selectedCount === 0}
                      className={`px-3 py-2 rounded-lg text-xs border ${selectedCount === 0 ? "bg-white/5 text-white/40 border-white/10 cursor-not-allowed" : "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"}`}
                    >
                      Seçilenleri sil
                    </button>
                    {selectedCount > 0 && (
                      <button
                        onClick={clearSelection}
                        className="px-3 py-2 rounded-lg text-xs bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                      >
                        Seçimi temizle
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <div
            ref={listRef}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-h-[300px]"
            id="games-list"
            data-registry="2.1.B1.2.2"
          >
            {loading ? (
              <p className="text-gray-300">Yükleniyor...</p>
            ) : (
              renderLibraryListContent()
            )}
          </div>
        </div>
      ) : (
        <LibraryCyclePlanner
          games={games}
          onAdd={() => setIsAddOpen(true)}
          renderCard={renderGameCard}
        />
      )}

      <AddGameModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditTarget(null);
        }}
        onGameAdded={handleGameAdded}
        editMode={!!editTarget}
        editGame={editTarget}
      />

      <SteamImportModal
        isOpen={isSteamImportOpen}
        onClose={() => setIsSteamImportOpen(false)}
        onImported={(count) => {
          setIsSteamImportOpen(false);
          setLastAdded(`Steam import: ${count} oyun eklendi`);
        }}
      />

      <CampaignSelectionModal
        isOpen={showCampaignModal}
        onClose={() => {
          setShowCampaignModal(false);
          setSelectedGameForCampaign(null);
        }}
        game={selectedGameForCampaign}
        onCampaignSelect={async (campaign) => {
          const sessionData = {
            ...selectedGameForCampaign,
            selectedCampaign: campaign,
            campaignId: campaign.id,
          };
          const result = await startSession(sessionData);
          if (result?.success) {
            setShowCampaignModal(false);
            setSelectedGameForCampaign(null);
            navigate("/arkade/session");
          } else {
            console.error("Oturum başlatılamadı:", result?.error);
          }
        }}
      />

      {/* Silme onayı modalı */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="text-white font-semibold">Silme onayı</div>
              <div className="text-gray-400 text-sm mt-1">
                {deleteIds.length > 1
                  ? `${deleteIds.length} oyun için işlem seçin:`
                  : "Bu oyun için işlem seçin:"}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => performDelete("library")}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 rounded-lg text-sm"
              >
                Oyunu sil
              </button>
              <button
                onClick={() => performDelete("library_and_data")}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-sm"
              >
                Oyunu ve verileri sil
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteIds([]);
                }}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg text-sm"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LibraryRightSidebar({ showCampaignCards, setShowCampaignCards }) {
  return (
    <div className="w-80 p-6 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-xl border-l border-[#00ff88]/20 min-h-[1600px]">
      {/* Tek Çok Yakında Kartı */}
      <div className="bg-gradient-to-br from-[#00ff88]/10 via-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl relative overflow-hidden h-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #00ff88 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
              backgroundSize: "100px 100px",
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#00ff88] via-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl">🚀</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-[#00ff88] via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Çok Yakında
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            Kütüphane yönetimi, istatistikler ve daha fazlası için harika
            yenilikler geliyor!
          </p>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <span className="text-[#00ff88]">✨</span>
              <span className="text-sm">Gelişmiş Kütüphane Özeti</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <span className="text-purple-400">🎯</span>
              <span className="text-sm">Campaign Yönetimi</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <span className="text-blue-400">📊</span>
              <span className="text-sm">Detaylı İstatistikler</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center gap-2 text-[#00ff88]">
              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Aktif Geliştirme Aşamasında
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Güncellemeler için takipte kalın!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryCyclePlanner({ games, onAdd, renderCard }) {
  const { user, isAdmin } = useAuth();

  // Admin kontrolü - admin olmayan kullanıcılar için uyarı göster
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Henüz Çalışma Altında
          </h3>
          <p className="text-gray-400 mb-4">
            Cycle Planner özelliği şu anda geliştirme aşamasındadır. Bu özellik
            yakında kullanıma sunulacaktır.
          </p>
          <div className="text-sm text-gray-500">
            Bu özelliğe erişim için admin yetkisi gereklidir.
          </div>
        </div>
      </div>
    );
  }

  const total = games?.length || 0;
  const completed =
    games?.filter(
      (g) => (g.libraryInfo?.category || g.category) === "completed",
    ).length || 0;
  const initialCycles = [
    { name: "Cycle 1", status: "Planlandı", items: [] },
    { name: "Cycle 2", status: "Planlandı", items: [] },
    { name: "Cycle 3", status: "Aktif", items: [] },
  ];

  const [cycles, setCycles] = useState(initialCycles);
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSelection, setPickerSelection] = useState(new Set());

  const getGameCategory = (g) =>
    g.libraryInfo?.category || g.category || "wishlist";

  const addRandomToSelected = (count = 3) => {
    if (!Array.isArray(games) || games.length === 0) return;
    setCycles((prev) => {
      const target = prev[selectedIdx];
      const existing = new Set(target.items);
      const candidates = games.map((_, i) => i).filter((i) => !existing.has(i));
      const picked = [];
      while (picked.length < count && candidates.length > 0) {
        const r = Math.floor(Math.random() * candidates.length);
        picked.push(candidates[r]);
        candidates.splice(r, 1);
      }
      const next = [...prev];
      next[selectedIdx] = { ...target, items: [...target.items, ...picked] };
      return next;
    });
  };

  const addFromBacklogToSelected = (count = 3) => {
    if (!Array.isArray(games) || games.length === 0) return;
    setCycles((prev) => {
      const target = prev[selectedIdx];
      const existing = new Set(target.items);
      const backlogIdxs = games
        .map((g, i) => ({ g, i }))
        .filter(
          ({ g, i }) => getGameCategory(g) === "wishlist" && !existing.has(i),
        )
        .map(({ i }) => i);
      const picked = backlogIdxs.slice(0, count);
      const next = [...prev];
      next[selectedIdx] = { ...target, items: [...target.items, ...picked] };
      return next;
    });
  };

  const renameSelectedCycle = () => {
    const currentName = cycles[selectedIdx]?.name || "Cycle";
    const nextName = window.prompt("Yeni cycle adı:", currentName);
    if (!nextName) return;
    setCycles((prev) => {
      const next = [...prev];
      next[selectedIdx] = { ...next[selectedIdx], name: nextName };
      return next;
    });
  };

  const addNewCycle = () => {
    setCycles((prev) => [
      ...prev,
      { name: `Cycle ${prev.length + 1}`, status: "Planlandı", items: [] },
    ]);
  };
  return (
    <div className="space-y-6">
      {/* Cycle cards */}
      <div
        className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory py-2 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        onWheel={(e) => {
          // Sadece mouse kartların üzerindeyken horizontal scroll yap
          const target = e.target.closest(".cycle-card");
          if (target) {
            e.preventDefault();
            const container = e.currentTarget;
            const scrollAmount = e.deltaY * 2; // Daha hızlı scroll
            container.scrollLeft += scrollAmount;
          }
          // Mouse kartların dışındaysa normal sayfa scroll'una izin ver
        }}
      >
        {cycles.map((c, idx) => (
          <React.Fragment key={c.name}>
            <div
              onClick={() => setSelectedIdx(idx)}
              className={`cycle-card min-w-[240px] cursor-pointer snap-start bg-white/5 rounded-xl p-4 border ${idx === selectedIdx ? "border-emerald-500/40 ring-1 ring-emerald-500/30" : "border-white/10"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">{c.name}</div>
                <span
                  className={`text-xs ${c.status === "Aktif" ? "text-emerald-400" : "text-yellow-300"}`}
                >
                  {c.status}
                </span>
              </div>
              <div className="text-sm text-gray-300">
                {c.items.length} / {c.items.length} oyun
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {(() => {
                    const compInCycle = c.items.filter(
                      (i) => getGameCategory(games[i]) === "completed",
                    ).length;
                    return total
                      ? Math.round(
                          (compInCycle / Math.max(1, c.items.length)) * 100,
                        )
                      : 0;
                  })()}
                  % tamamlandı
                </span>
                <span>
                  {Math.max(
                    0,
                    c.items.length -
                      c.items.filter(
                        (i) => getGameCategory(games[i]) === "completed",
                      ).length,
                  )}{" "}
                  kaldı
                </span>
              </div>
            </div>
            {idx < cycles.length - 1 && (
              <div className="self-center flex items-center shrink-0">
                <div className="h-px w-10 bg-white/20" />
                <div className="mx-2 text-white/60">⛓️</div>
                <div className="h-px w-10 bg-white/20" />
              </div>
            )}
          </React.Fragment>
        ))}
        {/* New cycle */}
        <div
          onClick={addNewCycle}
          className="cycle-card min-w-[240px] snap-start bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-center cursor-pointer hover:border-emerald-500/40"
        >
          <div className="text-center">
            <div className="text-2xl">➕</div>
            <div className="text-white text-sm mt-2">Yeni Cycle</div>
            <div className="text-gray-500 text-xs">Cycle oluştur</div>
          </div>
        </div>
      </div>

      {/* Overall progress kaldırıldı */}

      {/* Selected cycle details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="text-lg font-bold text-white mb-2">
            {cycles[selectedIdx]?.name || "Cycle"}
          </div>
          <div className="text-emerald-400 font-bold text-2xl">
            {cycles[selectedIdx]?.items.length || 0} /{" "}
            {cycles[selectedIdx]?.items.length || 0}
          </div>
          <div className="text-gray-400 text-sm mt-1">oyun</div>
          <button
            onClick={renameSelectedCycle}
            className="mt-4 px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
          >
            İsim Değiştir
          </button>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oyun ara..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 text-sm"
              />
              <button
                onClick={() => setIsPickerOpen(true)}
                className="px-3 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm border border-emerald-500/40"
              >
                Kütüphaneden Ekle
              </button>
              <button
                onClick={() => addRandomToSelected(3)}
                className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
              >
                Rastgele
              </button>
              <button
                onClick={() => addFromBacklogToSelected(3)}
                className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
              >
                Backlog'dan
              </button>
            </div>

            {/* Selected cycle list */}
            <div className="flex flex-wrap gap-4">
              {(() => {
                const indices = cycles[selectedIdx]?.items || [];
                const items = indices
                  .map((i) => ({ g: games[i], i }))
                  .filter(({ g }) => !!g)
                  .filter(({ g }) =>
                    (g.name || g.title || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  );
                if (items.length === 0) {
                  return (
                    <div className="text-gray-400 text-sm">
                      Bu cycle için henüz oyun eklenmedi.
                    </div>
                  );
                }
                return items.map(({ g, i }) =>
                  renderCard ? (
                    renderCard(g, i)
                  ) : (
                    <div
                      key={g.id || i}
                      className="group relative w-[160px] h-[240px] rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      <img
                        src={
                          (g.cover && (g.cover.url || g.cover)) ||
                          "/api/placeholder/160/240?text=Arkade"
                        }
                        alt={g.name || g.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-white text-sm font-semibold truncate">
                          {g.name || g.title}
                        </div>
                        <div className="text-[10px] text-gray-300">
                          {g.libraryInfo?.category || g.category || "wishlist"}
                        </div>
                      </div>
                    </div>
                  ),
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {isPickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="w-full max-w-3xl bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <input
                autoFocus
                placeholder="Kütüphanede ara..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 text-sm"
                onChange={(e) => {
                  // Not stored separately; reuse searchQuery for simplicity
                  setSearchQuery(e.target.value);
                }}
                value={searchQuery}
              />
              <button
                onClick={() => setIsPickerOpen(false)}
                className="px-3 py-2 text-sm rounded-lg bg-white/10 text-white"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  if (pickerSelection.size === 0) return setIsPickerOpen(false);
                  setCycles((prev) => {
                    const next = [...prev];
                    const target = next[selectedIdx];
                    const existing = new Set(target.items);
                    const added = Array.from(pickerSelection).filter(
                      (i) => !existing.has(i),
                    );
                    next[selectedIdx] = {
                      ...target,
                      items: [...target.items, ...added],
                    };
                    return next;
                  });
                  setPickerSelection(new Set());
                  setIsPickerOpen(false);
                }}
                className="px-3 py-2 text-sm rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              >
                Ekle
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {(games || [])
                .map((g, i) => ({ g, i }))
                .filter(({ g }) =>
                  (g.name || g.title || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map(({ g, i }) => {
                  const isSelected = pickerSelection.has(i);
                  const coverUrl = (() => {
                    const c = g.cover;
                    if (c?.image_id)
                      return `https://images.igdb.com/igdb/image/upload/t_1080p/${c.image_id}.jpg`;
                    if (typeof c?.url === "string")
                      return c.url
                        .replace("t_cover_small", "t_1080p")
                        .replace("t_thumb", "t_1080p");
                    return "/api/placeholder/160/240?text=Arkade";
                  })();
                  return (
                    <button
                      key={g.id || i}
                      onClick={() => {
                        setPickerSelection((prev) => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          return next;
                        });
                      }}
                      className={`text-left group relative rounded-lg overflow-hidden border ${isSelected ? "border-emerald-500/40 ring-1 ring-emerald-500/30" : "border-white/10"} bg-white/5`}
                    >
                      <div className="w-full aspect-[2/3] overflow-hidden">
                        <img
                          src={coverUrl}
                          alt={g.name || g.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="text-white text-xs font-medium line-clamp-1">
                          {g.name || g.title}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {g.libraryInfo?.category || g.category || "wishlist"}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
