import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function ArkadePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('library')

  const games = [
    { id: 1, title: 'Cyberpunk 2077', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', hours: 45, status: 'playing' },
    { id: 2, title: 'The Witcher 3', cover: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400', hours: 120, status: 'completed' },
    { id: 3, title: 'Red Dead 2', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', hours: 80, status: 'playing' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e27] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#1a0f2e] to-[#0a0e27] border-r border-white/10 p-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors">
          <span>←</span>
          <span>Ana Sayfa</span>
        </button>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🎮</span>
            <span className="text-neon-green">Arkade</span>
          </h1>
        </div>
        
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('library')} className={`sidebar-item ${activeTab === 'library' ? 'active' : ''} w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'library' ? 'text-white' : 'text-gray-400'}`}>
            <span className="text-xl">📚</span>
            <span>Kütüphane</span>
          </button>
          <button onClick={() => setActiveTab('backlog')} className={`sidebar-item ${activeTab === 'backlog' ? 'active' : ''} w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'backlog' ? 'text-white' : 'text-gray-400'}`}>
            <span className="text-xl">🎯</span>
            <span>Backlog</span>
          </button>
          <button onClick={() => setActiveTab('stats')} className={`sidebar-item ${activeTab === 'stats' ? 'active' : ''} w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'stats' ? 'text-white' : 'text-gray-400'}`}>
            <span className="text-xl">📊</span>
            <span>İstatistikler</span>
          </button>
          <button onClick={() => setActiveTab('wishlist')} className={`sidebar-item ${activeTab === 'wishlist' ? 'active' : ''} w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'wishlist' ? 'text-white' : 'text-gray-400'}`}>
            <span className="text-xl">⭐</span>
            <span>Wishlist</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <div className="relative h-80 bg-gradient-to-br from-[#1a0f2e] via-[#2a1845] to-[#0a0e27] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-transparent"></div>
          
          <div className="relative h-full flex items-end p-12">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-neon-green/20 text-neon-green border border-neon-green/50 mb-3">ŞU AN OYNUYOR</span>
              <h1 className="text-5xl font-bold text-white mb-2">Cyberpunk 2077</h1>
              <p className="text-gray-300">45 saat oynadın • Son oturum: 2 saat önce</p>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="p-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Oyun Kütüphanesi</h2>
            <div className="flex gap-3">
              <button className="glass glass-hover px-4 py-2 rounded-lg text-white text-sm">Filtrele</button>
              <button className="glass glass-hover px-4 py-2 rounded-lg text-white text-sm">Sırala</button>
              <button className="neon-border-green glass px-6 py-2 rounded-lg text-white text-sm font-semibold">+ Oyun Ekle</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <div key={game.id} className="glass glass-hover rounded-xl overflow-hidden group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={game.cover} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {game.status === 'playing' && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-neon-green/90 text-black">Oynuyor</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 truncate">{game.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{game.hours}h oynadın</span>
                    <span className="text-neon-green">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-gradient-to-b from-[#1a0f2e] to-[#0a0e27] border-l border-white/10 p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-6">Bu Hafta</h3>
        
        <div className="glass rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-neon-green mb-1">12.5</div>
            <div className="text-gray-400 text-sm">saat oynadın</div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <div className="h-full w-3/4 bg-gradient-to-r from-neon-green to-neon-cyan"></div>
          </div>
          <div className="text-xs text-gray-500 text-center">Haftalık hedefin: 15h</div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-4">Son Başarılar</h3>
        
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-2xl">
                🏆
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">İlk Zafer</p>
                <p className="text-gray-400 text-xs">Cyberpunk 2077</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default ArkadePage
