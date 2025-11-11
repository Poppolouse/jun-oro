import ArkadeHeader from "../components/ArkadeHeader";
import ArkadeSidebar from "../components/ArkadeSidebar";
import SiteFooter from "../components/SiteFooter";

function StatsPage() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]"
      data-registry="4.0"
      id="stats-page"
    >
      <ArkadeHeader />

      <div className="flex" data-registry="4.0.B" id="stats-layout">
        <ArkadeSidebar />

        <div
          className="flex-1 p-8 pr-4"
          data-registry="4.0.B1"
          id="stats-content"
        >
          <div className="text-center max-w-4xl mx-auto">
            {/* Ana İkon */}
            <div
              className="text-9xl mb-8 animate-pulse"
              data-registry="4.0.B1.1"
              id="stats-main-icon"
            >
              📊
            </div>

            {/* Başlık */}
            <h1
              className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6"
              data-registry="4.0.B1.2"
              id="stats-title"
            >
              Oyun İstatistikleri
            </h1>

            {/* Çok Yakında Badge */}
            <div
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-xl font-bold mb-8 shadow-lg shadow-blue-500/25"
              data-registry="4.0.B1.3"
              id="stats-coming-soon-badge"
            >
              📈 Çok Yakında
            </div>

            {/* Ana Açıklama */}
            <p
              className="text-2xl text-gray-300 mb-12 leading-relaxed"
              data-registry="4.0.B1.4"
              id="stats-description"
            >
              Oyun alışkanlıklarınızı detaylı analitiklerle keşfedin
            </p>

            {/* Özellikler Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              data-registry="4.0.B1.5"
              id="stats-features-grid"
            >
              {/* Oyun Süresi Analizi */}
              <div
                className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                data-registry="4.0.B1.5.1"
                id="playtime-analysis-card"
              >
                <div className="text-4xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Oyun Süresi Analizi
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Günlük, haftalık, aylık oyun süreleri
                  <br />
                  • Oyun başına detaylı zaman takibi
                  <br />
                  • En çok oynanan saatler analizi
                  <br />• Oyun süresi trendleri ve tahminler
                </p>
              </div>

              {/* Tür Analizi */}
              <div
                className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                data-registry="4.0.B1.5.2"
                id="genre-analysis-card"
              >
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Oyun Türü Tercihleri
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • En sevdiğiniz oyun türleri
                  <br />
                  • Tür bazında oyun süresi dağılımı
                  <br />
                  • Yeni tür keşif önerileri
                  <br />• Sezonsal tür değişimleri
                </p>
              </div>

              {/* Başarı Sistemi */}
              <div
                className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                data-registry="4.0.B1.5.3"
                id="achievement-tracking-card"
              >
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Başarı Takibi
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Achievement tamamlama oranları
                  <br />
                  • Nadir başarılar ve rozetler
                  <br />
                  • Platform bazında başarı karşılaştırması
                  <br />• Başarı avcısı istatistikleri
                </p>
              </div>

              {/* Platform Analizi */}
              <div
                className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all"
                data-registry="4.0.B1.5.4"
                id="platform-analysis-card"
              >
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Platform Kullanımı
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • PC, konsol, mobil oyun dağılımı
                  <br />
                  • Steam, Epic, Xbox Game Pass analizi
                  <br />
                  • Platform bazında oyun tercihleri
                  <br />• Çapraz platform oyun geçmişi
                </p>
              </div>

              {/* Sosyal İstatistikler */}
              <div
                className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all"
                data-registry="4.0.B1.5.5"
                id="social-stats-card"
              >
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Sosyal Oyun Analizi
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Multiplayer vs singleplayer oranı
                  <br />
                  • Arkadaşlarla oyun süresi
                  <br />
                  • Co-op oyun tercihleri
                  <br />• Online topluluk katılımı
                </p>
              </div>

              {/* Gelişmiş Raporlar */}
              <div
                className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                data-registry="4.0.B1.5.6"
                id="advanced-reports-card"
              >
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Detaylı Raporlar
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Aylık oyun aktivite raporları
                  <br />
                  • Yıllık oyun özeti
                  <br />
                  • Kişiselleştirilmiş öneriler
                  <br />• PDF ve Excel export seçenekleri
                </p>
              </div>
            </div>

            {/* Örnek Grafik Alanı */}
            <div
              className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-blue-500/20 mb-8"
              data-registry="4.0.B1.6"
              id="sample-stats-area"
            >
              <h3
                className="text-2xl font-bold text-white mb-6"
                data-registry="4.0.B1.6.1"
                id="sample-stats-title"
              >
                Örnek İstatistik Görünümü
              </h3>
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                data-registry="4.0.B1.6.2"
                id="sample-stats-grid"
              >
                <div
                  className="text-center"
                  data-registry="4.0.B1.6.2.1"
                  id="monthly-total-stat"
                >
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    156h
                  </div>
                  <p className="text-gray-400">Bu Ay Toplam</p>
                </div>
                <div
                  className="text-center"
                  data-registry="4.0.B1.6.2.2"
                  id="completed-games-stat"
                >
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    23
                  </div>
                  <p className="text-gray-400">Tamamlanan Oyun</p>
                </div>
                <div
                  className="text-center"
                  data-registry="4.0.B1.6.2.3"
                  id="achievement-rate-stat"
                >
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    89%
                  </div>
                  <p className="text-gray-400">Achievement Oranı</p>
                </div>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20"
              data-registry="4.0.B1.7"
              id="stats-footer-info"
            >
              <p className="text-gray-300 text-lg mb-4">
                <strong className="text-blue-400">Oyun İstatistikleri</strong>{" "}
                ile oyun alışkanlıklarınızı daha iyi anlayın!
              </p>
              <p className="text-gray-400 text-sm">
                Gelişmiş analitik araçları ve görselleştirmeler yakında
                sizlerle. Kişiselleştirilmiş raporlar için sabırsızlanıyoruz!
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          className="w-80 p-6 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-xl border-l border-[#00ff88]/20"
          data-registry="4.0.R"
          id="stats-sidebar"
        >
          {/* Tek Çok Yakında Kartı */}
          <div
            className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-blue-500/20 text-center"
            data-registry="4.0.R1"
            id="stats-sidebar-card"
          >
            {/* Ana İkon */}
            <div
              className="text-6xl mb-6 animate-pulse"
              data-registry="4.0.R1.1"
              id="sidebar-icon"
            >
              📊
            </div>

            {/* Başlık */}
            <h3
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
              data-registry="4.0.R1.2"
              id="sidebar-title"
            >
              Oyun İstatistikleri
            </h3>

            {/* Çok Yakında Badge */}
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg shadow-blue-500/25">
              📈 Çok Yakında
            </div>

            {/* Açıklama */}
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Oyun alışkanlıklarınızı detaylı analitiklerle keşfedin
            </p>

            {/* Özellikler */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-blue-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Detaylı Grafikler
                  </p>
                  <p className="text-gray-400 text-xs">Oyun süresi trendleri</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-green-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🏆</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Achievement Takibi
                  </p>
                  <p className="text-gray-400 text-xs">Başarı istatistikleri</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-pink-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📈</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Karşılaştırma
                  </p>
                  <p className="text-gray-400 text-xs">
                    Arkadaşlarla kıyaslama
                  </p>
                </div>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
              <p className="text-gray-300 text-sm">
                Gelişmiş analitik araçları ve görselleştirmeler yakında
                sizlerle!
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export default StatsPage;
