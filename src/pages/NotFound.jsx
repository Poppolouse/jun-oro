import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="text-8xl mb-6">🤷</div>
      <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
      <p className="text-xl text-gray-400 mb-8">
        Aradığınız sayfa bulunamadı.
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

export default NotFound