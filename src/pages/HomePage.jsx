import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  const apps = [
    {
      id: 'arkade',
      title: 'Arkade',
      description: 'Gaming companion app',
      icon: '🎮',
      color: 'neon-green',
      path: '/arkade'
    },
    // Gelecekte eklenecek uygulamalar
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-purple via-[#0a0e27] to-deep-purple">
      {/* Header */}
      <header className="pt-12 pb-8 px-8">
        <h1 className="text-5xl font-bold text-white mb-2">
          Personal <span className="text-neon-green">Hub</span>
        </h1>
        <p className="text-gray-400 text-lg">Günlük hayat uygulamalarım</p>
      </header>

      {/* Apps Grid */}
      <main className="px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => navigate(app.path)}
              className="glass glass-hover rounded-2xl p-8 text-left group"
            >
              <div className="text-6xl mb-4">{app.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors">
                {app.title}
              </h2>
              <p className="text-gray-400">{app.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

export default HomePage
