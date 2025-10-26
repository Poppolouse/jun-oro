/**
 * WelcomeSection Component
 * Hoş geldin mesajı ve quick stats
 */

function WelcomeSection({ userName }) {
  return (
    <div className="mb-8">
      {/* Hoş Geldin Mesajı */}
      <div 
        className="glass p-6 rounded-xl mb-6"
        style=
          background: 'rgba(102, 126, 234, 0.1)',
          borderColor: 'rgba(102, 126, 234, 0.3)'
        
      >
        <h2 className="text-3xl font-bold mb-2" style= color: 'var(--text-primary)' >
          👋 Hoş geldin, {userName}!
        </h2>
        <p style= color: 'var(--text-secondary)' >
          Tüm uygulamalarına buradan ulaşabilirsin. Devam böyle! 🚀
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-lg">
          <div className="text-2xl mb-2">🎮</div>
          <h3 className="font-semibold mb-1" style= color: 'var(--text-primary)' >Oyun</h3>
          <p className="text-2xl font-bold" style= color: 'var(--color-primary-500)' >0 saat</p>
          <p className="text-xs" style= color: 'var(--text-muted)' >Bu hafta</p>
        </div>

        <div className="glass p-4 rounded-lg">
          <div className="text-2xl mb-2">🎬</div>
          <h3 className="font-semibold mb-1" style= color: 'var(--text-primary)' >Film & Dizi</h3>
          <p className="text-2xl font-bold" style= color: 'var(--color-primary-500)' >0 içerik</p>
          <p className="text-xs" style= color: 'var(--text-muted)' >Bu hafta</p>
        </div>

        <div className="glass p-4 rounded-lg">
          <div className="text-2xl mb-2">⏳</div>
          <h3 className="font-semibold mb-1" style= color: 'var(--text-primary)' >Backlog</h3>
          <p className="text-2xl font-bold" style= color: 'var(--color-primary-500)' >0 item</p>
          <p className="text-xs" style= color: 'var(--text-muted)' >Tüm uygulamalar</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeSection