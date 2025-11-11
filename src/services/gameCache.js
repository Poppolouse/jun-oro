/**
 * Oyun Cache Sistemi
 * Oyun verilerini localStorage'da saklar ve yönetir
 * API çağrılarını azaltır ve performansı artırır
 */

class GameCacheService {
  constructor() {
    this.CACHE_KEY = "arkade_game_cache";
    this.CACHE_VERSION = "1.0";
    this.MAX_CACHE_SIZE = 1000; // Maksimum cache'lenecek oyun sayısı
    this.CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 gün (ms)
  }

  /**
   * Cache'i başlat ve temizle
   */
  initializeCache() {
    try {
      const cache = this.getCache();
      if (!cache.version || cache.version !== this.CACHE_VERSION) {
        this.clearCache();
        this.saveCache({
          version: this.CACHE_VERSION,
          games: {},
          lastCleanup: Date.now(),
        });
      }

      // Eski verileri temizle
      this.cleanupExpiredGames();
    } catch (error) {
      console.error("Cache baslatma hatasi:", error);
      this.clearCache();
    }
  }

  /**
   * Cache'den oyun al
   */
  getGame(gameId) {
    try {
      const cache = this.getCache();
      const game = cache.games[gameId];

      if (!game) return null;

      // Süre kontrolü
      if (Date.now() - game.cachedAt > this.CACHE_EXPIRY) {
        this.removeGame(gameId);
        return null;
      }

      return game.data;
    } catch (error) {
      console.error("Cache den oyun alma hatasi:", error);
      return null;
    }
  }

  /**
   * Oyunu cache'e ekle
   */
  addGame(gameId, gameData) {
    try {
      const cache = this.getCache();

      // Cache boyut kontrolü
      if (Object.keys(cache.games).length >= this.MAX_CACHE_SIZE) {
        this.cleanupOldestGames();
      }

      // Oyun verisini cache'e ekle
      cache.games[gameId] = {
        data: this.sanitizeGameData(gameData),
        cachedAt: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      this.saveCache(cache);
      console.log(`🎮 Oyun cache'e eklendi: ${gameData.name} (ID: ${gameId})`);
    } catch (error) {
      console.error("Cache e oyun ekleme hatasi:", error);
    }
  }

  /**
   * Oyun verisini temizle (gereksiz alanları kaldır)
   */
  sanitizeGameData(gameData) {
    return {
      id: gameData.id,
      name: gameData.name,
      cover: gameData.cover,
      first_release_date: gameData.first_release_date,
      genres: gameData.genres,
      platforms: gameData.platforms,
      summary: gameData.summary,
      rating: gameData.rating,
      rating_count: gameData.rating_count,
      screenshots: gameData.screenshots,
      videos: gameData.videos,
      involved_companies: gameData.involved_companies,
      game_modes: gameData.game_modes,
      themes: gameData.themes,
      category: gameData.category,
      parent_game: gameData.parent_game,
      version_parent: gameData.version_parent,
      dlcs: gameData.dlcs,
      expansions: gameData.expansions,
      campaigns: gameData.campaigns || [], // Campaign verilerini sakla
      selectedDlcs: gameData.selectedDlcs || [], // Seçilen DLC'leri sakla
      gameVariants: gameData.gameVariants || null, // Oyun varyantlarını sakla
      steamDlcs: gameData.steamDlcs || [], // Steam DLC'lerini sakla
      dlcSource: gameData.dlcSource || null, // DLC kaynağını sakla
      // Geliştirici bilgilerini koru
      developer: gameData.developer,
      developers: gameData.developers,
      steamData: gameData.steamData,
      publisher: gameData.publisher,
      publishers: gameData.publishers,
    };
  }

  /**
   * Cache'den oyun kaldır
   */
  removeGame(gameId) {
    try {
      const cache = this.getCache();
      delete cache.games[gameId];
      this.saveCache(cache);
    } catch (error) {
      console.error("Cache den oyun kaldirma hatasi:", error);
    }
  }

  /**
   * Süresi dolmuş oyunları temizle
   */
  cleanupExpiredGames() {
    try {
      const cache = this.getCache();
      const now = Date.now();
      let cleanedCount = 0;

      for (const [gameId, gameCache] of Object.entries(cache.games)) {
        if (now - gameCache.cachedAt > this.CACHE_EXPIRY) {
          delete cache.games[gameId];
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        cache.lastCleanup = now;
        this.saveCache(cache);
        console.log(
          `🧹 ${cleanedCount} süresi dolmuş oyun cache'den temizlendi`,
        );
      }
    } catch (error) {
      console.error("Cache temizleme hatasi:", error);
    }
  }

  /**
   * En eski oyunları temizle (cache boyutu kontrolü için)
   */
  cleanupOldestGames() {
    try {
      const cache = this.getCache();
      const games = Object.entries(cache.games);

      // En az erişilen ve en eski oyunları bul
      games.sort((a, b) => {
        const aScore =
          a[1].accessCount * 0.3 + (Date.now() - a[1].lastAccessed) * 0.7;
        const bScore =
          b[1].accessCount * 0.3 + (Date.now() - b[1].lastAccessed) * 0.7;
        return bScore - aScore;
      });

      // En eski %20'sini sil
      const toDelete = Math.floor(games.length * 0.2);
      for (let i = 0; i < toDelete; i++) {
        delete cache.games[games[i][0]];
      }

      this.saveCache(cache);
      console.log(`🧹 ${toDelete} eski oyun cache'den temizlendi`);
    } catch (error) {
      console.error("Eski oyun temizleme hatasi:", error);
    }
  }

  /**
   * Cache istatistikleri
   */
  getCacheStats() {
    try {
      const cache = this.getCache();
      const games = Object.values(cache.games);

      return {
        totalGames: games.length,
        cacheSize: JSON.stringify(cache).length,
        oldestGame:
          games.length > 0 ? Math.min(...games.map((g) => g.cachedAt)) : null,
        newestGame:
          games.length > 0 ? Math.max(...games.map((g) => g.cachedAt)) : null,
        lastCleanup: cache.lastCleanup,
      };
    } catch (error) {
      console.error("Cache istatistik hatasi:", error);
      return null;
    }
  }

  /**
   * Cache'i localStorage'dan al
   */
  getCache() {
    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY);
      return cacheData
        ? JSON.parse(cacheData)
        : { version: this.CACHE_VERSION, games: {}, lastCleanup: Date.now() };
    } catch (error) {
      console.error("Cache okuma hatasi:", error);
      return {
        version: this.CACHE_VERSION,
        games: {},
        lastCleanup: Date.now(),
      };
    }
  }

  /**
   * Cache'i localStorage'a kaydet
   */
  saveCache(cache) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Cache kaydetme hatasi:", error);
      // Storage dolu ise eski verileri temizle
      if (error.name === "QuotaExceededError") {
        this.cleanupOldestGames();
      }
    }
  }

  /**
   * Cache'i tamamen temizle
   */
  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log("🧹 Oyun cache tamamen temizlendi");
    } catch (error) {
      console.error("Cache temizleme hatasi:", error);
    }
  }
}

// Singleton instance
const gameCache = new GameCacheService();
gameCache.initializeCache();

export default gameCache;
