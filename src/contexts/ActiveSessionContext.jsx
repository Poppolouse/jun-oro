import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import steamApi from "../services/steamApi";
import userLibrary from "../services/userLibrary";
import sessionsService from "../services/sessions";
import { useAuth } from "./AuthContext";

const ActiveSessionContext = createContext(null);

/**
 * Saniyeleri okunabilir bir zaman formatına çeviren yardımcı fonksiyon
 * @param {number} seconds - Dönüştürülecek saniye sayısı
 * @returns {string} Formatlanmış zaman metni
 */
const formatTime = (seconds) => {
  const total = Math.floor(seconds || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours} saat ${minutes} dk ${secs} sn`;
  }
  return `${minutes} dk ${secs} sn`;
};

/**
 * ActiveSessionContext'e erişim için özel bir hook.
 * Bu hook, aktif oyun oturumu verilerini ve oturumları yönetmek için fonksiyonları sağlar.
 *
 * @returns {object} Context değeri. İçeriği:
 * - `activeSession`: Aktif oturum nesnesi veya null.
 * - `sessionTimer`: Saniye cinsinden oturum zamanlayıcısı.
 * - `isRunning`: Oturumun çalışıp çalışmadığını belirten boolean.
 * - `startSession`: Yeni bir oyun oturumu başlatır.
 * - `stopSession`: Aktif oyun oturumunu sonlandırır.
 * - `toggleSession`: Oturumu duraklatır veya devam ettirir.
 * - `formatTime`: Saniyeleri okunabilir bir zaman formatına çevirir.
 * - `getSessionHistory`: Kullanıcının tüm oturum geçmişini döndürür.
 * - `getUserStats`: Kullanıcının genel istatistiklerini döndürür.
 * - `getGameSessionHistory`: Belirli bir oyunun oturum geçmişini döndürür.
 * - `getDailyStats`: Belirtilen gün için günlük istatistikleri döndürür.
 * - `getWeeklyStats`: Belirtilen hafta için haftalık istatistikleri döndürür.
 * - `updateSessionNotes`: Bir oturumun notlarını günceller.
 * - `updateSessionRating`: Bir oturumun derecelendirmesini günceller.
 * @throws {Error} ActiveSessionProvider içinde kullanılmazsa hata fırlatır.
 */
export const useActiveSession = () => {
  const context = useContext(ActiveSessionContext);
  if (!context) {
    throw new Error(
      "useActiveSession must be used within an ActiveSessionProvider",
    );
  }
  return context;
};

/**
 * Uygulama genelinde aktif oyun oturumu durumunu ve ilgili fonksiyonları sağlayan Provider bileşeni.
 * @param {object} props - React bileşen props'ları.
 * @param {React.ReactNode} props.children - Provider tarafından sarmalanacak alt bileşenler.
 */
export const ActiveSessionProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);


  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTimer((timer) => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeSession]);

  // Steam'den oyun açıklaması çek
  const fetchGameDescription = useCallback(async (gameName) => {
    try {
      console.log("🔍 Steam'den açıklama aranıyor:", gameName);
      const searchResults = await steamApi.searchGame(gameName);

      if (searchResults.length > 0) {
        const steamGame = searchResults[0];
        const gameDetails = await steamApi.getGameDetails(steamGame.id);

        if (gameDetails.source === "steam_fallback") {
          console.log("⚠️ Steam API erişilemez, açıklama alınamadı");
          return `${gameName} oyunu hakkında Steam API erişilemediği için detaylı açıklama alınamadı.`;
        }

        return gameDetails.description || null;
      }

      return null;
    } catch (error) {
      console.error("❌ Steam açıklama çekme hatası:", error);
      return `${gameName} oyunu hakkında açıklama alınamadı (Steam API hatası).`;
    }
  }, []);

  // Oyun oynama süresini güncelle
  const updateGamePlaytime = useCallback(async (gameId, additionalTime) => {
    if (!user || !gameId || additionalTime <= 0) {
      console.log("⚠️ updateGamePlaytime: Geçersiz parametreler", {
        user: !!user,
        gameId,
        additionalTime,
      });
      return;
    }

    try {
      const additionalMinutes = Math.floor(additionalTime / 60);
      if (additionalMinutes <= 0) {
        console.log("⏱️ Playtime güncellenmedi (1 dakikadan az).");
        return;
      }

      console.log("⏱️ Playtime güncelleme başlıyor:", {
        gameId,
        eklenenSaniye: additionalTime,
        eklenenDakika: additionalMinutes,
      });

      const game = await userLibrary.getGameById(gameId);

      if (game) {
        const currentPlaytime = game.playtime || 0;
        const newPlaytime = currentPlaytime + additionalMinutes;

        console.log("⏱️ Playtime güncelleme detayları:", {
          oyun: game.name || game.title,
          eskiSure: currentPlaytime,
          eklenenDakika: additionalMinutes,
          yeniSure: newPlaytime,
        });

        const updateSuccess = await userLibrary.updateGameDetails(gameId, {
          playtime: newPlaytime,
          lastPlayed: new Date().toISOString(),
        });

        if (updateSuccess) {
          console.log(
            `✅ ${game.name || game.title} oyun süresi güncellendi: ${currentPlaytime}dk → ${newPlaytime}dk (+${additionalMinutes}dk)`,
          );
        } else {
          console.error("❌ Oyun süresi güncellenemedi (API hatası)");
        }
      } else {
        console.error("❌ Oyun kütüphanede bulunamadı:", gameId);
      }
    } catch (error) {
      console.error("❌ Oyun süresi güncellenirken hata:", error);
    }
  }, [user]);

  // Kullanıcı istatistiklerini güncelle
  const updateUserStats = useCallback((userId, sessionData) => {
    if (!userId) return;
    try {
      const userStats = JSON.parse(
        localStorage.getItem(`userStats_${userId}`) || "{}",
      );

      userStats.totalPlayTime =
        (userStats.totalPlayTime || 0) + sessionData.totalPlayTime;
      userStats.sessionsCompleted =
        (userStats.sessionsCompleted || 0) + sessionData.sessionsCompleted;
      userStats.lastPlayedGame = sessionData.lastPlayedGame;
      userStats.lastPlayedAt = sessionData.lastPlayedAt;
      userStats.totalSessions = (userStats.totalSessions || 0) + 1;

      const today = new Date().toDateString();
      if (!userStats.dailyStats) userStats.dailyStats = {};
      if (!userStats.dailyStats[today]) {
        userStats.dailyStats[today] = { playTime: 0, sessions: 0 };
      }
      userStats.dailyStats[today].playTime += sessionData.totalPlayTime;
      userStats.dailyStats[today].sessions += 1;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toDateString();
      if (!userStats.weeklyStats) userStats.weeklyStats = {};
      if (!userStats.weeklyStats[weekKey]) {
        userStats.weeklyStats[weekKey] = { playTime: 0, sessions: 0 };
      }
      userStats.weeklyStats[weekKey].playTime += sessionData.totalPlayTime;
      userStats.weeklyStats[weekKey].sessions += 1;

      localStorage.setItem(`userStats_${userId}`, JSON.stringify(userStats));
      console.log("📊 Kullanıcı istatistikleri güncellendi");
    } catch (error) {
      console.error("❌ Kullanıcı istatistikleri güncellenirken hata:", error);
    }
  }, []);

  // Oyun oturumu başlat
  const startSession = useCallback(async (game) => {
    if (!user) {
      console.error("❌ Kullanıcı girişi yapılmamış");
      return { success: false, error: "Kullanıcı girişi yapılmamış" };
    }

    if (activeSession) {
      console.warn("⚠️ Zaten aktif bir oturum var");
      return { success: false, error: "Zaten aktif bir oturum var" };
    }

    if (
      game.campaigns &&
      game.campaigns.length > 0 &&
      !game.selectedCampaign &&
      !game.campaignId
    ) {
      console.warn("⚠️ Bu oyun için campaign seçilmesi gerekiyor");
      return {
        success: false,
        error: "Bu oyun için bir campaign seçmelisiniz",
        requiresCampaign: true,
        availableCampaigns: game.campaigns,
      };
    }

    try {
      const sessionResponse = await sessionsService.startSession(user.id, {
        gameId: game.id || game.appid,
        gameName: game.name || game.title,
        platform: game.platform || "Steam",
        campaignId: game.campaignId || null,
        startTime: new Date().toISOString(),
      });

      const sessionData = {
        ...game,
        startTime: new Date(sessionResponse.data.startTime),
        sessionId: sessionResponse.data.id,
        userId: user.id,
        username: user.username,
        gameId: game.id || game.appid,
        gameName: game.name || game.title,
        platform: game.platform || "Steam",
        sessionType: "manual",
        pausedTime: 0,
        pauseHistory: [],
        achievements: [],
        notes: "",
        mood: "",
        difficulty: "",
        progress: 0,
        backendSessionId: sessionResponse.data.id,
      };

      setActiveSession(sessionData);
      setSessionTimer(0);
      setIsRunning(true);

      localStorage.setItem(
        `activeSession_${user.id}`,
        JSON.stringify(sessionData),
      );

      console.log(
        "🎮 Oyun oturumu başlatıldı:",
        game.name || game.title,
        "Kullanıcı:",
        user.username,
      );

      // Arka planda açıklamayı çek
      if (game.name || game.title) {
        fetchGameDescription(game.name || game.title).then((description) => {
          if (description) {
            setActiveSession((current) => {
              if (current && current.sessionId === sessionData.sessionId) {
                const updated = { ...current, description };
                localStorage.setItem(
                  `activeSession_${user.id}`,
                  JSON.stringify(updated),
                );
                console.log("✅ Steam açıklaması eklendi");
                return updated;
              }
              return current;
            });
          }
        });
      }

      return { success: true, session: sessionData };
    } catch (error) {
      console.error("❌ Oturum başlatılamadı (API hatası):", error);
      return { success: false, error: "API'ye ulaşılamadığı için oturum başlatılamadı." };
    }
  }, [user, activeSession, fetchGameDescription]);

  // Oyun oturumu durdur
  const stopSession = useCallback(async (
    sessionNotes = "",
    sessionMood = "",
    sessionProgress = 0,
  ) => {
    if (!activeSession || !user) {
      console.log("⚠️ stopSession: Aktif oturum veya kullanıcı bulunamadı.");
      return;
    }

    const endTime = new Date();
    const totalDuration = sessionTimer;
    const actualPlayTime = totalDuration - (activeSession.pausedTime || 0);

    console.log("📊 Session verileri:", {
      oyun: activeSession.gameName,
      gameId: activeSession.gameId,
      toplamSure: totalDuration,
      gercekOyunSuresi: actualPlayTime,
    });

    const completedSessionData = {
      ...activeSession,
      endTime,
      duration: totalDuration,
      actualPlayTime,
      completed: true,
      notes: sessionNotes,
      mood: sessionMood,
      progress: sessionProgress,
      completedAt: new Date().toISOString(),
    };

    try {
      if (activeSession.backendSessionId) {
        await sessionsService.endSession(activeSession.backendSessionId, {
          endTime: endTime.toISOString(),
          totalDuration,
          actualPlayTime,
          pausedTime: activeSession.pausedTime || 0,
          notes: sessionNotes,
          mood: sessionMood,
          progress: sessionProgress,
        });
        console.log("✅ Oturum backend'e başarıyla kaydedildi.");
      }
    } catch (error) {
      console.error("❌ Oturum backend'e kaydedilemedi:", error);
      // Hata durumunda bile yerel kayda devam et
    }

    try {
      const userSessionHistory = JSON.parse(
        localStorage.getItem(`sessionHistory_${user.id}`) || "[]",
      );
      userSessionHistory.unshift(completedSessionData);
      localStorage.setItem(
        `sessionHistory_${user.id}`,
        JSON.stringify(userSessionHistory.slice(0, 100)),
      );
      console.log("💾 Session geçmişe yerel olarak kaydedildi.");
    } catch (error) {
      console.error("❌ Session geçmişi yerel olarak kaydedilemedi:", error);
    }

    await updateGamePlaytime(activeSession.gameId, actualPlayTime);

    updateUserStats(user.id, {
      totalPlayTime: actualPlayTime,
      sessionsCompleted: 1,
      lastPlayedGame: activeSession.gameName,
      lastPlayedAt: endTime.toISOString(),
    });

    console.log(
      `✅ Oyun oturumu sonlandırıldı: ${activeSession.gameName}. Süre: ${formatTime(actualPlayTime)}`,
    );

    setActiveSession(null);
    setSessionTimer(0);
    setIsRunning(false);
    localStorage.removeItem(`activeSession_${user.id}`);
  }, [activeSession, user, sessionTimer, updateGamePlaytime, updateUserStats]);

  // Oyun oturumu duraklat/devam ettir
  const toggleSession = useCallback(async () => {
    if (!activeSession || !user) return;

    const now = new Date();
    const isCurrentlyRunning = isRunning;
    setIsRunning(!isCurrentlyRunning); // Optimistic UI update

    if (isCurrentlyRunning) {
      // Duraklatılıyor
      const updatedSession = {
        ...activeSession,
        pauseHistory: [
          ...activeSession.pauseHistory,
          { pausedAt: now, resumedAt: null },
        ],
      };
      setActiveSession(updatedSession);
      localStorage.setItem(`activeSession_${user.id}`, JSON.stringify(updatedSession));
      console.log("⏸️ Oyun oturumu duraklatıldı");

      try {
        if (activeSession.backendSessionId) {
          await sessionsService.updateSession(activeSession.backendSessionId, {
            pausedAt: now.toISOString(),
            pauseHistory: updatedSession.pauseHistory,
          });
        }
      } catch (error) {
        console.error("❌ Duraklatma bilgisi backend'e gönderilemedi:", error);
        // Gerekirse state'i geri al
      }
    } else {
      // Devam ettiriliyor
      const pauseHistory = [...activeSession.pauseHistory];
      const lastPause = pauseHistory[pauseHistory.length - 1];

      if (lastPause && !lastPause.resumedAt) {
        lastPause.resumedAt = now;

        const totalPausedTime = pauseHistory.reduce((total, pause) => {
          if (pause.pausedAt && pause.resumedAt) {
            return total + (new Date(pause.resumedAt) - new Date(pause.pausedAt));
          }
          return total;
        }, 0) / 1000; // saniyeye çevir

        const updatedSession = {
          ...activeSession,
          pauseHistory,
          pausedTime: totalPausedTime,
        };
        setActiveSession(updatedSession);
        localStorage.setItem(`activeSession_${user.id}`, JSON.stringify(updatedSession));
        console.log("▶️ Oyun oturumu devam ettiriliyor");

        try {
          if (activeSession.backendSessionId) {
            await sessionsService.updateSession(activeSession.backendSessionId, {
              resumedAt: now.toISOString(),
              pauseHistory: updatedSession.pauseHistory,
              pausedTime: totalPausedTime,
            });
          }
        } catch (error) {
          console.error("❌ Devam etme bilgisi backend'e gönderilemedi:", error);
        }
      }
    }
  }, [activeSession, user, isRunning]);

  // Sayfa yüklendiğinde aktif oturumu kontrol et
  useEffect(() => {
    if (!user) return;

    let savedSession;
    try {
      savedSession = localStorage.getItem(`activeSession_${user.id}`);
    } catch (error) {
      console.error("❌ Local storage'dan oturum okunurken hata:", error);
      return;
    }

    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const startTime = new Date(session.startTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);

        if (elapsedSeconds > 24 * 60 * 60) {
          localStorage.removeItem(`activeSession_${user.id}`);
          return;
        }

        let totalPausedTime = session.pausedTime || 0;
        let sessionIsRunning = true;

        if (session.pauseHistory && session.pauseHistory.length > 0) {
          const lastPause = session.pauseHistory[session.pauseHistory.length - 1];
          if (lastPause.pausedAt && !lastPause.resumedAt) {
            sessionIsRunning = false;
          }
        }

        const activeTime = elapsedSeconds - totalPausedTime;

        setActiveSession(session);
        setSessionTimer(activeTime);
        setIsRunning(sessionIsRunning);

        console.log(
          `🔄 Aktif oturum geri yüklendi: ${session.gameName}. Durum: ${sessionIsRunning ? "Çalışıyor" : "Duraklatıldı"}`,
        );
      } catch (error) {
        console.error("❌ Aktif oturum geri yüklenemedi:", error);
        localStorage.removeItem(`activeSession_${user.id}`);
      }
    }
  }, [user]);


  const getSessionHistory = useCallback(() => {
    if (!user) return [];
    try {
      return JSON.parse(localStorage.getItem(`sessionHistory_${user.id}`) || "[]");
    } catch (error) {
      console.error("❌ Oturum geçmişi okunamadı:", error);
      return [];
    }
  }, [user]);

  const getUserStats = useCallback(() => {
    if (!user) return {};
    try {
      return JSON.parse(localStorage.getItem(`userStats_${user.id}`) || "{}");
    } catch (error) {
      console.error("❌ Kullanıcı istatistikleri okunamadı:", error);
      return {};
    }
  }, [user]);

  const getGameSessionHistory = useCallback((gameId) => {
    if (!gameId) return [];
    const allSessions = getSessionHistory();
    return allSessions.filter(
      (session) => session.gameId === gameId || session.appid === gameId,
    );
  }, [getSessionHistory]);

  const getDailyStats = useCallback((date = new Date()) => {
    const dateKey = date.toDateString();
    const userStats = getUserStats();
    return userStats.dailyStats?.[dateKey] || { playTime: 0, sessions: 0 };
  }, [getUserStats]);

  const getWeeklyStats = useCallback((date = new Date()) => {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toDateString();
    const userStats = getUserStats();
    return userStats.weeklyStats?.[weekKey] || { playTime: 0, sessions: 0 };
  }, [getUserStats]);

  const updateSessionNotes = useCallback((sessionId, notes) => {
    if (!user || !sessionId) return;
    try {
      const sessionHistory = getSessionHistory();
      const sessionIndex = sessionHistory.findIndex(
        (session) => session.sessionId === sessionId,
      );

      if (sessionIndex !== -1) {
        sessionHistory[sessionIndex].notes = notes;
        localStorage.setItem(
          `sessionHistory_${user.id}`,
          JSON.stringify(sessionHistory),
        );
      }
    } catch (error) {
      console.error("❌ Oturum notları güncellenemedi:", error);
    }
  }, [user, getSessionHistory]);

  const updateSessionRating = useCallback((sessionId, rating) => {
    if (!user || !sessionId || rating < 1 || rating > 5) return;
    try {
      const sessionHistory = getSessionHistory();
      const sessionIndex = sessionHistory.findIndex(
        (session) => session.sessionId === sessionId,
      );

      if (sessionIndex !== -1) {
        sessionHistory[sessionIndex].sessionRating = rating;
        localStorage.setItem(
          `sessionHistory_${user.id}`,
          JSON.stringify(sessionHistory),
        );
      }
    } catch (error) {
      console.error("❌ Oturum değerlendirmesi güncellenemedi:", error);
    }
  }, [user, getSessionHistory]);

  const value = useMemo(
    () => ({
      activeSession,
      sessionTimer,
      isRunning,
      startSession,
      stopSession,
      toggleSession,
      formatTime,
      getSessionHistory,
      getUserStats,
      getGameSessionHistory,
      getDailyStats,
      getWeeklyStats,
      updateSessionNotes,
      updateSessionRating,
    }),
    [
      activeSession,
      sessionTimer,
      isRunning,
      startSession,
      stopSession,
      toggleSession,
      formatTime,
      getSessionHistory,
      getUserStats,
      getGameSessionHistory,
      getDailyStats,
      getWeeklyStats,
      updateSessionNotes,
      updateSessionRating,
    ],
  );

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  );
};

export default ActiveSessionContext;
