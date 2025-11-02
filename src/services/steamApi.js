import { apiKeyService } from './apiKeys.js';

class SteamApiService {
  constructor() {
    this.baseUrl = 'https://store.steampowered.com/api'
    this.corsProxies = [
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.allorigins.win/raw?url=',
      'https://thingproxy.freeboard.io/fetch/'
    ]
    this.currentProxyIndex = 0
    this.apiKey = '5C002F6B38021E0A64177095D5FD9476' // Default fallback API Key
    this.storeUrl = 'https://store.steampowered.com'
    this.searchUrl = 'https://steamcommunity.com/actions/SearchApps'
    this.webApiUrl = 'https://api.steampowered.com'
    
    // Initialize API key from database
    this.initializeApiKey()
  }

  // Initialize API key from database or localStorage (migration)
  async initializeApiKey() {
    try {
      // Try to get API key from database first
      const dbApiKey = await apiKeyService.getSteamApiKey()
      if (dbApiKey) {
        this.apiKey = dbApiKey
        return
      }

      // Fallback to localStorage for migration
      const localStorageKey = localStorage.getItem('steam_api_key') || localStorage.getItem('steamApiKey')
      if (localStorageKey && localStorageKey !== this.apiKey) {
        // Migrate to database
        try {
          await apiKeyService.setSteamApiKey(localStorageKey, null, true) // Set as global key
          this.apiKey = localStorageKey
          // Clean up localStorage
          localStorage.removeItem('steam_api_key')
          localStorage.removeItem('steamApiKey')
        } catch (error) {
          console.warn('Failed to migrate Steam API key to database:', error)
          this.apiKey = localStorageKey // Use it anyway
        }
      }
    } catch (error) {
      console.warn('Failed to initialize Steam API key from database:', error)
      // Use default key as fallback
    }
  }

  // API key yönetimi
  async setApiKey(apiKey) {
    try {
      // Save to database
      await apiKeyService.setSteamApiKey(apiKey, null, true)
      this.apiKey = apiKey
    } catch (error) {
      console.error('Failed to save Steam API key to database:', error)
      // Fallback to localStorage for backward compatibility
      this.apiKey = apiKey
      localStorage.setItem('steam_api_key', apiKey)
    }
  }

  async loadApiKey() {
    await this.initializeApiKey()
  }

  async clearApiKey() {
    try {
      // Try to delete from database
      const keys = await apiKeyService.getApiKeys()
      const steamKey = keys.data?.find(key => key.serviceName === 'steam')
      if (steamKey) {
        await apiKeyService.deleteApiKey(steamKey.id)
      }
    } catch (error) {
      console.warn('Failed to delete Steam API key from database:', error)
    }
    
    // Reset to default
    this.apiKey = '5C002F6B38021E0A64177095D5FD9476'
    localStorage.removeItem('steam_api_key')
    localStorage.removeItem('steamApiKey')
  }

  // CORS proxy ile request yap (fallback proxy'ler ile)
  async makeRequest(url, timeout = 10000) {
    let lastError = null

    // Tüm proxy'leri dene
    for (let i = 0; i < this.corsProxies.length; i++) {
      const proxyIndex = (this.currentProxyIndex + i) % this.corsProxies.length
      const proxy = this.corsProxies[proxyIndex]

      // Bazı proxy'ler URL'yi encode edilmiş bekler (örn. corsproxy.io, allorigins)
      const needsEncoding = proxy.endsWith('?') || proxy.includes('allorigins.win')
      const proxyUrl = needsEncoding ? `${proxy}${encodeURIComponent(url)}` : `${proxy}${url}`

      try {
        console.log(`🌐 Steam API isteği (Proxy ${proxyIndex + 1}):`, url)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        // Yanıtı JSON olarak parse et, değilse text'ten dene
        const contentType = response.headers.get('content-type') || ''
        let data
        if (contentType.includes('application/json')) {
          data = await response.json()
        } else {
          const text = await response.text()
          try {
            data = JSON.parse(text)
          } catch (e) {
            throw new Error('Steam API yanıtı geçerli JSON değil')
          }
        }

        // Başarılı proxy'yi kaydet ve veriyi döndür
        this.currentProxyIndex = proxyIndex
        console.log(`✅ Proxy ${proxyIndex + 1} başarılı`)
        return data
      } catch (error) {
        lastError = error
        console.warn(`❌ Proxy ${proxyIndex + 1} başarısız:`, error.message)
        continue
      }
    }

    // Tüm proxy'ler başarısız olursa hata fırlat
    console.error('❌ Tüm Steam API proxy\'leri başarısız')
    throw lastError || new Error('Steam API erişilemez')
  }

  // Bağlantı testi
  async testConnection() {
    try {
      console.log('🔍 Steam API bağlantısı test ediliyor...')
      const testUrl = `${this.webApiUrl}/ISteamApps/GetAppList/v2/?key=${this.apiKey}&format=json&max_length=10`
      const response = await this.makeRequest(testUrl, 5000)
      
      if (response && response.applist) {
        console.log('✅ Steam API bağlantısı başarılı!')
        return { success: true, message: 'Steam API bağlantısı başarılı' }
      } else {
        throw new Error('Steam API yanıtı beklenmeyen formatta')
      }
    } catch (error) {
      console.error('❌ Steam API bağlantı hatası:', error.message)
      return { success: false, message: error.message }
    }
  }

  /**
   * Steam ID çözümlemesi
   * Kullanıcı girdisi: Steam64 ID (17 haneli sayı), vanity (kısa ad), veya profil URL
   * Örnekler:
   * - 76561198000000000
   * - poppolouse
   * - https://steamcommunity.com/id/poppolouse/
   * - https://steamcommunity.com/profiles/76561198000000000
   */
  async resolveSteamId(input) {
    try {
      if (!input || typeof input !== 'string') {
        throw new Error('Geçerli bir Steam ID/Vanity/URL giriniz')
      }

      const trimmed = input.trim()

      // Profil URL ise ayrıştır
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed)
        // /profiles/<steam64>
        const profilesMatch = url.pathname.match(/\/profiles\/(\d{16,20})/)
        if (profilesMatch) {
          return { success: true, steamId: profilesMatch[1], type: 'steam64_url' }
        }
        // /id/<vanity>
        const vanityMatch = url.pathname.match(/\/id\/([^\/]+)/)
        if (vanityMatch) {
          const vanity = vanityMatch[1]
          const resolved = await this.resolveVanity(vanity)
          if (!resolved.success) throw new Error(resolved.message || 'Vanity çözümlenemedi')
          return { success: true, steamId: resolved.steamId, type: 'vanity_url' }
        }
        throw new Error('Profil URL formatı geçersiz veya desteklenmiyor')
      }

      // Tamamen sayı ise Steam64 ID olarak algıla
      if (/^\d{16,20}$/.test(trimmed)) {
        return { success: true, steamId: trimmed, type: 'steam64' }
      }

      // Aksi halde vanity olarak çözümle
      const resolved = await this.resolveVanity(trimmed)
      if (!resolved.success) throw new Error(resolved.message || 'Vanity çözümlenemedi')
      return { success: true, steamId: resolved.steamId, type: 'vanity' }
    } catch (error) {
      console.error('❌ Steam ID çözümleme hatası:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Vanity -> Steam64 ID çözümleme
  async resolveVanity(vanity) {
    try {
      if (!vanity || vanity.trim().length === 0) {
        throw new Error('Vanity boş olamaz')
      }
      const url = `${this.webApiUrl}/ISteamUser/ResolveVanityURL/v0001/?key=${this.apiKey}&vanityurl=${encodeURIComponent(vanity.trim())}`
      const response = await this.makeRequest(url, 8000)
      const data = response?.response
      if (data?.success === 1 && data?.steamid) {
        return { success: true, steamId: data.steamid }
      }
      const message = data?.message || 'Vanity çözümlenemedi'
      return { success: false, message }
    } catch (error) {
      console.warn('⚠️ ResolveVanityURL hatası:', error.message)
      return { success: false, message: error.message }
    }
  }

  /**
   * Kullanıcının sahip olduğu oyunları getirir
   * include_appinfo=true ile isim bilgisi dahil edilir
   */
  async getOwnedGames(steamId) {
    try {
      if (!steamId) throw new Error('Steam ID gerekli')
      const url = `${this.webApiUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`
      const response = await this.makeRequest(url, 10000)
      const games = response?.response?.games || []
      console.log(`✅ Steam owned games: ${games.length} bulundu`)
      // Normalize
      return games.map(g => ({
        appid: String(g.appid),
        name: g.name,
        playtime_forever: Number(g.playtime_forever || 0),
        img_icon_url: g.img_icon_url || null,
        img_logo_url: g.img_logo_url || null
      }))
    } catch (error) {
      if (error.message.includes('403')) {
        console.warn('⚠️ Steam owned games hatası (403): Profil gizli olabilir veya API anahtarı gerekli')
      } else if (error.message.includes('429')) {
        console.warn('⚠️ Steam owned games hatası (429): Rate limit aşıldı')
      } else {
        console.error('❌ Steam owned games hatası:', error.message)
      }
      return []
    }
  }

  /**
   * Header image URL oluşturucu (CDN)
   */
  getHeaderImageUrl(appId) {
    return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
  }

  // Oyun arama
  async searchGame(gameName) {
    try {
      if (!gameName || gameName.trim().length < 2) {
        return []
      }

      console.log('🔍 Steam\'de oyun aranıyor:', gameName)
      
      // Steam Store Search API kullan
      const searchUrl = `${this.searchUrl}/${encodeURIComponent(gameName.trim())}`
      const response = await this.makeRequest(searchUrl, 8000)
      
      if (!response || !Array.isArray(response)) {
        console.warn('⚠️ Steam arama yanıtı beklenmeyen formatta')
        return []
      }

      // Sonuçları formatla
      const games = response.slice(0, 10).map(game => ({
        id: game.appid,
        name: game.name,
        source: 'steam',
        type: 'game'
      }))

      console.log(`✅ Steam'de ${games.length} oyun bulundu`)
      return games

    } catch (error) {
      console.error('❌ Steam oyun arama hatası:', error.message)
      return []
    }
  }

  // Oyun detayları
  async getGameDetails(appId) {
    try {
      console.log('📋 Steam oyun detayları alınıyor:', appId)
      
      const detailsUrl = `${this.storeUrl}/api/appdetails?appids=${appId}&l=turkish`
      const response = await this.makeRequest(detailsUrl)
      
      if (!response || !response[appId] || !response[appId].success) {
        throw new Error('Steam oyun detayları alınamadı')
      }

      const gameData = response[appId].data
      
      return {
        id: gameData.steam_appid,
        name: gameData.name,
        description: gameData.short_description || gameData.detailed_description || '',
        releaseDate: gameData.release_date?.date || '',
        developer: gameData.developers?.[0] || '',
        publisher: gameData.publishers?.[0] || '',
        genres: gameData.genres?.map(g => g.description) || [],
        platforms: {
          windows: gameData.platforms?.windows || false,
          mac: gameData.platforms?.mac || false,
          linux: gameData.platforms?.linux || false
        },
        price: gameData.price_overview ? {
          currency: gameData.price_overview.currency,
          initial: gameData.price_overview.initial,
          final: gameData.price_overview.final,
          discount_percent: gameData.price_overview.discount_percent
        } : null,
        screenshots: gameData.screenshots?.map(s => s.path_full) || [],
        header_image: gameData.header_image || '',
        source: 'steam'
      }

    } catch (error) {
      console.error('❌ Steam oyun detayları hatası:', error.message)
      
      // Fallback: Temel oyun bilgilerini döndür
      console.log('🔄 Steam API erişilemez, fallback data kullanılıyor')
      
      // Popüler oyunlar için gerçekçi fallback data
      const fallbackGames = {
        '730': { name: 'Counter-Strike 2', developer: 'Valve', publisher: 'Valve' },
        '440': { name: 'Team Fortress 2', developer: 'Valve', publisher: 'Valve' },
        '570': { name: 'Dota 2', developer: 'Valve', publisher: 'Valve' },
        '1172470': { name: 'Apex Legends', developer: 'Respawn Entertainment', publisher: 'Electronic Arts' },
        '271590': { name: 'Grand Theft Auto V', developer: 'Rockstar North', publisher: 'Rockstar Games' },
        '1091500': { name: 'Cyberpunk 2077', developer: 'CD PROJEKT RED', publisher: 'CD PROJEKT RED' },
        '1174180': { name: 'Red Dead Redemption 2', developer: 'Rockstar Games', publisher: 'Rockstar Games' },
        '292030': { name: 'The Witcher 3: Wild Hunt', developer: 'CD PROJEKT RED', publisher: 'CD PROJEKT RED' }
      }
      
      const fallbackData = fallbackGames[appId] || { 
        name: `Steam Game ${appId}`, 
        developer: 'Indie Developer', 
        publisher: 'Independent Publisher' 
      }
      
      return {
        id: appId,
        name: fallbackData.name,
        description: 'Steam API erişilemediği için açıklama alınamadı.',
        releaseDate: new Date().getFullYear().toString(),
        developer: fallbackData.developer,
        publisher: fallbackData.publisher,
        genres: ['Action', 'Adventure'],
        platforms: {
          windows: true,
          mac: false,
          linux: false
        },
        price: null,
        screenshots: [],
        header_image: '',
        source: 'steam_fallback'
      }
    }
  }

  // DLC'leri getir
  async getGameDLCs(appId) {
    try {
      console.log('🎮 Steam DLC\'leri alınıyor:', appId)
      
      const detailsUrl = `${this.storeUrl}/api/appdetails?appids=${appId}&l=turkish`
      const response = await this.makeRequest(detailsUrl)
      
      if (!response || !response[appId] || !response[appId].success) {
        return []
      }

      const gameData = response[appId].data
      const dlcs = gameData.dlc || []
      
      if (dlcs.length === 0) {
        return []
      }

      // DLC detaylarını toplu al (maksimum 20 DLC)
      const dlcIds = dlcs.slice(0, 20)
      const dlcDetailsUrl = `${this.storeUrl}/api/appdetails?appids=${dlcIds.join(',')}&l=turkish`
      const dlcResponse = await this.makeRequest(dlcDetailsUrl)
      
      const dlcList = []
      
      for (const dlcId of dlcIds) {
        if (dlcResponse[dlcId] && dlcResponse[dlcId].success) {
          const dlcData = dlcResponse[dlcId].data
          dlcList.push({
            id: dlcData.steam_appid,
            name: dlcData.name,
            description: dlcData.short_description || '',
            releaseDate: dlcData.release_date?.date || '',
            price: dlcData.price_overview ? {
              currency: dlcData.price_overview.currency,
              final: dlcData.price_overview.final,
              discount_percent: dlcData.price_overview.discount_percent
            } : null,
            header_image: dlcData.header_image || '',
            type: dlcData.type || 'DLC',
            source: 'steam'
          })
        }
      }

      console.log(`✅ Steam'den ${dlcList.length} DLC bulundu`)
      return dlcList

    } catch (error) {
      if (error.message.includes('400')) {
        console.warn('⚠️ Steam DLC alma hatası (HTTP 400): Geçersiz App ID veya API limiti')
      } else if (error.message.includes('403')) {
        console.warn('⚠️ Steam DLC alma hatası (HTTP 403): Erişim reddedildi - API anahtarı gerekli olabilir')
      } else if (error.message.includes('429')) {
        console.warn('⚠️ Steam DLC alma hatası (HTTP 429): Rate limit aşıldı')
      } else {
        console.warn('⚠️ Steam DLC alma hatası:', error.message)
      }
      return []
    }
  }

  // IGDB oyunu için Steam DLC'lerini bul
  async getDLCsForGame(igdbGameName) {
    try {
      console.log('🔍 IGDB oyunu için Steam DLC\'leri aranıyor:', igdbGameName)
      
      // Önce oyunu Steam'de ara
      const searchResults = await this.searchGame(igdbGameName)
      
      if (searchResults.length === 0) {
        console.log('⚠️ Steam\'de oyun bulunamadı')
        return []
      }

      // İlk sonucun DLC'lerini al
      const steamGame = searchResults[0]
      const dlcs = await this.getGameDLCs(steamGame.id)
      
      return dlcs

    } catch (error) {
      if (error.message.includes('400') || error.message.includes('404')) {
        console.warn('⚠️ IGDB oyunu için Steam DLC alma hatası: Oyun Steam\'de bulunamadı')
      } else {
        console.error('❌ IGDB oyunu için Steam DLC alma hatası:', error.message)
      }
      return []
    }
  }

  // Oyun fiyatı
  async getGamePrice(appId) {
    try {
      const detailsUrl = `${this.storeUrl}/api/appdetails?appids=${appId}&l=turkish`
      const response = await this.makeRequest(detailsUrl)
      
      if (!response || !response[appId] || !response[appId].success) {
        return null
      }

      const gameData = response[appId].data
      return gameData.price_overview || null

    } catch (error) {
      console.error('❌ Steam fiyat alma hatası:', error.message)
      return null
    }
  }
}

// Singleton instance oluştur ve export et
const steamApi = new SteamApiService()
export default steamApi