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
    <nav className="bg-dark-surface h-16 border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="text-2xl">⭐</div>
          <h1 className="text-lg font-semibold text-primary-500">Jun-Oro Hub</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {apps.map((app) => (
            <button
              key={app.id}
              className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white flex items-center space-x-2"
              onClick={() => alert(`${app.name} yakında!`)}
            >
              <span>{app.icon}</span>
              <span className="hidden lg:inline">{app.name}</span>
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:ring-2 ring-primary-500/50 transition-all">
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
        <div className="md:hidden bg-dark-surface border-t border-white/10">
          <div className="container mx-auto px-6 py-4 space-y-1">
            {apps.map((app) => (
              <button
                key={app.id}
                className="w-full px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-left text-gray-300 hover:text-white flex items-center space-x-3"
                onClick={() => {
                  alert(`${app.name} yakında!`)
                  setIsMenuOpen(false)
                }}
              >
                <span className="text-xl">{app.icon}</span>
                <span>{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar