import ArkadeHeader from '../components/ArkadeHeader'
import ArkadeSidebar from '../components/ArkadeSidebar'
import SiteFooter from '../components/SiteFooter'

function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]" data-registry="5.0" id="gallery-page">
      <ArkadeHeader />
      
      <div className="flex" data-registry="5.0.B" id="gallery-layout">
        <ArkadeSidebar />
        
        <div className="flex-1 p-8 pr-4" data-registry="5.0.B1" id="gallery-content">
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center max-w-4xl mx-auto">
          {/* Ana İkon */}
          <div className="text-9xl mb-8 animate-pulse" data-registry="5.0.B1.1" id="gallery-main-icon">📷</div>
          
          {/* Başlık */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6" data-registry="5.0.B1.2" id="gallery-title">
            Oyun Galerisi
          </h1>
          
          {/* Çok Yakında Badge */}
          <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full text-xl font-bold mb-8 shadow-lg shadow-emerald-500/25" data-registry="5.0.B1.3" id="gallery-coming-soon-badge">
            📸 Çok Yakında
          </div>
          
          {/* Ana Açıklama */}
          <p className="text-2xl text-gray-300 mb-12 leading-relaxed" data-registry="5.0.B1.4" id="gallery-description">
            Oyun anlarınızı kaydedin, organize edin ve paylaşın
          </p>
          
          {/* Özellikler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" data-registry="5.0.B1.5" id="gallery-features-grid">
            {/* Otomatik Kayıt */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-all" data-registry="5.0.B1.5.1" id="auto-capture-card">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">Otomatik Medya Yakalama</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Achievement anında otomatik screenshot<br/>
                • Boss fight ve önemli anlar kaydı<br/>
                • Oyun başlangıç/bitiş otomatik kayıt<br/>
                • Kişiselleştirilebilir tetikleyiciler
              </p>
            </div>
            
            {/* Video Kayıt */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all" data-registry="5.0.B1.5.2" id="video-recording-card">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-3">Gelişmiş Video Kayıt</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • 4K 60FPS video kayıt desteği<br/>
                • Instant replay özelliği<br/>
                • Highlight reel otomatik oluşturma<br/>
                • Ses ve mikrofon kayıt seçenekleri
              </p>
            </div>
            
            {/* Organizasyon */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all" data-registry="5.0.B1.5.3" id="organization-card">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-white mb-3">Akıllı Organizasyon</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Oyun bazında otomatik klasörleme<br/>
                • Tarih ve achievement bazında sıralama<br/>
                • Özel etiketler ve kategoriler<br/>
                • Gelişmiş arama ve filtreleme
              </p>
            </div>
            
            {/* Düzenleme Araçları */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all" data-registry="5.0.B1.5.5" id="editing-card">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-bold text-white mb-3">Entegre Düzenleme</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Basit video düzenleme araçları<br/>
                • Filtre ve efekt uygulama<br/>
                • Metin ve logo ekleme<br/>
                • Müzik ve ses efekti ekleme
              </p>
            </div>
            
            {/* Sosyal Paylaşım */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all" data-registry="5.0.B1.5.4" id="sharing-card">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-white mb-3">Sosyal Medya Entegrasyonu</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Twitter, Instagram, TikTok paylaşımı<br/>
                • Discord ve Steam entegrasyonu<br/>
                • Otomatik hashtag önerileri<br/>
                • Topluluk galerisi ve yarışmalar
              </p>
            </div>
            
            {/* Bulut Depolama */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all" data-registry="5.0.B1.5.6" id="cloud-storage-card">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-xl font-bold text-white mb-3">Bulut Senkronizasyon</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                • Otomatik bulut yedekleme<br/>
                • Çoklu cihaz senkronizasyonu<br/>
                • Sınırsız depolama alanı<br/>
                • Hızlı erişim ve indirme
              </p>
            </div>
          </div>
          
          {/* Örnek Galeri Alanı */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-emerald-500/20 mb-8" data-registry="5.0.B1.6" id="sample-gallery-area">
            <h3 className="text-2xl font-bold text-white mb-6" data-registry="5.0.B1.6.1" id="sample-gallery-title">Örnek Galeri Görünümü</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-registry="5.0.B1.6.2" id="sample-gallery-grid">
              {/* Örnek Medya Kartları */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg p-4 border border-emerald-500/30">
                <div className="aspect-video bg-white/10 rounded mb-2 flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="text-xs text-white font-medium">Epic Boss Fight</div>
                <div className="text-xs text-gray-400">Cyberpunk 2077</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
                <div className="aspect-video bg-white/10 rounded mb-2 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="text-xs text-white font-medium">Achievement Unlocked</div>
                <div className="text-xs text-gray-400">Elden Ring</div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg p-4 border border-pink-500/30">
                <div className="aspect-video bg-white/10 rounded mb-2 flex items-center justify-center">
                  <span className="text-2xl">🌅</span>
                </div>
                <div className="text-xs text-white font-medium">Beautiful Sunset</div>
                <div className="text-xs text-gray-400">The Witcher 3</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                <div className="aspect-video bg-white/10 rounded mb-2 flex items-center justify-center">
                  <span className="text-2xl">⚔️</span>
                </div>
                <div className="text-xs text-white font-medium">Epic Combat</div>
                <div className="text-xs text-gray-400">God of War</div>
              </div>
            </div>
          </div>
          
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-2">2,847</div>
              <p className="text-gray-400">Toplam Screenshot</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-400 mb-2">156</div>
              <p className="text-gray-400">Video Klip</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-400 mb-2">89</div>
              <p className="text-gray-400">Paylaşılan İçerik</p>
            </div>
          </div>
          
          {/* Alt Bilgi */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/20">
            <p className="text-gray-300 text-lg mb-4">
              <strong className="text-emerald-400">Oyun Galerisi</strong> ile unutulmaz anlarınızı ölümsüzleştirin!
            </p>
            <p className="text-gray-400 text-sm">
              Otomatik kayıt, düzenleme araçları ve sosyal paylaşım özellikleri yakında sizlerle. Oyun anlarınızı kaydetmeye hazır olun!
            </p>
          </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-xl border-l border-[#00ff88]/20">
          {/* Tek Çok Yakında Kartı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-emerald-500/20 text-center">
            {/* Ana İkon */}
            <div className="text-6xl mb-6 animate-pulse">📸</div>
            
            {/* Başlık */}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
              Oyun Galerisi
            </h3>
            
            {/* Çok Yakında Badge */}
            <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg shadow-emerald-500/25">
              🎨 Çok Yakında
            </div>
            
            {/* Açıklama */}
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Oyun anlarınızı otomatik kaydedin ve unutulmaz koleksiyonlar oluşturun
            </p>
            
            {/* Özellikler */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-emerald-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🤖</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">Otomatik Etiketleme</p>
                  <p className="text-gray-400 text-xs">AI ile akıllı kategorizasyon</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-blue-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">☁️</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">Bulut Senkronizasyonu</p>
                  <p className="text-gray-400 text-xs">Tüm cihazlarda erişim</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-pink-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎨</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">Gelişmiş Editör</p>
                  <p className="text-gray-400 text-xs">Filtreler ve efektler</p>
                </div>
              </div>
            </div>
            
            {/* Alt Bilgi */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg p-4 border border-emerald-500/20">
              <p className="text-gray-300 text-sm">
                Otomatik kayıt, sosyal paylaşım ve gelişmiş düzenleme araçları yakında!
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

export default GalleryPage