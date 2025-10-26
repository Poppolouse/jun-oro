import { useNavigate, useLocation } from 'react-router-dom'

function ComingSoon() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const appNames = {
    '/sinepedi': { icon: '🎬', name: 'Sinepedi' },
    '/sayfa': { icon: '📚', name: 'Sayfa' },
    '/kas-kurdu': { icon: '💪', name: 'Kas Kurdu' },
    '/finans': { icon: '💰', name: 'Finans' },
    '/yapyap': { icon: '✅', name: 'Yapyap' }
  }

  const app = appNames[location.pathname] || { icon: '⭐', name: 'Bu uygulama' }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="text-8xl mb-6">{app.icon}</div>
      <h1 className="text-4xl font-bold mb-4 text-white">{app.name}</h1>
      <p className="text-xl text-gray-400 mb-8">
        Çok yakında burada olacak! 🚀
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
      >
        Ana Sayfaya Dön
      </button>
    </div>
  )
}

export default ComingSoon