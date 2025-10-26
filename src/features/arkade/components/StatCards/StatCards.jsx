const StatCards = () => {
  // TODO: Gerçek veriler store'dan gelecek
  const thisMonthHours = 0;
  const lastAddedGame = null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Card - This Month Hours */}
      <div className="bg-gradient-to-br from-accent-primary to-blue-600 backdrop-blur-xl bg-opacity-90 rounded-2xl p-6 shadow-[0_0_25px_rgba(76,110,245,0.4)] border border-blue-400 border-opacity-30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-opacity-80 text-sm font-medium mb-1">Bu Ay Oynadın</p>
            <p className="text-white text-4xl font-bold">{thisMonthHours} <span className="text-xl">saat</span></p>
          </div>
          <div className="text-5xl opacity-20">⏱️</div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${Math.min((thisMonthHours / 50) * 100, 100)}%` }}
          />
        </div>
        <p className="text-white text-opacity-70 text-xs mt-2">Hedef: 50 saat</p>
      </div>

      {/* Right Card - Last Added Game */}
      <div className="bg-surface-elevated backdrop-blur-xl bg-opacity-60 border border-border-default rounded-2xl p-6 shadow-lg hover:shadow-[0_0_20px_rgba(76,110,245,0.2)] transition-all">
        {lastAddedGame ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-surface-hover rounded-lg overflow-hidden flex-shrink-0">
              {lastAddedGame.coverImage ? (
                <img src={lastAddedGame.coverImage} alt={lastAddedGame.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-text-secondary text-sm mb-1">Son Eklenen</p>
              <p className="text-text-primary font-bold text-lg">{lastAddedGame.title}</p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-text-secondary text-sm">Henüz oyun eklenmedi</p>
            <button className="mt-3 text-accent-primary text-sm font-medium hover:underline">
              İlk oyununu ekle →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCards;