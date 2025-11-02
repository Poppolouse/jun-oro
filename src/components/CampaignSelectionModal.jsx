import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const CampaignSelectionModal = ({ isOpen, onClose, game, onCampaignSelect }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set())

  // Modal açıldığında ilk campaign'i seç
  useEffect(() => {
    if (isOpen && game?.campaigns?.length > 0) {
      setSelectedCampaign(game.campaigns[0])
    }
  }, [isOpen, game])

  if (!isOpen || !game) return null

  const campaigns = game.campaigns || []

  // Ana campaign'leri al (parentId olmayan)
  const getMainCampaigns = () => {
    return campaigns.filter(c => !c.parentId)
  }

  // Alt campaign'leri al
  const getSubCampaigns = (parentId) => {
    return campaigns.filter(c => c.parentId === parentId)
  }

  // Campaign genişletme/daraltma
  const toggleCampaignExpansion = (campaignId) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId)
      } else {
        newSet.add(campaignId)
      }
      return newSet
    })
  }

  // Campaign seçimi
  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign)
  }

  // Oyunu başlat
  const handleStartGame = () => {
    if (selectedCampaign) {
      onCampaignSelect(selectedCampaign)
      onClose()
    }
  }

  // Süre formatı
  const formatDuration = (duration) => {
    if (!duration) return 'Bilinmiyor'
    return duration
  }

  // Campaign ikonu
  const getCampaignIcon = (campaign) => {
    if (campaign.parentId) return '📖' // Alt campaign
    if (getSubCampaigns(campaign.id).length > 0) return '📚' // Ana campaign (alt campaign'leri var)
    return '🎯' // Tek campaign
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f23] rounded-2xl border border-[#00ff88]/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                <img 
                  src={game.image || game.cover || '/api/placeholder/64/64'} 
                  alt={game.name || game.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{game.name || game.title}</h2>
                <p className="text-gray-400">Campaign Seçimi</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-[#00ff88]">{campaigns.length} Campaign</span>
                  {selectedCampaign && (
                    <span className="text-blue-400">
                      Süre: {formatDuration(selectedCampaign.averageDuration)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Campaign List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Mevcut Campaign'ler</h3>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-400">Bu oyun için henüz campaign eklenmemiş.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getMainCampaigns().map(campaign => (
                  <div key={campaign.id} className="space-y-2">
                    {/* Ana Campaign */}
                    <div 
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedCampaign?.id === campaign.id 
                          ? 'bg-[#00ff88]/20 border-[#00ff88]/50' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => handleCampaignSelect(campaign)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getCampaignIcon(campaign)}</span>
                          <div>
                            <h4 className="font-semibold text-white">{campaign.name}</h4>
                            {campaign.description && (
                              <p className="text-sm text-gray-400 mt-1">{campaign.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {campaign.averageDuration && (
                            <span className="text-sm text-blue-400 bg-blue-400/20 px-2 py-1 rounded">
                              {formatDuration(campaign.averageDuration)}
                            </span>
                          )}
                          {getSubCampaigns(campaign.id).length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCampaignExpansion(campaign.id)
                              }}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {expandedCampaigns.has(campaign.id) ? '▼' : '▶'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alt Campaign'ler */}
                    {expandedCampaigns.has(campaign.id) && getSubCampaigns(campaign.id).map(subCampaign => (
                      <div 
                        key={subCampaign.id}
                        className={`ml-8 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCampaign?.id === subCampaign.id 
                            ? 'bg-[#00ff88]/20 border-[#00ff88]/50' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => handleCampaignSelect(subCampaign)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getCampaignIcon(subCampaign)}</span>
                            <div>
                              <h5 className="font-medium text-white">{subCampaign.name}</h5>
                              {subCampaign.description && (
                                <p className="text-sm text-gray-400 mt-1">{subCampaign.description}</p>
                              )}
                            </div>
                          </div>
                          {subCampaign.averageDuration && (
                            <span className="text-sm text-blue-400 bg-blue-400/20 px-2 py-1 rounded">
                              {formatDuration(subCampaign.averageDuration)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Details */}
          {selectedCampaign && (
            <div className="w-80 p-6 border-l border-white/10 bg-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">Campaign Detayları</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">{selectedCampaign.name}</h4>
                  {selectedCampaign.description && (
                    <p className="text-sm text-gray-400 leading-relaxed">{selectedCampaign.description}</p>
                  )}
                </div>

                {selectedCampaign.averageDuration && (
                  <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400">⏱️</span>
                      <span className="text-sm font-medium text-blue-400">Tahmini Süre</span>
                    </div>
                    <p className="text-white font-semibold">{formatDuration(selectedCampaign.averageDuration)}</p>
                  </div>
                )}

                {selectedCampaign.customProperties && selectedCampaign.customProperties.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Özel Özellikler</h5>
                    <div className="space-y-2">
                      {selectedCampaign.customProperties.map((prop, index) => (
                        <div key={index} className="p-2 bg-white/5 rounded border border-white/10">
                          <div className="text-xs text-gray-400">{prop.name}</div>
                          <div className="text-sm text-white">{prop.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCampaign.parentId && (
                  <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">📖</span>
                      <span className="text-sm text-yellow-400">Alt Campaign</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pb-12 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {selectedCampaign ? `${selectedCampaign.name} seçildi` : 'Bir campaign seçin'}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleStartGame}
                disabled={!selectedCampaign}
                className="px-6 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎮 Oyunu Başlat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CampaignSelectionModal