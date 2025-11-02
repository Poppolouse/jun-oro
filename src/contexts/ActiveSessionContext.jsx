import React, { createContext, useContext, useState, useEffect } from 'react'
import steamApi from '../services/steamApi'
import userLibrary from '../services/userLibrary'
import sessionsService from '../services/sessions'
import { useAuth } from './AuthContext'

const ActiveSessionContext = createContext()

export const useActiveSession = () => {
  const context = useContext(ActiveSessionContext)
  if (!context) {
    throw new Error('useActiveSession must be used within an ActiveSessionProvider')
  }
  return context
}

export const ActiveSessionProvider = ({ children }) => {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTimer(timer => timer + 1)
      }, 1000)
    } else if (!isRunning) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, activeSession])

  // Steam'den oyun açıklaması çek
  const fetchGameDescription = async (gameName) => {
    try {
      console.log('🔍 Steam\'den açıklama aranıyor:', gameName)
      const searchResults = await steamApi.searchGame(gameName)
      
      if (searchResults.length > 0) {
        const steamGame = searchResults[0]
        const gameDetails = await steamApi.getGameDetails(steamGame.id)
        
        // Steam API fallback durumunu kontrol et
        if (gameDetails.source === 'steam_fallback') {
          console.log('⚠️ Steam API erişilemez, açıklama alınamadı')
          return `${gameName} oyunu hakkında Steam API erişilemediği için detaylı açıklama alınamadı.`
        }
        
        return gameDetails.description || null
      }
      
      return null
    } catch (error) {
      console.error('❌ Steam açıklama çekme hatası:', error)
      return `${gameName} oyunu hakkında açıklama alınamadı (Steam API hatası).`
    }
  }

  // Oyun oynama süresini güncelle
  const updateGamePlaytime = async (gameId, additionalTime) => {
    if (!user || !gameId || additionalTime <= 0) {
      console.log('⚠️ updateGamePlaytime: Geçersiz parametreler', { user: !!user, gameId, additionalTime })
      return
    }

    try {
      // Saniyeyi dakikaya çevir
      const additionalMinutes = Math.floor(additionalTime / 60)
      
      console.log('⏱️ Playtime güncelleme başlıyor:', {
        gameId,
        eklenenSaniye: additionalTime,
        eklenenDakika: additionalMinutes
      })
      
      // userLibrary servisini kullanarak oyunu bul
      const game = await userLibrary.getGameById(gameId)
      
      if (game) {
        const currentPlaytime = game.playtime || 0
        const newPlaytime = currentPlaytime + additionalMinutes
        
        console.log('⏱️ Playtime güncelleme detayları:', {
          oyun: game.name || game.title,
          eskiSure: currentPlaytime,
          eklenenDakika: additionalMinutes,
          yeniSure: newPlaytime
        })
        
        // userLibrary servisi ile playtime'ı güncelle
        const updateSuccess = await userLibrary.updateGameDetails(gameId, {
          playtime: newPlaytime,
          lastPlayed: new Date().toISOString()
        })
        
        if (updateSuccess) {
          console.log(`✅ ${game.name || game.title} oyun süresi güncellendi: ${currentPlaytime}dk → ${newPlaytime}dk (+${additionalMinutes}dk)`)
        } else {
          console.error('❌ Oyun süresi güncellenemedi')
        }
      } else {
        console.error('❌ Oyun kütüphanede bulunamadı:', gameId)
        
        // Debug için kütüphanedeki oyunları listele
        const library = await userLibrary.getUserLibrary()
        console.log('📋 Kütüphanedeki oyunlar:', library.entries?.map(g => ({ 
          gameId: g.gameId, 
          name: g.name || g.title 
        })) || [])
      }
    } catch (error) {
      console.error('❌ Oyun süresi güncellenirken hata:', error)
    }
  }

  // Kullanıcı istatistiklerini güncelle
  const updateUserStats = (userId, sessionData) => {
    try {
      // Mevcut kullanıcı istatistiklerini al
      const userStats = JSON.parse(localStorage.getItem(`userStats_${userId}`) || '{}')
      
      // İstatistikleri güncelle
      userStats.totalPlayTime = (userStats.totalPlayTime || 0) + sessionData.totalPlayTime
      userStats.sessionsCompleted = (userStats.sessionsCompleted || 0) + sessionData.sessionsCompleted
      userStats.lastPlayedGame = sessionData.lastPlayedGame
      userStats.lastPlayedAt = sessionData.lastPlayedAt
      userStats.totalSessions = (userStats.totalSessions || 0) + 1
      
      // Günlük istatistikler
      const today = new Date().toDateString()
      if (!userStats.dailyStats) userStats.dailyStats = {}
      if (!userStats.dailyStats[today]) {
        userStats.dailyStats[today] = { playTime: 0, sessions: 0 }
      }
      userStats.dailyStats[today].playTime += sessionData.totalPlayTime
      userStats.dailyStats[today].sessions += 1
      
      // Haftalık istatistikler
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toDateString()
      if (!userStats.weeklyStats) userStats.weeklyStats = {}
      if (!userStats.weeklyStats[weekKey]) {
        userStats.weeklyStats[weekKey] = { playTime: 0, sessions: 0 }
      }
      userStats.weeklyStats[weekKey].playTime += sessionData.totalPlayTime
      userStats.weeklyStats[weekKey].sessions += 1
      
      // Güncellenen istatistikleri kaydet
      localStorage.setItem(`userStats_${userId}`, JSON.stringify(userStats))
      
      console.log('📊 Kullanıcı istatistikleri güncellendi')
    } catch (error) {
      console.error('❌ Kullanıcı istatistikleri güncellenirken hata:', error)
    }
  }

  // Oyun oturumu başlat
  const startSession = async (game) => {
    if (!user) {
      console.error('❌ Kullanıcı girişi yapılmamış')
      return { success: false, error: 'Kullanıcı girişi yapılmamış' }
    }

    if (activeSession) {
      console.warn('⚠️ Zaten aktif bir oturum var')
      return { success: false, error: 'Zaten aktif bir oturum var' }
    }

    // Campaign kontrolü - eğer oyunun campaign'leri varsa ve hiçbiri seçilmemişse hata ver
    if (game.campaigns && game.campaigns.length > 0 && !game.selectedCampaign && !game.campaignId) {
      console.warn('⚠️ Bu oyun için campaign seçilmesi gerekiyor')
      return { 
        success: false, 
        error: 'Bu oyun için bir campaign seçmelisiniz',
        requiresCampaign: true,
        availableCampaigns: game.campaigns
      }
    }

    try {
      // Backend'e oturum başlatma isteği gönder
      const sessionResponse = await sessionsService.startSession(user.id, {
        gameId: game.id || game.appid,
        gameName: game.name || game.title,
        platform: game.platform || 'Steam',
        campaignId: game.campaignId || null,
        startTime: new Date().toISOString()
      })

      const sessionData = {
        ...game,
        startTime: new Date(sessionResponse.data.startTime),
        sessionId: sessionResponse.data.id,
        userId: user.id,
        username: user.username,
        gameId: game.id || game.appid,
        gameName: game.name || game.title,
        platform: game.platform || 'Steam',
        sessionType: 'manual', // manual, auto
        pausedTime: 0, // Toplam duraklatma süresi
        pauseHistory: [], // Duraklatma geçmişi
        achievements: [], // Bu oturumda alınan başarımlar
        notes: '', // Kullanıcı notları
        mood: '', // Oyun oynama ruh hali
        difficulty: '', // Zorluk seviyesi
        progress: 0, // Oyun ilerleme yüzdesi
        backendSessionId: sessionResponse.data.id
      }
      
      setActiveSession(sessionData)
      setSessionTimer(0)
      setIsRunning(true)
      
      // Kullanıcı bazlı local storage'a kaydet
      localStorage.setItem(`activeSession_${user.id}`, JSON.stringify(sessionData))
      
      console.log('🎮 Oyun oturumu başlatıldı:', game.name || game.title, 'Kullanıcı:', user.username)
      return { success: true, session: sessionData }
    } catch (error) {
      console.error('❌ Oturum başlatılamadı:', error)
      // Hata durumunda yerel olarak başlat (fallback)
      const sessionData = {
        ...game,
        startTime: new Date(),
        sessionId: Date.now(),
        userId: user.id,
        username: user.username,
        gameId: game.id || game.appid,
        gameName: game.name || game.title,
        platform: game.platform || 'Steam',
        sessionType: 'manual', // manual, auto
        pausedTime: 0, // Toplam duraklatma süresi
        pauseHistory: [], // Duraklatma geçmişi
        achievements: [], // Bu oturumda alınan başarımlar
        notes: '', // Kullanıcı notları
        mood: '', // Oyun oynama ruh hali
        difficulty: '', // Zorluk seviyesi
        progress: 0, // Oyun ilerleme yüzdesi
        backendSessionId: null // Backend'e kaydedilemedi
      }
      
      setActiveSession(sessionData)
      setSessionTimer(0)
      setIsRunning(true)
      
      // Kullanıcı bazlı local storage'a kaydet
      localStorage.setItem(`activeSession_${user.id}`, JSON.stringify(sessionData))
      
      console.log('🎮 Oyun oturumu yerel olarak başlatıldı:', game.name || game.title)
      return { success: true, session: sessionData, fallback: true }
    }
    
    // Steam'den açıklama çek (arka planda)
    if (game.name || game.title) {
      const description = await fetchGameDescription(game.name || game.title)
      if (description) {
        const updatedSession = {
          ...sessionData,
          description
        }
        setActiveSession(updatedSession)
        localStorage.setItem(`activeSession_${user.id}`, JSON.stringify(updatedSession))
        console.log('✅ Steam açıklaması eklendi')
      }
    }
  }

  // Oyun oturumu durdur
  const stopSession = async (sessionNotes = '', sessionMood = '', sessionProgress = 0) => {
    console.log('🛑 stopSession çağrıldı:', { activeSession: !!activeSession, user: !!user, sessionTimer })
    
    if (activeSession && user) {
      const endTime = new Date()
      const totalDuration = sessionTimer
      const actualPlayTime = totalDuration - (activeSession.pausedTime || 0)
      
      console.log('📊 Session verileri:', {
        oyun: activeSession.gameName || activeSession.name || activeSession.title,
        gameId: activeSession.gameId,
        toplamSure: totalDuration,
        duraklatmaSuresi: activeSession.pausedTime || 0,
        gercekOyunSuresi: actualPlayTime
      })
      
      const completedSessionData = {
        ...activeSession,
        endTime,
        duration: totalDuration, // Toplam süre (duraklatmalar dahil)
        actualPlayTime, // Gerçek oyun süresi
        completed: true,
        notes: sessionNotes,
        mood: sessionMood,
        progress: sessionProgress,
        sessionRating: 0, // Kullanıcı değerlendirmesi (1-5)
        completedAt: new Date().toISOString()
      }
      
      try {
        // Backend'e oturum sonlandırma isteği gönder
        if (activeSession.backendSessionId) {
          await sessionsService.endSession(activeSession.backendSessionId, {
            endTime: endTime.toISOString(),
            totalDuration,
            actualPlayTime,
            pausedTime: activeSession.pausedTime || 0,
            notes: sessionNotes,
            mood: sessionMood,
            progress: sessionProgress
          })
          console.log('✅ Oturum backend\'e kaydedildi')
        }
      } catch (error) {
        console.error('❌ Oturum backend\'e kaydedilemedi:', error)
        // Yerel kayıt devam eder
      }
      
      // Kullanıcı bazlı oturum geçmişine ekle (yerel yedek)
      const userSessionHistory = JSON.parse(localStorage.getItem(`sessionHistory_${user.id}`) || '[]')
      userSessionHistory.unshift(completedSessionData)
      localStorage.setItem(`sessionHistory_${user.id}`, JSON.stringify(userSessionHistory.slice(0, 100))) // Son 100 oturum
      console.log('💾 Session geçmişe kaydedildi')
      
      // Oyunun toplam süresini güncelle
      console.log('🔄 updateGamePlaytime çağrılıyor:', {
        gameId: activeSession.gameId,
        actualPlayTime,
        gameName: activeSession.gameName || activeSession.name || activeSession.title
      })
      await updateGamePlaytime(activeSession.gameId, actualPlayTime)
      
      // Kullanıcı istatistiklerini güncelle
      updateUserStats(user.id, {
        totalPlayTime: actualPlayTime,
        sessionsCompleted: 1,
        lastPlayedGame: activeSession.gameName,
        lastPlayedAt: endTime.toISOString()
      })
      
      console.log('✅ Oyun oturumu sonlandırıldı:', completedSessionData.gameName || completedSessionData.name || completedSessionData.title, 'Süre:', formatTime(actualPlayTime))
    } else {
      console.log('⚠️ stopSession: activeSession veya user bulunamadı')
    }
    
    setActiveSession(null)
    setSessionTimer(0)
    setIsRunning(false)
    if (user) {
      localStorage.removeItem(`activeSession_${user.id}`)
    }
  }

  // Oyun oturumu duraklat/devam ettir
  const toggleSession = async () => {
    if (!activeSession || !user) return

    const now = new Date()
    
    if (isRunning) {
      // Duraklatılıyor
      const updatedSession = {
        ...activeSession,
        pauseHistory: [
          ...activeSession.pauseHistory,
          { pausedAt: now, resumedAt: null }
        ]
      }
      
      try {
        // Backend'e duraklatma bilgisi gönder
        if (activeSession.backendSessionId) {
          await sessionsService.updateSession(activeSession.backendSessionId, {
            pausedAt: now.toISOString(),
            pauseHistory: updatedSession.pauseHistory
          })
        }
      } catch (error) {
        console.error('❌ Duraklatma backend\'e kaydedilemedi:', error)
      }
      
      setActiveSession(updatedSession)
      localStorage.setItem(`activeSession_${user.id}`, JSON.stringify(updatedSession))
      console.log('⏸️ Oyun oturumu duraklatıldı')
    } else {
      // Devam ettiriliyor
      const pauseHistory = [...activeSession.pauseHistory]
      if (pauseHistory.length > 0 && !pauseHistory[pauseHistory.length - 1].resumedAt) {
        // Son duraklatmayı tamamla
        pauseHistory[pauseHistory.length - 1].resumedAt = now
        
        // Toplam duraklatma süresini hesapla
        const totalPausedTime = pauseHistory.reduce((total, pause) => {
          if (pause.pausedAt && pause.resumedAt) {
            const pauseDuration = (new Date(pause.resumedAt) - new Date(pause.pausedAt)) / 1000
            return total + pauseDuration
          }
          return total
        }, 0)
        
        const updatedSession = {
          ...activeSession,
          pauseHistory,
          pausedTime: totalPausedTime
        }
        
        try {
          // Backend'e devam ettirme bilgisi gönder
          if (activeSession.backendSessionId) {
            await sessionsService.updateSession(activeSession.backendSessionId, {
              resumedAt: now.toISOString(),
              pauseHistory: updatedSession.pauseHistory,
              pausedTime: totalPausedTime
            })
          }
        } catch (error) {
          console.error('❌ Devam ettirme backend\'e kaydedilemedi:', error)
        }
        
        setActiveSession(updatedSession)
        localStorage.setItem(`activeSession_${user.id}`, JSON.stringify(updatedSession))
        console.log('▶️ Oyun oturumu devam ettiriliyor')
      }
    }
    
    setIsRunning(!isRunning)
  }

  // Sayfa yüklendiğinde aktif oturumu kontrol et
  useEffect(() => {
    if (!user) return

    const savedSession = localStorage.getItem(`activeSession_${user.id}`)
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        const startTime = new Date(session.startTime)
        const now = new Date()
        const elapsedSeconds = Math.floor((now - startTime) / 1000)
        
        // Eğer 24 saatten fazla geçmişse oturumu temizle
        if (elapsedSeconds > 24 * 60 * 60) {
          localStorage.removeItem(`activeSession_${user.id}`)
          return
        }
        
        // Duraklatma süresini hesapla
        let totalPausedTime = session.pausedTime || 0
        if (session.pauseHistory && session.pauseHistory.length > 0) {
          const lastPause = session.pauseHistory[session.pauseHistory.length - 1]
          if (lastPause.pausedAt && !lastPause.resumedAt) {
            // Hala duraklatılmış durumda
            const pauseDuration = (now - new Date(lastPause.pausedAt)) / 1000
            totalPausedTime += pauseDuration
            setIsRunning(false)
          } else {
            setIsRunning(true)
          }
        } else {
          setIsRunning(true)
        }
        
        const adjustedElapsedSeconds = Math.max(0, elapsedSeconds - totalPausedTime)
        
        setActiveSession({
          ...session,
          pausedTime: totalPausedTime
        })
        setSessionTimer(adjustedElapsedSeconds)
        
        console.log('🔄 Aktif oturum geri yüklendi:', session.gameName || session.name || session.title, 'Kullanıcı:', user.username)
      } catch (error) {
        console.error('❌ Aktif oturum geri yüklenemedi:', error)
        localStorage.removeItem(`activeSession_${user.id}`)
      }
    }
  }, [user])

  // Süre formatı
  const formatTime = (seconds) => {
    const total = Math.floor(seconds || 0)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const secs = total % 60
    
    if (hours > 0) {
      return `${hours} saat ${minutes} dk ${secs} sn`
    }
    return `${minutes} dk ${secs} sn`
  }

  // Kullanıcı bazlı oturum geçmişini al
  const getSessionHistory = () => {
    if (!user) return []
    return JSON.parse(localStorage.getItem(`sessionHistory_${user.id}`) || '[]')
  }

  // Kullanıcı istatistiklerini al
  const getUserStats = () => {
    if (!user) return {}
    return JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}')
  }

  // Belirli bir oyun için oturum geçmişini al
  const getGameSessionHistory = (gameId) => {
    const allSessions = getSessionHistory()
    return allSessions.filter(session => 
      session.gameId === gameId || session.appid === gameId
    )
  }

  // Günlük oturum istatistikleri
  const getDailyStats = (date = new Date()) => {
    const dateKey = date.toDateString()
    const userStats = getUserStats()
    return userStats.dailyStats?.[dateKey] || { playTime: 0, sessions: 0 }
  }

  // Haftalık oturum istatistikleri
  const getWeeklyStats = (date = new Date()) => {
    const weekStart = new Date(date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekKey = weekStart.toDateString()
    const userStats = getUserStats()
    return userStats.weeklyStats?.[weekKey] || { playTime: 0, sessions: 0 }
  }

  // Oturum notları güncelle
  const updateSessionNotes = (sessionId, notes) => {
    if (!user) return
    
    const sessionHistory = getSessionHistory()
    const sessionIndex = sessionHistory.findIndex(session => session.sessionId === sessionId)
    
    if (sessionIndex !== -1) {
      sessionHistory[sessionIndex].notes = notes
      localStorage.setItem(`sessionHistory_${user.id}`, JSON.stringify(sessionHistory))
    }
  }

  // Oturum değerlendirmesi güncelle
  const updateSessionRating = (sessionId, rating) => {
    if (!user || rating < 1 || rating > 5) return
    
    const sessionHistory = getSessionHistory()
    const sessionIndex = sessionHistory.findIndex(session => session.sessionId === sessionId)
    
    if (sessionIndex !== -1) {
      sessionHistory[sessionIndex].sessionRating = rating
      localStorage.setItem(`sessionHistory_${user.id}`, JSON.stringify(sessionHistory))
    }
  }

  const value = {
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
    updateSessionRating
  }

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  )
}

export default ActiveSessionContext