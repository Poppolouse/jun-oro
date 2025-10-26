import WelcomeSection from '@/components/WelcomeSection'
import AppCard from '@/components/AppCard'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const apps = [
    { id: 'arkade', icon: '🎮', title: 'Arkade', description: 'Oyun kütüphanesi', stats: 'Yakında', path: '/arkade' },
    { id: 'sinepedi', icon: '🎬', title: 'Sinepedi', description: 'Film & dizi', stats: 'Yakında', path: '/sinepedi' },
    { id: 'sayfa', icon: '📚', title: 'Sayfa', description: 'Kitap okuma', stats: 'Yakında', path: '/sayfa' },
    { id: 'kas-kurdu', icon: '💪', title: 'Kas Kurdu', description: 'Antrenman', stats: 'Yakında', path: '/kas-kurdu' },
    { id: 'finans', icon: '💰', title: 'Finans', description: 'Bütçe', stats: 'Yakında', path: '/finans' },
    { id: 'yapyap', icon: '✅', title: 'Yapyap', description: 'Todo', stats: 'Yakında', path: '/yapyap' }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <WelcomeSection userName="Özgü" />
      
      <h2 className="text-2xl font-bold mb-6 text-white">
        🚀 Uygulamalar
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <AppCard 
            key={app.id} 
            icon={app.icon}
            title={app.title}
            description={app.description}
            stats={app.stats}
            onClick={() => navigate(app.path)}
          />
        ))}
      </div>
      
      <div className="mt-12 text-center text-gray-500">
        <p className="text-sm">Jun-Oro Hub • Kişisel Uygulamalar</p>
      </div>
    </div>
  )
}

export default Home