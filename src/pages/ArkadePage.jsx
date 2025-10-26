import { useNavigate } from 'react-router-dom'

function ArkadePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-purple via-[#0a0e27] to-deep-purple">
      {/* Header */}
      <header className="pt-8 pb-6 px-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white mb-2 transition-colors"
          >
            ← Geri
          </button>
          <h1 className="text-4xl font-bold text-white">
            🎮 <span className="text-neon-green">Arkade</span>
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-8 pb-12">
        <div className="glass rounded-2xl p-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-4">Gaming Companion</h2>
          <p className="text-gray-400 mb-6">
            Oyun kütüphaneni yönet, oturumlarını takip et, istatistiklerini gör.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass glass-hover rounded-xl p-6">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-white font-semibold mb-1">Kütüphane</h3>
              <p className="text-gray-400 text-sm">Tüm oyunların</p>
            </div>
            
            <div className="glass glass-hover rounded-xl p-6">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-white font-semibold mb-1">İstatistikler</h3>
              <p className="text-gray-400 text-sm">Oyun zamanın</p>
            </div>
            
            <div className="glass glass-hover rounded-xl p-6">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-white font-semibold mb-1">Backlog</h3>
              <p className="text-gray-400 text-sm">Oynanacaklar</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ArkadePage
