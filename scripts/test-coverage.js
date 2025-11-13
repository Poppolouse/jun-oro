/**
 * @fileoverview Test Coverage Analysis Script
 * @description Test coverage analiz ve raporlama
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { execSync } from "child_process";

/**
 * Test coverage hedefleri
 */
const COVERAGE_TARGETS = {
  MINIMUM_COVERAGE: 90,
  CRITICAL_PATHS_COVERAGE: 95,
  UNIT_TESTS_COVERAGE: 95,
  INTEGRATION_TESTS_COVERAGE: 90,
  E2E_TESTS_COVERAGE: 85,
};

/**
 * Durum emoji'si
 * @param {number} coverage - Coverage yüzdesi
 * @returns {string} Durum emoji'si
 */
function getStatusEmoji(coverage) {
  if (coverage >= COVERAGE_TARGETS.CRITICAL_PATHS_COVERAGE) {
    return "✅";
  }
  if (coverage >= COVERAGE_TARGETS.MINIMUM_COVERAGE) {
    return "⚠️";
  }
  return "❌";
}

/**
 * Coverage durumu kontrol et
 * @param {number} coverage - Coverage yüzdesi
 * @param {number} target - Hedef coverage
 * @param {string} category - Kategori adı
 * @returns {string} Durum mesajı
 */
function checkCoverageStatus(coverage, target, category) {
  if (coverage >= target) {
    return `✅ ${category} coverage hedefine ulaştı (${coverage}% >= ${target}%)`;
  }
  return `❌ ${category} coverage hedefin altında (${coverage}% < ${target}%)`;
}

/**
 * Coverage raporu formatı
 */
function generateCoverageReport(
  overallCoverage,
  unitCoverage,
  integrationCoverage,
  e2eCoverage,
  criticalPathsCoverage,
  coverageDetails,
  recommendations,
) {
  return `
📊 Test Coverage Report
==========================

📈 Genel Coverage
-----------------
Toplam Coverage: ${overallCoverage}%
Hedeflenen Minimum: ${COVERAGE_TARGETS.MINIMUM_COVERAGE}%
Durum: ${getStatusEmoji(overallCoverage)}

📊 Kategori Bazında Coverage
----------------------------
Unit Tests: ${unitCoverage}%
Integration Tests: ${integrationCoverage}%
E2E Tests: ${e2eCoverage}%

📊 Kritik Path Coverage
-------------------
Kritik path'ler:
${criticalPathsCoverage}

📊 Coverage Detayları
--------------------
${coverageDetails}

📊 Öneriler
----------
${recommendations}

📊 Komutlar
----------
Coverage raporu görüntüle: open coverage/lcov-report/index.html
Detaylı analiz: npm run test:coverage:details
Tüm testleri çalıştır: npm test
`;
}

/**
 * Coverage analizini çalıştır
 */
function analyzeCoverage() {
  try {
    console.log("🔍 Test coverage analizi başlatılıyor...\n");

    // Frontend coverage kontrolü
    console.log("📱 Frontend coverage analizi...");
    const frontendCoverage = analyzeFrontendCoverage();

    // Backend coverage kontrolü
    console.log("🔧 Backend coverage analizi...");
    const backendCoverage = analyzeBackendCoverage();

    // Genel coverage hesapla
    const OVERALL_COVERAGE = Math.round(
      (frontendCoverage.total + backendCoverage.total) / 2,
    );

    // Coverage değerlerini hesapla
    const UNIT_COVERAGE = (frontendCoverage.unit + backendCoverage.unit) / 2;
    const INTEGRATION_TESTS_COVERAGE =
      (frontendCoverage.integration + backendCoverage.integration) / 2;
    const E2E_TESTS_COVERAGE = frontendCoverage.e2e; // E2E genellikle frontend odaklı

    // Kritik path'leri analiz et
    const CRITICAL_PATHS_COVERAGE = analyzeCriticalPaths(
      frontendCoverage,
      backendCoverage,
    );

    // Önerileri oluştur
    const RECOMMENDATIONS = generateRecommendations(
      frontendCoverage,
      backendCoverage,
      OVERALL_COVERAGE,
      CRITICAL_PATHS_COVERAGE,
    );

    // Coverage detaylarını oluştur
    const COVERAGE_DETAILS = generateCoverageDetails(
      frontendCoverage,
      backendCoverage,
      OVERALL_COVERAGE,
    );

    // Raporu oluştur
    const report = generateCoverageReport(
      OVERALL_COVERAGE,
      UNIT_COVERAGE,
      INTEGRATION_TESTS_COVERAGE,
      E2E_TESTS_COVERAGE,
      CRITICAL_PATHS_COVERAGE,
      COVERAGE_DETAILS,
      RECOMMENDATIONS,
    );

    // Raporu dosyaya yaz
    writeFileSync("test-coverage-report.md", report, "utf8");

    // Konsola yazdır
    console.log(report);

    // Durum kodunu döndür
    const statusCode =
      OVERALL_COVERAGE >= COVERAGE_TARGETS.MINIMUM_COVERAGE ? 0 : 1;
    process.exit(statusCode);
  } catch (error) {
    console.error("❌ Coverage analizi sırasında hata oluştu:", error.message);
    process.exit(1);
  }
}

/**
 * Frontend coverage analizini yap
 * @returns {object} Frontend coverage verileri
 */
function analyzeFrontendCoverage() {
  try {
    // Coverage dosyasını kontrol et
    const coveragePath = "coverage/lcov.info";

    if (!existsSync(coveragePath)) {
      console.log("⚠️ Frontend coverage dosyası bulunamadı");
      return {
        total: 0,
        unit: 0,
        integration: 0,
        e2e: 0,
        criticalPaths: [],
      };
    }

    // LCOV dosyasını oku ve analiz et
    const lcovContent = readFileSync(coveragePath, "utf8");

    // Basit LCOV parsing (gerçek uygulamada daha gelişmiş parser kullanılmalı)
    const lines = lcovContent.split("\n");
    let totalLines = 0;
    let coveredLines = 0;

    for (const line of lines) {
      if (line.startsWith("LF:")) {
        totalLines++;
        if (line.includes("end_record")) {
          const hits = parseInt(line.split(",")[1].split("=")[1]);
          coveredLines += hits > 0 ? 1 : 0;
        }
      }
    }

    const coverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;

    console.log(`📈 Frontend coverage: ${coverage.toFixed(1)}%`);

    return {
      total: coverage,
      unit: coverage, // Basitleştirme
      integration: 0,
      e2e: 0,
      criticalPaths: [],
    };
  } catch (error) {
    console.error(
      "❌ Frontend coverage analizi sırasında hata:",
      error.message,
    );
    return {
      total: 0,
      unit: 0,
      integration: 0,
      e2e: 0,
      criticalPaths: [],
    };
  }
}

/**
 * Backend coverage analizini yap
 * @returns {object} Backend coverage verileri
 */
function analyzeBackendCoverage() {
  try {
    const coveragePath = "backend/coverage/lcov.info";

    if (!existsSync(coveragePath)) {
      console.log("⚠️ Backend coverage dosyası bulunamadı");
      return {
        total: 0,
        unit: 0,
        integration: 0,
        e2e: 0,
        criticalPaths: [],
      };
    }

    const lcovContent = readFileSync(coveragePath, "utf8");
    const lines = lcovContent.split("\n");

    let totalLines = 0;
    let coveredLines = 0;

    for (const line of lines) {
      if (line.startsWith("LF:")) {
        totalLines++;
        if (line.includes("end_record")) {
          const hits = parseInt(line.split(",")[1].split("=")[1]);
          coveredLines += hits > 0 ? 1 : 0;
        }
      }
    }

    const coverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;

    console.log(`🔧 Backend coverage: ${coverage.toFixed(1)}%`);

    return {
      total: coverage,
      unit: coverage, // Basitleştirme
      integration: 0,
      e2e: 0,
      criticalPaths: [],
    };
  } catch (error) {
    console.error("❌ Backend coverage analizi sırasında hata:", error.message);
    return {
      total: 0,
      unit: 0,
      integration: 0,
      e2e: 0,
      criticalPaths: [],
    };
  }
}

/**
 * Kritik path coverage analizini yap
 * @param {object} frontendCoverage - Frontend coverage verileri
 * @param {object} backendCoverage - Backend coverage verileri
 * @returns {number} Kritik path coverage yüzdesi
 */
function analyzeCriticalPaths(frontendCoverage, backendCoverage) {
  // Bu fonksiyon kritik path'lerin coverage'ini analiz eder
  // Gerçek uygulamada test dosyalarını analiz ederek daha doğru sonuçlar elde edilir

  const criticalPaths = [
    "src/components/GameCard.jsx",
    "src/components/AddGameModal.jsx",
    "src/pages/HomePage.jsx",
    "src/pages/LibraryPage.jsx",
    "src/pages/SettingsPage.jsx",
    "src/services/api.js",
    "src/services/userLibrary.js",
    "backend/src/routes/games.js",
    "backend/src/routes/library.js",
    "backend/src/routes/users.js",
    "backend/src/middleware/auth.js",
  ];

  // Basitleştirme: kritik path'lerin ortalama coverage'ini hesapla
  const averageCriticalCoverage =
    (frontendCoverage.unit + backendCoverage.unit) / 2;

  return averageCriticalCoverage;
}

/**
 * Coverage önerileri oluştur
 * @param {object} frontendCoverage - Frontend coverage verileri
 * @param {object} backendCoverage - Backend coverage verileri
 * @param {number} overallCoverage - Genel coverage
 * @param {number} criticalPathsCoverage - Kritik path coverage
 * @returns {string} Öneriler
 */
function generateRecommendations(
  frontendCoverage,
  backendCoverage,
  overallCoverage,
  criticalPathsCoverage,
) {
  const recommendations = [];

  // Genel coverage önerileri
  if (overallCoverage < COVERAGE_TARGETS.MINIMUM_COVERAGE) {
    recommendations.push(
      "🎯 Test coverage hedefine ulaşmak için daha fazla test yazın",
    );
    recommendations.push("📝 Tüm kritik pathlerin test coverageini artırın");
  }

  // Unit test önerileri
  if (frontendCoverage.unit < COVERAGE_TARGETS.UNIT_TESTS_COVERAGE) {
    recommendations.push("🧪 Frontend unit test coverageini artırın");
  }

  if (backendCoverage.unit < COVERAGE_TARGETS.UNIT_TESTS_COVERAGE) {
    recommendations.push("🔧 Backend unit test coverageini artırın");
  }

  // Integration test önerileri
  if (
    frontendCoverage.integration < COVERAGE_TARGETS.INTEGRATION_TESTS_COVERAGE
  ) {
    recommendations.push("🔗 Frontend integration test coverageini artırın");
  }

  if (
    backendCoverage.integration < COVERAGE_TARGETS.INTEGRATION_TESTS_COVERAGE
  ) {
    recommendations.push("🔧 Backend integration test coverageini artırın");
  }

  // E2E test önerileri
  if (frontendCoverage.e2e < COVERAGE_TARGETS.E2E_TESTS_COVERAGE) {
    recommendations.push("🎭 Frontend E2E test coverageini artırın");
  }

  // Kritik path önerileri
  if (criticalPathsCoverage < COVERAGE_TARGETS.CRITICAL_PATHS_COVERAGE) {
    recommendations.push("⚡ Kritik pathlerin test coverageini artırın");
    recommendations.push(
      "📋 Özellikle GameCard, AddGameModal, HomePage gibi componentlerin testini yazın",
    );
  }

  // Spesifik öneriler
  if (frontendCoverage.total < 50) {
    recommendations.push(
      "📈 Frontend coverage çok düşük, test stratejisini gözden geçirin",
    );
  }

  if (backendCoverage.total < 50) {
    recommendations.push(
      "📈 Backend coverage çok düşük, test stratejisini gözden geçirin",
    );
  }

  return recommendations.join("\n");
}

/**
 * Coverage detaylarını oluştur
 * @param {object} frontendCoverage - Frontend coverage verileri
 * @param {object} backendCoverage - Backend coverage verileri
 * @param {number} overallCoverage - Genel coverage
 * @returns {string} Coverage detayları
 */
function generateCoverageDetails(
  frontendCoverage,
  backendCoverage,
  overallCoverage,
) {
  const details = [];

  details.push(`📱 Frontend Coverage: ${frontendCoverage.total.toFixed(1)}%`);
  details.push(`🔧 Backend Coverage: ${backendCoverage.total.toFixed(1)}%`);
  details.push(`📈 Genel Coverage: ${overallCoverage.toFixed(1)}%`);

  // Kategori bazında detaylar
  details.push("\n📊 Kategori Bazında:");
  details.push(
    `  Unit Tests: ${frontendCoverage.unit.toFixed(1)}% (Frontend) / ${backendCoverage.unit.toFixed(1)}% (Backend)`,
  );
  details.push(
    `  Integration Tests: ${frontendCoverage.integration.toFixed(1)}% (Frontend) / ${backendCoverage.integration.toFixed(1)}% (Backend)`,
  );
  details.push(
    `  E2E Tests: ${frontendCoverage.e2e.toFixed(1)}% (Frontend) / ${backendCoverage.e2e.toFixed(1)}% (Backend)`,
  );

  // Durum analizi
  if (overallCoverage >= COVERAGE_TARGETS.MINIMUM_COVERAGE) {
    details.push("\n✅ Coverage hedeflerine ulaşıldı!");
  } else {
    details.push("\n❌ Coverage hedeflerin altında kalındı!");
  }

  return details.join("\n");
}

// Script'i çalıştır
analyzeCoverage();

export { analyzeCoverage };
