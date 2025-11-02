import ArkadeHeader from '../components/ArkadeHeader'
import ArkadeSidebar from '../components/ArkadeSidebar'
import SiteFooter from '../components/SiteFooter'

function BacklogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <ArkadeHeader />
      
      <div className="flex">
        <ArkadeSidebar />
        
        <div className="flex-1 p-8 pr-4">
          <div className="text-center max-w-4xl mx-auto">
          {/* Ana İkon */}
          <div className="text-9xl mb-8 animate-pulse">📋</div>
          
          {/* Başlık */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6">
            Backlog Yönetimi
          </h1>
          
          {/* Çok Yakında Badge */}
          <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-xl font-bold mb-8 shadow-lg shadow-orange-500/25">
            🚀 Çok Yakında
          </div>
          
          {/* Ana Açıklama */}
          <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
            Oyun biriktirme listenizi profesyonel bir şekilde yönetin
          </p>
          
          {/* Özellikler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Akıllı Öncelik Sıralaması */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Akıllı Öncelik Sıralaması</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Oyunları önem derecesine göre sıralayın<br/>
                • Otomatik öneri sistemi ile hangi oyunu oynayacağınızı belirleyin<br/>
                • Kişisel tercihlerinize göre algoritma öğrenir<br/>
                • Mood-based oyun önerileri
              </p>
            </div>
            
            {/* Platform Entegrasyonu */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-white mb-3">Platform Entegrasyonu</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Steam, Epic Games, GOG otomatik senkronizasyon<br/>
                • Xbox Game Pass ve PlayStation Plus entegrasyonu<br/>
                • Tüm platformlardan tek yerden yönetim<br/>
                • Fiyat takibi ve indirim bildirimleri
              </p>
            </div>
            
            {/* Kategori Yönetimi */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="text-xl font-bold text-white mb-3">Gelişmiş Kategori Sistemi</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Türe göre otomatik kategorilendirme<br/>
                • Özel etiketler ve filtreler<br/>
                • Oyun süresi tahminleri<br/>
                • Tamamlanma zorluğu değerlendirmesi
              </p>
            </div>
            
            {/* Zaman Planlama */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-white mb-3">Zaman Planlama</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Haftalık oyun planı oluşturma<br/>
                • Mevcut zamanınıza göre oyun önerileri<br/>
                • Tamamlanma süresi tahminleri<br/>
                • Kişisel oyun takvimi
              </p>
            </div>
            
            {/* İstatistik ve Analiz */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Detaylı Analiz</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Backlog büyüme/küçülme trendleri<br/>
                • En çok beklenen oyun türleri<br/>
                • Tamamlama oranı istatistikleri<br/>
                • Aylık backlog raporları
              </p>
            </div>
            
            {/* Sosyal Özellikler */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-3">Sosyal Özellikler</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Arkadaşlarınızın backlog'larını görün<br/>
                • Ortak oyun önerileri<br/>
                • Backlog yarışmaları ve challengelar<br/>
                • Oyun tamamlama kutlamaları
              </p>
            </div>
          </div>
          
          {/* Alt Bilgi */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20">
            <p className="text-gray-300 text-lg mb-4">
              <strong className="text-orange-400">Backlog Yönetimi</strong> özelliği ile oyun biriktirme listenizi kontrol altına alın!
            </p>
            <p className="text-gray-400 text-sm">
              Bu özellik yakında aktif olacak. Geliştirme sürecini takip etmek için bildirimleri açık tutun.
            </p>
          </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-xl border-l border-[#00ff88]/20">
          {/* Tek Çok Yakında Kartı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-orange-500/20 text-center">
            {/* Ana İkon */}
            <div className="text-6xl mb-6 animate-pulse">📋</div>
            
            {/* Başlık */}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
              Backlog Yönetimi
            </h3>
            
            {/* Çok Yakında Badge */}
            <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg shadow-orange-500/25">
              🚀 Çok Yakında
            </div>
            
            {/* Açıklama */}
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Oyun biriktirme listenizi profesyonel bir şekilde yönetin
            </p>
            
            {/* Özellikler */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-orange-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎯</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">Akıllı Sıralama</p>
                  <p className="text-gray-400 text-xs">AI destekli öncelik belirleme</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-purple-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⏰</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">Zaman Tahmini</p>
                  <p className="text-gray-400 text-xs">Gerçekçi tamamlama süreleri</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-blue-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">İlerleme Takibi</p>
                  <p className="text-gray-400 text-xs">Detaylı backlog analizi</p>
                </div>
              </div>
            </div>
            
            {/* Alt Bilgi */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
              <p className="text-gray-300 text-sm">
                Geliştirme sürecini takip etmek için bildirimleri açık tutun!
              </p>
            </div>
          </div>
        </div>
       </div>
       <SiteFooter />
     </div>
   )
 }
 
 export default BacklogPage