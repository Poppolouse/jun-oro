import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import igdbApi from '../services/igdbApi'
import steamApi from '../services/steamApi'
import cacheService from '../services/cacheService'
import userLibrary from '../services/userLibrary'
import userPreferences from '../services/userPreferences'
import { sortGamesByRelevance, formatRelevanceScore } from '../utils/searchUtils'

// IGDB category kodlarını açıklayıcı isimlere çevir
const getCategoryName = (category) => {
  const categories = {
    0: 'Ana Oyun',
    1: 'DLC',
    2: 'Ek Paket',
    3: 'Genişleme',
    4: 'Standalone Genişleme',
    8: 'Remake',
    9: 'Remaster',
    10: 'Expanded Game',
    11: 'Port'
  }
  return categories[category] || ''
}

// IGDB görsel URL'sini düzelt - Yüksek çözünürlük
const getImageUrl = (cover, size = '1080p') => {
  if (!cover) return '/placeholder-game.jpg'
  
  // Eğer image_id varsa, doğru IGDB URL formatını kullan
  if (cover.image_id) {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${cover.image_id}.jpg`
  }
  
  // Eski format için fallback - yüksek çözünürlük
  if (cover.url) {
    const sizeParam = `t_${size}`
    return `https:${cover.url.replace('t_thumb', sizeParam)}`
  }
  
  return '/placeholder-game.jpg'
}

// IGDB involved_companies verisinden geliştirici ve yayımcı bilgilerini çıkar
const extractDeveloperAndPublisher = (involvedCompanies) => {
  if (!involvedCompanies || !Array.isArray(involvedCompanies)) {
    return { developer: 'Bilinmiyor', publisher: 'Bilinmiyor' }
  }

  let developer = null
  let publisher = null

  involvedCompanies.forEach(company => {
    if (company.developer && company.company?.name) {
      developer = company.company.name
    }
    if (company.publisher && company.company?.name) {
      publisher = company.company.name
    }
  })

  return {
    developer: developer || 'Bilinmiyor',
    publisher: publisher || developer || 'Bilinmiyor'
  }
}

// DLC'leri birleştirirken tekrarları kaldır
const mergeDLCsWithoutDuplicates = (igdbDlcs, igdbExpansions, steamDlcs) => {
  const allDlcs = []
  const seenNames = new Set()
  
  // IGDB DLC'lerini ekle
  for (const dlc of igdbDlcs) {
    const normalizedName = dlc.name.toLowerCase().trim()
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName)
      allDlcs.push({
        ...dlc,
        source: 'igdb'
      })
    }
  }
  
  // IGDB Expansion'larını ekle
  for (const expansion of igdbExpansions) {
    const normalizedName = expansion.name.toLowerCase().trim()
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName)
      allDlcs.push({
        ...expansion,
        source: 'igdb'
      })
    }
  }
  
  // Steam DLC'lerini ekle (sadece IGDB'de yoksa)
  for (const dlc of steamDlcs) {
    const normalizedName = dlc.name.toLowerCase().trim()
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName)
      allDlcs.push({
        id: `steam_${dlc.steam_appid}`,
        name: dlc.name,
        cover: dlc.header_image ? { url: dlc.header_image } : null,
        source: 'steam',
        price_overview: dlc.price_overview
      })
    }
  }
  
  return allDlcs
}

const AddGameModal = ({ isOpen, onClose, onGameAdded, onEditGame, editMode = false, editGame = null }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [isAddingGame, setIsAddingGame] = useState(false)
  const [gameStatus, setGameStatus] = useState('backlog')
  const [platform, setPlatform] = useState('')
  const [platforms, setPlatforms] = useState([])
  const [totalPlaytime, setTotalPlaytime] = useState('')
  const [error, setError] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  
  // Edition/DLC seçimi için yeni state'ler
  const [showVariants, setShowVariants] = useState(false)
  const [gameVariants, setGameVariants] = useState({ dlcs: [], expansions: [], editions: [] })
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  
  // DLC seçimi için ayrı state'ler
  const [selectedDlcs, setSelectedDlcs] = useState([]) // Seçilen DLC'ler
  const [steamDlcs, setSteamDlcs] = useState([])
  const [currentDlcPage, setCurrentDlcPage] = useState(1)
  const [dlcsPerPage] = useState(6) // Sayfa başına DLC sayısı

  
  // Campaign modu için state'ler
  const [isCampaignMode, setIsCampaignMode] = useState(true) // Default olarak campaign mode açık
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    games: []
  })
  
  // Campaign ekleme ekranı için state'ler
  const [campaigns, setCampaigns] = useState([])
  const [currentCampaign, setCurrentCampaign] = useState({
    id: '',
    name: '',
    description: '',
    averageDuration: '',
    customProperties: [],
    parentId: null,
    children: []
  })
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [newProperty, setNewProperty] = useState({ name: '', value: '', type: 'text' })
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  
  // Campaign yönetimi için yardımcı state'ler
  const [selectedParentCampaign, setSelectedParentCampaign] = useState(null)
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set())
  const [expandedCampaignDetails, setExpandedCampaignDetails] = useState(new Set())

  // Modal konumu için ref ve ölçüm (floating box konumlandırma)
  const modalRef = useRef(null)
  const [modalRect, setModalRect] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const updateRect = () => {
      if (modalRef.current) {
        setModalRect(modalRef.current.getBoundingClientRect())
      }
    }
    updateRect()
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('resize', updateRect)
    }
  }, [isOpen, campaigns.length])

  // Diğer platformlar için varsayılan liste ve IGDB ile birleşik seçenekler
  const defaultOtherPlatforms = [
    'GOG',
    'Nintendo Switch',
    'Origin',
    'Ubisoft Connect',
    'Battle.net',
    'Microsoft Store',
    'Mac App Store',
    'Itch.io',
    'Fiziksel Kopya',
    'Diğer'
  ]

  const otherPlatforms = useMemo(() => {
    const igdbNames = Array.isArray(platforms)
      ? platforms.map(p => p?.name).filter(Boolean)
      : []
    const merged = Array.from(new Set([...
      igdbNames,
      ...defaultOtherPlatforms
    ]))
    return merged
  }, [platforms])

  // Uzun campaign isimleri için sağdan sola yavaşça kayan metin
  const MarqueeText = ({ children, className = '' }) => {
    const ref = useRef(null)
    const [overflow, setOverflow] = useState(false)
    useEffect(() => {
      const el = ref.current
      if (el) {
        setOverflow(el.scrollWidth > el.clientWidth)
      }
    }, [children])
    return (
      <span
        ref={ref}
        className={`${className} ${overflow ? 'whitespace-nowrap overflow-hidden block animate-marquee' : 'truncate'}`}
        title={typeof children === 'string' ? children : ''}
      >
        {children}
      </span>
    )
  }

  // Modal görünümünde, sağda sabit kampanya kutusu (sadece girdiler ağaç şeklinde)
  const CampaignFloatingBox = ({ rect, show, gap = 24 }) => {
    if (!show || !rect) return null
    const left = Math.round(rect.right + gap)
    const top = Math.round(rect.top)
    const height = Math.round(rect.height)
    const mains = getMainCampaigns()

    // Basit ikonlar (inline SVG) – ek bağımlılık yok
    const FolderIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#00ff88]">
        <path d="M10 4l2 2h8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      </svg>
    )
    const FileIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#00d4ff]">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )

    return createPortal(
      <div className="fixed z-[100000]" style={{ left, top, height }}>
        {/* Güncel Campaign'ler paneli */}
        {true && (
        <div style={{ left: 8 }} className="absolute top-0 h-full w-[22rem] bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] border border-white/20 rounded-2xl shadow-xl">
          <div className="p-4 h-full overflow-y-auto text-sm text-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-semibold">Güncel Campaign'ler</div>
              <div className="text-xs text-gray-400">Ağaç görünüm: sadece girdiler</div>
            </div>

            {/* Ağaç listesi (ikonlar + girinti) */}
            <div className="space-y-2">
              {mains.map((campaign) => {
                const subs = getSubCampaigns(campaign.id)
                return (
                  <div key={campaign.id}>
                    {/* Ana öğe */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 gap-2">
                        <FolderIcon />
                        <span className="truncate font-medium text-white">{campaign.name}</span>
                      </div>
                      {campaign.averageDuration && (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-[#00ff88] text-xs font-mono">{campaign.averageDuration}</span>
                      )}
                    </div>

                    {/* Alt öğeler */}
                    {subs.length > 0 && (
                      <div className="mt-1 ml-5 pl-4 border-l border-white/10 space-y-1">
                        {subs.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 gap-2">
                              <FileIcon />
                              <span className="truncate text-gray-300">{sub.name}</span>
                            </div>
                            {sub.averageDuration && (
                              <span className="px-2 py-0.5 rounded bg-white/5 text-[#00d4ff] text-xs font-mono">{sub.averageDuration}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* İstatistikler */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/5 rounded p-2">
                  <div className="text-[#00ff88] font-bold text-sm">{mains.length}</div>
                  <div className="text-gray-400 text-[11px]">Ana</div>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <div className="text-[#00d4ff] font-bold text-sm">{campaigns.filter(c => c.parentId).length}</div>
                  <div className="text-gray-400 text-[11px]">Alt</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>,
      document.body
    )
  }



  // Platform listesini yükle
  useEffect(() => {
    if (isOpen) {
      loadPlatforms()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (editMode && editGame) {
        // --- DÜZENLEME MODU --- 

        // 1. Kayıtlı tercihleri yükle
        const gamePrefs = userPreferences.getGameFormPreferences(editGame.id);
        console.log('📝 Düzenleme modu için tercihler yükleniyor:', gamePrefs);

        // 2. IGDB/Steam'den gelen oyun verilerini ayarla
        setSelectedGame({
          id: editGame.id,
          name: editGame.title,
          cover: editGame.coverUrl ? { image_id: editGame.coverUrl.split('/').pop().split('.')[0] } : null,
          platforms: editGame.platform ? [{ name: editGame.platform }] : [],
          genres: editGame.genre ? [{ name: editGame.genre }] : [],
          first_release_date: editGame.releaseYear ? new Date(editGame.releaseYear, 0, 1).getTime() / 1000 : null,
          rating: editGame.rating !== 'N/A' ? parseFloat(editGame.rating) * 10 : null
        });
        setSearchTerm(editGame.title || '');

        // 3. Öncelik sırasına göre state'leri ayarla: Kayıtlı Tercih > Oyun Verisi > Varsayılan
        setPlatform(gamePrefs.platform || editGame.platform || '');
        setGameStatus(gamePrefs.status || editGame.status || 'backlog');
        setTotalPlaytime(editGame.totalPlaytime || editGame.playtime || '');
        setCampaigns(gamePrefs.selectedCampaigns || editGame.campaigns || []);
        setSelectedDlcs(gamePrefs.selectedDLCs || editGame.selectedDlcs || []);
        
        // selectedVariant null ise ana oyunu seç
        const variantToSet = gamePrefs.selectedVariant || editGame.selectedVariant;
        setSelectedVariant(variantToSet || {
          id: editGame.id,
          name: editGame.title,
          cover: editGame.coverUrl ? { image_id: editGame.coverUrl.split('/').pop().split('.')[0] } : null
        });
        
        // Versiyon/DLC verilerini yükle
        if (editGame.gameVariants) setGameVariants(editGame.gameVariants);
        if (editGame.steamDlcs) setSteamDlcs(editGame.steamDlcs);
    

        const hasIgdbVariants = editGame.gameVariants && ((editGame.gameVariants.dlcs?.length || 0) + (editGame.gameVariants.expansions?.length || 0) + (editGame.gameVariants.editions?.length || 0) > 0);
        const hasSteamDlcs = editGame.steamDlcs && editGame.steamDlcs.length > 0;
        if (hasIgdbVariants || hasSteamDlcs) {
          setShowVariants(true);
        } else {
          console.log('🔄 Düzenleme modunda DLC/versiyon bulunamadı, API\'den yükleniyor...');
          if (editGame.title) {
            loadGameVariants({ name: editGame.title, id: editGame.id });
          }
        }

      } else {
        // --- EKLEME MODU --- 
        const generalPrefs = userPreferences.getGameFormPreferences();
        console.log('📋 Ekleme modu için genel tercihler yüklendi:', generalPrefs);
        setPlatform(generalPrefs.platform || '');
        setGameStatus(generalPrefs.status || 'backlog');
        setSelectedDlcs(generalPrefs.selectedDLCs || []);
        setCampaigns(generalPrefs.selectedCampaigns || []);
      }
    }
  }, [isOpen, editMode, editGame]);

  // Modal kapandığında temizlik
  useEffect(() => {
    if (!isOpen) {
      // State'leri temizle
      setSearchTerm('')
      setSearchResults([])
      setSelectedGame(null)
      setError('')
      setGameStatus('backlog')
      setPlatform('')
      setTotalPlaytime('')
      setShowVariants(false)
      setGameVariants({ dlcs: [], expansions: [], editions: [] })
      setSelectedVariant(null)
      setSelectedDlcs([])
      setSteamDlcs([])
      setCurrentDlcPage(1)
  
      setIsCampaignMode(false)
      setCampaignData({ name: '', description: '', games: [] })
      
      // Timeout'u temizle
      if (searchTimeout) {
        clearTimeout(searchTimeout)
        setSearchTimeout(null)
      }
    }
  }, [isOpen, searchTimeout])

  const loadPlatforms = async () => {
    try {
      const platformData = await igdbApi.getPlatforms()
      const uniqueNames = Array.from(new Set(
        (platformData || []).map(p => p?.name).filter(Boolean)
      ))
      const normalized = uniqueNames.map(name => ({ name }))
      setPlatforms(normalized)
    } catch (error) {
      console.error('Platform yükleme hatası:', error)
      // IGDB erişilemezse, mağaza ve yaygın platformlardan oluşan fallback listeyi kullan
      const fallback = [
        'GOG',
        'Nintendo Switch',
        'Origin',
        'Ubisoft Connect',
        'Battle.net',
        'Microsoft Store',
        'Mac App Store',
        'Itch.io',
        'Fiziksel Kopya',
        'Diğer'
      ].map(name => ({ name }))
      setPlatforms(fallback)
    }
  }

  // Oyun variantlarını yükle (düzenleme modu için)
  const loadGameVariants = async (game) => {
    try {
      setIsLoadingVariants(true)
      console.log('🔄 Oyun variantları yükleniyor:', game.name)
      
      // Cache key'leri oluştur
      const igdbCacheKey = cacheService.getVersionsCacheKey(game.id, game.name)
      const steamCacheKey = cacheService.getDLCCacheKey(game.id, game.name)
      
      // Cache'den kontrol et
      let variants = cacheService.get(igdbCacheKey)
      let steamDlcResults = cacheService.get(steamCacheKey)
      
      // Cache'de yoksa API'den getir
      const promises = []
      
      if (!variants) {
        promises.push(
          igdbApi.getGameVariants(game.id).then(result => {
            cacheService.setVersionsWithLowResCovers(igdbCacheKey, result)
            return { type: 'igdb', result }
          }).catch(error => ({ type: 'igdb', error }))
        )
      }
      
      if (!steamDlcResults) {
        promises.push(
          steamApi.getDLCsForGame(game.name).then(result => {
            cacheService.setDLCWithLowResCovers(steamCacheKey, result)
            return { type: 'steam', result }
          }).catch(error => ({ type: 'steam', error }))
        )
      }
      
      // API çağrıları varsa bekle
      if (promises.length > 0) {
        const results = await Promise.allSettled(promises)
        
        results.forEach(promiseResult => {
          if (promiseResult.status === 'fulfilled') {
            const { type, result, error } = promiseResult.value
            if (!error) {
              if (type === 'igdb' && !variants) {
                variants = result
              } else if (type === 'steam' && !steamDlcResults) {
                steamDlcResults = result
              }
            }
          }
        })
      }
      
      // Varsayılan değerler
      variants = variants || { dlcs: [], expansions: [], editions: [] }
      steamDlcResults = steamDlcResults || []
      
      console.log('📦 IGDB variants:', variants)
      setGameVariants(variants)
      
      console.log('🎮 Steam DLC\'leri:', steamDlcResults.length, 'adet')
      setSteamDlcs(steamDlcResults)
      
      // DLC sayılarını logla
      const igdbDlcCount = variants.dlcs.length + variants.expansions.length
      const steamDlcCount = steamDlcResults.length
      
      console.log('🎯 DLC Sayıları:', {
        igdb: igdbDlcCount,
        steam: steamDlcCount,
        total: igdbDlcCount + steamDlcCount
      })
      
      // Eğer herhangi bir kaynakta DLC varsa seçim ekranını göster
      const hasVariants = igdbDlcCount > 0 || steamDlcCount > 0 || variants.editions.length > 0
      console.log('✅ Variants var mı?', hasVariants, {
        igdb: igdbDlcCount,
        steam: steamDlcCount,
        editions: variants.editions.length
      })
      
      if (hasVariants) {
        setShowVariants(true)
        console.log('🎯 showVariants = true yapıldı')
        
        // DLC'leri varsayılan olarak seçili yap (sadece yeni oyun ekleme modunda)
        if (!editMode) {
          const allDlcs = mergeDLCsWithoutDuplicates(
            variants.dlcs || [],
            variants.expansions || [],
            steamDlcResults || []
          )
          setSelectedDlcs(allDlcs)
          console.log('✅ Tüm DLC\'ler varsayılan olarak seçildi (tekrarsız):', allDlcs.length, 'adet')
        }
      } else {
        console.log('❌ Hiç variant bulunamadı')
      }
      
    } catch (error) {
      console.error('Oyun variantları yüklenemedi:', error)
    } finally {
      setIsLoadingVariants(false)
    }
  }

  // Debounced arama fonksiyonu
  const handleSearchDebounced = (term) => {
    // Önceki timeout'u temizle
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Yeni timeout ayarla
    const newTimeout = setTimeout(() => {
      performSearch(term)
    }, 500) // 500ms bekle

    setSearchTimeout(newTimeout)
  }

  // Oyunun kütüphanede olup olmadığını kontrol et
  const checkGameInLibrary = async (gameId) => {
    try {
      const lib = await userLibrary.getUserLibrary()
      return Array.isArray(lib.entries) && lib.entries.some(entry => entry.gameId === gameId.toString())
    } catch (error) {
      console.error('Kütüphane kontrolü hatası:', error)
      return false
    }
  }

  // Gerçek arama fonksiyonu
  const performSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError('')
    
    try {
      const results = await igdbApi.searchGames(term, 20) // Daha fazla sonuç al
      
      // Relevance score'a göre sırala
      const sortedResults = sortGamesByRelevance(results, term)
      
      // Her oyun için kütüphane durumunu kontrol et
      const resultsWithLibraryStatus = await Promise.all(
        sortedResults.map(async game => ({
          ...game,
          isInLibrary: await checkGameInLibrary(game.id)
        }))
      )
      
      setSearchResults(resultsWithLibraryStatus)
      
      if (resultsWithLibraryStatus.length === 0) {
        setError('Arama sonucu bulunamadı. Farklı bir terim deneyin.')
      }
    } catch (error) {
      setError('Arama sırasında hata oluştu: ' + error.message)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Manuel arama (Enter tuşu veya buton)
  const handleSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    performSearch(searchTerm)
  }

  // Enter tuşu ile arama
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Oyun seçimi
  const handleGameSelect = async (game) => {
    console.log('🎮 Oyun seçildi:', game.name)
    setSelectedGame(game)
    setSelectedVariant(null)
    setGameVariants({ dlcs: [], expansions: [], editions: [] })
    setSteamDlcs([])
    setCurrentDlcPage(1)
    setSelectedDlcs([])
    
    // Oyun detaylarını getir
    try {
      const gameDetails = await igdbApi.getGameDetails(game.id)
      setSelectedGame(gameDetails)
      
      // Edition/DLC'leri yükle
      console.log('🔄 DLC/Edition yükleniyor...')
      setIsLoadingVariants(true)
      
      // Cache key'leri oluştur
      const igdbCacheKey = cacheService.getVersionsCacheKey(game.id, game.name)
      const steamCacheKey = cacheService.getDLCCacheKey(game.id, game.name)
      
      // Cache'den kontrol et
      let variants = cacheService.get(igdbCacheKey)
      let steamDlcResults = cacheService.get(steamCacheKey)
      
      // Cache'de yoksa API'den getir
      const promises = []
      
      if (!variants) {
        promises.push(
          igdbApi.getGameVariants(game.id).then(result => {
            cacheService.setVersionsWithLowResCovers(igdbCacheKey, result)
            return { type: 'igdb', result }
          }).catch(error => ({ type: 'igdb', error }))
        )
      }
      
      if (!steamDlcResults) {
        promises.push(
          steamApi.getDLCsForGame(game.name).then(result => {
            cacheService.setDLCWithLowResCovers(steamCacheKey, result)
            return { type: 'steam', result }
          }).catch(error => ({ type: 'steam', error }))
        )
      }
      
      // API çağrıları varsa bekle
      if (promises.length > 0) {
        const results = await Promise.allSettled(promises)
        
        results.forEach(promiseResult => {
          if (promiseResult.status === 'fulfilled') {
            const { type, result, error } = promiseResult.value
            if (!error) {
              if (type === 'igdb' && !variants) {
                variants = result
              } else if (type === 'steam' && !steamDlcResults) {
                steamDlcResults = result
              }
            }
          }
        })
      }
      
      // Varsayılan değerler
      variants = variants || { dlcs: [], expansions: [], editions: [] }
      steamDlcResults = steamDlcResults || []
      
      console.log('📦 IGDB variants:', variants)
      setGameVariants(variants)
      
      console.log('🎮 Steam DLC\'leri:', steamDlcResults.length, 'adet')
      setSteamDlcs(steamDlcResults)
      
      // DLC sayılarını logla
      const igdbDlcCount = variants.dlcs.length + variants.expansions.length
      const steamDlcCount = steamDlcResults.length
      
      console.log('🎯 Steam Arama - DLC Sayıları:', {
        igdb: igdbDlcCount,
        steam: steamDlcCount,
        total: igdbDlcCount + steamDlcCount
      })
      
      // Eğer herhangi bir kaynakta DLC varsa seçim ekranını göster
      const hasVariants = igdbDlcCount > 0 || steamDlcCount > 0 || variants.editions.length > 0
      console.log('✅ Variants var mı?', hasVariants, {
        igdb: igdbDlcCount,
        steam: steamDlcCount,
        editions: variants.editions.length
      })
      
      if (hasVariants) {
        setShowVariants(true)
        console.log('🎯 showVariants = true yapıldı')
        
        // DLC'leri varsayılan olarak seçili yap
        const allDlcs = mergeDLCsWithoutDuplicates(
          variants.dlcs || [],
          variants.expansions || [],
          steamDlcResults || []
        )
        setSelectedDlcs(allDlcs)
        console.log('✅ Tüm DLC\'ler varsayılan olarak seçildi (tekrarsız):', allDlcs.length, 'adet')
      } else {
        console.log('❌ Hiç variant bulunamadı')
      }
      
    } catch (error) {
      console.error('Oyun detayları yüklenemedi:', error)
    } finally {
      setIsLoadingVariants(false)
    }
  }

  // DLC verilerini yenile
  const refreshDLCData = async () => {
    if (!selectedGame) return

    setIsLoadingVariants(true)
    
    try {
      // Cache'i temizle
      const igdbCacheKey = cacheService.getVersionsCacheKey(selectedGame.id, selectedGame.name)
      const steamCacheKey = cacheService.getDLCCacheKey(selectedGame.id, selectedGame.name)
      
      cacheService.delete(igdbCacheKey)
      cacheService.delete(steamCacheKey)
      
      console.log('🔄 DLC cache temizlendi, yeniden yükleniyor...')
      
      // API'den yeniden getir
      const [igdbResult, steamResult] = await Promise.allSettled([
        igdbApi.getGameVariants(selectedGame.id).then(result => {
          cacheService.setVersionsWithLowResCovers(igdbCacheKey, result)
          return result
        }),
        steamApi.getDLCsForGame(selectedGame.name).then(result => {
          cacheService.setDLCWithLowResCovers(steamCacheKey, result)
          return result
        })
      ])
      
      // Sonuçları işle
      let variants = { dlcs: [], expansions: [], editions: [] }
      let steamDlcResults = []
      
      if (igdbResult.status === 'fulfilled') {
        variants = igdbResult.value || { dlcs: [], expansions: [], editions: [] }
      }
      
      if (steamResult.status === 'fulfilled') {
        steamDlcResults = steamResult.value || []
      }
      
      // State'leri güncelle
      setGameVariants(variants)
      setSteamDlcs(steamDlcResults)
      
      // Hangi kaynakta daha çok DLC varsa onu varsayılan yap
      const igdbDlcCount = variants.dlcs.length + variants.expansions.length
      const steamDlcCount = steamDlcResults.length
      
      // DLC kaynak bilgisi artık otomatik birleştiriliyor
      
      // Eğer herhangi bir kaynakta DLC varsa seçim ekranını göster
      const hasVariants = igdbDlcCount > 0 || steamDlcCount > 0 || variants.editions.length > 0
      setShowVariants(hasVariants)
      
      console.log('✅ DLC verileri yenilendi:', {
        igdb: igdbDlcCount,
        steam: steamDlcCount,
        editions: variants.editions.length
      })
      
    } catch (error) {
      console.error('❌ DLC verileri yenilenemedi:', error)
    } finally {
      setIsLoadingVariants(false)
    }
  }

  const showHowLongToBeatOptions = async () => {
    if (!selectedGame?.name) return
    
    try {
      setIsLoadingHLTB(true)
      console.log('🕐 HowLongToBeat seçenekleri yükleniyor:', selectedGame.name)
      
      const searchResults = await howLongToBeatScraper.searchGame(selectedGame.name)
      const bestMatch = howLongToBeatScraper.findBestMatch(searchResults, selectedGame.name)
      
      if (bestMatch && (bestMatch.mainStory || bestMatch.mainExtra || bestMatch.completionist)) {
        setHltbOptions(bestMatch)
        setShowHLTBModal(true)
      } else {
        // Fallback: generate campaigns and derive durations
        const generated = await howLongToBeatScraper.generateCampaignData(selectedGame.name)
        if (generated && Array.isArray(generated.campaigns) && generated.campaigns.length > 0) {
          const lower = (s) => (s || '').toLowerCase()
          const findBy = (key) => generated.campaigns.find(c => lower(c.name).includes(key))
          const fallbackOptions = {
            name: selectedGame.name,
            mainStory: findBy('main')?.averageDuration || null,
            mainExtra: findBy('extra')?.averageDuration || null,
            completionist: findBy('completion')?.averageDuration || null,
            platforms: [],
          }
          setHltbOptions(fallbackOptions)
          setShowHLTBModal(true)
        } else {
          setError('HowLongToBeat\'te oyun bulunamadı')
          setHltbOptions(null)
          setShowHLTBModal(true)
        }
      }
      
    } catch (error) {
      console.error('❌ HowLongToBeat seçenekleri yüklenemedi:', error)
      setError('HowLongToBeat verileri yüklenemedi: ' + error.message)
      setHltbOptions(null)
      setShowHLTBModal(true) // Hata durumunda da modal açılsın
    } finally {
      setIsLoadingHLTB(false)
    }
  }


  const toggleCampaignDetails = (campaignId) => {
    const newExpanded = new Set(expandedCampaignDetails)
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId)
    } else {
      newExpanded.add(campaignId)
    }
    setExpandedCampaignDetails(newExpanded)
  }

  // Toplam campaign süresini hesapla
  const calculateTotalDuration = () => {
    if (campaigns.length === 0) return null

    const durations = campaigns
      .filter(c => c.averageDuration && c.averageDuration.trim())
      .map(c => c.averageDuration.trim())

    if (durations.length === 0) return null

    // Süreleri parse et ve topla
    let totalMinutes = 0
    let hasValidDuration = false

    durations.forEach(duration => {
      // "25 saat", "40-50 saat", "2.5 hours" gibi formatları parse et
      const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*(?:saat|hour|h)/i)
      const rangeMatch = duration.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:saat|hour|h)/i)
      
      if (rangeMatch) {
        // Aralık varsa ortalamasını al
        const min = parseFloat(rangeMatch[1])
        const max = parseFloat(rangeMatch[2])
        totalMinutes += ((min + max) / 2) * 60
        hasValidDuration = true
      } else if (hourMatch) {
        // Tek değer varsa onu kullan
        totalMinutes += parseFloat(hourMatch[1]) * 60
        hasValidDuration = true
      }
    })

    if (!hasValidDuration) return null

    // Dakikaları saat ve dakikaya çevir
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)

    if (hours === 0) {
      return `${minutes} dakika`
    } else if (minutes === 0) {
      return `${hours} saat`
    } else {
      return `${hours} saat ${minutes} dakika`
    }
  }

  // Campaign yönetimi fonksiyonları
  const addCustomProperty = () => {
    if (!newProperty.name.trim()) return
    
    setCurrentCampaign(prev => ({
      ...prev,
      customProperties: [...prev.customProperties, { ...newProperty, id: Date.now() }]
    }))
    
    setNewProperty({ name: '', value: '', type: 'text' })
    setShowAddProperty(false)
  }

  const removeCustomProperty = (propertyId) => {
    setCurrentCampaign(prev => ({
      ...prev,
      customProperties: prev.customProperties.filter(p => p.id !== propertyId)
    }))
  }

  const saveCampaign = () => {
    if (!currentCampaign.name.trim()) {
      setError('Campaign adı gereklidir.')
      return
    }

    const newCampaign = {
      ...currentCampaign,
      id: currentCampaign.id || Date.now().toString()
    }

    setCampaigns(prev => {
      const existing = prev.find(c => c.id === newCampaign.id)
      if (existing) {
        return prev.map(c => c.id === newCampaign.id ? newCampaign : c)
      }
      return [...prev, newCampaign]
    })

    // Reset form
    setCurrentCampaign({
      id: '',
      name: '',
      description: '',
      averageDuration: '',
      customProperties: [],
      parentId: null,
      children: []
    })
  }

  const importFromText = () => {
    if (!importText.trim()) return

    try {
      const lines = importText.split('\n').filter(line => line.trim())
      const importedCampaigns = []

      lines.forEach((line, index) => {
        const parts = line.split('|').map(p => p.trim())
        const name = parts[0] || `Campaign ${index + 1}`
        const duration = parts[1] || ''
        const description = parts[2] || ''

        importedCampaigns.push({
          id: Date.now() + index,
          name,
          description,
          averageDuration: duration,
          customProperties: [],
          parentId: null,
          children: []
        })
      })

      setCampaigns(prev => [...prev, ...importedCampaigns])
      setImportText('')
      setShowImport(false)
    } catch (error) {
      setError('Import sırasında hata oluştu: ' + error.message)
    }
  }

  // Hiyerarşi yönetimi fonksiyonları
  const addSubCampaign = (parentId) => {
    setCurrentCampaign({
      id: '',
      name: '',
      description: '',
      averageDuration: '',
      customProperties: [],
      parentId: parentId,
      children: []
    })
    setSelectedParentCampaign(parentId)
  }

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

  const getMainCampaigns = () => {
    return campaigns.filter(c => !c.parentId)
  }

  const getSubCampaigns = (parentId) => {
    return campaigns.filter(c => c.parentId === parentId)
  }

  const deleteCampaign = (campaignId) => {
    // Alt campaign'leri de sil
    const toDelete = [campaignId]
    const findChildren = (id) => {
      const children = campaigns.filter(c => c.parentId === id)
      children.forEach(child => {
        toDelete.push(child.id)
        findChildren(child.id)
      })
    }
    findChildren(campaignId)

    setCampaigns(prev => prev.filter(c => !toDelete.includes(c.id)))
  }

  const generateAIPrompt = () => {
    const gameInfo = selectedGame ? `Game: ${selectedGame.name}` : 'Game: [Game Name]'
    const campaignList = campaigns.map(c => `- ${c.name}: ${c.description || 'No description'} (${c.averageDuration || 'Unknown duration'})`).join('\n')
    
    const prompt = `Please analyze this game and create a comprehensive campaign system:

${gameInfo}

Current campaigns:
${campaignList || 'No campaigns yet'}

Please provide:
1. Campaign names and descriptions
2. Average completion times for each campaign
3. Unique characteristics/playstyles for each campaign
4. Any sub-campaigns or variations
5. Recommended difficulty levels or special features

Format each campaign as: Name | Duration | Description | Special Properties

User customization notes: [Add your specific requirements here]

Please make this comprehensive and detailed for a game library management system.`

    setAiPrompt(prompt)
    setShowAIPrompt(true)
  }

  // Oyunu kütüphaneye ekle
  const handleAddGame = async () => {
    if (!selectedGame || !platform) {
      setError('Lütfen platform seçin.')
      return
    }

    // Campaign zorunluluğu - her zaman en az 1 campaign gerekli
    if (campaigns.length === 0) {
      setError('Oyunu kütüphaneye eklemek için en az 1 campaign eklemelisiniz. Campaign eklemek için "🎯 Campaign Yönetimi" butonuna tıklayın.')
      return
    }

    // Campaign mode açıkken ek kontrol
    if (isCampaignMode && campaigns.length === 0) {
      setError('Campaign modu açıkken en az 1 campaign eklemelisiniz.')
      return
    }

    setIsAddingGame(true)
    setError('')

    try {
      // Seçilen variant varsa onu kullan, yoksa ana oyunu kullan
      const gameToAdd = selectedVariant || selectedGame
      
      // Seçili platform ve durum bilgilerini ekle
      gameToAdd.status = gameStatus
      gameToAdd.platform = platform
      gameToAdd.totalPlaytime = totalPlaytime

      // Versiyon bilgisi (seçili edition/DLC/expansion adı)
      if (selectedVariant) {
        const versionLabel = getCategoryName(selectedVariant.category)
        gameToAdd.version = versionLabel ? `${versionLabel}: ${selectedVariant.name}` : selectedVariant.name
      }

      // Campaign bilgilerini de ekle
      if (campaigns.length > 0) {
        gameToAdd.campaigns = campaigns
      }

      // DLC ve versiyon bilgilerini de ekle
      if (selectedDlcs.length > 0) {
        gameToAdd.selectedDlcs = selectedDlcs
      }

      if (gameVariants && (gameVariants.dlcs?.length > 0 || gameVariants.expansions?.length > 0 || gameVariants.editions?.length > 0)) {
        gameToAdd.gameVariants = gameVariants
      }

      if (steamDlcs.length > 0) {
        gameToAdd.steamDlcs = steamDlcs
      }



      // Kullanıcı tercihlerini kaydet
      const formData = {
        platform: platform,
        status: gameStatus,
        includeDLCs: selectedDlcs.length > 0,
        selectedDLCs: selectedDlcs,
        selectedCampaigns: campaigns,
        version: selectedVariant ? selectedVariant.name : ''
      }
      
      userPreferences.saveGameFormPreferences(
        gameToAdd.id, 
        gameToAdd.name, 
        formData
      )

      // Callback'i çağır - userLibrary servisi ArkadeLibrary'de kullanılacak
      if (editMode && onEditGame) {
        // Düzenleme modunda onEditGame callback'ini çağır
        onEditGame(gameToAdd)
      } else if (onGameAdded) {
        // Yeni oyun ekleme modunda onGameAdded callback'ini çağır
        onGameAdded(gameToAdd)
      }

      // Modal'ı kapat ve formu temizle
      handleClose()
    } catch (error) {
      setError('Oyun eklenirken hata oluştu: ' + error.message)
    } finally {
      setIsAddingGame(false)
    }
  }



  // Modal'ı kapat ve formu temizle
  const handleClose = () => {
    setSearchTerm('')
    setSearchResults([])
    setSelectedGame(null)
    setGameStatus('backlog')
    setPlatform('')
    setTotalPlaytime('')
    setError('')
    
    onClose()
  }

  // Modal açık değilse render etme
  console.log('AddGameModal isOpen:', isOpen)
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Ana Modal */}
        <div ref={modalRef} className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {isCampaignMode && (
              <button
                onClick={() => setIsCampaignMode(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                ←
              </button>
            )}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
        {isCampaignMode ? 'Campaign yönetimi' : (editMode ? 'Oyun Düzenle' : 'Oyun Ekle')}
                </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isCampaignMode ? (
            // Campaign Modu
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Campaign yönetimi</h3>
                <p className="text-gray-400">
                  {selectedGame ? `${selectedGame.name} için campaign'ler` : 'Oyun campaign\'lerini yönetin'}
                </p>
                
                {/* Toplam Süre Gösterimi */}
                {campaigns.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/30 rounded-lg">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-[#00ff88] font-bold text-lg">{campaigns.length}</div>
                        <div className="text-gray-400 text-xs">Campaign</div>
                      </div>
                      {calculateTotalDuration() && (
                        <>
                          <div className="w-px h-8 bg-white/20"></div>
                          <div className="text-center">
                            <div className="text-[#00d4ff] font-bold text-lg">{calculateTotalDuration()}</div>
                            <div className="text-gray-400 text-xs">Toplam Süre</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Campaign Zorunluluğu Uyarısı */}
                {campaigns.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-yellow-400 text-xl">⚠️</div>
                      <div>
                        <div className="text-yellow-400 font-medium text-sm">Campaign Gerekli</div>
                        <div className="text-gray-400 text-xs">Oyunu eklemek için en az 1 campaign eklemelisiniz.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Import & AI Tools */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowImport(true)}
                  className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <div className="text-blue-400 text-2xl mb-2">📄</div>
                  <div className="text-white font-medium">TXT Import</div>
                  <div className="text-gray-400 text-xs">Metin dosyasından içe aktar</div>
                </button>

                <button
                  onClick={generateAIPrompt}
                  className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                  <div className="text-purple-400 text-2xl mb-2">🤖</div>
                  <div className="text-white font-medium">AI Prompt</div>
                  <div className="text-gray-400 text-xs">Yapay zeka için prompt oluştur</div>
                </button>

                <button
                  onClick={() => {
                    // Yeni campaign formu için temiz state
                    setCurrentCampaign({
                      id: '',
                      name: '',
                      description: '',
                      averageDuration: '',
                      customProperties: [],
                      parentId: null,
                      children: []
                    })
                  }}
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  <div className="text-green-400 text-2xl mb-2">➕</div>
                  <div className="text-white font-medium">Yeni Campaign</div>
                  <div className="text-gray-400 text-xs">Manuel olarak ekle</div>
                </button>
              </div>

              {/* Campaign Form */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Campaign Bilgileri</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campaign Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Adı</label>
                    <input
                      type="text"
                      value={currentCampaign.name}
                      onChange={(e) => setCurrentCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Örn: Main Story, Evil Playthrough, Nosferatu Clan"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
                    />
                  </div>

                  {/* Parent Campaign */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ana Campaign 
                      <span className="text-xs text-gray-500 ml-1">(Alt campaign için)</span>
                    </label>
                    <select
                      value={currentCampaign.parentId || ''}
                      onChange={(e) => setCurrentCampaign(prev => ({ ...prev, parentId: e.target.value || null }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
                    >
                      <option value="" className="bg-gray-800">Ana Campaign (Bağımsız)</option>
                      {getMainCampaigns().map((campaign) => (
                        <option key={campaign.id} value={campaign.id} className="bg-gray-800">
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Average Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ortalama Süre</label>
                    <input
                      type="text"
                      value={currentCampaign.averageDuration}
                      onChange={(e) => setCurrentCampaign(prev => ({ ...prev, averageDuration: e.target.value }))}
                      placeholder="Örn: 25 saat, 40-50 saat"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
                    />
                  </div>

                  {/* Campaign Type Indicator */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Türü</label>
                    <div className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg">
                      {currentCampaign.parentId ? (
                        <span className="text-blue-400 text-sm">🔗 Alt Campaign</span>
                      ) : (
                        <span className="text-[#00ff88] text-sm">⭐ Ana Campaign</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama</label>
                  <textarea
                    value={currentCampaign.description}
                    onChange={(e) => setCurrentCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Campaign'in özelliklerini, hikayesini veya oynama stilini açıklayın..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 resize-none"
                  />
                </div>

                {/* Custom Properties */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Özel Özellikler</label>
                    <button
                      onClick={() => setShowAddProperty(true)}
                      className="px-3 py-1 bg-[#00ff88]/20 border border-[#00ff88]/30 rounded text-xs text-[#00ff88] hover:bg-[#00ff88]/30 transition-colors"
                    >
                      + Özellik Ekle
                    </button>
                  </div>

                  {currentCampaign.customProperties.length > 0 && (
                    <div className="space-y-2">
                      {currentCampaign.customProperties.map((property) => (
                        <div key={property.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex-1">
                            <div className="text-sm text-white font-medium">{property.name}</div>
                            <div className="text-xs text-gray-400">{property.value}</div>
                          </div>
                          <button
                            onClick={() => removeCustomProperty(property.id)}
                            className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={saveCampaign}
                    disabled={!currentCampaign.name.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Campaign Kaydet
                  </button>
                </div>
              </div>

              {/* Saved Campaigns List - devre dışı (sadece sağ hover panelinde gösterilecek) */}
              {false && campaigns.length > 0 && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">Kaydedilen Campaign'ler ({campaigns.length})</h4>
                  
                  <div className="space-y-3">
                    {getMainCampaigns().map((campaign) => (
                      <div key={campaign.id}>
                        {/* Ana Campaign */}
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getSubCampaigns(campaign.id).length > 0 && (
                                  <button
                                    onClick={() => toggleCampaignExpansion(campaign.id)}
                                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                  >
                                    {expandedCampaigns.has(campaign.id) ? '▼' : '▶'}
                                  </button>
                                )}
                                <h5 
                                  className="text-white font-medium cursor-pointer hover:text-[#00ff88] transition-colors"
                                  onClick={() => toggleCampaignDetails(campaign.id)}
                                >
                                  {campaign.name}
                                </h5>
                                <span className="px-2 py-1 bg-[#00ff88]/20 border border-[#00ff88]/30 rounded text-xs text-[#00ff88]">
                                  Ana Campaign
                                </span>
                              </div>
                              
                              {/* Campaign Detayları - Sadece açıksa göster */}
                              {expandedCampaignDetails.has(campaign.id) && (
                                <div className="mt-3 ml-7 space-y-2">
                                  {campaign.averageDuration && (
                                    <div className="text-sm text-[#00ff88]">⏱️ {campaign.averageDuration}</div>
                                  )}
                                  {campaign.description && (
                                    <p className="text-sm text-gray-400">{campaign.description}</p>
                                  )}
                                  {campaign.customProperties.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {campaign.customProperties.map((prop) => (
                                        <span key={prop.id} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                                          {prop.name}: {prop.value}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {campaign.howLongToBeatData && (
                                    <div className="text-xs text-gray-500">
                                      📊 HowLongToBeat verisi mevcut
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => addSubCampaign(campaign.id)}
                                className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-500/30 transition-colors"
                              >
                                + Alt Campaign
                              </button>
                              <button
                                onClick={() => setCurrentCampaign(campaign)}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-gray-300 transition-colors"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => deleteCampaign(campaign.id)}
                                className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Alt Campaign'ler */}
                        {expandedCampaigns.has(campaign.id) && getSubCampaigns(campaign.id).length > 0 && (
                          <div className="ml-8 mt-2 space-y-2">
                            {getSubCampaigns(campaign.id).map((subCampaign) => (
                              <div key={subCampaign.id} className="p-3 bg-white/5 rounded-lg border border-white/10 border-l-4 border-l-blue-500/50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h6 
                                        className="text-white font-medium text-sm cursor-pointer hover:text-blue-400 transition-colors"
                                        onClick={() => toggleCampaignDetails(subCampaign.id)}
                                      >
                                        {subCampaign.name}
                                      </h6>
                                      <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                                        Alt Campaign
                                      </span>
                                    </div>
                                    
                                    {/* Alt Campaign Detayları - Sadece açıksa göster */}
                                    {expandedCampaignDetails.has(subCampaign.id) && (
                                      <div className="mt-2 space-y-1">
                                        {subCampaign.averageDuration && (
                                          <div className="text-sm text-[#00ff88]">⏱️ {subCampaign.averageDuration}</div>
                                        )}
                                        {subCampaign.description && (
                                          <p className="text-sm text-gray-400">{subCampaign.description}</p>
                                        )}
                                        {subCampaign.customProperties.length > 0 && (
                                          <div className="flex flex-wrap gap-2">
                                            {subCampaign.customProperties.map((prop) => (
                                              <span key={prop.id} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                                                {prop.name}: {prop.value}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        {subCampaign.howLongToBeatData && (
                                          <div className="text-xs text-gray-500">
                                            📊 HowLongToBeat verisi mevcut
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setCurrentCampaign(subCampaign)}
                                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-gray-300 transition-colors"
                                    >
                                      Düzenle
                                    </button>
                                    <button
                                      onClick={() => deleteCampaign(subCampaign.id)}
                                      className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/30 transition-colors"
                                    >
                                      Sil
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Modal */}
              {showImport && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
                  <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-2xl">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white">TXT Import</h3>
                      <p className="text-gray-400 text-sm mt-1">Her satırda: Campaign Adı | Süre | Açıklama</p>
                    </div>
                    
                    <div className="p-6">
                      <textarea
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder={`Main Story | 25 saat | Ana hikaye kampanyası\nEvil Playthrough | 30 saat | Kötü karakter ile oynama\nNosferatu Clan | 35 saat | Nosferatu vampiri olarak oynama`}
                        rows={8}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 resize-none"
                      />
                      
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={importFromText}
                          disabled={!importText.trim()}
                          className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                        >
                          Import Et
                        </button>
                        <button
                          onClick={() => setShowImport(false)}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Prompt Modal */}
              {showAIPrompt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
                  <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white">AI Prompt Oluşturucu</h3>
                      <p className="text-gray-400 text-sm mt-1">Bu prompt'u yapay zekaya vererek campaign'leri otomatik oluşturabilirsiniz</p>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={15}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 resize-none font-mono text-sm"
                        readOnly
                      />
                      
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => { try { void navigator.clipboard.writeText(aiPrompt).catch(() => {}) } catch {} }}
                          className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                          📋 Prompt'u Kopyala
                        </button>
                        <button
                          onClick={() => setShowAIPrompt(false)}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                          Kapat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Property Modal */}
              {showAddProperty && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
                  <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-md">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white">Özel Özellik Ekle</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Özellik Adı</label>
                          <input
                            type="text"
                            value={newProperty.name}
                            onChange={(e) => setNewProperty(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Örn: Faction, Playstyle, Difficulty"
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Değer</label>
                          <input
                            type="text"
                            value={newProperty.value}
                            onChange={(e) => setNewProperty(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Örn: Nosferatu, Stealth, Hard"
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={addCustomProperty}
                          disabled={!newProperty.name.trim() || !newProperty.value.trim()}
                          className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                        >
                          Ekle
                        </button>
                        <button
                          onClick={() => setShowAddProperty(false)}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : !selectedGame ? (
            // Arama Ekranı
            <div className="space-y-6">
              {/* Arama Kutusu */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value
                      setSearchTerm(value)
                      // Otomatik arama (debounced)
                      if (value.length >= 2) {
                        handleSearchDebounced(value)
                      } else if (value.length === 0) {
                        setSearchResults([])
                        setError('')
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Oyun adı girin... (otomatik arama)"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00ff88]/50"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchTerm.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? '🔍 Arıyor...' : '🔍 Ara'}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Arama Sonuçları */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Arama Sonuçları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {searchResults.map((game) => (
                      <div
                        key={game.id}
                        className="bg-white/5 rounded-lg border border-white/10 hover:border-[#00ff88]/50 transition-all group relative"
                      >
                        {/* Kütüphane Durumu Badge */}
                        {game.isInLibrary && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-[#00ff88] text-black text-xs font-bold px-2 py-1 rounded-full">
                              ✓ Kütüphanede
                            </span>
                          </div>
                        )}
                        
                        <div 
                          onClick={() => !game.isInLibrary && handleGameSelect(game)}
                          className={`${!game.isInLibrary ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
                            <img
                              src={getImageUrl(game.cover, 'cover_big')}
                              alt={game.name}
                              className={`w-full h-full object-cover transition-transform ${!game.isInLibrary ? 'group-hover:scale-105' : ''}`}
                            />
                          </div>
                          <div className="p-3">
                            <h4 className={`font-bold text-sm truncate transition-colors ${!game.isInLibrary ? 'text-white group-hover:text-[#00ff88]' : 'text-gray-300'}`}>
                              {game.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : 'Bilinmiyor'}
                            </p>
                            
                            {/* Relevance Score Göstergesi */}
                            {game.relevanceScore && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-xs text-[#00ff88]">🎯</span>
                                <span className={`text-xs font-medium ${formatRelevanceScore(game.relevanceScore).color}`}>
                                  %{Math.round(game.relevanceScore)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatRelevanceScore(game.relevanceScore).label}
                                </span>
                              </div>
                            )}
                            
                            {game.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-yellow-400">⭐</span>
                                <span className="text-xs text-gray-300">{Math.round(game.rating)}/100</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Düzenle Butonu - Sadece kütüphanede olan oyunlar için */}
                        {game.isInLibrary && (
                          <div className="p-3 pt-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onEditGame) {
                                  onEditGame(game.id)
                                }
                              }}
                              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                            >
                              <span>✏️</span>
                              Düzenle
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Oyun Detayları ve Ekleme Ekranı
            <div className="space-y-6">
              {/* Geri Butonu - düzenleme modunda gizle */}
              {!editMode && (
                <button
                  onClick={() => setSelectedGame(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  ← Geri dön
                </button>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol: Oyun Görseli */}
                <div className="lg:col-span-1 space-y-4">
                  <img
                    src={getImageUrl(selectedGame.cover, '1080p')}
                    alt={selectedGame.name}
                    className="w-full aspect-[2/3] object-cover rounded-lg"
                  />
                  
                  {/* Afiş Altı Bilgiler */}
                  <div className="space-y-3">
                    {/* Hızlı İstatistikler */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Hızlı Bilgiler</h4>
                      <div className="space-y-2 text-xs">
                        {selectedGame.first_release_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Çıkış:</span>
                            <span className="text-white">{new Date(selectedGame.first_release_date * 1000).getFullYear()}</span>
                          </div>
                        )}

                        {selectedGame.platforms && selectedGame.platforms.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Platformlar:</span>
                            <span className="text-white">{selectedGame.platforms.length}</span>
                          </div>
                        )}
                        {gameVariants.dlcs.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">DLC:</span>
                            <span className="text-[#00ff88]">{gameVariants.dlcs.length} adet</span>
                          </div>
                        )}
                        {(() => {
                          const { developer, publisher } = extractDeveloperAndPublisher(selectedGame.involved_companies)
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Geliştirici:</span>
                                <span className="text-white text-xs">{developer}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Yayımcı:</span>
                                <span className="text-white text-xs">{publisher}</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Türler */}
                    {selectedGame.genres && selectedGame.genres.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Türler</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedGame.genres.slice(0, 4).map((genre) => (
                            <span key={genre.id} className="px-2 py-1 bg-gradient-to-r from-[#00ff88]/20 to-[#00d4ff]/20 rounded text-xs text-white border border-[#00ff88]/30">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Versiyon Durumu */}
                    {(showVariants || isLoadingVariants) && (
                      <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-blue-300">Versiyon Durumu</h4>
                          {isLoadingVariants && (
                            <div className="text-blue-400 text-xs">Kontrol ediliyor...</div>
                          )}
                        </div>
                        
                        {isLoadingVariants ? (
                          <div className="space-y-2">
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full animate-pulse" 
                                   style={{width: '100%'}}>
                              </div>
                            </div>
                            <div className="flex justify-center items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                            <div className="text-center text-gray-400 text-xs">Versiyonlar kontrol ediliyor...</div>
                          </div>
                        ) : (
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Ana Oyun:</span>
                              <span className="text-white">✓ Mevcut</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Edisyonlar:</span>
                              <span className="text-white">{gameVariants.editions.length} adet</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">DLC/Expansion:</span>
                              <span className="text-white">{gameVariants.dlcs.length + gameVariants.expansions.length} adet</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Versiyon Seçimi */}
                    {showVariants && !isLoadingVariants && (
                      <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">Versiyon Seçimi</h4>
                        <div className="space-y-2">
                          {/* Ana Oyun */}
                          <div 
                            onClick={() => setSelectedVariant(selectedGame)}
                            className={`p-2 rounded-lg border cursor-pointer transition-all ${
                              selectedVariant?.id === selectedGame.id
                                ? 'border-[#00ff88] bg-[#00ff88]/10' 
                                : 'border-white/20 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-10 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                                {selectedGame.cover?.url && (
                                  <img 
                                    src={getImageUrl(selectedGame.cover, 'cover_big')}
                                    alt={selectedGame.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-xs truncate">{selectedGame.name}</div>
                                <div className="text-xs text-gray-400">Ana Oyun</div>
                              </div>
                              {selectedVariant?.id === selectedGame.id && (
                                <div className="text-[#00ff88] text-xs">✓</div>
                              )}
                            </div>
                          </div>

                          {/* Edisyonlar */}
                          {gameVariants.editions.map((edition) => (
                            <div 
                              key={edition.id}
                              onClick={() => setSelectedVariant(edition)}
                              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                selectedVariant?.id === edition.id
                                  ? 'border-[#00ff88] bg-[#00ff88]/10' 
                                  : 'border-white/20 bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-10 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                                  {edition.cover?.url && (
                                    <img 
                                      src={getImageUrl(edition.cover, 'cover_small')}
                                      alt={edition.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white text-xs truncate">{edition.name}</div>
                                  <div className="text-xs text-gray-400">{getCategoryName(edition.category)}</div>
                                </div>
                                {selectedVariant?.id === edition.id && (
                                  <div className="text-[#00ff88] text-xs">✓</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sağ: Oyun Bilgileri ve Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Oyun Bilgileri */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedGame.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {selectedGame.first_release_date && (
                        <div>
                          <span className="text-gray-400">Çıkış Tarihi:</span>
                          <span className="text-white ml-2">{new Date(selectedGame.first_release_date * 1000).getFullYear()}</span>
                        </div>
                      )}
                      

                      
                      {selectedGame.genres && selectedGame.genres.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-gray-400">Türler:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedGame.genres.slice(0, 5).map((genre) => (
                              <span key={genre.id} className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedGame.summary && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {selectedGame.summary.length > 300 
                          ? selectedGame.summary.substring(0, 300) + '...' 
                          : selectedGame.summary
                        }
                      </p>
                    )}
                  </div>

                  {/* DLC Seçimi - Tam Genişlik */}
                  {(showVariants || isLoadingVariants) && (
                    <div className="space-y-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white">DLC Seçimi</h4>
                          <div className="flex items-center gap-2">
                            {isLoadingVariants && (
                              <div className="text-purple-400 text-sm">Yükleniyor...</div>
                            )}
                            <button
                              onClick={() => refreshDLCData()}
                              disabled={isLoadingVariants}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
                              title="DLC verilerini yenile"
                            >
                              🔄 Yenile
                            </button>
                          </div>
                        </div>
                        
                        {/* Yükleme Barı */}
                        {isLoadingVariants && (
                          <div className="space-y-3">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] h-2 rounded-full animate-pulse" 
                                   style={{width: '100%'}}>
                              </div>
                            </div>
                            <div className="flex justify-center items-center space-x-2">
                              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                            <div className="text-center text-gray-400 text-sm">DLC'ler aranıyor...</div>
                          </div>
                        )}
                        
                        {!isLoadingVariants && (
                          <>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-300 text-sm">
                                Bu oyunun DLC'lerini seçin (çoklu seçim yapabilirsiniz):
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const allDlcs = mergeDLCsWithoutDuplicates(
                                      gameVariants.dlcs || [],
                                      gameVariants.expansions || [],
                                      steamDlcs || []
                                    )
                                    setSelectedDlcs(allDlcs)
                                  }}
                                  className="px-3 py-1 text-xs bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50 rounded-lg hover:bg-[#00ff88]/30 transition-all"
                                >
                                  Tümünü Seç
                                </button>
                                <button
                                  onClick={() => setSelectedDlcs([])}
                                  className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all"
                                >
                                  Tümünü Temizle
                                </button>
                              </div>
                            </div>

                            {/* Birleşik DLC Listesi - IGDB Öncelikli */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {(() => {
                                // IGDB DLC'lerini ve Steam'den sadece IGDB'de olmayan DLC'leri birleştir
                                const mergedDlcs = mergeDLCsWithoutDuplicates(
                                  gameVariants.dlcs || [],
                                  gameVariants.expansions || [],
                                  steamDlcs || []
                                )
                                
                                if (mergedDlcs.length === 0) {
                                  return (
                                    <div className="text-center text-gray-400 py-8">
                                      Bu oyun için DLC bulunamadı
                                    </div>
                                  )
                                }
                                
                                return mergedDlcs.map((dlc) => (
                                  <div 
                                    key={dlc.id}
                                    onClick={() => {
                                      const isSelected = selectedDlcs.some(d => d.id === dlc.id)
                                      if (isSelected) {
                                        setSelectedDlcs(selectedDlcs.filter(d => d.id !== dlc.id))
                                      } else {
                                        setSelectedDlcs([...selectedDlcs, dlc])
                                      }
                                    }}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                      selectedDlcs.some(d => d.id === dlc.id)
                                        ? 'border-[#00ff88] bg-[#00ff88]/10' 
                                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-12 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                                        {dlc.cover?.url && (
                                          <img 
                                            src={dlc.source === 'steam' ? dlc.cover.url : getImageUrl(dlc.cover, 'cover_small')}
                                            alt={dlc.name}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white text-sm truncate">{dlc.name}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-2">
                                          <span>
                                            {dlc.source === 'steam' ? 'Steam DLC' : getCategoryName(dlc.category)}
                                          </span>
                                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                            dlc.source === 'igdb' 
                                              ? 'bg-blue-500/20 text-blue-300' 
                                              : 'bg-green-500/20 text-green-300'
                                          }`}>
                                            {dlc.source === 'igdb' ? 'IGDB' : 'Steam'}
                                          </span>
                                        </div>
                                        {dlc.first_release_date && (
                                          <div className="text-xs text-gray-500">
                                            {new Date(dlc.first_release_date * 1000).getFullYear()}
                                          </div>
                                        )}
                                        {dlc.source === 'steam' && dlc.price_overview && (
                                          <div className="text-xs text-yellow-400">
                                            {dlc.price_overview.final_formatted}
                                          </div>
                                        )}
                                        {dlc.source === 'steam' && dlc.description && (
                                          <div 
                                            className="text-xs text-gray-400 mt-1"
                                            style={{
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden'
                                            }}
                                          >
                                            {dlc.description}
                                          </div>
                                        )}
                                      </div>
                                      {selectedDlcs.some(d => d.id === dlc.id) && (
                                        <div className="text-[#00ff88] text-sm">✓</div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              })()}
                            </div>

                            {/* DLC İstatistikleri */}
                            {(() => {
                              const mergedDlcs = mergeDLCsWithoutDuplicates(
                                gameVariants.dlcs || [],
                                gameVariants.expansions || [],
                                steamDlcs || []
                              )
                              const igdbCount = mergedDlcs.filter(dlc => dlc.source === 'igdb').length
                              const steamCount = mergedDlcs.filter(dlc => dlc.source === 'steam').length
                              
                              return mergedDlcs.length > 0 && (
                                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                  <div className="text-sm text-gray-300 flex items-center justify-between">
                                    <span>Toplam {mergedDlcs.length} DLC bulundu</span>
                                    <div className="flex gap-3 text-xs">
                                      {igdbCount > 0 && (
                                        <span className="text-blue-300">
                                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                          IGDB: {igdbCount}
                                        </span>
                                      )}
                                      {steamCount > 0 && (
                                        <span className="text-green-300">
                                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                          Steam: {steamCount}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}

                        </>
                      )}
                    </div>

                  )}

                  {/* Ekleme Formu */}
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-bold text-white">{editMode ? 'Oyunu Düzenle' : 'Kütüphaneye Ekle'}</h4>
                    
                    {/* Platform Seçimi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Platform</label>
                      
                      {/* Ana Platformlar - Butonlar */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          { name: 'Steam', icon: '🎮', color: 'from-blue-500 to-blue-600' },
                          { name: 'Epic Games', icon: '🚀', color: 'from-gray-700 to-gray-800' },
                          { name: 'PlayStation', icon: '🎮', color: 'from-blue-600 to-blue-700' },
                          { name: 'Xbox', icon: '🎮', color: 'from-green-500 to-green-600' }
                        ].map((p) => (
                          <button
                            key={p.name}
                            onClick={() => setPlatform(p.name)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              platform === p.name 
                                ? 'border-[#00ff88] bg-[#00ff88]/10 text-white' 
                                : 'border-white/20 bg-white/5 hover:bg-white/10 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{p.icon}</span>
                              <span className="text-sm font-medium">{p.name}</span>
                            </div>
                            {platform === p.name && (
                              <div className="text-[#00ff88] text-xs mt-1">✓ Seçili</div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {/* Diğer Platformlar - Dropdown */}
                      <div>
                        <select
                          value={['Steam', 'Epic Games', 'PlayStation', 'Xbox'].includes(platform) ? '' : platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
                        >
                          <option value="" className="bg-gray-800">Diğer Platformlar</option>
                          {otherPlatforms.map((name) => (
                            <option key={name} value={name} className="bg-gray-800">{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Toplam Oynama Süresi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Toplam Oynama Süresi</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={totalPlaytime}
                          onChange={(e) => setTotalPlaytime(e.target.value)}
                          placeholder="Örn: 25 saat, 2.5h, 150 dakika"
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          ⏱️
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        💡 İsteğe bağlı - Oyunu ne kadar süre oynadığınızı girebilirsiniz
                      </div>
                    </div>

                    {/* Durum Seçimi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
                      <select
                        value={gameStatus}
                        onChange={(e) => setGameStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
                      >
                        <option value="backlog" className="bg-gray-800">Backlog</option>
                        <option value="playing" className="bg-gray-800">Oynanıyor</option>
                        <option value="completed" className="bg-gray-800">Bitti</option>
                        <option value="completed_100" className="bg-gray-800">%100 Bitti</option>
                        <option value="paused" className="bg-gray-800">Ara Verildi</option>
                        <option value="dropped" className="bg-gray-800">Bırakıldı</option>
                      </select>
                    </div>

        {/* Campaign yönetimi */}
                    {/* Campaign Yönetimi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Yönetimi</label>
                      <div className="space-y-3">
                        {/* Campaign Durumu */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🎯 Campaign moduna geçiş')
                              setIsCampaignMode(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-white/5 border-white/20 text-gray-300 hover:border-white/40"
                          >
                            🎯 Campaign Yönetimi
                          </button>
                          
                          {/* HLTB Button - Coming Soon */}
                          <div className="relative">
                            <button
                              type="button"
                              disabled
                              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-yellow-500/10 border-yellow-500/30 text-yellow-300 cursor-not-allowed opacity-75"
                              title="Çok Yakında!"
                            >
                              🕹️ HLTB Ekle
                            </button>
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                              Yakında
                            </div>
                          </div>
                        </div>
                        
                        {/* Yardım Metni */}
                        <div className="text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
                          💡 Bu oyunda birden fazla campaign/hikaye modu varsa campaign ekleyebilirsiniz
                        </div>
                      </div>
                    </div>

                    {/* Seçilen DLC'ler Özeti */}
                    {selectedDlcs.length > 0 && (
                      <div className="p-3 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">Seçilen DLC'ler</span>
                          <span className="text-lg font-bold text-[#00ff88]">{selectedDlcs.length}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          DLC seçildi ve oyunla birlikte eklenecek
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Ekleme Butonu */}
                    <button
                      onClick={handleAddGame}
                      disabled={isAddingGame || !platform}
                      className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingGame ? (editMode ? '🎮 Güncelleniyor...' : '🎮 Ekleniyor...') : (editMode ? '🎮 Oyunu Düzenle' : '🎮 Kütüphaneye Ekle')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal gövdesi (modalRef) kapanışı */}
        </div>

        {/* Bağımsız Floating Campaign Kutusu (modalın sağında, hover ile görünür) - Sadece campaign yönetimi modunda */}
        <CampaignFloatingBox rect={modalRect} show={isCampaignMode && campaigns.length > 0} />

      </div>
    </div>,
    document.body
  )
}

export default AddGameModal