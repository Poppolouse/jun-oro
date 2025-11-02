import { gameApi } from './api.js'

/**
 * Games Service - Oyun verilerini yönetir
 */
class GamesService {
  constructor() {
    this.cache = new Map()
    this.CACHE_EXPIRY = 5 * 60 * 1000 // 5 dakika
  }

  /**
   * ID'ye göre oyun detaylarını getir
   */
  async getGameById(gameId) {
    try {
      // Cache kontrolü
      const cacheKey = `game_${gameId}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        console.log('✅ Oyun cache\'den alındı:', gameId)
        return cached.data
      }

      console.log('🔍 Database\'den oyun getiriliyor:', gameId)
      const response = await gameApi.getGame(gameId)
      
      if (response.success && response.data) {
        // Cache'e kaydet
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })
        
        console.log('✅ Oyun database\'den alındı:', response.data.name)
        return response.data
      }
      
      console.warn('⚠️ Oyun bulunamadı:', gameId)
      return null
      
    } catch (error) {
      console.error('❌ Oyun getirme hatası:', error)
      return null
    }
  }

  /**
   * Oyun arama
   */
  async searchGames(query, options = {}) {
    try {
      const response = await gameApi.getGames({ q: query, ...options })
      return response.success ? response.data : []
    } catch (error) {
      console.error('❌ Oyun arama hatası:', error)
      return []
    }
  }

  /**
   * Oyun önerileri getir
   */
  async getSearchSuggestions(query) {
    try {
      const response = await gameApi.getSearchSuggestions(query)
      return response.success ? response.data : []
    } catch (error) {
      console.error('❌ Oyun önerileri hatası:', error)
      return []
    }
  }

  /**
   * Oyun istatistikleri getir
   */
  async getGameStats(gameId) {
    try {
      const response = await gameApi.getGameStats(gameId)
      return response.success ? response.data : null
    } catch (error) {
      console.error('❌ Oyun istatistikleri hatası:', error)
      return null
    }
  }

  /**
   * Oyun oluştur veya güncelle
   */
  async saveGame(gameData) {
    try {
      const response = await gameApi.upsertGame(gameData)
      
      if (response.success) {
        // Cache'i temizle
        this.cache.delete(`game_${gameData.id}`)
        console.log('✅ Oyun kaydedildi:', response.data.name)
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('❌ Oyun kaydetme hatası:', error)
      return null
    }
  }

  /**
   * Oyun güncelle
   */
  async updateGame(gameId, updateData) {
    try {
      const response = await gameApi.updateGame(gameId, updateData)
      
      if (response.success) {
        // Cache'i temizle
        this.cache.delete(`game_${gameId}`)
        console.log('✅ Oyun güncellendi:', response.data.name)
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('❌ Oyun güncelleme hatası:', error)
      return null
    }
  }

  /**
   * Cache'i temizle
   */
  clearCache() {
    this.cache.clear()
    console.log('🗑️ Games cache temizlendi')
  }

  /**
   * Belirli bir oyunun cache'ini temizle
   */
  clearGameCache(gameId) {
    this.cache.delete(`game_${gameId}`)
    console.log('🗑️ Oyun cache\'i temizlendi:', gameId)
  }
}

// Singleton instance
const gamesService = new GamesService()

export default gamesService