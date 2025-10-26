import WelcomeSection from '@/components/WelcomeSection'
import AppCard from '@/components/AppCard'

function App() {
  const apps = [
    {
      id: 'arkade',
      icon: '🎮',
      title: 'Arkade',
      description: 'Oyun kütüphanesi',
      stats: 'Yakında açılacak'
    },
    {
      id: 'sinepedi',
      icon: '🎬',
      title: 'Sinepedi',
      description: 'Film & dizi takibi',
      stats: 'Yakında açılacak'
    },
    {
      id: 'sayfa',
      icon: '📚',
      title: 'Sayfa',
      description: 'Kitap okuma',
      stats: 'Yakında açılacak'
    },
    {
      id: 'kas-kurdu',
      icon: '💪',
      title: 'Kas Kurdu',
      description: 'Antrenman takibi',
      stats: 'Yakında açılacak'
    },
    {
      id: 'finans',
      icon: '💰',
      title: 'Finans',
      description: 'Bütçe yönetimi',
      stats: 'Yakında açılacak'
    },
    {
      id: 'yapyap',
      icon: '✅',
      title: 'Yapyap',
      description: 'Todo listeleri',
      stats: 'Yakında açılacak'
    }
  ]

  const handleAppClick = (appId) => {
    console.log('Tıklanan uygulama:', appId)
    alert(`${appId} yakında açılacak!`)
  }

  return (
    <div className="min-h-screen" style= background: 'var(--bg-page)' >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <WelcomeSection userName="Özgü" />

        {/* Uygulamalar Başlık */}
        <h2 className="text-2xl font-bold mb-6" style= color: 'var(--text-primary)' >
          🚀 Uygulamalar
        </h2>

        {/* Uygulama Kartları Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              icon={app.icon}
              title={app.title}
              description={app.description}
              stats={app.stats}
              onClick={() => handleAppClick(app.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center" style= color: 'var(--text-muted)' >
          <p className="text-sm">
            Jun-Oro Hub • Kişisel Web Uygulamaları Merkezi
          </p>
        </div>
      </div>
    </div>
  )
}

export default App