// IGDB API Service
// IGDB API entegrasyonu için servis dosyası

import { apiKeyService } from "./apiKeys.js";

class IGDBApiService {
  constructor() {
    this.baseUrl = "/api/igdb";
    this.clientId = null;
    this.accessToken = null;
    this.isInitialized = false;

    // Basit oran sınırlayıcı (rate limiter)
    // IGDB için güvenli bir sınır: saniyede en fazla 2 istek
    this.maxRequestsPerSecond = 2;
    this.requestTimestamps = []; // Son 1 saniyedeki istek zamanları
    this.defaultRetryCount = 3; // 429 durumunda tekrar deneme sayısı

    // Initialize credentials from database
    this.initializeCredentials();
  }

  // Initialize credentials from database or localStorage (migration)
  async initializeCredentials() {
    try {
      // Try to get credentials from database first (with decryption)
      const dbCredentials = await apiKeyService.getIgdbCredentials();
      if (
        dbCredentials &&
        dbCredentials.clientId &&
        dbCredentials.accessToken
      ) {
        this.clientId = dbCredentials.clientId;
        this.accessToken = dbCredentials.accessToken;
        this.isInitialized = true;
        console.log("✅ IGDB credentials loaded from database");
        return;
      }

      // Fallback to localStorage for migration
      const localClientId =
        localStorage.getItem("igdb_client_id") ||
        localStorage.getItem("igdbClientId");
      const localAccessToken =
        localStorage.getItem("igdb_access_token") ||
        localStorage.getItem("igdbAccessToken");

      if (localClientId && localAccessToken) {
        // Migrate to database
        try {
          await apiKeyService.setIgdbCredentials(
            localClientId,
            localAccessToken,
            null,
            true,
          ); // Set as global key
          this.clientId = localClientId;
          this.accessToken = localAccessToken;
          this.isInitialized = true;
          // Clean up localStorage
          localStorage.removeItem("igdb_client_id");
          localStorage.removeItem("igdb_access_token");
          localStorage.removeItem("igdbClientId");
          localStorage.removeItem("igdbAccessToken");
        } catch (error) {
          console.warn(
            "Failed to migrate IGDB credentials to database:",
            error,
          );
          // Use them anyway
          this.clientId = localClientId;
          this.accessToken = localAccessToken;
          this.isInitialized = true;
        }
      }
    } catch (error) {
      console.warn(
        "Failed to initialize IGDB credentials from database:",
        error,
      );
    }
  }

  // API anahtarlarını ayarla
  async setCredentials(clientId, accessToken) {
    try {
      // Save to database
      await apiKeyService.setIgdbCredentials(clientId, accessToken, null, true);
      this.clientId = clientId;
      this.accessToken = accessToken;
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to save IGDB credentials to database:", error);
      // Fallback to localStorage for backward compatibility
      this.clientId = clientId;
      this.accessToken = accessToken;
      this.isInitialized = true;
      localStorage.setItem("igdb_client_id", clientId);
      localStorage.setItem("igdb_access_token", accessToken);
    }
  }

  // Local storage'dan anahtarları yükle
  async loadCredentials() {
    await this.initializeCredentials();
    return this.isInitialized;
  }

  // API anahtarlarını temizle
  async clearCredentials() {
    try {
      // Try to delete both Client ID and Access Token from database
      const keys = await apiKeyService.getApiKeys();
      const clientIdKey = keys.data?.find(
        (key) => key.serviceName === "igdb_client_id",
      );
      const accessTokenKey = keys.data?.find(
        (key) => key.serviceName === "igdb_access_token",
      );

      const deletePromises = [];
      if (clientIdKey) {
        deletePromises.push(apiKeyService.deleteApiKey(clientIdKey.id));
      }
      if (accessTokenKey) {
        deletePromises.push(apiKeyService.deleteApiKey(accessTokenKey.id));
      }

      await Promise.all(deletePromises);
    } catch (error) {
      console.warn("Failed to delete IGDB credentials from database:", error);
    }

    // Reset local state
    this.clientId = null;
    this.accessToken = null;
    this.isInitialized = false;
    localStorage.removeItem("igdb_client_id");
    localStorage.removeItem("igdb_access_token");
    localStorage.removeItem("igdbClientId");
    localStorage.removeItem("igdbAccessToken");
  }

  // Yardımcı: bekleme
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Yardımcı: jitter'lı gecikme (yükü dağıtmak için)
  applyJitter(ms) {
    const jitter = Math.floor(Math.random() * 250); // 0-250ms
    return ms + jitter;
  }

  // Basit token-bucket/throttle: saniyede maxRequestsPerSecond isteği aşma
  async throttle() {
    const now = Date.now();
    // Eski timestamp'leri temizle (1s penceresi)
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < 1000,
    );
    if (this.requestTimestamps.length < this.maxRequestsPerSecond) {
      this.requestTimestamps.push(now);
      return;
    }
    // En eski isteğin üstünden 1 saniye geçene kadar bekle
    const oldest = this.requestTimestamps[0];
    const waitMs = this.applyJitter(1000 - (now - oldest));
    await this.sleep(waitMs);
    // Bekledikten sonra tekrar kontrol et
    return this.throttle();
  }

  // API isteği gönder (429 için yeniden deneme ve rate limiting ile)
  async makeRequest(endpoint, body) {
    const startTime = Date.now();
    let lastError = null;

    const maxRetries = this.defaultRetryCount;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Oran sınırlayıcıyı uygula
        await this.throttle();

        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body }),
        });

        if (!response.ok) {
          // 429 ise Retry-After'a göre veya exponential backoff ile tekrar dene
          if (response.status === 429) {
            const retryAfterHeader = response.headers.get("Retry-After");
            const retryAfterSec = retryAfterHeader
              ? Number(retryAfterHeader)
              : null;
            const backoffMs = this.applyJitter(
              retryAfterSec ? retryAfterSec * 1000 : 800 * Math.pow(2, attempt),
            );
            await this.sleep(backoffMs);
            lastError = new Error(
              `IGDB API Error: 429 Too Many Requests (attempt ${attempt + 1}/${maxRetries + 1})`,
            );
            // Bir sonraki denemeye geç
            continue;
          }
          // Diğer hatalar için direkt fırlat
          const errorData = await response.text();
          throw new Error(
            `IGDB API Error: ${response.status} ${response.statusText} - ${errorData}`,
          );
        }

        const data = await response.json();
        // Başarılı denemeyi logla ve döndür
        this.logApiCall(endpoint, true, Date.now() - startTime, null);
        return data;
      } catch (err) {
        // Fetch seviyesinde hata (network vb.) veya non-429 durumlarda
        lastError = err;
        // 429 dışındaki hatalarda beklemeden çık veya sınırlı backoff uygula
        if (String(err.message || "").includes("429")) {
          const backoffMs = this.applyJitter(800 * Math.pow(2, attempt));
          await this.sleep(backoffMs);
          continue;
        }
        // Log kaydı ve fırlat
        this.logApiCall(endpoint, false, Date.now() - startTime, err.message);
        throw err;
      }
    }

    // Tüm denemeler başarısız oldu
    this.logApiCall(
      endpoint,
      false,
      Date.now() - startTime,
      lastError ? lastError.message : "Unknown error",
    );
    throw lastError || new Error("IGDB API Error: Bilinmeyen hata");
  }

  // Oyun ara (tüm oyunlar)
  async searchGames(query, limit = 10) {
    const body = `
      search "${query}";
      fields name, cover.url, cover.image_id, first_release_date, genres.name, platforms.name, 
             summary, rating, rating_count, screenshots.url, videos.video_id,
             involved_companies.company.name, involved_companies.developer,
             involved_companies.publisher, game_modes.name, themes.name, category,
             parent_game.name, version_parent.name, dlcs.name, expansions.name;
      limit ${limit};
    `;

    return await this.makeRequest("games", body);
  }

  // Tüm oyunları ara (DLC/expansion dahil)
  async searchAllGames(query, limit = 10) {
    const body = `
      search "${query}";
      fields name, cover.url, cover.image_id, first_release_date, genres.name, platforms.name, 
             summary, rating, rating_count, screenshots.url, videos.video_id,
             involved_companies.company.name, involved_companies.developer,
             involved_companies.publisher, game_modes.name, themes.name, category,
             parent_game.name, version_parent.name;
      limit ${limit};
    `;

    return await this.makeRequest("games", body);
  }

  // Oyun detaylarını getir
  async getGameDetails(gameId) {
    const body = `
      fields name, cover.url, cover.image_id, first_release_date, genres.name, platforms.name,
             summary, storyline, rating, rating_count, screenshots.url, 
             videos.video_id, involved_companies.company.name, 
             involved_companies.developer, involved_companies.publisher,
             game_modes.name, themes.name, websites.url, websites.category,
             age_ratings.rating, age_ratings.category, similar_games.name,
             dlcs.name, expansions.name, franchise.name, collection.name, category;
      where id = ${gameId};
    `;

    const result = await this.makeRequest("games", body);
    return result[0] || null;
  }

  // Oyunun DLC ve edition'larını getir
  async getGameVariants(gameId) {
    try {
      console.log("🔍 DLC aranıyor, gameId:", gameId);

      // DLC'leri getir - daha geniş arama
      const dlcBody = `
        fields name, cover.url, cover.image_id, first_release_date, summary, category, platforms.name;
        where parent_game = ${gameId} & category = (1,2,3,4,5,6,7,8,9,10,11,12,13,14);
        sort first_release_date asc;
        limit 100;
      `;
      const dlcs = await this.makeRequest("games", dlcBody);
      console.log("📦 DLC sonuçları:", dlcs);

      // Expansion'ları getir
      const expansionBody = `
        fields name, cover.url, cover.image_id, first_release_date, summary, category, platforms.name;
        where parent_game = ${gameId};
        sort first_release_date asc;
        limit 100;
      `;
      const expansions = await this.makeRequest("games", expansionBody);
      console.log("🎯 Expansion sonuçları:", expansions);

      // Edition'ları getir (aynı oyunun farklı versiyonları)
      const editionBody = `
        fields name, cover.url, cover.image_id, first_release_date, summary, category, platforms.name;
        where version_parent = ${gameId};
        sort first_release_date asc;
        limit 50;
      `;
      const editions = await this.makeRequest("games", editionBody);
      console.log("🏆 Edition sonuçları:", editions);

      // Alternatif arama - oyun adına göre DLC ara
      const gameDetails = await this.getGameDetails(gameId);
      const gameName = gameDetails?.name || "";

      if (gameName) {
        const nameSearchBody = `
          fields name, cover.url, cover.image_id, first_release_date, summary, category, platforms.name;
          search "${gameName}";
          where category = (1,2,3,4,5,6,7,8,9,10,11,12,13,14);
          limit 100;
        `;
        const nameSearchResults = await this.makeRequest(
          "games",
          nameSearchBody,
        );
        console.log("🔎 İsim araması sonuçları:", nameSearchResults);

        // Ana oyun dışındaki sonuçları DLC olarak ekle
        const additionalDlcs = (nameSearchResults || []).filter(
          (game) =>
            game.id !== gameId &&
            game.name.toLowerCase().includes(gameName.toLowerCase()),
        );

        console.log("➕ Ek DLC'ler:", additionalDlcs);

        return {
          dlcs: [...(dlcs || []), ...(expansions || []), ...additionalDlcs],
          expansions: expansions || [],
          editions: editions || [],
        };
      }

      return {
        dlcs: [...(dlcs || []), ...(expansions || [])],
        expansions: expansions || [],
        editions: editions || [],
      };
    } catch (error) {
      console.error("Oyun varyantları getirilemedi:", error);
      return { dlcs: [], expansions: [], editions: [] };
    }
  }

  // Popüler oyunları getir
  async getPopularGames(limit = 20) {
    const body = `
      fields name, cover.url, first_release_date, genres.name, platforms.name,
             summary, rating, rating_count;
      where rating_count > 100 & rating > 75;
      sort rating desc;
      limit ${limit};
    `;

    return await this.makeRequest("games", body);
  }

  // Yeni çıkan oyunları getir
  async getNewReleases(limit = 20) {
    const currentDate = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = currentDate - 30 * 24 * 60 * 60;

    const body = `
      fields name, cover.url, first_release_date, genres.name, platforms.name,
             summary, rating, rating_count;
      where first_release_date > ${thirtyDaysAgo} & first_release_date < ${currentDate};
      sort first_release_date desc;
      limit ${limit};
    `;

    return await this.makeRequest("games", body);
  }

  // Platform listesini getir
  async getPlatforms() {
    const body = `
      fields name, platform_logo.url, category;
      where category = (1,2,3,4,5,6);
      sort name asc;
      limit 100;
    `;

    return await this.makeRequest("platforms", body);
  }

  // Genre listesini getir
  async getGenres() {
    const body = `
      fields name;
      sort name asc;
      limit 50;
    `;

    return await this.makeRequest("genres", body);
  }

  // API çağrısını logla
  logApiCall(endpoint, success, responseTime, error) {
    const logEntry = {
      id: Date.now() + Math.random(),
      endpoint,
      success,
      responseTime,
      error,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
    };

    // Mevcut logları al
    const logs = this.getApiLogs();
    logs.push(logEntry);

    // 30 günden eski logları temizle
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredLogs = logs.filter(
      (log) => new Date(log.timestamp) > thirtyDaysAgo,
    );

    // Local storage'a kaydet
    localStorage.setItem("igdb_api_logs", JSON.stringify(filteredLogs));
  }

  // API loglarını getir
  getApiLogs() {
    const logs = localStorage.getItem("igdb_api_logs");
    return logs ? JSON.parse(logs) : [];
  }

  // API istatistiklerini getir
  getApiStats() {
    const logs = this.getApiLogs();
    const today = new Date().toDateString();
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const todayLogs = logs.filter((log) => log.date === today);
    const last7DaysLogs = logs.filter(
      (log) => new Date(log.timestamp) > last7Days,
    );
    const last30DaysLogs = logs.filter(
      (log) => new Date(log.timestamp) > last30Days,
    );

    return {
      today: {
        total: todayLogs.length,
        successful: todayLogs.filter((log) => log.success).length,
        failed: todayLogs.filter((log) => !log.success).length,
        avgResponseTime:
          todayLogs.length > 0
            ? Math.round(
                todayLogs.reduce((sum, log) => sum + log.responseTime, 0) /
                  todayLogs.length,
              )
            : 0,
      },
      last7Days: {
        total: last7DaysLogs.length,
        successful: last7DaysLogs.filter((log) => log.success).length,
        failed: last7DaysLogs.filter((log) => !log.success).length,
        avgResponseTime:
          last7DaysLogs.length > 0
            ? Math.round(
                last7DaysLogs.reduce((sum, log) => sum + log.responseTime, 0) /
                  last7DaysLogs.length,
              )
            : 0,
      },
      last30Days: {
        total: last30DaysLogs.length,
        successful: last30DaysLogs.filter((log) => log.success).length,
        failed: last30DaysLogs.filter((log) => !log.success).length,
        avgResponseTime:
          last30DaysLogs.length > 0
            ? Math.round(
                last30DaysLogs.reduce((sum, log) => sum + log.responseTime, 0) /
                  last30DaysLogs.length,
              )
            : 0,
      },
      endpoints: this.getEndpointStats(logs),
    };
  }

  // Endpoint istatistiklerini getir
  getEndpointStats(logs) {
    const endpointStats = {};

    logs.forEach((log) => {
      if (!endpointStats[log.endpoint]) {
        endpointStats[log.endpoint] = {
          total: 0,
          successful: 0,
          failed: 0,
          avgResponseTime: 0,
        };
      }

      endpointStats[log.endpoint].total++;
      if (log.success) {
        endpointStats[log.endpoint].successful++;
      } else {
        endpointStats[log.endpoint].failed++;
      }
    });

    // Ortalama response time hesapla
    Object.keys(endpointStats).forEach((endpoint) => {
      const endpointLogs = logs.filter((log) => log.endpoint === endpoint);
      endpointStats[endpoint].avgResponseTime =
        endpointLogs.length > 0
          ? Math.round(
              endpointLogs.reduce((sum, log) => sum + log.responseTime, 0) /
                endpointLogs.length,
            )
          : 0;
    });

    return endpointStats;
  }

  // API durumunu kontrol et
  async testConnection() {
    try {
      await this.makeRequest("games", "fields name; limit 1;");
      return { success: true, message: "IGDB API bağlantısı başarılı" };
    } catch (error) {
      console.error("API baglanti hatasi:", error);
      return { success: false, message: error.message };
    }
  }
}

// Singleton instance
const igdbApi = new IGDBApiService();

// Sayfa yüklendiğinde anahtarları yükle
igdbApi.loadCredentials();

export default igdbApi;
