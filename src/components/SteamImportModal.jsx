import React, { useState } from 'react'
import steamApi from '../services/steamApi'
import igdbApi from '../services/igdbApi'
import userLibrary from '../services/userLibrary'
import { gameApi, libraryApi } from '../services/api'

function SteamImportModal({ isOpen, onClose, onImported }) {
  const [inputValue, setInputValue] = useState('')
  const [phase, setPhase] = useState('idle') // idle | resolving | fetchingSteam | fetchingIgdb | review | saving | done
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState({ total: 0, completed: 0 })
  const [candidates, setCandidates] = useState([])
  const [importedCount, setImportedCount] = useState(0)
  const [includeUnresolved, setIncludeUnresolved] = useState(false)

  // Statik kategori eşlemesi (hook olmadan, her render’da sabit)
  const categoryMapping = {
    backlog: 'wishlist',
    wishlist: 'wishlist',
    playing: 'playing',
    completed: 'completed',
    dropped: 'dropped'
  }

  if (!isOpen) return null

  const normalizeName = (name) => {
    return (name || '')
      .toLowerCase()
      .replace(/\u2122|\u00ae|®|™/g, '')
      .replace(/(game of the year|goty|complete|definitive|remastered|edition|ultimate|collection)/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  }

  const pickBestMatch = (steamName, igdbResults) => {
    if (!Array.isArray(igdbResults) || igdbResults.length === 0) return null
    const sNorm = normalizeName(steamName)
    // 1) Tam isim eşleşmesi
    const exact = igdbResults.find(r => normalizeName(r.name) === sNorm)
    if (exact) return exact
    // 2) İçeren eşleşme
    const contains = igdbResults.find(r => normalizeName(r.name).includes(sNorm) || sNorm.includes(normalizeName(r.name)))
    if (contains) return contains
    // 3) En yüksek rating
    const rated = [...igdbResults].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return rated[0]
  }

  // Yereldeki (kütüphanedeki) oyunun verileri eksiksiz mi?
  const isCompleteLocalGame = (g) => {
    if (!g) return false
    const nameOk = !!(g.name || g.title)
    const c = g.cover
    const coverOk = !!(c && (c.image_id || (typeof c.url === 'string' && c.url.length > 0)))
    return nameOk && coverOk
  }

  // Kütüphane verisini IGDB-like bir nesneye dönüştür (import akışı için)
  const toIgdbLikeFromLocal = (g) => {
    const normalizeArr = (arr) => Array.isArray(arr) ? arr.map((x) => (typeof x === 'string' ? { name: x } : x)) : []
    return {
      id: g.id,
      name: g.name || g.title || 'Bilinmeyen Oyun',
      cover: g.cover ? { image_id: g.cover.image_id, url: typeof g.cover.url === 'string' ? g.cover.url : undefined } : null,
      first_release_date: g.first_release_date,
      genres: normalizeArr(g.genres),
      platforms: normalizeArr(g.platforms?.length ? g.platforms : ['PC']),
      summary: g.summary,
      rating: g.rating,
      rating_count: g.rating_count,
      screenshots: g.screenshots
    }
  }

  // DB'deki oyun kaydını IGDB-like nesneye dönüştür
  const toIgdbLikeFromDbGame = (g) => {
    const normalizeArr = (arr) => Array.isArray(arr) ? arr.map((x) => (typeof x === 'string' ? { name: x } : x)) : []
    const igdbId = (g?.igdbData && typeof g.igdbData.id === 'number') ? g.igdbData.id : undefined
    return {
      id: igdbId, // IGDB id varsa kullan, yoksa undefined bırak
      dbGameId: g.id, // Mevcut DB kaydının ID'sini taşı
      name: g.name || 'Bilinmeyen Oyun',
      cover: g.cover ? { url: g.cover } : null,
      first_release_date: g.firstReleaseDate ? Math.floor(new Date(g.firstReleaseDate).getTime() / 1000) : undefined,
      genres: normalizeArr(g.genres),
      platforms: normalizeArr(g.platforms?.length ? g.platforms : ['PC']),
      summary: g.summary,
      rating: g.rating,
      rating_count: g.rating_count,
      screenshots: Array.isArray(g.screenshots) ? g.screenshots.map(url => ({ url })) : []
    }
  }

  const updateCandidate = (index, updates) => {
    setCandidates(prev => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const fetchIgdbForCandidates = async (list) => {
    const total = list.length
    setProgress({ total, completed: 0 })
    setPhase('fetchingIgdb')
    let completed = 0
    // IGDB oran sınırlayıcı ile uyumlu, güvenli eşzamanlılık
    // Not: Her aday için 2 IGDB çağrısı (search + details) yapılır.
    // Global servis tarafında saniyede 2 isteğe throttle var; burada da
    // eşzamanlılığı düşük tutmak, 429 olasılığını daha da azaltır.
    const CONCURRENCY = 2

    // Kuyruk yaklaşımı
    const queue = list.map((item, idx) => ({ item, idx }))

    // Mevcut kütüphaneden isim -> oyun eşlemesi (tam eşleşme için)
    const existingGames = await userLibrary.getLibraryGamesWithDetails() || []
    const localIndex = new Map()
    for (const g of existingGames) {
      const key = normalizeName(g.name || g.title)
      if (key) localIndex.set(key, g)
    }

    const worker = async () => {
      while (queue.length) {
        const { item, idx } = queue.shift()
        try {
          // 1) Önce yerel kütüphanede eksiksiz veri var mı kontrol et
          const sNorm = normalizeName(item.steamName)
          const local = localIndex.get(sNorm)
          if (local && isCompleteLocalGame(local)) {
            updateCandidate(idx, { igdb: toIgdbLikeFromLocal(local), error: null, sourceHint: 'local' })
          } else {
            // 2) DB'de var mı kontrol et (oyunlar tablosu)
            try {
              const dbRes = await gameApi.getGames({ search: item.steamName, limit: 5 })
              const dbList = Array.isArray(dbRes?.data) ? dbRes.data : []
              const dbMatch = pickBestMatch(item.steamName, dbList)
              if (dbMatch) {
                updateCandidate(idx, { igdb: toIgdbLikeFromDbGame(dbMatch), error: null, sourceHint: 'db' })
              } else {
                // 3) DB'de yoksa IGDB araması yap
                const results = await igdbApi.searchGames(item.steamName, 5)
                const chosen = pickBestMatch(item.steamName, results || [])
                if (chosen) {
                  // Ekstra detay (getGameDetails) çağrısını iptal ederek istek sayısını yarıya düşür.
                  // searchGames zaten çoğu gerekli alanı içeriyor.
                  updateCandidate(idx, { igdb: chosen, error: null })
                } else {
                  updateCandidate(idx, { igdb: null, error: 'Eşleşme bulunamadı', selected: false })
                }
              }
            } catch (e) {
              // DB araması başarısızsa IGDB ile devam et
              const results = await igdbApi.searchGames(item.steamName, 5)
              const chosen = pickBestMatch(item.steamName, results || [])
              if (chosen) {
                updateCandidate(idx, { igdb: chosen, error: null })
              } else {
                updateCandidate(idx, { igdb: null, error: 'Eşleşme bulunamadı', selected: false })
              }
            }
          }
        } catch (err) {
          updateCandidate(idx, { igdb: null, error: err.message || 'Arama hatası', selected: false })
        } finally {
          completed++
          setProgress({ total, completed })
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }).map(() => worker()))
  }

  const handleImport = async () => {
    try {
      setImportedCount(0)
      setCandidates([])
      setStatus('Steam ID çözümleniyor...')
      setPhase('resolving')
      const resolved = await steamApi.resolveSteamId(inputValue)
      if (!resolved.success) {
        setStatus(`Hata: ${resolved.message || 'Steam ID çözümlenemedi'}`)
        setPhase('idle')
        return
      }
      const steamId = resolved.steamId
      setStatus(`Steam ID bulundu: ${steamId}. Oyunlar getiriliyor...`)
      setPhase('fetchingSteam')

      const games = await steamApi.getOwnedGames(steamId)
      if (!Array.isArray(games) || games.length === 0) {
        setStatus('Hiç oyun bulunamadı veya Steam profili gizli olabilir.')
        setPhase('idle')
        return
      }

      // Aday listesi oluştur
      const initial = games.map(g => ({
        appid: String(g.appid),
        steamName: g.name || 'Bilinmeyen Oyun',
        playtimeMins: Number(g.playtime_forever || 0),
        steamHeader: steamApi.getHeaderImageUrl(String(g.appid)),
        igdb: null,
        error: null,
        selected: true,
        targetStatus: 'backlog'
      }))
      setCandidates(initial)
      setStatus(`Steam'den ${initial.length} oyun bulundu. Oyunlar aktarılıyor...`)

      await fetchIgdbForCandidates(initial)
      setStatus('Veriler hazır. Listedeki oyunlar için durumları ayarlayın ve kaydedin.')
      setPhase('review')
    } catch (error) {
      console.error('Steam import hatası:', error)
      setStatus(`Hata: ${error.message || 'Bilinmeyen hata'}`)
      setPhase('idle')
    }
  }

  const handleBulkStatusChange = (newStatus) => {
    setCandidates(prev => prev.map(c => c.selected ? { ...c, targetStatus: newStatus } : c))
  }

  const handleSelectAllToggle = (checked) => {
    setCandidates(prev => prev.map(c => ({ ...c, selected: checked })))
  }

  const buildGameDataFromCandidate = (cand) => {
    const d = cand.igdb
    if (d) {
      return {
        id: d.id,
        name: d.name,
        // IGDB kapaklarını tam nesne olarak sakla (image_id/url), 2:3 afiş için gereklidir
        cover: d.cover ? { image_id: d.cover.image_id, url: d.cover.url } : (cand.steamHeader ? { url: cand.steamHeader } : null),
        first_release_date: d.first_release_date,
        genres: d.genres?.map(g => g.name) || [],
        platforms: d.platforms?.map(p => p.name) || ['PC'],
        summary: d.summary || '',
        rating: d.rating || null,
        rating_count: d.rating_count || null,
        screenshots: d.screenshots?.map(s => s.url) || [],
        involved_companies: d.involved_companies,
        source: cand.sourceHint === 'local' ? 'local' : 'igdb+steam'
      }
    }
    // IGDB bulunamazsa Steam verileri ile minimal kayıt
    return {
      id: cand.appid,
      name: cand.steamName,
      cover: cand.steamHeader ? { url: cand.steamHeader } : null,
      platforms: ['PC'],
      genres: [],
      source: 'steam'
    }
  }

  const handleSave = async () => {
    try {
      setPhase('saving')
      setStatus('Toplu kayıt başlatılıyor...')

      // Seçili ve kriterlere uygun adaylar
      const selected = candidates.filter(c => c.selected && (includeUnresolved || c.igdb))
      if (selected.length === 0) {
        setStatus('Kaydedilecek uygun oyun yok.')
        setPhase('review')
        return
      }

      // Yardımcı: kapak URL'ini normalize et
      const getCoverUrl = (cover) => {
        if (!cover) return null
        if (typeof cover === 'string') {
          if (cover.startsWith('http')) return cover
          return `https://images.igdb.com/igdb/image/upload/t_1080p/${cover}.jpg`
        }
        if (typeof cover === 'object') {
          if (cover.url && cover.url.startsWith('http')) return cover.url
          if (cover.image_id) return `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`
          if (cover.url) return `https:${cover.url.replace('t_thumb', 't_1080p')}`
        }
        return null
      }

      // IGDB/Steam verisini backend şemasına map et
      const toGameCreatePayload = (cand) => {
        const d = cand.igdb
        const idStr = String((d && d.dbGameId) || d?.id || cand.appid)
        const firstReleaseDate = d?.first_release_date ? new Date(d.first_release_date * 1000).toISOString() : undefined
        const genres = d?.genres ? d.genres.map(g => (typeof g === 'object' ? (g.name || g.slug || String(g)) : String(g))) : undefined
        const platforms = d?.platforms ? d.platforms.map(p => (typeof p === 'object' ? (p.name || p.slug || String(p)) : String(p))) : ['PC']
        const devs = d?.involved_companies ? d.involved_companies.filter(ic => ic.developer).map(ic => ic.company?.name || ic.company).filter(Boolean) : undefined
        const pubs = d?.involved_companies ? d.involved_companies.filter(ic => ic.publisher).map(ic => ic.company?.name || ic.company).filter(Boolean) : undefined
        const developer = devs?.[0]
        const publisher = pubs?.[0]
        const igdbScreens = Array.isArray(d?.screenshots) ? d.screenshots.map(s => {
          const u = s?.url || s
          return typeof u === 'string' && u.startsWith('//') ? `https:${u.replace('t_thumb','t_1080p')}` : (typeof u === 'string' ? u : undefined)
        }).filter(Boolean) : undefined
        const igdbUrl = d?.slug ? `https://www.igdb.com/games/${d.slug}` : undefined
        return {
          id: idStr,
          name: d?.name || cand.steamName,
          cover: getCoverUrl(d?.cover) || cand.steamHeader || null,
          firstReleaseDate,
          genres,
          platforms,
          summary: d?.summary || undefined,
          rating: typeof d?.rating === 'number' ? Math.round(d.rating) : undefined,
          developer,
          developers: devs,
          publisher,
          publishers: pubs,
          steamData: {
            appId: cand.appid ? Number(cand.appid) : undefined
          },
          igdbData: {
            id: (typeof d?.id === 'number') ? d.id : undefined,
            slug: d?.slug,
            url: igdbUrl,
            screenshots: igdbScreens
          }
        }
      }

      // Kütüphane giriş payload'u
      const toLibraryEntry = (cand) => {
        const d = cand.igdb
        const idStr = String(d?.id || cand.appid)
        // Backend kategori UPPERCASE
        const mapCat = (cat) => {
        const map = {
          backlog: 'PLAN_TO_PLAY', wishlist: 'WISHLIST', owned: 'WISHLIST',
          playing: 'PLAYING', completed: 'COMPLETED', dropped: 'DROPPED',
          on_hold: 'ON_HOLD', plan_to_play: 'PLAN_TO_PLAY'
        }
          return map[(cat || '').toLowerCase()] || 'WISHLIST'
        }
        return {
          gameId: idStr,
          category: mapCat(cand.targetStatus),
          playtime: Number(cand.playtimeMins || 0),
          rating: undefined,
          notes: '',
          progress: 0,
          priority: 3,
          isPublic: true,
          tags: {
            source: d ? 'igdb+steam' : 'steam',
            importedAt: new Date().toISOString(),
            steamAppId: cand.appid || undefined
          }
        }
      }

      const user = userLibrary.getCurrentUser()
      if (!user) {
        setStatus('Kullanıcı bilgisi bulunamadı. Lütfen tekrar deneyin.')
        setPhase('review')
        return
      }

      const gamesPayload = selected.map(toGameCreatePayload)
      const entriesPayload = selected.map(toLibraryEntry)

      const BATCH_SIZE = 20
      let totalAdded = 0
      for (let i = 0; i < gamesPayload.length; i += BATCH_SIZE) {
        const gamesChunk = gamesPayload.slice(i, i + BATCH_SIZE)
        const entriesChunk = entriesPayload.slice(i, i + BATCH_SIZE)

        setStatus(`Oyunlar kaydediliyor... (${Math.min(i + BATCH_SIZE, gamesPayload.length)} / ${gamesPayload.length})`)
        // Oyunları toplu upsert
        await gameApi.bulkUpsert(gamesChunk)
        // Kütüphane import (upsert)
        const libRes = await libraryApi.importData(user.id, { entries: entriesChunk })
        const okCount = (libRes && libRes.data && typeof libRes.data.successful === 'number') ? libRes.data.successful : entriesChunk.length
        totalAdded += okCount
        // Supabase/DB yükünü azaltmak için küçük bekleme
        await new Promise(r => setTimeout(r, 600))
      }

      setImportedCount(totalAdded)
      setStatus(`İçe aktarma tamamlandı. ${totalAdded} oyun eklendi.`)
      setPhase('done')
      if (typeof onImported === 'function') onImported(totalAdded)
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      setStatus(`Hata: ${error.message || 'Bilinmeyen hata'}`)
      setPhase('review')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" id="steam-import-modal" data-registry="2.1.B1.5">
      <div className="w-full max-w-4xl bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-white font-semibold">Steam'den Kütüphane İçe Aktarma</div>
          <div className="text-gray-400 text-sm mt-1">Steam ID (64-bit), vanity veya profil URL'nizi girin.</div>
        </div>
        <div className="p-4 space-y-3">
          {/* Input Row */}
          <div className="flex gap-3 items-center">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Örn: 7656119..., poppolouse veya https://steamcommunity.com/id/..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 text-sm"
              id="steam-import-input" data-registry="2.1.B1.5.1"
            />
            <button
              onClick={handleImport}
              disabled={!inputValue.trim() || phase === 'resolving' || phase === 'fetchingSteam' || phase === 'fetchingIgdb' || phase === 'saving'}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${(!inputValue.trim() || phase !== 'idle') ? 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'}`}
              id="steam-import-submit-btn" data-registry="2.1.B1.5.2"
            >
              Başlat
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
              id="steam-import-cancel-btn" data-registry="2.1.B1.5.3"
            >
              Kapat
            </button>
          </div>

          {/* Status */}
          {status && (
            <div className="text-xs text-gray-300" id="steam-import-result" data-registry="2.1.B1.5.7">{status}</div>
          )}

          {/* Progress while fetching */}
          {phase === 'fetchingIgdb' && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3" id="steam-import-progress" data-registry="2.1.B1.5.4">
              <div className="text-sm text-gray-200 mb-2">Oyunlar aktarılıyor...</div>
              <div className="w-full h-2 bg-white/10 rounded">
                <div
                  className="h-2 bg-emerald-500 rounded transition-all"
                  style={{ width: `${progress.total ? Math.round((progress.completed / progress.total) * 100) : 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{progress.completed} / {progress.total}</div>
            </div>
          )}

          {/* Review List */}
          {phase === 'review' && (
            <div className="space-y-3" id="steam-import-review" data-registry="2.1.B1.5.5">
              {/* Bulk controls */}
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-3" id="steam-import-review-bulk-controls">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" className="accent-emerald-500" checked={candidates.every(c => c.selected)} onChange={(e) => handleSelectAllToggle(e.target.checked)} />
                  Tümünü seç
                </label>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-300">Seçilileri durum:</span>
                  <select
                    className="bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
                    onChange={(e) => handleBulkStatusChange(e.target.value)}
                    defaultValue="backlog"
                  >
                    <option value="backlog" className="bg-gray-800">Backlog</option>
                    <option value="playing" className="bg-gray-800">Oynanıyor</option>
                    <option value="completed" className="bg-gray-800">Bitti</option>
                    <option value="dropped" className="bg-gray-800">Bırakıldı</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input type="checkbox" className="accent-blue-500" checked={includeUnresolved} onChange={(e) => setIncludeUnresolved(e.target.checked)} />
                  Eşleşme bulunmayanları da dahil et
                </label>
              </div>

              {/* Items */}
              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {candidates.map((cand, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-2">
                    <input type="checkbox" className="accent-emerald-500 mt-1" checked={cand.selected} onChange={(e) => updateCandidate(idx, { selected: e.target.checked })} />
                    <img src={(cand.igdb?.cover?.url) || cand.steamHeader} alt={cand.steamName} className="w-16 h-9 object-cover rounded" />
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{cand.igdb?.name || cand.steamName}</div>
                      <div className="text-xs text-gray-400">
                        {cand.igdb ? (
                          <span>Platformlar: {cand.igdb.platforms?.map(p => p.name).join(', ') || '—'} • Puan: {Math.round(cand.igdb.rating || 0)}</span>
                        ) : (
                          <span className="text-yellow-300">Detay verisi bulunamadı</span>
                        )}
                        {cand.playtimeMins > 0 && <span> • Oynanma: {cand.playtimeMins} dk</span>}
                        {cand.error && <span className="text-red-400"> • {cand.error}</span>}
                      </div>
                    </div>
                    <select
                      value={cand.targetStatus}
                      onChange={(e) => updateCandidate(idx, { targetStatus: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs"
                      id={`steam-import-item-status-select-${idx}`}
                    >
                      <option value="backlog" className="bg-gray-800">Backlog</option>
                      <option value="playing" className="bg-gray-800">Oynanıyor</option>
                      <option value="completed" className="bg-gray-800">Bitti</option>
                      <option value="dropped" className="bg-gray-800">Bırakıldı</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                  id="steam-import-review-save-btn" data-registry="2.1.B1.5.6"
                >
                  İçe Aktar ve Kaydet
                </button>
                <div className="text-xs text-gray-400">Seçili: {candidates.filter(c => c.selected).length} • Kapak hazır: {candidates.filter(c => !!(c.igdb && c.igdb.cover)).length}</div>
              </div>
            </div>
          )}

          {/* Done info */}
          {phase === 'done' && (
            <div className="text-xs text-emerald-300">Toplam {importedCount} oyun eklendi.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SteamImportModal