import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="bg-dark-surface h-16 border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="text-2xl">⭐</div>
          <h1 className="text-lg font-semibold text-primary-500">Jun-Oro Hub</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <button 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            title="Ara"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Notifications */}
          <button 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white relative"
            title="Bildirimler"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <button 
            className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm hover:ring-2 ring-primary-500/50 transition-all"
            title="Profil"
          >
            Ö
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar