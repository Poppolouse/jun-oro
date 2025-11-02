class CacheService {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 2 * 60 * 1000 // 2 dakika (milisaniye)
  }

  // Cache'e veri ekle
  set(key, data, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl
    this.cache.set(key, {
      data,
      expiresAt
    })
    
    console.log(`📦 Cache'e eklendi: ${key} (${ttl/1000}s TTL)`)
  }

  // Cache'den veri al
  get(key) {
    const cached = this.cache.get(key)
    
    if (!cached) {
      console.log(`❌ Cache miss: ${key}`)
      return null
    }
    
    // Süre dolmuş mu kontrol et
    if (Date.now() > cached.expiresAt) {
      console.log(`⏰ Cache expired: ${key}`)
      this.cache.delete(key)
      return null
    }
    
    console.log(`✅ Cache hit: ${key}`)
    return cached.data
  }

  // Cache'den veri sil
  delete(key) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      console.log(`🗑️ Cache'den silindi: ${key}`)
    }
    return deleted
  }

  // Tüm cache'i temizle
  clear() {
    const size = this.cache.size
    this.cache.clear()
    console.log(`🧹 Cache temizlendi (${size} item)`)
  }

  // Süresi dolmuş cache'leri temizle
  cleanup() {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 ${cleanedCount} süresi dolmuş cache temizlendi`)
    }
    
    return cleanedCount
  }

  // Cache istatistikleri
  getStats() {
    const now = Date.now()
    let activeCount = 0
    let expiredCount = 0
    
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        expiredCount++
      } else {
        activeCount++
      }
    }
    
    return {
      total: this.cache.size,
      active: activeCount,
      expired: expiredCount
    }
  }

  // Cache key'leri listele
  getKeys() {
    return Array.from(this.cache.keys())
  }

  // Belirli bir prefix ile başlayan cache'leri sil
  deleteByPrefix(prefix) {
    let deletedCount = 0
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🗑️ ${prefix}* prefix'li ${deletedCount} cache silindi`)
    }
    
    return deletedCount
  }

  // Oyun DLC'leri için özel cache key oluştur
  getDLCCacheKey(gameId, gameName) {
    return `dlc_${gameId}_${gameName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  }

  // Oyun versiyonları için özel cache key oluştur
  getVersionsCacheKey(gameId, gameName) {
    return `versions_${gameId}_${gameName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  }

  // Oyun detayları için özel cache key oluştur
  getGameDetailsCacheKey(gameId) {
    return `game_details_${gameId}`
  }

  // DLC/versiyon verilerini düşük çözünürlük kapak görselleri ile cache'le
  setDLCWithLowResCovers(key, dlcData, ttl = this.defaultTTL) {
    if (!dlcData || !Array.isArray(dlcData)) {
      return this.set(key, dlcData, ttl)
    }

    // DLC verilerini düşük çözünürlük kapak görselleri ile optimize et
    const optimizedDlcData = dlcData.map(dlc => {
      const optimizedDlc = { ...dlc }
      
      // Kapak görselini düşük çözünürlük yap
      if (dlc.cover?.url) {
        optimizedDlc.cover = {
          ...dlc.cover,
          url: dlc.cover.url.replace('t_1080p', 't_cover_small')
        }
      }

      // Header image'ı düşük çözünürlük yap (Steam DLC'leri için)
      if (dlc.header_image) {
        // Steam header image'ları için boyut optimizasyonu
        optimizedDlc.header_image = dlc.header_image.replace('header.jpg', 'header_292x136.jpg')
      }

      // Gereksiz büyük verileri kaldır
      delete optimizedDlc.screenshots
      delete optimizedDlc.videos
      delete optimizedDlc.artworks
      
      return optimizedDlc
    })

    console.log(`📦 DLC cache'lendi (${dlcData.length} → ${optimizedDlcData.length} items, düşük çözünürlük)`)
    return this.set(key, optimizedDlcData, ttl)
  }

  // Versiyon verilerini düşük çözünürlük kapak görselleri ile cache'le
  setVersionsWithLowResCovers(key, versionData, ttl = this.defaultTTL) {
    if (!versionData || typeof versionData !== 'object') {
      return this.set(key, versionData, ttl)
    }

    const optimizedVersionData = {
      dlcs: this.optimizeGameArray(versionData.dlcs || []),
      expansions: this.optimizeGameArray(versionData.expansions || []),
      editions: this.optimizeGameArray(versionData.editions || [])
    }

    console.log(`📦 Version cache'lendi (düşük çözünürlük)`)
    return this.set(key, optimizedVersionData, ttl)
  }

  // Oyun dizisini optimize et (kapak görselleri düşük çözünürlük)
  optimizeGameArray(gameArray) {
    if (!Array.isArray(gameArray)) return []
    
    return gameArray.map(game => {
      const optimizedGame = { ...game }
      
      // Kapak görselini düşük çözünürlük yap
      if (game.cover?.url) {
        optimizedGame.cover = {
          ...game.cover,
          url: game.cover.url.replace('t_1080p', 't_cover_small')
        }
      }

      // Gereksiz büyük verileri kaldır
      delete optimizedGame.screenshots
      delete optimizedGame.videos
      delete optimizedGame.artworks
      
      return optimizedGame
    })
  }
}

// Otomatik temizlik (her 5 dakikada bir)
const cacheService = new CacheService()

// Periyodik temizlik
setInterval(() => {
  cacheService.cleanup()
}, 5 * 60 * 1000) // 5 dakika

export default cacheService