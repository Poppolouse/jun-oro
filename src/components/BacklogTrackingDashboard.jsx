import React, { useState, useEffect } from 'react';
import { useCycles } from '../contexts/CyclesContext';
import { useActiveSession } from '../contexts/ActiveSessionContext';
import userLibrary from '../services/userLibrary';

const BacklogTrackingDashboard = () => {
  // Güvenli context kullanımı
  let contextData;
  try {
    contextData = useCycles();
  } catch (err) {
    console.error('CyclesContext hatası:', err);
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Context Hatası</div>
          <div className="text-gray-400 text-sm">{err.message}</div>
        </div>
      </div>
    );
  }

  const { activeCycle, cycles, loading, error, activateCycle, updateGameStatus } = contextData || {};
  const { startSession } = useActiveSession();
  const [cycleGames, setCycleGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loadingGames, setLoadingGames] = useState(false);

  // Aktif döngünün oyunlarını yükle
  useEffect(() => {
    const loadCycleGames = async () => {
      if (!activeCycle?.gameIds || activeCycle.gameIds.length === 0) {
        setCycleGames([]);
        return;
      }

      try {
        setLoadingGames(true);
        const library = await userLibrary.getUserLibrary();
        
        // Aktif döngüdeki oyunları filtrele
        const gamesInCycle = library.filter(entry => 
          activeCycle.gameIds.includes(entry.gameId)
        );
        
        setCycleGames(gamesInCycle);
      } catch (err) {
        console.error('Döngü oyunları yüklenemedi:', err);
      } finally {
        setLoadingGames(false);
      }
    };

    loadCycleGames();
  }, [activeCycle]);

  // Oyun durumu güncelleme
  const handleStatusChange = async (gameId, newStatus) => {
    try {
      await updateGameStatus(gameId, newStatus);
      
      // Yerel state'i güncelle
      setCycleGames(prev => 
        prev.map(game => 
          game.gameId === gameId 
            ? { ...game, status: newStatus }
            : game
        )
      );
      
      setSelectedGame(prev => 
        prev?.gameId === gameId 
          ? { ...prev, status: newStatus }
          : prev
      );
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
    }
  };

  // Oturum başlat
  const handleStartSession = async (game) => {
    try {
      await startSession({
        gameId: game.gameId,
        gameName: game.game?.name || 'Bilinmeyen Oyun',
        campaigns: game.game?.campaigns || [],
        platform: game.game?.platforms?.[0] || null
      });
      
      // Oyunu "playing" durumuna getir
      await handleStatusChange(game.gameId, 'playing');
    } catch (err) {
      console.error('Oturum başlatma hatası:', err);
    }
  };

  // Tamamlanan oyun sayısı
  const completedCount = cycleGames.filter(g => g.status === 'completed').length;
  const totalCount = cycleGames.length;

  // Status ikonları
  const getStatusIcon = (status) => {
    switch (status) {
      case 'backlog':
        return '🕒';
      case 'playing':
        return '▶️';
      case 'completed':
        return '✓';
      default:
        return '🕒';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'backlog':
        return 'bg-gray-500/20 text-gray-400';
      case 'playing':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center h-full"
        data-ers="backlog-tracking.loading"
      >
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center h-full p-8"
        data-ers="backlog-tracking.error"
      >
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-2xl">
          <div className="text-red-400 text-xl font-bold mb-4">⚠️ Hata</div>
          <div className="text-gray-300 mb-4">{error}</div>
          
          {error.includes('migration') || error.includes('Veritabanı') ? (
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <div className="text-sm text-gray-400 mb-2">Çözüm:</div>
              <code className="text-xs text-green-400 block bg-gray-900 p-3 rounded">
                cd backend<br/>
                npx prisma migrate dev --name add_cycles_and_status
              </code>
              <div className="text-xs text-gray-500 mt-2">
                Bu komut veritabanına Cycle tablosunu ve status alanını ekleyecektir.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!activeCycle) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-full p-8"
        data-ers="backlog-tracking.no-active-cycle"
      >
        <div className="text-gray-400 text-center mb-6">
          Henüz aktif bir döngü yok. Döngü yönetiminden yeni bir döngü oluşturun.
        </div>
        {cycles.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-white font-bold mb-3">Planlanmış Döngüler</h3>
            <div className="space-y-2">
              {cycles.filter(c => c.status === 'planned').map((cycle, idx) => (
                <div 
                  key={cycle.id}
                  className="flex items-center justify-between bg-gray-700/30 rounded p-3"
                  data-ers={`backlog-tracking.planned-cycle.${idx}`}
                >
                  <span className="text-gray-300">{cycle.name}</span>
                  <button
                    onClick={() => activateCycle(cycle.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    data-ers={`backlog-tracking.planned-cycle.${idx}.activate-button`}
                  >
                    Aktif Et
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex h-full gap-6 p-6"
      data-ers="backlog-tracking.dashboard"
    >
      {/* Sol Panel: Oyun Kartları */}
      <div 
        className="flex-1 overflow-y-auto"
        data-ers="backlog-tracking.main-panel"
      >
        <div 
          className="mb-6"
          data-ers="backlog-tracking.main-panel.header"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Aktif Döngü: {activeCycle.name}
          </h2>
          <p className="text-gray-400">
            {completedCount} / {totalCount} oyun tamamlandı
          </p>
        </div>

        {loadingGames ? (
          <div className="text-center text-gray-400 py-8">
            Oyunlar yükleniyor...
          </div>
        ) : cycleGames.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Bu döngüde henüz oyun yok
          </div>
        ) : (
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ers="backlog-tracking.main-panel.game-grid"
          >
            {cycleGames.map((game, idx) => (
              <div
                key={game.id}
                className="relative bg-gray-800/50 rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500 transition-all"
                onClick={() => setSelectedGame(game)}
                data-ers={`backlog-tracking.game-card.${idx}`}
              >
                {/* Kapak Resmi */}
                <div className="aspect-[3/4] relative">
                  {game.game?.cover ? (
                    <img
                      src={game.game.cover}
                      alt={game.game?.name || 'Oyun'}
                      className="w-full h-full object-cover"
                      data-ers={`backlog-tracking.game-card.${idx}.cover`}
                    />
                  ) : (
                    <div 
                      className="w-full h-full bg-gray-700 flex items-center justify-center"
                      data-ers={`backlog-tracking.game-card.${idx}.no-cover`}
                    >
                      <span className="text-gray-500 text-4xl">🎮</span>
                    </div>
                  )}
                  
                  {/* Durum Etiketi */}
                  <div 
                    className={`absolute top-2 right-2 ${getStatusColor(game.status)} rounded-full w-8 h-8 flex items-center justify-center text-lg`}
                    data-ers={`backlog-tracking.game-card.${idx}.status-icon`}
                  >
                    {getStatusIcon(game.status)}
                  </div>

                  {/* Hover: Oturum Başlat Butonu */}
                  <div 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    data-ers={`backlog-tracking.game-card.${idx}.hover-overlay`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSession(game);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                      data-ers={`backlog-tracking.game-card.${idx}.start-button`}
                    >
                      Oturumu Başlat
                    </button>
                  </div>
                </div>

                {/* Oyun Adı */}
                <div 
                  className="p-3 bg-gray-900/50"
                  data-ers={`backlog-tracking.game-card.${idx}.info`}
                >
                  <h3 className="text-white font-semibold text-sm truncate">
                    {game.game?.name || 'Bilinmeyen Oyun'}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sağ Panel: Döngü Yönetimi */}
      <div 
        className="w-80 bg-gray-800/30 rounded-xl p-6 overflow-y-auto"
        data-ers="backlog-tracking.side-panel"
      >
        <h3 
          className="text-xl font-bold text-white mb-4"
          data-ers="backlog-tracking.side-panel.title"
        >
          Döngü Yönetimi
        </h3>

        {/* Döngü İlerlemesi */}
        <div 
          className="mb-6 bg-gray-700/30 rounded-lg p-4"
          data-ers="backlog-tracking.side-panel.progress"
        >
          <div className="text-gray-400 text-sm mb-2">Döngü İlerlemesi</div>
          <div className="text-2xl font-bold text-white">
            {completedCount} / {totalCount}
          </div>
          <div className="text-gray-400 text-sm mt-1">oyun tamamlandı</div>
        </div>

        {/* Seçili Oyun Detayları */}
        {selectedGame ? (
          <div 
            className="mb-6 bg-gray-700/30 rounded-lg p-4"
            data-ers="backlog-tracking.side-panel.selected-game"
          >
            <div className="text-sm text-gray-400 mb-2">Seçili Oyun</div>
            <div className="flex items-center gap-3 mb-4">
              {selectedGame.game?.cover && (
                <img
                  src={selectedGame.game.cover}
                  alt={selectedGame.game?.name}
                  className="w-16 h-16 object-cover rounded"
                  data-ers="backlog-tracking.side-panel.selected-game.cover"
                />
              )}
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">
                  {selectedGame.game?.name || 'Bilinmeyen Oyun'}
                </h4>
                <div className={`text-xs mt-1 ${getStatusColor(selectedGame.status)} inline-block px-2 py-1 rounded`}>
                  {getStatusIcon(selectedGame.status)} {
                    selectedGame.status === 'backlog' ? 'Sırada' :
                    selectedGame.status === 'playing' ? 'Oynanıyor' :
                    selectedGame.status === 'completed' ? 'Tamamlandı' : 'Bilinmiyor'
                  }
                </div>
              </div>
            </div>

            <div 
              className="space-y-2"
              data-ers="backlog-tracking.side-panel.selected-game.actions"
            >
              <button
                onClick={() => handleStatusChange(selectedGame.gameId, 'playing')}
                disabled={selectedGame.status === 'playing'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
                data-ers="backlog-tracking.side-panel.selected-game.play-button"
              >
                Oynamaya Başla
              </button>
              <button
                onClick={() => handleStatusChange(selectedGame.gameId, 'completed')}
                disabled={selectedGame.status === 'completed'}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
                data-ers="backlog-tracking.side-panel.selected-game.complete-button"
              >
                Tamamlandı Olarak İşaretle
              </button>
              <button
                onClick={() => handleStatusChange(selectedGame.gameId, 'backlog')}
                disabled={selectedGame.status === 'backlog'}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
                data-ers="backlog-tracking.side-panel.selected-game.backlog-button"
              >
                Tekrar Sıraya Al
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="mb-6 bg-gray-700/30 rounded-lg p-4 text-center text-gray-400 text-sm"
            data-ers="backlog-tracking.side-panel.no-selection"
          >
            Detayları görmek için bir oyun seçin
          </div>
        )}

        {/* Sıradaki Döngüler */}
        <div data-ers="backlog-tracking.side-panel.upcoming-cycles">
          <h4 className="text-white font-semibold mb-3">Sıradaki Döngüler</h4>
          {cycles.filter(c => c.status === 'planned').length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">
              Planlanmış döngü yok
            </div>
          ) : (
            <div className="space-y-2">
              {cycles.filter(c => c.status === 'planned').map((cycle, idx) => (
                <div 
                  key={cycle.id}
                  className="bg-gray-700/30 rounded p-3"
                  data-ers={`backlog-tracking.side-panel.upcoming-cycle.${idx}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-semibold">
                      {cycle.name}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {cycle.gameIds?.length || 0} oyun
                    </span>
                  </div>
                  <button
                    onClick={() => activateCycle(cycle.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm transition-colors"
                    data-ers={`backlog-tracking.side-panel.upcoming-cycle.${idx}.activate-button`}
                  >
                    Aktif Et
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacklogTrackingDashboard;
