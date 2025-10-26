import { useNavigate, useLocation } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'

  return (
    <header className="bg-gradient-to-r from-[#1a0f2e] to-[#0a0e27] border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Logo & Nav */}
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <span className="text-2xl">🎮</span>
            <span className="text-xl font-bold text-white group-hover:text-neon-green transition-colors">
              Personal <span className="text-neon-green">Hub</span>
            </span>
          </button>
          
          {!isHome && (
            <nav className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                <span>🏠</span>
                <span>Ana Sayfa</span>
              </button>
              <span className="text-gray-600">•</span>
              <button onClick={() => navigate('/arkade')} className={`text-sm transition-colors flex items-center gap-1 ${location.pathname === '/arkade' ? 'text-neon-green' : 'text-gray-400 hover:text-white'}`}>
                <span>🎮</span>
                <span>Arkade</span>
              </button>
            </nav>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button className="glass glass-hover px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2">
            <span>🔔</span>
            <span className="hidden md:inline">Bildirimler</span>
          </button>
          
          <button className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold hover:scale-110 transition-transform">
            Ö
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
