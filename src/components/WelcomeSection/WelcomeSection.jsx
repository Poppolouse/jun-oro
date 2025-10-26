function WelcomeSection({ userName }) {
  return (
    <div className="mb-8">
      <div className="glass p-6 rounded-xl mb-6 bg-primary-500/10 border border-primary-500/30">
        <h2 className="text-3xl font-bold mb-2 text-white">
          👋 Hoş geldin, {userName}!
        </h2>
        <p className="text-gray-300">
          Tüm uygulamalarına buradan ulaşabilirsin. Devam böyle! 🚀
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-lg">
          <div className="text-2xl mb-2">🎮</div>
          <h3 className="font-semibold mb-1 text-white">Oyun</h3>
          <p className="text-2xl font-bold text-primary-500">0 saat</p>
          <p className="text-xs text-gray-500">Bu hafta</p>
        </div>

        <div className="glass p-4 rounded-lg">
          <div className="text-2xl mb-2">🎬</div>
          <h3 className="font-semibold mb-1 text-white">Film & Dizi</h3>
          <p className="text-2xl font-bold text-primary-500">0 içerik</p>
          <p className="text-xs text-gray-500">Bu hafta</p>
        </div>

        <div className="glass p-4 rounded-lg">
          <div className="text-2xl mb-2">⏳</div>
          <h3 className="font-semibold mb-1 text-white">Backlog</h3>
          <p className="text-2xl font-bold text-primary-500">0 item</p>
          <p className="text-xs text-gray-500">Tüm uygulamalar</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeSection