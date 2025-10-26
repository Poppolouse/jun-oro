import { useNavigate } from 'react-router-dom';

const ActiveSessionCard = ({ hasActiveSession, activeGame }) => {
  const navigate = useNavigate();

  if (hasActiveSession && activeGame) {
    return (
      <div className="bg-surface-elevated backdrop-blur-xl bg-opacity-60 border border-border-default rounded-2xl p-6 shadow-lg hover:shadow-[0_0_30px_rgba(76,110,245,0.3)] transition-all">
        <div className="flex items-center gap-6">
          {/* Game Cover */}
          <div className="w-24 h-24 bg-surface-hover rounded-lg overflow-hidden flex-shrink-0">
            {activeGame.coverImage ? (
              <img src={activeGame.coverImage} alt={activeGame.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
            )}
          </div>

          {/* Game Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-text-primary mb-1">{activeGame.title}</h3>
            <p className="text-text-secondary">Toplam süre: <span className="text-accent-primary font-medium">{activeGame.totalPlaytime || 0} dakika</span></p>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => navigate('/arkade/aktif-oturum')}
            className="px-8 py-4 bg-accent-primary text-white font-bold rounded-xl hover:bg-opacity-90 shadow-[0_0_20px_rgba(76,110,245,0.5)] hover:shadow-[0_0_30px_rgba(76,110,245,0.7)] transition-all"
          >
            Devam Et →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated backdrop-blur-xl bg-opacity-60 border border-border-default rounded-2xl p-8 shadow-lg text-center">
      <p className="text-xl text-text-secondary mb-4">Hangi oyunu oynayacaksın?</p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigate('/arkade/backlog')}
          className="px-6 py-3 bg-accent-primary text-white font-medium rounded-xl hover:bg-opacity-90 shadow-[0_0_15px_rgba(76,110,245,0.4)] hover:shadow-[0_0_25px_rgba(76,110,245,0.6)] transition-all"
        >
          🎲 Rastgele Seç
        </button>
        <button
          onClick={() => navigate('/arkade/kutuphane')}
          className="px-6 py-3 bg-surface-hover text-text-primary font-medium rounded-xl hover:bg-opacity-80 border border-border-default transition-all"
        >
          📚 Kütüphaneyi Gör
        </button>
      </div>
    </div>
  );
};

export default ActiveSessionCard;