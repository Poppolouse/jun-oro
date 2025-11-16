import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lock, Trash2, GripVertical } from 'lucide-react';
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

  const { activeCycle, cycles, loading, error, activateCycle, updateGameStatus, createCycle, deleteCycle, reorderCycles } = contextData || {};
  const { startSession } = useActiveSession();
  const [cycleGames, setCycleGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleDescription, setNewCycleDescription] = useState('');
  const [plannedOrder, setPlannedOrder] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [orderInputValue, setOrderInputValue] = useState('1');

  const plannedCycles = useMemo(() => {
    if (!cycles || !Array.isArray(cycles)) {
      return [];
    }

    return [...cycles]
      .filter(cycle => cycle.status === 'planned')
      .sort((a, b) => {
        const orderDiff = (a.order ?? 0) - (b.order ?? 0);
        if (orderDiff !== 0) {
          return orderDiff;
        }
        const createdAtA = new Date(a.createdAt || 0).getTime();
        const createdAtB = new Date(b.createdAt || 0).getTime();
        return createdAtA - createdAtB;
      });
  }, [cycles]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    setPlannedOrder(plannedCycles);
  }, [plannedCycles]);

  // Aktif döngünün oyunlarını yükle
  useEffect(() => {
    const loadCycleGames = async () => {
      if (!activeCycle?.gameIds || activeCycle.gameIds.length === 0) {
        setCycleGames([]);
        return;
      }

      try {
        setLoadingGames(true);
        const libraryGames = await userLibrary.getLibraryGamesWithDetails();
        
        // Aktif döngüdeki oyunları filtrele
        const gamesInCycle = libraryGames.filter(entry => 
          activeCycle.gameIds.includes(entry.id)
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

  // Yeni döngü oluştur
  const handleCreateCycle = async (e) => {
    e.preventDefault();
    
    if (!newCycleName.trim()) {
      return;
    }

    try {
      await createCycle({
        name: newCycleName.trim(),
        description: newCycleDescription.trim() || null,
        gameIds: []
      });
      
      setNewCycleName('');
      setNewCycleDescription('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Döngü oluşturma hatası:', err);
      alert('Döngü oluşturulamadı: ' + err.message);
    }
  };

  const byOrder = useCallback((a, b) => (a.order ?? 0) - (b.order ?? 0), []);

  const buildFullOrdering = useCallback((updatedPlanned) => {
    if (!cycles || !Array.isArray(cycles)) {
      return [];
    }

    const activeIds = cycles
      .filter(cycle => cycle.status === 'active')
      .sort(byOrder)
      .map(cycle => cycle.id);

    const otherIds = cycles
      .filter(cycle => cycle.status !== 'active' && cycle.status !== 'planned')
      .sort(byOrder)
      .map(cycle => cycle.id);

    return [...activeIds, ...updatedPlanned.map(cycle => cycle.id), ...otherIds];
  }, [byOrder, cycles]);

  const persistPlannedOrder = useCallback(async (nextOrder) => {
    if (!nextOrder || nextOrder.length === 0 || !reorderCycles) {
      return;
    }

    setIsReordering(true);
    setReorderError(null);

    try {
      const orderedIds = buildFullOrdering(nextOrder);
      if (orderedIds.length === 0) {
        return;
      }
      await reorderCycles(orderedIds);
    } catch (err) {
      console.error('Döngü sıralaması kaydedilemedi:', err);
      setReorderError(err.message);
      setPlannedOrder(plannedCycles);
    } finally {
      setIsReordering(false);
    }
  }, [buildFullOrdering, plannedCycles, reorderCycles]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }

    setPlannedOrder(prev => {
      const oldIndex = prev.findIndex(cycle => cycle.id === active.id);
      const newIndex = prev.findIndex(cycle => cycle.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      const reordered = arrayMove(prev, oldIndex, newIndex);
      persistPlannedOrder(reordered);
      return reordered;
    });
  };

  const openOrderEditor = (cycle) => {
    setEditingCycle(cycle);
    const currentIndex = plannedOrder.findIndex(item => item.id === cycle.id);
    setOrderInputValue(currentIndex >= 0 ? String(currentIndex + 1) : '1');
  };

  const handleManualOrderSave = async () => {
    if (!editingCycle || plannedOrder.length === 0) {
      setEditingCycle(null);
      return;
    }

    const parsedValue = parseInt(orderInputValue, 10);
    if (Number.isNaN(parsedValue)) {
      setReorderError('Geçerli bir sıra değeri girin.');
      return;
    }

    const maxIndex = Math.max(plannedOrder.length - 1, 0);
    const desiredIndex = Math.min(Math.max(parsedValue - 1, 0), maxIndex);
    const remaining = plannedOrder.filter(cycle => cycle.id !== editingCycle.id);
    const targetCycle = plannedOrder.find(cycle => cycle.id === editingCycle.id) || editingCycle;
    remaining.splice(desiredIndex, 0, targetCycle);

    setPlannedOrder(remaining);
    await persistPlannedOrder(remaining);
    setEditingCycle(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !deleteCycle) {
      setDeleteTarget(null);
      return;
    }

    setDeleteLoading(true);
    setReorderError(null);

    try {
      await deleteCycle(deleteTarget.id);
    } catch (err) {
      console.error('Döngü silinemedi:', err);
      setReorderError(err.message);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const getGameCount = useCallback((cycle) => {
    if (!cycle?.gameIds) {
      return 0;
    }

    if (Array.isArray(cycle.gameIds)) {
      return cycle.gameIds.length;
    }

    if (typeof cycle.gameIds === 'string') {
      try {
        const parsed = JSON.parse(cycle.gameIds);
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch (err) {
        console.warn('gameIds parse edilemedi:', err);
        return 0;
      }
    }

    return 0;
  }, []);

  const renderPlannedCycleList = (dataErsPrefix, emptyStateErs) => {
    if (!plannedOrder.length) {
      return (
        <div className="text-gray-400 text-sm text-center py-4" data-ers={emptyStateErs}>
          Planlanmış döngü yok
        </div>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={plannedOrder.map(cycle => cycle.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2" data-ers={`${dataErsPrefix}.list`}>
            {plannedOrder.map((cycle, idx) => (
              <PlannedCycleCard
                key={cycle.id}
                cycle={cycle}
                index={idx}
                isLocked={idx > 0}
                gameCount={getGameCount(cycle)}
                dataErs={`${dataErsPrefix}.item.${idx}`}
                onActivate={() => activateCycle?.(cycle.id)}
                onOrderEdit={() => openOrderEditor(cycle)}
                onRequestDelete={() => setDeleteTarget(cycle)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
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
          Henüz aktif bir döngü yok. Yeni bir döngü oluşturun veya mevcut döngülerden birini aktif edin.
        </div>
        
        {/* Yeni Döngü Oluştur Butonu */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg mb-6 transition-colors font-semibold"
          data-ers="backlog-tracking.create-cycle-button"
        >
          + Yeni Döngü Oluştur
        </button>
        
        {cycles.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4 w-full max-w-md" data-ers="backlog-tracking.planned-container">
            <h3 className="text-white font-bold mb-3">Planlanmış Döngüler</h3>
            {renderPlannedCycleList('backlog-tracking.planned-container', 'backlog-tracking.planned-container.empty')}
            {isReordering && (
              <div className="text-xs text-blue-400 mt-2" data-ers="backlog-tracking.planned-container.status">
                Yeni sıra kaydediliyor...
              </div>
            )}
            {reorderError && (
              <div className="text-xs text-red-400 mt-2" data-ers="backlog-tracking.planned-container.error">
                {reorderError}
              </div>
            )}
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
          {renderPlannedCycleList('backlog-tracking.side-panel.upcoming-cycles', 'backlog-tracking.side-panel.upcoming-cycles.empty')}
          {isReordering && (
            <div className="text-xs text-blue-400 mt-2" data-ers="backlog-tracking.side-panel.upcoming-cycles.status">
              Yeni sıra kaydediliyor...
            </div>
          )}
          {reorderError && (
            <div className="text-xs text-red-400 mt-2" data-ers="backlog-tracking.side-panel.upcoming-cycles.error">
              {reorderError}
            </div>
          )}
        </div>
      </div>

      {/* Yeni Döngü Oluşturma Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
          data-ers="backlog-tracking.create-modal.overlay"
        >
          <div 
            className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-ers="backlog-tracking.create-modal"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Yeni Döngü Oluştur</h2>
            
            <form onSubmit={handleCreateCycle}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2" htmlFor="cycle-name">
                  Döngü Adı *
                </label>
                <input
                  id="cycle-name"
                  type="text"
                  value={newCycleName}
                  onChange={(e) => setNewCycleName(e.target.value)}
                  placeholder="Örn: Yaz 2024 Döngüsü"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                  data-ers="backlog-tracking.create-modal.name-input"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2" htmlFor="cycle-description">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  id="cycle-description"
                  value={newCycleDescription}
                  onChange={(e) => setNewCycleDescription(e.target.value)}
                  placeholder="Bu döngü hakkında kısa bir açıklama..."
                  rows="3"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
                  data-ers="backlog-tracking.create-modal.description-input"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  data-ers="backlog-tracking.create-modal.cancel-button"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-semibold"
                  data-ers="backlog-tracking.create-modal.submit-button"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => (deleteLoading ? null : setDeleteTarget(null))}
          data-ers="backlog-tracking.delete-modal.overlay"
        >
          <div 
            className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-ers="backlog-tracking.delete-modal"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              "{deleteTarget.name}" döngüsünü sil
            </h2>
            <p className="text-gray-400 mb-6">
              Bu döngüyü silmek istediğinizden emin misiniz? İşlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                disabled={deleteLoading}
                data-ers="backlog-tracking.delete-modal.cancel"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={deleteLoading}
                data-ers="backlog-tracking.delete-modal.confirm"
              >
                {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCycle && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setEditingCycle(null)}
          data-ers="backlog-tracking.order-modal.overlay"
        >
          <div 
            className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-ers="backlog-tracking.order-modal"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Döngü Sırasını Güncelle
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              "{editingCycle.name}" döngüsünün yeni sırasını girin. 1 en üstteki sırayı temsil eder.
            </p>
            <label className="block text-gray-400 text-sm mb-2" htmlFor="cycle-order-input">
              Yeni Sıra Numarası
            </label>
            <input
              id="cycle-order-input"
              type="number"
              min="1"
              max={Math.max(plannedOrder.length, 1)}
              value={orderInputValue}
              onChange={(e) => setOrderInputValue(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              data-ers="backlog-tracking.order-modal.input"
            />
            <p className="text-gray-500 text-xs mt-2">
              Alternatif olarak öğeyi listede sürükleyerek de sıralayabilirsiniz.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingCycle(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                data-ers="backlog-tracking.order-modal.cancel"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleManualOrderSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold"
                data-ers="backlog-tracking.order-modal.save"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacklogTrackingDashboard;

const PlannedCycleCard = ({
  cycle,
  index,
  isLocked,
  gameCount,
  dataErs,
  onActivate = () => {},
  onOrderEdit = () => {},
  onRequestDelete = () => {}
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cycle.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-700/30 rounded-lg p-3 border border-gray-600/30 shadow-sm transition-all ${isLocked ? 'opacity-60 grayscale' : ''} ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
      data-ers={dataErs}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-600/40 transition-colors"
            data-ers={`${dataErs}.drag-handle`}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div>
            <span className="text-white text-sm font-semibold block">
              {cycle.name}
            </span>
            <span className="text-gray-500 text-xs">Sıra #{index + 1}</span>
          </div>
          {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
        </div>
        <button
          type="button"
          onClick={onRequestDelete}
          className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
          data-ers={`${dataErs}.delete-button`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{gameCount} oyun</span>
        <span className="text-gray-500">ID: {cycle.id.slice(0, 6)}...</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3" data-ers={`${dataErs}.actions`}>
        <button
          type="button"
          onClick={onActivate}
          className="bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm transition-colors"
          data-ers={`${dataErs}.activate-button`}
        >
          Aktif Et
        </button>
        <button
          type="button"
          onClick={onOrderEdit}
          className="bg-gray-600 hover:bg-gray-500 text-white py-1 rounded text-sm transition-colors"
          data-ers={`${dataErs}.edit-button`}
        >
          Sıra Düzenle
        </button>
      </div>
    </div>
  );
};
