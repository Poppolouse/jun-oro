import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ArkadeHeader from '../components/ArkadeHeader'
import ArkadeSidebar from '../components/ArkadeSidebar'
import SiteFooter from '../components/SiteFooter'
import { useActiveSession } from '../contexts/ActiveSessionContext'
import igdbApi from '../services/igdbApi'
import gamesService from '../services/games'
import userLibrary from '../services/userLibrary'

// Oyun verisinden geliştirici ve yayıncı bilgilerini çıkar (IGDB ve Steam destekli)
const extractDeveloperAndPublisher = (gameData) => {
  let developer = null
  let publisher = null

  // Önce doğrudan Steam verilerini kontrol et
  if (gameData.developer && typeof gameData.developer === 'string') {
    developer = gameData.developer
  }
  if (gameData.publisher && typeof gameData.publisher === 'string') {
    publisher = gameData.publisher
  }

  // Eğer Steam verisi yoksa IGDB involved_companies'i kontrol et
  if (!developer || !publisher) {
    const involvedCompanies = gameData.involved_companies
    if (involvedCompanies && Array.isArray(involvedCompanies)) {
      involvedCompanies.forEach(company => {
        if (company.developer && company.company?.name && !developer) {
          developer = company.company.name
        }
        if (company.publisher && company.company?.name && !publisher) {
          publisher = company.company.name
        }
      })
    }
  }

  return { developer, publisher }
}

function ArkadeActiveSession() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [gameDetails, setGameDetails] = useState(null)
  const [isLoadingGameDetails, setIsLoadingGameDetails] = useState(false)
  
  // ActiveSession context'inden verileri al
  const { 
    activeSession, 
    sessionTimer, 
    isRunning, 
    toggleSession, 
    stopSession,
    formatTime 
  } = useActiveSession()
  
  // Aktif session kontrolü
  const hasActiveSession = !!activeSession

  // Database'den oyun detaylarını çek
  const fetchGameDetails = async (gameId) => {
    if (!gameId || isLoadingGameDetails) return
    
    setIsLoadingGameDetails(true)
    try {
      console.log('🔍 Database\'den oyun detayları çekiliyor:', gameId)
      const details = await gamesService.getGameById(gameId)
      
      if (details) {
        // LibraryEntry'den playtime verilerini de çek
        try {
          const libraryEntry = await userLibrary.getGameById(gameId)
          if (libraryEntry) {
            details.totalPlaytime = libraryEntry.playtime || 0
            console.log('✅ LibraryEntry playtime eklendi:', details.totalPlaytime, 'dakika')
          }
        } catch (libraryError) {
          console.warn('⚠️ LibraryEntry playtime alınamadı:', libraryError)
          details.totalPlaytime = 0
        }
        
        setGameDetails(details)
        console.log('✅ Oyun detayları alındı:', details.name)
      } else {
        console.warn('⚠️ Oyun detayları bulunamadı:', gameId)
      }
    } catch (error) {
      console.error('❌ Oyun detayları çekme hatası:', error)
    } finally {
      setIsLoadingGameDetails(false)
    }
  }

  // Oyun verilerinden geliştirici ve yayıncı bilgilerini çıkar
  // Önce database'den gelen detayları kullan, sonra mevcut oyun verisini
  const gameDataForExtraction = gameDetails || (hasActiveSession ? activeSession : null)
  const { developer, publisher } = extractDeveloperAndPublisher(gameDataForExtraction)

  // IGDB'den arkaplan görseli çek
  const fetchBackgroundImage = async (gameName) => {
    try {
      const searchResults = await igdbApi.searchGames(gameName, 1)
      if (searchResults && searchResults.length > 0) {
        const game = searchResults[0]
        if (game.screenshots && game.screenshots.length > 0) {
          // İlk screenshot'ı 16:9 arkaplan için kullan
          const screenshot = game.screenshots[0]
          if (screenshot.url) {
            // IGDB screenshot URL'sini yüksek çözünürlük için düzenle
            const imageUrl = `https:${screenshot.url.replace('t_thumb', 't_1080p')}`
            setBackgroundImage(imageUrl)
          }
        }
      }
    } catch (error) {
      console.error('Arkaplan görseli yüklenemedi:', error)
    }
  }

  // Oyun değiştiğinde database'den detayları çek
  useEffect(() => {
    if (hasActiveSession && activeSession && activeSession.id) {
      fetchGameDetails(activeSession.id)
    }
  }, [hasActiveSession, activeSession?.id])

  // Oyun değiştiğinde arkaplan görselini yükle
  useEffect(() => {
    if (hasActiveSession && activeSession && (activeSession.name || activeSession.title)) {
      fetchBackgroundImage(activeSession.name || activeSession.title)
    }
  }, [hasActiveSession, activeSession?.name, activeSession?.title])

  // Timer controls (ActiveSessionContext'ten gelenler kullanılıyor)
  const startTimer = () => toggleSession()
  const pauseTimer = () => toggleSession()
  const stopTimer = () => {
    // Oturumu sonlandır ve kütüphaneye dön
    stopSession('', '', 0) // Boş notlar, ruh hali ve %0 ilerleme ile
    console.log('🏁 Oyun oturumu sonlandırıldı, kütüphaneye yönlendiriliyor...')
    navigate('/arkade/library')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex flex-col">
      <ArkadeHeader />
      
      <div className="flex flex-1">
        <ArkadeSidebar />

        {/* Center Content */}
        <div className="flex-1 p-8 pr-4 overflow-y-auto">
          {hasActiveSession ? (
            /* Active Session Hero Section */
            <div className="relative overflow-hidden bg-gradient-to-r from-[#00ff88]/10 via-transparent to-purple-500/10 backdrop-blur-xl rounded-3xl mb-8 border border-white/10 shadow-2xl">
              {/* IGDB Background Image */}
              {backgroundImage && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)' // Slight scale to avoid blur edges
                  }}
                ></div>
              )}
              
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30"></div>
              
              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#00ff88]/20 rounded-xl flex items-center justify-center border border-[#00ff88]/30">
                      <span className="text-2xl">🎮</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Aktif Oyun Oturumu</h1>
                      <p className="text-gray-400">Oyun deneyimini takip et</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Canlı</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Game Info Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                      <div className="flex gap-8 h-full py-6">
                        {/* Game Poster - Left Side */}
                        <div className="flex-shrink-0">
                          <div className="relative h-full flex items-end">
                            <img 
                              src={activeSession.image || activeSession.cover || '/api/placeholder/160/200'} 
                              alt="Game Cover"
                              className="w-72 aspect-[2/3] rounded-xl object-cover shadow-2xl border border-white/10"
                            />
                          </div>
                        </div>
                        
                        {/* Game Details - Right Side */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          {/* Oyun Başlığı */}
                          <div className="mb-4">
                            <h2 className="text-2xl font-bold text-white mb-2 leading-tight" title={activeSession.name || activeSession.title}>
                              {activeSession.name || activeSession.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-[#00ff88]">
                              <span>🎮</span>
                              <span className="font-medium">{activeSession.platform || 'Steam'}</span>
                            </div>
                            
                            {/* Campaign Bilgisi */}
                            {activeSession.selectedCampaign && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-[#00ff88]/10 to-blue-500/10 rounded-lg border border-[#00ff88]/30">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[#00ff88]">🎯</span>
                                  <span className="text-sm font-medium text-[#00ff88]">Aktif Campaign</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-white font-semibold">{activeSession.selectedCampaign.name}</h3>
                                  {activeSession.selectedCampaign.averageDuration && (
                                    <span className="text-blue-400 text-sm bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30">
                                      ⏱️ {activeSession.selectedCampaign.averageDuration}
                                    </span>
                                  )}
                                </div>
                                {activeSession.selectedCampaign.description && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{activeSession.selectedCampaign.description}</p>
                                )}
                                
                                {/* Oyun Konusu */}
                                {gameDetails?.summary && (
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-purple-400">📖</span>
                                      <span className="text-sm font-medium text-purple-400">Oyun Konusu</span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                                      {gameDetails.summary}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Steam Açıklama */}
                          {activeSession.description && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-300 mb-2">Açıklama</h4>
                              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                                {activeSession.description}
                              </p>
                            </div>
                          )}

                          {/* Oyun Bilgileri Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-400">👨‍💻</span>
                                <span className="text-xs font-medium text-gray-300">Geliştirici</span>
                                {isLoadingGameDetails && (
                                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>
                              <p className="text-sm text-white font-medium truncate">
                                {isLoadingGameDetails ? 
                                  'Yükleniyor...' : 
                                  (gameDetails?.developer || gameDetails?.developers || developer || activeSession.developer || 'Bilinmiyor')
                                }
                              </p>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-purple-400">🏢</span>
                                <span className="text-xs font-medium text-gray-300">Yayıncı</span>
                                {isLoadingGameDetails && (
                                  <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>
                              <p className="text-sm text-white font-medium truncate">
                                {isLoadingGameDetails ? 
                                  'Yükleniyor...' : 
                                  (gameDetails?.publisher || gameDetails?.publishers || publisher || activeSession.publisher || 
                                   gameDetails?.developer || gameDetails?.developers || developer || activeSession.developer || 'Bilinmiyor')
                                }
                              </p>
                            </div>
                          </div>

                          {/* Oynama İstatistikleri */}
                          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400">⏱️</span>
                                <span className="text-sm font-medium text-gray-300">Toplam Oynama Süresi</span>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-400">
                                  {isLoadingGameDetails ? 
                                    'Yükleniyor...' : 
                                    (() => {
                                      // Database'den gelen toplam süreyi öncelikle kullan (dakika cinsinden)
                                      const totalMinutes = gameDetails?.totalPlaytime || 0
                                      
                                      if (totalMinutes > 0) {
                                        const hours = Math.floor(totalMinutes / 60)
                                        const minutes = totalMinutes % 60
                                        return `${hours}h ${minutes}m`
                                      } else {
                                        return '0h 0m'
                                      }
                                    })()
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timer & Controls */}
                  <div className="lg:col-span-1">
                    <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 h-full flex flex-col justify-center">
                      {isRunning && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {/* Timer Display */}
                      <div className="text-center mb-8">
                        <h3 className="text-lg text-gray-400 mb-4 flex items-center justify-center gap-2">
                          <span>⏱️</span>
                          <span>Oturum Süresi</span>
                        </h3>
                        <div className="relative">
                          <div className="text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00cc6a] mb-6">
                            {formatTime(sessionTimer)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Control Buttons */}
                      <div className="flex gap-4 justify-center mb-6">
                        <button 
                          onClick={startTimer}
                          disabled={isRunning}
                          className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black px-8 py-4 rounded-xl hover:from-[#00cc6a] hover:to-[#00aa55] font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#00ff88]/20"
                        >
                          <span>▶️</span>
                          <span>Başlat</span>
                        </button>
                        <button 
                          onClick={pauseTimer}
                          disabled={!isRunning}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-yellow-500/20"
                        >
                          <span>⏸️</span>
                          <span>Duraklat</span>
                        </button>
                        <button 
                          onClick={stopTimer}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-600 font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/20"
                        >
                          <span>⏹️</span>
                          <span>Bitir</span>
                        </button>
                      </div>
                      
                      {/* Status Info */}
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                          <span className="text-xs text-gray-400">🤖 Otomatik duraklama: 10dk hareketsizlik</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Library Redirect Card - When No Active Session */
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 backdrop-blur-xl rounded-3xl mb-8 border border-white/10 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), 
                                   radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
                  backgroundSize: '100px 100px'
                }}></div>
              </div>
              
              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Aktif Oturum Yok</h1>
                      <p className="text-gray-400">Kütüphanenden bir oyun seç ve başla</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400 text-sm font-medium">Hazır</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Library Info Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-full flex flex-col justify-center items-center text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 mb-6">
                        <span className="text-5xl">🎮</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mb-4">Oyun Kütüphanesi</h2>
                      <p className="text-gray-400 mb-6 leading-relaxed">
                        Oyun koleksiyonunu keşfet, yeni oyunlar ekle ve oyun oturumlarını başlat. 
                        Tüm oyunların tek bir yerde organize edilmiş hali.
                      </p>
                      
                      <button 
                        onClick={() => navigate('/arkade/library')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white rounded-xl font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center gap-3 group"
                      >
                        <span className="text-xl">📚</span>
                        <span>Kütüphaneye Git</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 h-full">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Hızlı İşlemler</h3>
                        <p className="text-gray-400 text-sm">Kütüphane yönetimi için kısayollar</p>
                      </div>
                      
                      <div className="space-y-4">
                        <button 
                          onClick={() => navigate('/arkade/library')}
                          className="w-full p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🎯</span>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="text-white font-medium">Oyun Başlat</h4>
                            <p className="text-gray-400 text-sm">Kütüphanenden oyun seç</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </svg>
                        </button>

                        <button 
                          onClick={() => navigate('/arkade/library')}
                          className="w-full p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-lg">➕</span>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="text-white font-medium">Oyun Ekle</h4>
                            <p className="text-gray-400 text-sm">Yeni oyunlar ekle</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </svg>
                        </button>

                        <button 
                          onClick={() => navigate('/arkade/library')}
                          className="w-full p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-lg">📊</span>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="text-white font-medium">İstatistikler</h4>
                            <p className="text-gray-400 text-sm">Oyun geçmişini görüntüle</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tek Büyük Çok Yakında Kartı */}
          <div className="bg-gradient-to-br from-[#00ff88]/10 via-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #00ff88 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
                backgroundSize: '100px 100px'
              }}></div>
            </div>
            
            <div className="relative">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-[#00ff88]/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-[#00ff88]/30 mx-auto mb-6">
                  <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Gelişmiş Özellikler Çok Yakında!</h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Oyun deneyiminizi bir üst seviyeye taşıyacak yapay zeka destekli özellikler geliştiriliyor. 
                  Akıllı analitik, otomatik hedef belirleme ve daha fazlası için sabırsızlanıyoruz!
                </p>
              </div>

              {/* Özellik Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-emerald-500/20 relative">
                  <div className="absolute top-4 right-4 text-emerald-400 text-sm font-medium">🚀</div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Akıllı Analitik</h3>
                  <p className="text-gray-400 text-sm">Oyun performansınızı AI ile analiz edin ve kişiselleştirilmiş öneriler alın</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-purple-500/20 relative">
                  <div className="absolute top-4 right-4 text-purple-400 text-sm font-medium">🚀</div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Otomatik Hedefler</h3>
                  <p className="text-gray-400 text-sm">Oyun alışkanlıklarınıza göre otomatik hedef belirleme sistemi</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-blue-500/20 relative">
                  <div className="absolute top-4 right-4 text-blue-400 text-sm font-medium">🚀</div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 mb-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Otomatik Highlight</h3>
                  <p className="text-gray-400 text-sm">Önemli anları otomatik tespit eden akıllı ekran görüntüsü sistemi</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-yellow-500/20 relative">
                  <div className="absolute top-4 right-4 text-yellow-400 text-sm font-medium">🚀</div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30 mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Başarım Sistemi</h3>
                  <p className="text-gray-400 text-sm">Kişiselleştirilmiş rozetler ve başarım takip sistemi</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-pink-500/20 relative">
                  <div className="absolute top-4 right-4 text-pink-400 text-sm font-medium">🚀</div>
                  <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-500/30 mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sesli Notlar</h3>
                  <p className="text-gray-400 text-sm">Oyun sırasında sesli not alma ve otomatik metin dönüştürme</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-indigo-500/20 relative">
                  <div className="absolute top-4 right-4 text-indigo-400 text-sm font-medium">🚀</div>
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sosyal Özellikler</h3>
                  <p className="text-gray-400 text-sm">Arkadaşlarla oturum paylaşımı ve karşılaştırma sistemi</p>
                </div>
              </div>

              {/* Alt Bilgi */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#00ff88]/20 to-purple-500/20 rounded-full border border-[#00ff88]/30">
                  <div className="w-3 h-3 bg-[#00ff88] rounded-full animate-pulse"></div>
                  <span className="text-[#00ff88] font-medium">Aktif Geliştirme Aşamasında</span>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Bu özellikler yakında kullanıma sunulacak. Güncellemeler için takipte kalın!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tek Çok Yakında Kartı (Sağ Taraf) */}
        <div className="w-80 p-6 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-xl border-l border-[#00ff88]/20">
          <div className="bg-gradient-to-br from-[#00ff88]/10 via-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden h-full">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #00ff88 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
                backgroundSize: '50px 50px'
              }}></div>
            </div>
            
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00ff88]/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-[#00ff88]/30 mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Gelişmiş Özellikler</h3>
                <p className="text-gray-400 text-sm">Çok yakında kullanımda!</p>
              </div>

              {/* Özellik Listesi */}
              <div className="space-y-4 flex-1">
                <div className="bg-white/5 rounded-lg p-4 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📊</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">Oturum Özeti</h4>
                      <p className="text-gray-400 text-xs">Detaylı analiz ve raporlama</p>
                    </div>
                    <div className="text-emerald-400 text-xs">🚀</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm">🎯</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">Günlük Hedefler</h4>
                      <p className="text-gray-400 text-xs">Akıllı hedef belirleme</p>
                    </div>
                    <div className="text-purple-400 text-xs">🚀</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📈</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">İstatistikler</h4>
                      <p className="text-gray-400 text-xs">Gelişmiş performans takibi</p>
                    </div>
                    <div className="text-blue-400 text-xs">🚀</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm">⚡</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">Son Aktiviteler</h4>
                      <p className="text-gray-400 text-xs">Gerçek zamanlı takip</p>
                    </div>
                    <div className="text-yellow-400 text-xs">🚀</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-pink-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📝</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">Akıllı Notlar</h4>
                      <p className="text-gray-400 text-xs">AI destekli not alma</p>
                    </div>
                    <div className="text-pink-400 text-xs">🚀</div>
                  </div>
                </div>
              </div>

              {/* Alt Bilgi */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ff88]/20 to-purple-500/20 rounded-full border border-[#00ff88]/30">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                  <span className="text-[#00ff88] text-xs font-medium">Geliştiriliyor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

export default ArkadeActiveSession