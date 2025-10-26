import WelcomeSection from '@/components/WelcomeSection'
import AppCard from '@/components/AppCard'

function App() {
  const apps = [
    { id: 'arkade', icon: '🎮', title: 'Arkade', description: 'Oyun kütüphanesi', stats: 'Yakında' },
    { id: 'sinepedi', icon: '🎬', title: 'Sinepedi', description: 'Film & dizi', stats: 'Yakında' },
    { id: 'sayfa', icon: '📚', title: 'Sayfa', description: 'Kitap okuma', stats: 'Yakında' },
    { id: 'kas-kurdu', icon: '💪', title: 'Kas Kurdu', description: 'Antrenman', stats: 'Yakında' },
    { id: 'finans', icon: '💰', title: 'Finans', description: 'Bütçe', stats: 'Yakında' },
    { id: 'yapyap', icon: '✅', title: 'Yapyap', description: 'Todo', stats: 'Yakında' }
  ]

  const handleAppClick = (appId) => {
    alert(`${appId} yakında!`)
  }

  return (
    <div className="min-h-screen" style= background: 'var(--bg-page)' >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <WelcomeSection userName="Özgü" />
        
        <h2 className="text-2xl font-bold mb-6" style= color: 'var(--text-primary)' >
          🚀 Uygulamalar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} {...app} onClick={() => handleAppClick(app.id)} />
          ))}
        </div>
        
        <div className="mt-12 text-center" style= color: 'var(--text-muted)' >
          <p className="text-sm">Jun-Oro Hub • Kişisel Uygulamalar</p>
        </div>
      </div>
    </div>
  )
}

export default App