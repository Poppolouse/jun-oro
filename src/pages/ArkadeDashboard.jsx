import ArkadeHeader from "../components/ArkadeHeader";
import ArkadeSidebar from "../components/ArkadeSidebar";
import SiteFooter from "../components/SiteFooter";

function ArkadeDashboard() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]"
      id="arkade-dashboard"
      data-registry="2.0"
    >
      <ArkadeHeader />

      <div className="flex" id="dashboard-layout" data-registry="2.0.B">
        <ArkadeSidebar />

        <div className="flex-1 p-8 pr-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Ana İkon */}
            <div className="text-9xl mb-8 animate-pulse">🎮</div>

            {/* Başlık */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent mb-6">
              Arkade Dashboard
            </h1>

            {/* Çok Yakında Badge */}
            <div className="inline-block bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black px-8 py-4 rounded-full text-xl font-bold mb-8 shadow-lg shadow-[#00ff88]/25">
              🚀 Çok Yakında
            </div>

            {/* Ana Açıklama */}
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
              Oyun deneyiminizi profesyonelce yönetin ve analiz edin
            </p>

            {/* Özellikler Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Oyun İstatistikleri */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Detaylı İstatistikler
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Oyun süresi analizi ve trendler
                  <br />
                  • Tür bazında oyun dağılımı
                  <br />
                  • Aylık ve yıllık oyun raporları
                  <br />• Kişisel oyun başarı metrikleri
                </p>
              </div>

              {/* Aktivite Takibi */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Aktivite Takibi
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Günlük oyun aktivite grafiği
                  <br />
                  • En çok oynanan oyunlar listesi
                  <br />
                  • Oyun oturumu analizi
                  <br />• Haftalık aktivite özeti
                </p>
              </div>

              {/* Başarı Sistemi */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Başarı Sistemi
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Oyun tamamlama rozetleri
                  <br />
                  • Milestone başarıları
                  <br />
                  • Sosyal başarı paylaşımı
                  <br />• Kişisel rekor takibi
                </p>
              </div>

              {/* Oyun Önerileri */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Akıllı Öneriler
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • AI destekli oyun önerileri
                  <br />
                  • Mood-based oyun seçimi
                  <br />
                  • Arkadaş aktivitelerine göre öneriler
                  <br />• Trend analizi ve popüler oyunlar
                </p>
              </div>

              {/* Sosyal Özellikler */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Sosyal Dashboard
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Arkadaş aktivite akışı
                  <br />
                  • Ortak oyun önerileri
                  <br />
                  • Leaderboard ve yarışmalar
                  <br />• Oyun deneyimi paylaşımı
                </p>
              </div>

              {/* Kişiselleştirme */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Kişiselleştirme
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Özelleştirilebilir dashboard widget'ları
                  <br />
                  • Kişisel tema ve renk seçenekleri
                  <br />
                  • Bildirim tercihleri
                  <br />• Dashboard layout düzenleyici
                </p>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 rounded-xl p-6 border border-[#00ff88]/20">
              <p className="text-gray-300 text-lg mb-4">
                <strong className="text-[#00ff88]">Arkade Dashboard</strong> ile
                oyun deneyiminizi bir üst seviyeye taşıyın!
              </p>
              <p className="text-gray-400 text-sm">
                Bu özellik yakında aktif olacak. Geliştirme sürecini takip etmek
                için bildirimleri açık tutun.
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-xl border-l border-[#00ff88]/20">
          {/* Tek Çok Yakında Kartı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-[#00ff88]/20 text-center">
            {/* Ana İkon */}
            <div className="text-6xl mb-6 animate-pulse">🎮</div>

            {/* Başlık */}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent mb-4">
              Arkade Dashboard
            </h3>

            {/* Çok Yakında Badge */}
            <div className="inline-block bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg shadow-[#00ff88]/25">
              🚀 Çok Yakında
            </div>

            {/* Açıklama */}
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Oyun deneyiminizi profesyonelce yönetin ve analiz edin
            </p>

            {/* Özellikler */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-[#00ff88]/20">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">📊</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Detaylı İstatistikler
                  </p>
                  <p className="text-gray-400 text-xs">
                    Oyun analizi ve trendler
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-purple-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🏆</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Başarı Sistemi
                  </p>
                  <p className="text-gray-400 text-xs">
                    Rozetler ve milestone'lar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-blue-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">👥</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Sosyal Dashboard
                  </p>
                  <p className="text-gray-400 text-xs">Arkadaş aktiviteleri</p>
                </div>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 rounded-lg p-4 border border-[#00ff88]/20">
              <p className="text-gray-300 text-sm">
                Geliştirme sürecini takip etmek için bildirimleri açık tutun!
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export default ArkadeDashboard;
