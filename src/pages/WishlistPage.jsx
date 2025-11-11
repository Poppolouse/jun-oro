import ArkadeHeader from "../components/ArkadeHeader";
import ArkadeSidebar from "../components/ArkadeSidebar";
import SiteFooter from "../components/SiteFooter";

function WishlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <ArkadeHeader />

      <div className="flex">
        <ArkadeSidebar />

        <div className="flex-1 p-8 pr-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Ana İkon */}
            <div className="text-9xl mb-8 animate-pulse">💝</div>

            {/* Başlık */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
              İstek listesi
            </h1>

            {/* Çok Yakında Badge */}
            <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full text-xl font-bold mb-8 shadow-lg shadow-pink-500/25">
              💖 Çok Yakında
            </div>

            {/* Ana Açıklama */}
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
              İstek listenizi takip edin ve hiçbir indirimi kaçırmayın
            </p>

            {/* Özellikler Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Fiyat Takibi */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Akıllı Fiyat Takibi
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Otomatik fiyat düşüşü bildirimleri
                  <br />
                  • Hedef fiyat belirleme
                  <br />
                  • Fiyat geçmişi grafikleri
                  <br />• En iyi indirim zamanı tahminleri
                </p>
              </div>

              {/* Platform Entegrasyonu */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Çoklu Platform Desteği
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Steam, Epic Games, GOG senkronizasyonu
                  <br />
                  • PlayStation Store ve Xbox Store
                  <br />
                  • Humble Bundle ve diğer mağazalar
                  <br />• Tek yerden tüm istek listeleri
                </p>
              </div>

              {/* İndirim Bildirimleri */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Akıllı Bildirimler
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Anında indirim bildirimleri
                  <br />
                  • Kişiselleştirilmiş bildirim zamanları
                  <br />
                  • Email, push ve Discord entegrasyonu
                  <br />• Özel etkinlik bildirimleri
                </p>
              </div>

              {/* Oyun Analizi */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Oyun Değerlendirme
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Metacritic ve kullanıcı puanları
                  <br />
                  • Steam review analizi
                  <br />
                  • Oyun süresi ve zorluk bilgisi
                  <br />• Benzer oyun önerileri
                </p>
              </div>

              {/* Bütçe Yönetimi */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Bütçe Planlama
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Aylık oyun bütçesi belirleme
                  <br />
                  • Harcama takibi ve raporları
                  <br />
                  • Öncelik bazında satın alma önerileri
                  <br />• Tasarruf hedefleri
                </p>
              </div>

              {/* Sosyal Özellikler */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Sosyal İstek listesi
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  • Arkadaşlarınızın istek listelerini görün
                  <br />
                  • Ortak oyun önerileri
                  <br />
                  • Hediye verme önerileri
                  <br />• İstek listesi paylaşımı ve yorumlar
                </p>
              </div>
            </div>

            {/* Örnek Wishlist Görünümü */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-pink-500/20 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Örnek İstek listesi Görünümü
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-lg font-bold text-white mb-2">
                    Cyberpunk 2077
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-bold">₺89.99</span>
                    <span className="text-red-400 text-sm">-50%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Steam • Hedef: ₺60
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-lg font-bold text-white mb-2">
                    Elden Ring
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">₺299.99</span>
                    <span className="text-gray-500 text-sm">Tam Fiyat</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Epic Games • Hedef: ₺200
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-lg font-bold text-white mb-2">
                    Hades II
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 font-bold">₺149.99</span>
                    <span className="text-green-400 text-sm">Yeni!</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Steam • Early Access
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
              <p className="text-gray-300 text-lg mb-4">
                <strong className="text-pink-400">İstek listesi</strong> ile
                hiçbir indirimi kaçırmayın!
              </p>
              <p className="text-gray-400 text-sm">
                Akıllı fiyat takibi ve bildirim sistemi yakında aktif olacak.
                Oyun alışverişinizi optimize etmeye hazır olun!
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-xl border-l border-[#00ff88]/20">
          {/* Tek Çok Yakında Kartı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-pink-500/20 text-center">
            {/* Ana İkon */}
            <div className="text-6xl mb-6 animate-pulse">💝</div>

            {/* Başlık */}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              İstek listesi
            </h3>

            {/* Çok Yakında Badge */}
            <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg shadow-pink-500/25">
              💰 Çok Yakında
            </div>

            {/* Açıklama */}
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Akıllı fiyat takibi ve indirim bildirimleri ile hiçbir fırsatı
              kaçırmayın
            </p>

            {/* Özellikler */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-pink-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💰</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">Fiyat Takibi</p>
                  <p className="text-gray-400 text-xs">
                    Otomatik indirim bildirimleri
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-blue-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔗</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Platform Senkronizasyonu
                  </p>
                  <p className="text-gray-400 text-xs">
                    Steam, Epic, GOG entegrasyonu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-green-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔔</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    Akıllı Bildirimler
                  </p>
                  <p className="text-gray-400 text-xs">
                    Kişiselleştirilmiş uyarılar
                  </p>
                </div>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-4 border border-pink-500/20">
              <p className="text-gray-300 text-sm">
                Bütçe takibi, hediye önerileri ve arkadaş istek listeleri
                yakında!
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export default WishlistPage;
