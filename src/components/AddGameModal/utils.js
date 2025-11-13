/**
 * AddGameModal Utility Functions
 * IGDB ve Steam verileri için yardımcı fonksiyonlar
 */

/**
 * IGDB category kodlarını açıklayıcı isimlere çevirir
 * @param {number} category - IGDB category kodu
 * @returns {string} - Kategori adı
 */
export const getCategoryName = (category) => {
  const categories = {
    0: "Ana Oyun",
    1: "DLC",
    2: "Ek Paket",
    3: "Genişleme",
    4: "Standalone Genişleme",
    8: "Remake",
    9: "Remaster",
    10: "Expanded Game",
    11: "Port",
  };
  return categories[category] || "";
};

/**
 * IGDB görsel URL'sini düzelt - Yüksek çözünürlük
 * @param {Object} cover - Cover objesi
 * @param {string} size - İstenen boyut (varsayılan: "1080p")
 * @returns {string} - Görsel URL'si
 */
export const getImageUrl = (cover, size = "1080p") => {
  if (!cover) return "/placeholder-game.jpg";

  // Eğer image_id varsa, doğru IGDB URL formatını kullan
  if (cover.image_id) {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${cover.image_id}.jpg`;
  }

  // Eski format için fallback - yüksek çözünürlük
  if (cover.url) {
    const sizeParam = `t_${size}`;
    return `https:${cover.url.replace("t_thumb", sizeParam)}`;
  }

  return "/placeholder-game.jpg";
};

/**
 * IGDB involved_companies verisinden geliştirici ve yayımcı bilgilerini çıkarır
 * @param {Array} involvedCompanies - Şirket listesi
 * @returns {Object} - {developer, publisher} objesi
 */
export const extractDeveloperAndPublisher = (involvedCompanies) => {
  if (!involvedCompanies || !Array.isArray(involvedCompanies)) {
    return { developer: "Bilinmiyor", publisher: "Bilinmiyor" };
  }

  let developer = null;
  let publisher = null;

  involvedCompanies.forEach((company) => {
    if (company.developer && company.company?.name) {
      developer = company.company.name;
    }
    if (company.publisher && company.company?.name) {
      publisher = company.company.name;
    }
  });

  return {
    developer: developer || "Bilinmiyor",
    publisher: publisher || developer || "Bilinmiyor",
  };
};

/**
 * DLC'leri birleştirirken tekrarları kaldırır
 * @param {Array} igdbDlcs - IGDB DLC'leri
 * @param {Array} igdbExpansions - IGDB Expansion'ları
 * @param {Array} steamDlcs - Steam DLC'leri
 * @returns {Array} - Birleşik ve tekrarsız DLC listesi
 */
export const mergeDLCsWithoutDuplicates = (
  igdbDlcs,
  igdbExpansions,
  steamDlcs,
) => {
  const allDlcs = [];
  const seenNames = new Set();

  // IGDB DLC'lerini ekle
  for (const dlc of igdbDlcs) {
    const normalizedName = dlc.name.toLowerCase().trim();
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      allDlcs.push({
        ...dlc,
        source: "igdb",
      });
    }
  }

  // IGDB Expansion'larını ekle
  for (const expansion of igdbExpansions) {
    const normalizedName = expansion.name.toLowerCase().trim();
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      allDlcs.push({
        ...expansion,
        source: "igdb",
      });
    }
  }

  // Steam DLC'lerini ekle (sadece IGDB'de yoksa)
  for (const dlc of steamDlcs) {
    const normalizedName = dlc.name.toLowerCase().trim();
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      allDlcs.push({
        id: `steam_${dlc.steam_appid}`,
        name: dlc.name,
        cover: dlc.header_image ? { url: dlc.header_image } : null,
        source: "steam",
        price_overview: dlc.price_overview,
      });
    }
  }

  return allDlcs;
};

/**
 * Toplam campaign süresini hesaplar
 * @param {Array} campaigns - Campaign listesi
 * @returns {string|null} - Formatlanmış süre veya null
 */
export const calculateTotalDuration = (campaigns) => {
  if (campaigns.length === 0) return null;

  const durations = campaigns
    .filter((c) => c.averageDuration && c.averageDuration.trim())
    .map((c) => c.averageDuration.trim());

  if (durations.length === 0) return null;

  // Süreleri parse et ve topla
  let totalMinutes = 0;
  let hasValidDuration = false;

  durations.forEach((duration) => {
    // "25 saat", "40-50 saat", "2.5 hours" gibi formatları parse et
    const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*(?:saat|hour|h)/i);
    const rangeMatch = duration.match(
      /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:saat|hour|h)/i,
    );

    if (rangeMatch) {
      // Aralık varsa ortalamasını al
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      totalMinutes += ((min + max) / 2) * 60;
      hasValidDuration = true;
    } else if (hourMatch) {
      // Tek değer varsa onu kullan
      totalMinutes += parseFloat(hourMatch[1]) * 60;
      hasValidDuration = true;
    }
  });

  if (!hasValidDuration) return null;

  // Dakikaları saat ve dakikaya çevir
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours === 0) {
    return `${minutes} dakika`;
  } else if (minutes === 0) {
    return `${hours} saat`;
  } else {
    return `${hours} saat ${minutes} dakika`;
  }
};

/**
 * Diğer platformlar için varsayılan liste
 * @returns {Array} - Platform listesi
 */
export const getDefaultOtherPlatforms = () => [
  "GOG",
  "Nintendo Switch",
  "Origin",
  "Ubisoft Connect",
  "Battle.net",
  "Microsoft Store",
  "Mac App Store",
  "Itch.io",
  "Fiziksel Kopya",
  "Diğer",
];
