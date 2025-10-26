import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  const apps = [
    {
      id: 'arkade',
      title: 'Arkade',
      description: 'Gaming companion app',
      icon: '🎮',
      gradient: 'from-neon-green/20 to-transparent'
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e27] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#1a0f2e] to-[#0a0e27] border-r border-white/10 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Personal Hub</h1>
          <p className="text-gray-500 text-sm">@ozgu</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="sidebar-item active w-full text-left px-4 py-3 rounded-lg text-white flex items-center gap-3">
            <span className="text-xl">🏠</span>
            <span>Ana Sayfa</span>
          </button>
          <button className="sidebar-item w-full text-left px-4 py-3 rounded-lg text-gray-400 flex items-center gap-3">
            <span className="text-xl">📊</span>
            <span>Dashboard</span>
          </button>
          <button className="sidebar-item w-full text-left px-4 py-3 rounded-lg text-gray-400 flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <span>Ayarlar</span>
          </button>
        </nav>
        
        <div className="glass rounded-lg p-4 mt-auto">
          <p className="text-xs text-gray-400 mb-2">v0.0.1</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-neon-green to-neon-cyan"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-br from-[#1a0f2e] via-[#2a1845] to-[#0a0e27] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] to-transparent"></div>
          
          <div className="relative h-full flex flex-col justify-end p-12">
            <h1 className="text-6xl font-bold text-white mb-4">
              Hoş Geldin <span className="text-neon-green text-glow-green">Özgü</span>
            </h1>
            <p className="text-xl text-gray-300">Günlük uygulamalarına buradan erişebilirsin</p>
          </div>
        </div>

        {/* Apps Section */}
        <div className="p-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Uygulamalar</h2>
            <button className="glass glass-hover px-6 py-2 rounded-lg text-white text-sm flex items-center gap-2">
              <span>➕</span>
              <span>Yeni Ekle</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(app.path)}
                className="glass glass-hover rounded-2xl p-6 text-left relative overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="relative">
                  <div className="text-6xl mb-4">{app.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{app.title}</h3>
                  <p className="text-gray-400">{app.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Son güncelleme: Bugün</span>
                    <span className="text-neon-green text-xl">→</span>
                  </div>
                </div>
              </button>
            ))}
            
            {/* Coming Soon Cards */}
            <div className="glass rounded-2xl p-6 text-left opacity-50">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-2">Sinepedi</h3>
              <p className="text-gray-400">Film & dizi takibi</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-neon-cyan">Yakında...</span>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-6 text-left opacity-50">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-2">Sayfa</h3>
              <p className="text-gray-400">Kitap okuma tracker</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-neon-cyan">Yakında...</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-gradient-to-b from-[#1a0f2e] to-[#0a0e27] border-l border-white/10 p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-6">Son Aktiviteler</h3>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="glass rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold">
                  Ö
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm mb-1">Yeni oyun eklendi</p>
                  <p className="text-gray-400 text-xs">2 saat önce</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">İstatistikler</h3>
          
          <div className="space-y-3">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Toplam Oyun</span>
                <span className="text-2xl font-bold text-neon-green">42</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-neon-green to-neon-cyan"></div>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Bu Hafta</span>
                <span className="text-2xl font-bold text-neon-purple">12h</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-neon-purple to-neon-pink"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default HomePage
