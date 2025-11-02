import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { updatesApi } from '../../services/api'

const statusColors = {
  in_progress: 'bg-blue-500',
  planned: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  completed: 'bg-green-500'
}

const statusLabels = {
  in_progress: 'Devam Ediyor',
  planned: 'Planlandı',
  cancelled: 'İptal Edildi',
  completed: 'Tamamlandı'
}

const typeColors = {
  feature: 'bg-green-600',
  bugfix: 'bg-red-600',
  improvement: 'bg-blue-600',
  security: 'bg-purple-600',
  performance: 'bg-orange-600'
}

const typeLabels = {
  feature: 'Özellik',
  bugfix: 'Hata Düzeltmesi',
  improvement: 'İyileştirme',
  security: 'Güvenlik',
  performance: 'Performans'
}

const priorityColors = {
  low: 'bg-gray-600',
  medium: 'bg-yellow-600',
  high: 'bg-orange-600',
  critical: 'bg-red-600'
}

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik'
}

export function UpdatesCard({ showManage = false }) {
  const [updates, setUpdates] = useState({ recent: [], inProgress: [] })
  const [plannedUpdates, setPlannedUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true)
        const [homepageResponse, plannedResponse] = await Promise.all([
          updatesApi.getHomepageUpdates({ limit: 5 }),
          updatesApi.getUpdates({ status: 'planned', limit: 10 })
        ])
        
        if (homepageResponse.success) {
          setUpdates(homepageResponse.data)
        } else {
          setError('Güncellemeler yüklenemedi')
        }
        
        if (plannedResponse.success) {
          setPlannedUpdates(plannedResponse.data || [])
        }
      } catch (err) {
        console.error('Updates fetch error:', err)
        setError('Güncellemeler yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

  const current = updates?.inProgress || []
  const upcoming = updates?.recent?.slice(0, 3) || []

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div className="text-center" id="updates-card" data-registry="1.0.B5">
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 md:p-12">
          <div className="text-5xl md:text-6xl mb-4 md:mb-6" data-registry="1.0.B5.1">🛠️</div>
          <h3 className="text-2xl font-bold text-white mb-4" data-registry="1.0.B5.2">Güncel Geliştirmeler</h3>
          <div className="text-gray-400">Güncellemeler yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center" id="updates-card" data-registry="1.0.B5">
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 md:p-12">
          <div className="text-5xl md:text-6xl mb-4 md:mb-6" data-registry="1.0.B5.1">🛠️</div>
          <h3 className="text-2xl font-bold text-white mb-4" data-registry="1.0.B5.2">Güncel Geliştirmeler</h3>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center" id="updates-card" data-registry="1.0.B5">
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 md:p-12">
        <div className="text-5xl md:text-6xl mb-4 md:mb-6" data-registry="1.0.B5.1">🛠️</div>
        <h3 className="text-2xl font-bold text-white mb-4" data-registry="1.0.B5.2">Güncel Geliştirmeler</h3>
        <p className="text-gray-300 text-base md:text-lg mb-6 max-w-2xl mx-auto" data-registry="1.0.B5.3">
          Burada şu an üzerinde çalıştığımız özelliklerin ilerlemesini ve son tamamlanan güncellemeleri görebilirsiniz.
        </p>

        {/* Current Developments */}
        <div className="text-left max-w-3xl mx-auto mb-8" id="updates-current" data-registry="1.0.B5.4">
          <h4 className="text-lg font-semibold text-white mb-3">Devam Eden Geliştirmeler</h4>
          {current.length === 0 ? (
            <div className="text-gray-400 text-sm">Şu anda aktif geliştirme yok.</div>
          ) : (
            current.map(item => (
              <div key={item.id} className="mb-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-white" id={`update-title-${item.id}`} data-registry={`1.0.B5.4.${item.id}.title`}>
                        {item.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full text-black ${statusColors[item.status] || 'bg-gray-500'}`} id={`update-status-${item.id}`} data-registry={`1.0.B5.4.${item.id}.status`}>
                        {statusLabels[item.status] || item.status}
                      </span>
                      {item.type && (
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${typeColors[item.type] || 'bg-gray-600'}`} id={`update-type-${item.id}`} data-registry={`1.0.B5.4.${item.id}.type`}>
                          {typeLabels[item.type] || item.type}
                        </span>
                      )}
                      {item.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${priorityColors[item.priority] || 'bg-gray-600'}`} id={`update-priority-${item.id}`} data-registry={`1.0.B5.4.${item.id}.priority`}>
                          {priorityLabels[item.priority] || item.priority}
                        </span>
                      )}
                      {item.version && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-600 text-white">
                          v{item.version}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                    )}
                    {item.targetDate && (
                      <p className="text-gray-500 text-xs mt-1">
                        Hedef: {new Date(item.targetDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  
                  {/* Substeps toggle button */}
                  {item.substeps && item.substeps.length > 0 && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                      id={`substeps-toggle-${item.id}`}
                      data-registry={`1.0.B5.4.${item.id}.substeps-toggle`}
                    >
                      <span>{item.substeps.length} Alt Adım</span>
                      <span className={`transform transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                  )}
                </div>
                
                {/* Progress bar */}
                {item.progress !== null && (
                  <div className="mt-4">
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
                        style={{ width: `${Math.min(100, Math.max(0, item.progress || 0))}%` }}
                        id={`update-progress-${item.id}`}
                        data-registry={`1.0.B5.4.${item.id}.progress`}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-400 mt-1">%{Math.round(item.progress || 0)}</div>
                  </div>
                )}

                {/* Substeps list */}
                {expandedId === item.id && item.substeps && item.substeps.length > 0 && (
                  <div className="mt-4 space-y-2" id={`substeps-list-${item.id}`} data-registry={`1.0.B5.4.${item.id}.substeps-list`}>
                    <div className="text-sm font-medium text-gray-300 mb-2">Alt Adımlar:</div>
                    {item.substeps.map((substep, index) => (
                      <div 
                        key={substep.id} 
                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600/30"
                        id={`substep-${substep.id}`}
                        data-registry={`1.0.B5.4.${item.id}.substep.${index}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">#{index + 1}</span>
                            <h5 className="text-sm font-medium text-white">{substep.title}</h5>
                            <span className={`text-xs px-2 py-1 rounded-full text-black ${statusColors[substep.status] || 'bg-gray-500'}`}>
                              {statusLabels[substep.status] || substep.status}
                            </span>
                          </div>
                          {substep.description && (
                            <p className="text-xs text-gray-400 mt-1 ml-6">{substep.description}</p>
                          )}
                        </div>
                        
                        {/* Substep progress */}
                        <div className="ml-4 min-w-[80px]">
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-blue-400 to-green-400"
                              style={{ width: `${Math.min(100, Math.max(0, substep.progress || 0))}%` }}
                            />
                          </div>
                          <div className="text-right text-xs text-gray-400 mt-1">%{Math.round(substep.progress || 0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Planned Updates */}
        <div className="text-left max-w-3xl mx-auto mb-8" id="updates-planned" data-registry="1.0.B5.3">
          <h4 className="text-lg font-semibold text-white mb-3">Planlanan Güncellemeler</h4>
          {plannedUpdates.length === 0 ? (
            <div className="text-gray-400 text-sm">Henüz planlanan güncelleme bulunmuyor.</div>
          ) : (
            plannedUpdates.map((update) => (
              <div key={update.id} className="mb-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-white font-medium" id={`planned-title-${update.id}`} data-registry={`1.0.B5.3.${update.id}.title`}>
                      {update.title}
                    </div>
                    {update.type && (
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${typeColors[update.type] || 'bg-gray-600'}`}>
                        {typeLabels[update.type] || update.type}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      update.priority === 'high' ? 'bg-red-600' :
                      update.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                    } text-white`}>
                      {update.priority === 'high' ? 'Yüksek' : 
                       update.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-white">
                      Planlanan
                    </span>
                  </div>
                </div>
                {update.description && (
                  <div className="text-gray-400 text-sm mb-2" id={`planned-desc-${update.id}`} data-registry={`1.0.B5.3.${update.id}.desc`}>
                    {update.description}
                  </div>
                )}
                {update.targetDate && (
                  <div className="text-xs text-blue-400">
                    Hedef Tarih: {new Date(update.targetDate).toLocaleDateString('tr-TR')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Recent Completed Updates */}
        <div className="text-left max-w-3xl mx-auto" id="updates-recent" data-registry="1.0.B5.5">
          <h4 className="text-lg font-semibold text-white mb-3">Son Tamamlanan Güncellemeler</h4>
          {upcoming.length === 0 ? (
            <div className="text-gray-400 text-sm">Henüz tamamlanan güncelleme bulunmuyor.</div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((it, idx) => (
                <li key={it.id} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
                  <span className="text-sm text-slate-300">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-medium" id={`recent-title-${it.id}`} data-registry={`1.0.B5.5.${it.id}.title`}>{it.title}</div>
                      {it.status && (
                        <span className={`text-xs px-2 py-1 rounded-full text-black ${statusColors[it.status] || 'bg-gray-500'}`}>
                          {statusLabels[it.status] || it.status}
                        </span>
                      )}
                      {it.type && (
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${typeColors[it.type] || 'bg-gray-600'}`}>
                          {typeLabels[it.type] || it.type}
                        </span>
                      )}
                      {it.version && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white">
                          v{it.version}
                        </span>
                      )}
                    </div>
                    {it.description && (
                      <div className="text-gray-400 text-sm" id={`recent-desc-${it.id}`} data-registry={`1.0.B5.5.${it.id}.desc`}>{it.description}</div>
                    )}
                    {it.completedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Tamamlandı: {new Date(it.completedAt).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Admin yönetim butonu kaldırıldı: Yönetim artık Ayarlar > Admin sol sidebar alt kategorilerinden erişiliyor */}
      </div>
    </div>
  )
}

UpdatesCard.propTypes = {
  showManage: PropTypes.bool
}


export default UpdatesCard