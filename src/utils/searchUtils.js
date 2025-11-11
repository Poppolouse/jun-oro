/**
 * Oyun arama sonuçları için relevance score hesaplama utilities
 */

/**
 * İki string arasındaki benzerlik oranını hesaplar (Levenshtein distance kullanarak)
 * @param {string} str1 - İlk string
 * @param {string} str2 - İkinci string
 * @returns {number} 0-1 arası benzerlik oranı
 */
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance hesaplama
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Arama teriminin string içinde geçip geçmediğini kontrol eder
 * @param {string} searchTerm - Arama terimi
 * @param {string} text - Kontrol edilecek metin
 * @returns {object} { contains: boolean, position: number, exactMatch: boolean }
 */
function checkTermInText(searchTerm, text) {
  if (!searchTerm || !text)
    return { contains: false, position: -1, exactMatch: false };

  const term = searchTerm.toLowerCase().trim();
  const content = text.toLowerCase().trim();

  const exactMatch = content === term;
  const position = content.indexOf(term);
  const contains = position !== -1;

  return { contains, position, exactMatch };
}

/**
 * Oyun için relevance score hesaplar
 * @param {object} game - IGDB'den gelen oyun objesi
 * @param {string} searchTerm - Kullanıcının arama terimi
 * @returns {number} 0-100 arası relevance score
 */
export function calculateRelevanceScore(game, searchTerm) {
  if (!game || !searchTerm) return 0;

  const term = searchTerm.toLowerCase().trim();
  let totalScore = 0;
  let maxScore = 0;

  // Ana oyun kontrolü - DLC/mod/edition'ları penalize et
  let categoryMultiplier = 1.0;
  if (game.category !== undefined) {
    // IGDB Category kodları:
    // 0: Ana oyun, 4: Standalone expansion, 8: Remake, 9: Remaster, 10: Expanded game, 11: Port
    // 1: DLC, 2: Expansion pack, 3: Bundle
    const mainGameCategories = [0, 4, 8, 9, 10, 11];
    const dlcCategories = [1, 2, 3];

    if (mainGameCategories.includes(game.category)) {
      categoryMultiplier = 1.0; // Ana oyunlar tam puan
    } else if (dlcCategories.includes(game.category)) {
      categoryMultiplier = 0.9; // DLC/expansion'lar %90 puan
    } else {
      categoryMultiplier = 0.95; // Diğer kategoriler %95 puan
    }
  }

  // Parent game kontrolü - eğer parent_game varsa bu bir DLC/expansion'dır
  if (game.parent_game || game.version_parent) {
    categoryMultiplier = Math.min(categoryMultiplier, 0.8); // Parent'ı olan oyunlar maksimum %80 puan
  }

  // 1. İsim eşleşmesi (en yüksek ağırlık: 40 puan)
  if (game.name) {
    const nameCheck = checkTermInText(term, game.name);
    const nameSimilarity = calculateStringSimilarity(term, game.name);

    let nameScore = 0;
    if (nameCheck.exactMatch) {
      nameScore = 40; // Tam eşleşme
    } else if (nameCheck.contains) {
      if (nameCheck.position === 0) {
        nameScore = 35; // Başlangıçta geçiyor
      } else {
        nameScore = 25; // Ortada geçiyor
      }
    } else {
      nameScore = nameSimilarity * 20; // Benzerlik oranına göre
    }

    totalScore += nameScore;
  }
  maxScore += 40;

  // 2. Özet/Açıklama eşleşmesi (25 puan)
  if (game.summary) {
    const summaryCheck = checkTermInText(term, game.summary);
    let summaryScore = 0;

    if (summaryCheck.contains) {
      // Özette geçen kelime sayısına göre puan
      const termCount = (
        game.summary.toLowerCase().match(new RegExp(term, "g")) || []
      ).length;
      summaryScore = Math.min(25, termCount * 8);
    }

    totalScore += summaryScore;
  }
  maxScore += 25;

  // 3. Tür eşleşmesi (20 puan)
  if (game.genres && Array.isArray(game.genres)) {
    let genreScore = 0;

    for (const genre of game.genres) {
      if (genre.name) {
        const genreCheck = checkTermInText(term, genre.name);
        if (genreCheck.contains) {
          genreScore += genreCheck.exactMatch ? 20 : 10;
          break; // İlk eşleşmede dur
        }
      }
    }

    totalScore += Math.min(genreScore, 20);
  }
  maxScore += 20;

  // 4. Platform eşleşmesi (10 puan)
  if (game.platforms && Array.isArray(game.platforms)) {
    let platformScore = 0;

    for (const platform of game.platforms) {
      if (platform.name) {
        const platformCheck = checkTermInText(term, platform.name);
        if (platformCheck.contains) {
          platformScore += platformCheck.exactMatch ? 10 : 5;
          break;
        }
      }
    }

    totalScore += Math.min(platformScore, 10);
  }
  maxScore += 10;

  // 5. Popülerlik bonusu (20 puan)
  if (game.rating && game.rating_count) {
    // Rating (0-100) ve rating_count'u birleştir
    const ratingScore = game.rating / 100; // 0-1 arası
    const countScore = Math.min(1, Math.log10(game.rating_count + 1) / 5); // 0-1 arası
    const popularityScore = (ratingScore * 0.6 + countScore * 0.4) * 20; // Maksimum 20 puan
    totalScore += popularityScore;
  }
  maxScore += 20;

  // 6. Çok popüler oyunlar için ekstra bonus (10 puan)
  if (game.rating && game.rating_count) {
    if (game.rating >= 80 && game.rating_count >= 1000) {
      totalScore += 10; // Çok yüksek rating + çok oy
    } else if (game.rating >= 75 && game.rating_count >= 500) {
      totalScore += 5; // Yüksek rating + orta oy
    }
  }
  maxScore += 10;

  // Yüzdelik olarak hesapla (0-100)
  let finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  // Category multiplier'ı uygula
  finalScore = finalScore * categoryMultiplier;

  return Math.round(finalScore * 100) / 100; // 2 ondalık basamak
}

/**
 * Oyun listesini relevance score'a göre sıralar
 * @param {array} games - Oyun listesi
 * @param {string} searchTerm - Arama terimi
 * @returns {array} Score'a göre sıralanmış oyun listesi
 */
export function sortGamesByRelevance(games, searchTerm) {
  if (!Array.isArray(games) || !searchTerm) return games;

  return games
    .map((game) => ({
      ...game,
      relevanceScore: calculateRelevanceScore(game, searchTerm),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .filter((game) => game.relevanceScore > 0); // Sıfır score'lu oyunları filtrele
}

/**
 * Relevance score'u kullanıcı dostu formatta döndürür
 * @param {number} score - 0-100 arası score
 * @returns {object} { percentage: number, label: string, color: string }
 */
export function formatRelevanceScore(score) {
  if (score >= 80) {
    return {
      percentage: score,
      label: "Mükemmel Eşleşme",
      color: "text-green-600",
    };
  } else if (score >= 60) {
    return { percentage: score, label: "İyi Eşleşme", color: "text-blue-600" };
  } else if (score >= 40) {
    return {
      percentage: score,
      label: "Orta Eşleşme",
      color: "text-yellow-600",
    };
  } else if (score >= 20) {
    return {
      percentage: score,
      label: "Zayıf Eşleşme",
      color: "text-orange-600",
    };
  } else {
    return { percentage: score, label: "Düşük Eşleşme", color: "text-red-600" };
  }
}
