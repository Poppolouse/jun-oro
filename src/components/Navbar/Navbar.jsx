import { useState } from 'react'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const apps = [
    { id: 'arkade', icon: '🎮', name: 'Arkade' },
    { id: 'sinepedi', icon: '🎬', name: 'Sinepedi' },
    { id: 'sayfa', icon: '📚', name: 'Sayfa' },
    { id: 'kas-kurdu', icon: '💪', name: 'Kas Kurdu' },
    { id: 'finans', icon: '💰', name: 'Finans' },
    { id: 'yapyap', icon: '✅', name: 'Yapyap' }
  ]

  return (
    <nav className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">⭐</div>
            <h1 className="text-xl font-bold text-white">Jun-Oro Hub</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {apps.map((app) => (
              <button
                key={app.id}
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300 hover:text-white flex items-center space-x-2"
                onClick={() => alert(`${app.name} yakında!`)}
              >
                <span>{app.icon}</span>
                <span>{app.name}</span>
              </button>
            ))}
          </div>

          {/* User Avatar */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              Ö
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/10">
            {apps.map((app) => (
              <button
                key={app.id}
                className="w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left text-gray-300 hover:text-white flex items-center space-x-3"
                onClick={() => {
                  alert(`${app.name} yakında!`)
                  setIsMenuOpen(false)
                }}
              >
                <span className="text-xl">{app.icon}</span>
                <span>{app.name}</span>
              </button>
            ))}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center space-x-3 px-4">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                  Ö
                </div>
                <div>
                  <p className="text-white font-medium">Özgü</p>
                  <p className="text-xs text-gray-400">Profil Ayarları</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar