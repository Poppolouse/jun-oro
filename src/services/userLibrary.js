/**
 * Kullanıcı Kütüphanesi Sistemi
 * Her kullanıcının kendi oyun kütüphanesini yönetir
 * API tabanlı veri saklama
 */

import { userApi, libraryApi, gameApi } from "./api.js";

class UserLibraryService {
  constructor() {
    this.USER_KEY = "arkade_user";
    this.LEGACY_KEY = "arkade_current_user";
    this.currentUser = null;
    this.initializeUser();
  }

  /**
   * Parse playtime string to minutes
   */
  _parsePlaytime(playtimeStr) {
    if (!playtimeStr || typeof playtimeStr !== "string") return 0;

    const str = playtimeStr.toLowerCase().trim();
    if (!str) return 0;

    // Regex patterns for different formats
    const patterns = [
      // "25 saat", "2.5 saat", "1,5 saat"
      { regex: /(\d+(?:[.,]\d+)?)\s*(?:saat|hour|h|hr|hrs)/, multiplier: 60 },
      // "150 dakika", "90 dk", "45 min"
      {
        regex: /(\d+(?:[.,]\d+)?)\s*(?:dakika|minute|min|dk|m)/,
        multiplier: 1,
      },
      // Sadece sayı (varsayılan olarak saat kabul et)
      { regex: /^(\d+(?:[.,]\d+)?)$/, multiplier: 60 },
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern.regex);
      if (match) {
        const number = parseFloat(match[1].replace(",", "."));
        return Math.round(number * pattern.multiplier);
      }
    }

    return 0;
  }

  /**
   * Build structured metadata tags object from AddGameModal payload
   */
  _buildMetadataTags(gameData) {
    try {
      if (!gameData || typeof gameData !== "object") return undefined;

      const platform =
        gameData.platform ||
        (Array.isArray(gameData.platforms) && gameData.platforms.length > 0
          ? gameData.platforms[0]?.name || gameData.platforms[0]
          : undefined);
      const campaigns = Array.isArray(gameData.campaigns)
        ? gameData.campaigns
        : undefined;
      const selectedDlcs = Array.isArray(gameData.selectedDlcs)
        ? gameData.selectedDlcs
        : undefined;
      const steamDlcs = Array.isArray(gameData.steamDlcs)
        ? gameData.steamDlcs
        : undefined;
      const gameVariants =
        gameData.gameVariants && typeof gameData.gameVariants === "object"
          ? gameData.gameVariants
          : undefined;
      const dlcSource =
        steamDlcs && steamDlcs.length > 0
          ? "steam"
          : selectedDlcs && selectedDlcs.length > 0
            ? "igdb"
            : undefined;

      const meta = {
        platform,
        status: gameData.status,
        version: gameData.version,
        totalPlaytime: gameData.totalPlaytime,
        campaigns,
        selectedDlcs,
        steamDlcs,
        gameVariants,
        dlcSource,
        metadataVersion: "1.0",
        createdAt: new Date().toISOString(),
      };

      // Remove undefined keys to keep payload clean
      Object.keys(meta).forEach((k) => meta[k] === undefined && delete meta[k]);
      return Object.keys(meta).length > 0 ? meta : undefined;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Kullanıcıyı başlat
   */
  async initializeUser() {
    try {
      // LocalStorage'dan kullanıcıyı oku (öncelik yeni anahtar)
      const modernData = localStorage.getItem(this.USER_KEY);
      const legacyData = localStorage.getItem(this.LEGACY_KEY);

      if (modernData) {
        try {
          const parsed = JSON.parse(modernData);
          const id = parsed?.id || parsed?.data?.id || parsed?.user?.id;
          if (id) {
            // Backend'den kullanıcıyı yenile, bulunamazsa yereldeki veriyi koru
            try {
              const response = await userApi.getUser(id);
              this.currentUser = response.data;
              await userApi.updateActivity(id);
            } catch (e) {
              console.warn(
                "Backend user not found or unreachable; using local user",
                e,
              );
              this.currentUser = parsed;
            }
          } else {
            // Tam kullanıcı objesi saklandıysa direkt kullan
            this.currentUser = parsed;
            if (parsed?.id) {
              await userApi.updateActivity(parsed.id);
            }
          }
        } catch (e) {
          console.error("Kullanıcı bilgileri parse edilemedi:", e);
          localStorage.removeItem(this.USER_KEY);
        }
      } else if (legacyData) {
        const legacyParsed = JSON.parse(legacyData);
        const id = legacyParsed?.id;
        if (id) {
          try {
            const response = await userApi.getUser(id);
            this.currentUser = response.data;
            await userApi.updateActivity(id);
            // Geçiş: modern anahtarı da güncelle
            localStorage.setItem(
              this.USER_KEY,
              JSON.stringify(this.currentUser),
            );
          } catch (e) {
            console.warn("Legacy user not found; not auto-creating", e);
            this.currentUser = null;
          }
        }
      } else {
        // Otomatik kullanıcı oluşturma devre dışı: kullanıcıyı null bırak
        this.currentUser = null;
      }
    } catch (error) {
      console.error("Kullanıcı başlatma hatası:", error);
      // Otomatik oluşturma yapma, kullanıcıyı null bırak
      this.currentUser = null;
    }
  }

  /**
   * Yeni kullanıcı oluştur
   */
  async createNewUser() {
    const userData = {
      name: "Oyuncu",
    };

    const response = await userApi.createUser(userData);
    console.log("🎮 Yeni kullanıcı oluşturuldu:", response.data.id);
    return response.data;
  }

  /**
   * Mevcut kullanıcıyı al
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Kullanıcının kütüphanesini al
   */
  async getUserLibrary(filters = {}) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }
      // Otomatik kullanıcı oluşturma kapalı: kullanıcı yoksa boş payload döndür
      if (!this.currentUser?.id) {
        return {
          id: null,
          userId: null,
          entries: [],
          stats: {
            totalGames: 0,
            totalPlaytime: 0,
            lastUpdated: new Date(),
          },
        };
      }
      const response = await libraryApi.getLibrary(
        this.currentUser.id,
        filters,
      );
      const payload = response?.data ?? response;
      // Backend uyumsuzluklarına dayanıklı: entries/pagination/stats alanlarını varsa döndür
      if (payload && (payload.entries || payload.pagination || payload.stats)) {
        return payload;
      }
      return {
        id: null,
        userId: this.currentUser?.id,
        entries: [],
        stats: {
          totalGames: 0,
          totalPlaytime: 0,
          lastUpdated: new Date(),
        },
      };
    } catch (error) {
      console.error("Kütüphane alma hatası:", error);
      // Fallback: boş kütüphane döndür
      return {
        id: null,
        userId: this.currentUser?.id,
        entries: [],
        stats: {
          totalGames: 0,
          totalPlaytime: 0,
          lastUpdated: new Date(),
        },
      };
    }
  }

  /**
   * Kütüphaneye oyun ekle
   */
  async addGameToLibrary(gameData, category = "playing") {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }
      if (!this.currentUser?.id) {
        console.warn("Kullanıcı oturumu yok; kütüphaneye ekleme atlandı");
        return false;
      }

      // Kategori normalize: backend'in beklediği UPPERCASE formata çevir
      const normalizeCategory = (cat) => {
        const map = {
          backlog: "WISHLIST",
          wishlist: "WISHLIST",
          owned: "WISHLIST",
          playing: "PLAYING",
          completed: "COMPLETED",
          dropped: "DROPPED",
          on_hold: "ON_HOLD",
          plan_to_play: "PLAN_TO_PLAY",
        };
        return map[(cat || "").toLowerCase()] || "WISHLIST";
      };
      category = normalizeCategory(category);

      // Önce oyunu veritabanına ekle/güncelle
      // Cover alanını tam URL'e çevir
      const getCoverUrl = (cover) => {
        if (!cover) return null;

        // Eğer string ise ve zaten URL ise direkt döndür
        if (typeof cover === "string") {
          if (cover.startsWith("http")) return cover;
          // Eğer image_id ise tam URL'e çevir
          return `https://images.igdb.com/igdb/image/upload/t_1080p/${cover}.jpg`;
        }

        // Eğer object ise
        if (typeof cover === "object") {
          // Önce URL varsa onu kullan
          if (cover.url && cover.url.startsWith("http")) return cover.url;
          // image_id varsa tam URL'e çevir
          if (cover.image_id)
            return `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`;
          // Fallback olarak url alanını kullan (IGDB'den gelen relative URL'ler için)
          if (cover.url)
            return `https:${cover.url.replace("t_thumb", "t_1080p")}`;
        }

        return null;
      };

      const gameDataForApi = {
        ...gameData,
        id: gameData.id.toString(),
        // Cover alanını tam URL'e çevir
        cover: getCoverUrl(gameData.cover),
        // Genres alanını string array'e çevir
        genres: gameData.genres
          ? gameData.genres.map((genre) =>
              typeof genre === "object"
                ? genre.name || genre.slug || String(genre)
                : String(genre),
            )
          : undefined,
        // Platforms alanını string array'e çevir
        platforms: gameData.platforms
          ? gameData.platforms.map((platform) =>
              typeof platform === "object"
                ? platform.name || platform.slug || String(platform)
                : String(platform),
            )
          : undefined,
        // Developer ve Publisher alanlarını involved_companies'den çıkar
        developer: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.developer)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)[0]
          : undefined,
        developers: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.developer)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)
          : undefined,
        publisher: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.publisher)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)[0]
          : undefined,
        publishers: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.publisher)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)
          : undefined,
      };
      console.log("🔍 API'ye gönderilen oyun verisi:", gameDataForApi);
      await gameApi.upsertGame(gameDataForApi);

      // Kategoriyi normalize et
      const normalizedCategory = normalizeCategory(category);

      // Kütüphane entry'si oluştur
      const libraryEntry = {
        userId: this.currentUser.id,
        gameId: gameData.id.toString(),
        category: normalizedCategory, // Normalize edilmiş kategori kullan
        playtime: this._parsePlaytime(gameData.totalPlaytime) || 0,
        rating: undefined, // null yerine undefined kullan (backend optional olarak bekliyor)
        notes: "",
        progress: 0,
        // Structured metadata from AddGameModal
        tags: this._buildMetadataTags(gameData),
      };

      // Kütüphaneye ekle
      const response = await libraryApi.addToLibrary(libraryEntry);
      console.log(
        `🎮 Oyun kütüphaneye eklendi: ${gameData.name} (${normalizedCategory})`,
      );
      return response.data;
    } catch (error) {
      console.error("Kütüphaneye oyun ekleme hatası:", error);
      return false;
    }
  }

  /**
   * Kütüphaneden oyun kaldır
   */
  async removeGameFromLibrary(gameId) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }
      if (!this.currentUser?.id) {
        console.warn("Kullanıcı oturumu yok; kütüphaneden kaldırma atlandı");
        return false;
      }

      gameId = gameId.toString();
      const response = await libraryApi.removeFromLibrary(
        this.currentUser.id,
        gameId,
      );
      console.log("🗑️ Oyun kütüphaneden kaldırıldı:", gameId);
      return response.data;
    } catch (error) {
      console.error("Kütüphaneden oyun kaldırma hatası:", error);
      return false;
    }
  }

  /**
   * Oyun kategorisini değiştir
   */
  async changeGameCategory(gameId, newCategory) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }

      // Kategori normalize: backend'in beklediği UPPERCASE formata çevir
      const normalizeCategory = (cat) => {
        const map = {
          backlog: "WISHLIST",
          wishlist: "WISHLIST",
          owned: "WISHLIST",
          playing: "PLAYING",
          completed: "COMPLETED",
          dropped: "DROPPED",
          on_hold: "ON_HOLD",
          plan_to_play: "PLAN_TO_PLAY",
        };
        return map[(cat || "").toLowerCase()] || "WISHLIST";
      };
      newCategory = normalizeCategory(newCategory);
      gameId = gameId.toString();

      const updates = { category: newCategory };
      const response = await libraryApi.updateEntry(
        this.currentUser.id,
        gameId,
        updates,
      );
      console.log(
        `📁 Oyun kategorisi değiştirildi: ${gameId} → ${newCategory}`,
      );
      return response.data;
    } catch (error) {
      console.error("Kategori değiştirme hatası:", error);
      return false;
    }
  }

  /**
   * Oyun detaylarını güncelle
   */
  async updateGameDetails(gameId, updates) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }

      gameId = gameId.toString();
      const response = await libraryApi.updateEntry(
        this.currentUser.id,
        gameId,
        updates,
      );
      console.log("📝 Oyun detayları güncellendi:", gameId);
      return response.data;
    } catch (error) {
      console.error("Oyun detayları güncelleme hatası:", error);
      return false;
    }
  }

  /**
   * Kütüphanedeki oyunu güncelle (düzenleme modu için)
   */
  async updateGameInLibrary(gameId, gameData) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }

      gameId = gameId.toString();

      // Önce oyun verilerini güncelle
      // Cover alanını tam URL'e çevir (aynı fonksiyonu kullan)
      const getCoverUrl = (cover) => {
        if (!cover) return null;

        // Eğer string ise ve zaten URL ise direkt döndür
        if (typeof cover === "string") {
          if (cover.startsWith("http")) return cover;
          // Eğer image_id ise tam URL'e çevir
          return `https://images.igdb.com/igdb/image/upload/t_1080p/${cover}.jpg`;
        }

        // Eğer object ise
        if (typeof cover === "object") {
          // Önce URL varsa onu kullan
          if (cover.url && cover.url.startsWith("http")) return cover.url;
          // image_id varsa tam URL'e çevir
          if (cover.image_id)
            return `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`;
          // Fallback olarak url alanını kullan (IGDB'den gelen relative URL'ler için)
          if (cover.url)
            return `https:${cover.url.replace("t_thumb", "t_1080p")}`;
        }

        return null;
      };

      const gameDataForApi = {
        ...gameData,
        id: gameId,
        // Cover alanını tam URL'e çevir
        cover: getCoverUrl(gameData.cover),
        // Genres alanını string array'e çevir
        genres: gameData.genres
          ? gameData.genres.map((genre) =>
              typeof genre === "object"
                ? genre.name || genre.slug || String(genre)
                : String(genre),
            )
          : undefined,
        // Platforms alanını string array'e çevir
        platforms: gameData.platforms
          ? gameData.platforms.map((platform) =>
              typeof platform === "object"
                ? platform.name || platform.slug || String(platform)
                : String(platform),
            )
          : undefined,
        // Developer ve Publisher alanlarını involved_companies'den çıkar
        developer: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.developer)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)[0]
          : undefined,
        developers: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.developer)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)
          : undefined,
        publisher: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.publisher)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)[0]
          : undefined,
        publishers: gameData.involved_companies
          ? gameData.involved_companies
              .filter((company) => company.publisher)
              .map((company) => company.company?.name || company.company)
              .filter((name) => name)
          : undefined,
      };
      await gameApi.updateGame(gameId, gameDataForApi);

      // Status'u kategoriye dönüştür - backend'in beklediği UPPERCASE formata çevir
      const categoryMapping = {
        playing: "PLAYING",
        completed: "COMPLETED",
        backlog: "WISHLIST",
        wishlist: "WISHLIST",
        owned: "WISHLIST",
        dropped: "DROPPED",
        on_hold: "ON_HOLD",
        plan_to_play: "PLAN_TO_PLAY",
      };
      const newCategory = categoryMapping[gameData.status];

      // Kütüphane entry'sini güncelle
      const updates = {};
      if (newCategory) {
        updates.category = newCategory;
      }
      if (gameData.totalPlaytime !== undefined) {
        updates.playtime = this._parsePlaytime(gameData.totalPlaytime) || 0;
      }
      const tags = this._buildMetadataTags(gameData);
      if (tags) {
        updates.tags = tags;
      }

      if (Object.keys(updates).length > 0) {
        await libraryApi.updateEntry(this.currentUser.id, gameId, updates);
      }

      console.log(`🎮 Oyun güncellendi: ${gameData.name || gameData.title}`);
      return true;
    } catch (error) {
      console.error("Oyun güncelleme hatası:", error);
      return false;
    }
  }

  /**
   * Kütüphanedeki oyunları detaylarıyla birlikte al
   */
  async getLibraryGamesWithDetails(filters = {}) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }
      // Backend default limit=10; fetch all pages to avoid truncation
      const PAGE_LIMIT = 100;
      const allEntries = [];

      let page = 1;
      let totalPages = 1;

      do {
        const resp = await libraryApi.getLibrary(this.currentUser.id, {
          ...filters,
          page,
          limit: PAGE_LIMIT,
        });
        const payload = resp?.data ?? resp;
        const pageEntries = payload?.entries ?? [];
        const pagination = payload?.pagination ?? {
          page,
          limit: PAGE_LIMIT,
          totalPages: 1,
        };
        totalPages = pagination?.totalPages || 1;
        allEntries.push(...pageEntries);
        page += 1;
      } while (page <= totalPages);

      const rawEntries = allEntries;

      // Flatten entry + game into a single object expected by UI
      const formatted = rawEntries.map((entry) => {
        const g = entry.game || {};
        const cover = (() => {
          const c = g.cover;
          if (!c) return null;
          // Normalize string cover to object with url for UI expectations
          if (typeof c === "string") return { url: c };
          return c;
        })();
        const tags = entry.tags;
        const campaigns = Array.isArray(tags)
          ? []
          : tags?.selectedCampaigns || tags?.campaigns || [];
        const selectedDlcs = Array.isArray(tags)
          ? []
          : tags?.selectedDlcs || [];
        const steamDlcs = Array.isArray(tags) ? [] : tags?.steamDlcs || [];
        const gameVariants = Array.isArray(tags)
          ? undefined
          : tags?.gameVariants;
        const dlcSource = Array.isArray(tags) ? undefined : tags?.dlcSource;

        return {
          // Game fields
          id: g.id || entry.gameId,
          name: g.name,
          title: g.name,
          cover,
          rating: g.rating,
          developer: g.developer,
          genres: g.genres,
          platforms: g.platforms,
          first_release_date: g.firstReleaseDate
            ? Math.floor(new Date(g.firstReleaseDate).getTime() / 1000)
            : undefined,

          // Library fields (top-level fallback + nested info)
          category: (entry.category || "WISHLIST").toLowerCase(),
          libraryInfo: {
            category: (entry.category || "WISHLIST").toLowerCase(),
            playtime: entry.playtime ?? 0,
            rating: entry.rating,
            notes: entry.notes,
            progress: entry.progress ?? 0,
            priority: entry.priority,
            isPublic: entry.isPublic,
            tags: entry.tags,
            lastPlayed: entry.lastPlayed,
            addedAt: entry.addedAt,
          },

          // Derived metadata from tags to enrich UI
          campaigns,
          selectedDlcs,
          steamDlcs,
          gameVariants,
          dlcSource,
        };
      });

      return formatted;
    } catch (error) {
      console.error("Detaylı kütüphane alma hatası:", error);
      return [];
    }
  }

  /**
   * Kategoriye göre oyunları al
   */
  async getGamesByCategory(category) {
    try {
      const filters = { category };
      return await this.getLibraryGamesWithDetails(filters);
    } catch (error) {
      console.error("Kategori oyunları alma hatası:", error);
      return [];
    }
  }

  /**
   * Kütüphane istatistikleri
   */
  async getLibraryStats() {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }

      const response = await libraryApi.getStats(this.currentUser.id);
      return response.data;
    } catch (error) {
      console.error("İstatistik alma hatası:", error);
      return null;
    }
  }

  /**
   * ID'ye göre oyun getir
   */
  async getGameById(gameId) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }

      const response = await libraryApi.getEntry(
        this.currentUser.id,
        gameId.toString(),
      );
      return response.data;
    } catch (error) {
      console.error("Oyun getirme hatası:", error);
      return null;
    }
  }

  /**
   * Kütüphaneyi temizle
   */
  async clearLibrary() {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }

      // Tüm kütüphane girişlerini al ve sil
      const library = await this.getUserLibrary();
      for (const entry of library.entries || []) {
        await libraryApi.removeFromLibrary(this.currentUser.id, entry.gameId);
      }

      console.log("🧹 Kullanıcı kütüphanesi temizlendi");
    } catch (error) {
      console.error("Kütüphane temizleme hatası:", error);
    }
  }

  /**
   * Oyun durumunu güncelle (backlog, playing, completed)
   */
  async updateGameStatus(gameId, status) {
    try {
      if (!this.currentUser) {
        await this.initializeUser();
      }

      if (!['backlog', 'playing', 'completed'].includes(status)) {
        throw new Error('Geçersiz durum değeri');
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library/${gameId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Oyun durumu güncellenemedi');
      }

      return await response.json();
    } catch (error) {
      console.error("Oyun durumu güncelleme hatası:", error);
      throw error;
    }
  }
}

// Singleton instance
const userLibrary = new UserLibraryService();

export default userLibrary;
