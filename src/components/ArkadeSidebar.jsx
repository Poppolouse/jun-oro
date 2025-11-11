import { useNavigate, useLocation } from "react-router-dom";
import { useActiveSession } from "../contexts/ActiveSessionContext";
import { useState, useEffect } from "react";
import userLibrary from "../services/userLibrary";

function ArkadeSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeSession,
    sessionTimer,
    isRunning,
    formatTime,
    stopSession,
    toggleSession,
    getUserStats,
  } = useActiveSession();

  // Gerçek kütüphane verilerini al
  const [games, setGames] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({ playTime: 0, newGames: 0 });

  useEffect(() => {
    const loadGames = async () => {
      try {
        const libraryGames =
          (await userLibrary.getLibraryGamesWithDetails()) || [];
        setGames(libraryGames);

        // Bu hafta istatistikleri hesapla
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const newGamesThisWeek = libraryGames.filter(
          (g) => g.libraryInfo?.addedAt && g.libraryInfo.addedAt > oneWeekAgo,
        ).length;

        // Haftalık oyun süresi (getUserStats'tan al)
        const userStats = getUserStats();
        const weeklyPlayTime = userStats?.weeklyPlayTime || 0;

        setWeeklyStats({
          playTime: weeklyPlayTime,
          newGames: newGamesThisWeek,
        });
      } catch (error) {
        console.error("Kütüphane verileri alınırken hata:", error);
        setGames([]);
      }
    };
    loadGames();
  }, [getUserStats]);

  // Aktif tab'ı location'a göre belirle
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/arkade") return "dashboard";
    if (path === "/arkade/library") return "library";
    if (path === "/backlog") return "backlog";
    if (path === "/stats") return "stats";
    if (path === "/wishlist") return "wishlist";
    if (path === "/gallery") return "gallery";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  // Oyun kategorilerini hesapla
  const getGameCategory = (game) =>
    game.libraryInfo?.category || game.category || "wishlist";
  const getGameStatus = (game) => {
    const s = (game.status || game.libraryInfo?.status || "").toLowerCase();
    return s || "backlog"; // status yoksa backlog kabul
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: "🏠",
      active: activeTab === "dashboard",
      count: null,
      route: "/arkade",
    },
    {
      name: "Kütüphane",
      icon: "📚",
      active: activeTab === "library",
      count: games.length,
      route: "/arkade/library",
    },
    {
      name: "Backlog",
      icon: "📋",
      active: activeTab === "backlog",
      count: games.filter(
        (g) =>
          getGameCategory(g) === "wishlist" && getGameStatus(g) === "backlog",
      ).length,
      route: "/backlog",
    },
    {
      name: "İstatistikler",
      icon: "📊",
      active: activeTab === "stats",
      count: null,
      route: "/stats",
    },
    {
      name: "İstek listesi",
      icon: "💝",
      active: activeTab === "wishlist",
      count: games.filter(
        (g) =>
          getGameCategory(g) === "wishlist" && getGameStatus(g) !== "backlog",
      ).length,
      route: "/wishlist",
    },
    {
      name: "Galeri",
      icon: "📷",
      active: activeTab === "gallery",
      count: null,
      route: "/gallery",
    },
  ];

  return (
    <div
      data-registry="L"
      id="arkade-sidebar"
      className="w-72 bg-gradient-to-b from-[#1a1a2e]/60 to-[#0f0f23]/40 backdrop-blur-xl border-r border-[#00ff88]/20 overflow-hidden min-h-[1600px]"
    >
      <div
        data-registry="L1"
        id="sidebar-content"
        className="p-6 h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {/* User Info - Removed gradient div */}

        {/* Aktif Oturum */}
        <div data-registry="L1.1" id="active-session-section" className="mb-8">
          <div
            data-registry="L1.1.1"
            id="active-session-title"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Aktif Oturum
          </div>

          {activeSession ? (
            <div
              data-registry="L1.1.2"
              id="active-session-card"
              className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
              <div className="relative z-10">
                <div
                  data-registry="L1.1.2.1"
                  id="session-game-info"
                  className="flex items-center gap-3 mb-3"
                >
                  <div
                    data-registry="L1.1.2.1.1"
                    id="session-game-image"
                    className="w-12 h-16 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0"
                  >
                    {activeSession.image ? (
                      <img
                        src={activeSession.image}
                        alt={activeSession.name || activeSession.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">🎮</span>
                    )}
                  </div>
                  <div
                    data-registry="L1.1.2.1.2"
                    id="session-game-details"
                    className="flex-1 min-w-0"
                  >
                    <h4
                      data-registry="L1.1.2.1.2.1"
                      id="session-game-title"
                      className="text-white font-bold text-sm truncate"
                    >
                      {activeSession.name ||
                        activeSession.title ||
                        "Bilinmeyen Oyun"}
                    </h4>
                    <p
                      data-registry="L1.1.2.1.2.2"
                      id="session-game-genre"
                      className="text-gray-400 text-xs truncate"
                    >
                      {activeSession.genre ||
                        activeSession.genres?.[0] ||
                        "Oyun"}
                    </p>
                    <div
                      data-registry="L1.1.2.1.2.3"
                      id="session-status"
                      className="flex items-center gap-2 mt-1"
                    >
                      <div
                        data-registry="L1.1.2.1.2.3.1"
                        id="session-status-indicator"
                        className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}
                      ></div>
                      <span
                        data-registry="L1.1.2.1.2.3.2"
                        id="session-status-text"
                        className={`text-xs font-medium ${isRunning ? "text-green-400" : "text-yellow-400"}`}
                      >
                        {isRunning ? "Oynuyor" : "Duraklatıldı"}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  data-registry="L1.1.2.2"
                  id="session-stats"
                  className="space-y-2"
                >
                  <div
                    data-registry="L1.1.2.2.1"
                    id="session-time-current"
                    className="flex justify-between text-xs"
                  >
                    <span className="text-gray-400">Bu oturum</span>
                    <span className="text-white font-medium">
                      {formatTime(sessionTimer)}
                    </span>
                  </div>
                  <div
                    data-registry="L1.1.2.2.2"
                    id="session-time-total"
                    className="flex justify-between text-xs"
                  >
                    <span className="text-gray-400">Toplam süre</span>
                    <span className="text-white font-medium">
                      {formatTime(getUserStats()?.totalPlayTime || 0)}
                    </span>
                  </div>
                  {activeSession.progress && (
                    <>
                      <div
                        data-registry="L1.1.2.2.3"
                        id="session-progress-bar"
                        className="w-full bg-gray-700 rounded-full h-1.5 mt-2"
                      >
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${activeSession.progress}%` }}
                        ></div>
                      </div>
                      <div
                        data-registry="L1.1.2.2.4"
                        id="session-progress-text"
                        className="flex justify-between text-xs"
                      >
                        <span className="text-gray-400">İlerleme</span>
                        <span className="text-purple-400 font-medium">
                          {activeSession.progress}%
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div
                  data-registry="L1.1.2.3"
                  id="session-controls"
                  className="flex gap-2 mt-3"
                >
                  <button
                    data-registry="L1.1.2.3.1"
                    id="session-toggle-btn"
                    onClick={toggleSession}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                      isRunning
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    }`}
                  >
                    {isRunning ? "Duraklat" : "Devam Et"}
                  </button>
                  <button
                    data-registry="L1.1.2.3.2"
                    id="session-stop-btn"
                    onClick={() => stopSession()}
                    className="flex-1 bg-red-500/20 text-red-400 text-xs font-medium py-2 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    Bitir
                  </button>
                </div>

                <button
                  data-registry="L1.1.2.4"
                  id="session-view-btn"
                  onClick={() => navigate("/arkade/session")}
                  className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                >
                  Oturumu Görüntüle
                </button>
              </div>
            </div>
          ) : (
            <div
              data-registry="L1.1.3"
              id="no-active-session"
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center"
            >
              <div
                data-registry="L1.1.3.1"
                id="no-session-icon"
                className="text-gray-500 text-sm mb-2"
              >
                🎮
              </div>
              <p
                data-registry="L1.1.3.2"
                id="no-session-text"
                className="text-gray-400 text-xs"
              >
                Aktif oyun oturumu yok
              </p>
              <button
                data-registry="L1.1.3.3"
                id="select-game-btn"
                onClick={() => navigate("/arkade/library")}
                className="mt-3 text-purple-400 text-xs hover:text-purple-300 transition-colors"
              >
                Kütüphaneden oyun seç
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          data-registry="L1.2"
          id="navigation-section"
          className="space-y-2 flex-shrink-0"
        >
          {navigationItems.map((item, index) => (
            <button
              key={item.name}
              data-registry={`L1.2.${index + 1}`}
              id={`nav-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                item.active
                  ? "bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div
                data-registry={`L1.2.${index + 1}.1`}
                id={`nav-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-content`}
                className="flex items-center gap-3"
              >
                <span
                  data-registry={`L1.2.${index + 1}.1.1`}
                  id={`nav-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-icon`}
                  className="text-lg"
                >
                  {item.icon}
                </span>
                <span
                  data-registry={`L1.2.${index + 1}.1.2`}
                  id={`nav-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-text`}
                  className="font-medium"
                >
                  {item.name}
                </span>
              </div>
              {item.count !== null && (
                <span
                  data-registry={`L1.2.${index + 1}.2`}
                  id={`nav-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-count`}
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    item.active
                      ? "bg-[#00ff88]/20 text-[#00ff88]"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Kütüphane Özeti */}
        <div
          data-registry="L1.3"
          id="library-summary-section"
          className="mt-6 flex-shrink-0"
        >
          <div
            data-registry="L1.3.1"
            id="library-summary-title"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            📊 Kütüphane Özeti
          </div>
          <div
            data-registry="L1.3.2"
            id="library-summary-card"
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <div
              data-registry="L1.3.2.1"
              id="library-summary-stats"
              className="space-y-2"
            >
              <div
                data-registry="L1.3.2.1.1"
                id="library-total-games"
                className="flex justify-between"
              >
                <span className="text-gray-400 text-xs">Toplam Oyun</span>
                <span className="text-white font-semibold text-xs">
                  {games.length}
                </span>
              </div>
              <div
                data-registry="L1.3.2.1.2"
                id="library-playing-games"
                className="flex justify-between"
              >
                <span className="text-gray-400 text-xs">Oynuyor</span>
                <span className="text-[#00ff88] font-semibold text-xs">
                  {games.filter((g) => getGameCategory(g) === "playing").length}
                </span>
              </div>
              <div
                data-registry="L1.3.2.1.3"
                id="library-completed-games"
                className="flex justify-between"
              >
                <span className="text-gray-400 text-xs">Tamamlandı</span>
                <span className="text-green-400 font-semibold text-xs">
                  {
                    games.filter((g) => getGameCategory(g) === "completed")
                      .length
                  }
                </span>
              </div>
              <div
                data-registry="L1.3.2.1.4"
                id="library-backlog-games"
                className="flex justify-between"
              >
                <span className="text-gray-400 text-xs">Backlog</span>
                <span className="text-orange-400 font-semibold text-xs">
                  {
                    games.filter(
                      (g) =>
                        getGameCategory(g) === "wishlist" &&
                        getGameStatus(g) === "backlog",
                    ).length
                  }
                </span>
              </div>
              <div
                data-registry="L1.3.2.1.5"
                id="library-dropped-games"
                className="flex justify-between"
              >
                <span className="text-gray-400 text-xs">Bırakıldı</span>
                <span className="text-red-400 font-semibold text-xs">
                  {games.filter((g) => getGameCategory(g) === "dropped").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div
          data-registry="L1.4"
          id="weekly-stats-section"
          className="mt-6 flex-shrink-0"
        >
          <div
            data-registry="L1.4.1"
            id="weekly-stats-title"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Bu Hafta
          </div>
          <div
            data-registry="L1.4.2"
            id="weekly-stats-grid"
            className="grid grid-cols-2 gap-3"
          >
            <div
              data-registry="L1.4.2.1"
              id="weekly-playtime-card"
              className="bg-white/5 rounded-lg p-3 text-center"
            >
              <div
                data-registry="L1.4.2.1.1"
                id="weekly-playtime-value"
                className="text-[#00ff88] font-bold text-lg"
              >
                {weeklyStats.playTime > 0
                  ? `${Math.round(weeklyStats.playTime / 60)}h`
                  : "0h"}
              </div>
              <div
                data-registry="L1.4.2.1.2"
                id="weekly-playtime-label"
                className="text-gray-400 text-xs"
              >
                Oyun Süresi
              </div>
            </div>
            <div
              data-registry="L1.4.2.2"
              id="weekly-new-games-card"
              className="bg-white/5 rounded-lg p-3 text-center"
            >
              <div
                data-registry="L1.4.2.2.1"
                id="weekly-new-games-value"
                className="text-blue-400 font-bold text-lg"
              >
                {weeklyStats.newGames}
              </div>
              <div
                data-registry="L1.4.2.2.2"
                id="weekly-new-games-label"
                className="text-gray-400 text-xs"
              >
                Yeni Oyun
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArkadeSidebar;
