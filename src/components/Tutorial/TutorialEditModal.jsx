import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTutorialAdmin } from '../../hooks/useTutorial'
import { TUTORIAL_TYPES, PAGE_CATEGORIES } from '../../utils/tutorialTypes'

function TutorialEditModal({ isOpen, onClose, tutorialId = null }) {
  const { isAdmin, saveTutorial, loadTutorial, deleteTutorial, listTutorials } = useTutorialAdmin()
  const selectorWindowRef = useRef(null)
  // Draft persistence key: unique per tutorial or 'new'
  const draftKeyRef = useRef(null)
  const [tutorialData, setTutorialData] = useState({
    id: '',
    title: '',
    description: '',
    version: '1.0.0',
    type: TUTORIAL_TYPES.PAGE_GUIDE,
    targetPage: null, // { categoryId, pageId, pageName, pagePath }
    steps: [],
    settings: {
      autoStart: true,
      showProgress: true,
      allowSkip: true,
      overlay: {
        color: 'rgba(0, 0, 0, 0.7)',
        blur: true
      },
      highlight: {
        color: '#8b5cf6',
        borderWidth: 3,
        borderRadius: 8,
        padding: 8
      },
      modal: {
        maxWidth: 400,
        borderRadius: 12,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        textColor: '#ffffff'
      }
    }
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [draggedStep, setDraggedStep] = useState(null)
  const restoredFromDraftRef = useRef(false)

  // Resolve draft key whenever modal opens or tutorialId changes
  useEffect(() => {
    draftKeyRef.current = tutorialId ? `junoro:tutorialDraft:${tutorialId}` : 'junoro:tutorialDraft:new'
  }, [tutorialId, isOpen])

  // Element seçme ve READY mesajlarını dinle
  useEffect(() => {
    const handleMessage = (event) => {
      // Yeni sekme hazırsa ENABLE mesajını tekrar gönder (el sıkışma)
      if (event.data.type === 'ELEMENT_SELECTOR_READY') {
        const targetWin = selectorWindowRef.current
        if (targetWin && !targetWin.closed) {
          try {
            targetWin.postMessage({
              type: 'ENABLE_ELEMENT_SELECTOR',
              stepIndex: currentStep,
              returnUrl: window.location.href
            }, '*')
          } catch (e) {
            // sessiz geç
          }
        }
        return
      }

      if (event.data.type === 'ELEMENT_SELECTED') {
        const { selector, navigationSteps, registryId, stepIndex: incomingStepIndex } = event.data
        
        // Eğer navigation steps varsa, bunları tutorial'a ekle
        if (navigationSteps && navigationSteps.length > 0) {
          // Mevcut adımdan önce navigation steps'i ekle
          const newSteps = [...tutorialData.steps]
          const currentIndex = newSteps.findIndex(step => step.id === currentStep)
          
          // Navigation steps'i tutorial adımlarına çevir
          const navSteps = navigationSteps.map((navStep, index) => ({
            id: `nav-step-${Date.now()}-${index}`,
            title: `Adım ${index + 1}: ${navStep.description}`,
            description: `${navStep.action} işlemi yapın`,
            target: navStep.selector,
            position: 'bottom',
            action: navStep.action,
            isNavigationStep: true
          }))
          
          // Navigation steps'i mevcut adımdan önce ekle
          newSteps.splice(currentIndex, 0, ...navSteps)
          
          setTutorialData(prev => ({
            ...prev,
            steps: newSteps
          }))
          
          setSuccess(`${navigationSteps.length} navigasyon adımı ve hedef element eklendi`)
        } else {
          setSuccess(registryId ? `ERS ID: ${registryId} seçildi` : `Element seçildi: ${selector}`)
        }
        
        // Seçilen elementi ilgili adıma ata (gelen stepIndex varsa onu kullan)
        const targetStepIndex = typeof incomingStepIndex === 'number' ? incomingStepIndex : currentStep
        updateStep(targetStepIndex, 'target', selector)
        
        setTimeout(() => setSuccess(''), 3000)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [currentStep, tutorialData.steps])

  // Geri dönüşte localStorage üzerinden seçim bilgisini al ve modal açıldığında uygula
  useEffect(() => {
    if (!isOpen) return
    try {
      const raw = localStorage.getItem('junoro:tutorialSelection')
      if (!raw) return
      const sel = JSON.parse(raw)
      // Son 3 dakika içinde ise geçerli say
      if (sel && sel.selector && Date.now() - sel.timestamp < 3 * 60 * 1000) {
        const idx = typeof sel.stepIndex === 'number' ? sel.stepIndex : currentStep
        updateStep(idx, 'target', sel.registryId ? `[data-registry="${sel.registryId}"]` : sel.selector)
        setCurrentStep(idx)
        setSuccess(sel.registryId ? `ERS ID panoya kopyalandı: ${sel.registryId}` : `Element seçildi: ${sel.selector}`)
        setTimeout(() => setSuccess(''), 3000)
      }
      localStorage.removeItem('junoro:tutorialSelection')
    } catch (e) {
      // sessiz geç
    }
  }, [isOpen])

  // Modal açıldığında mevcut draft'ı otomatik geri yükle (Seç'e basmadan önceki tüm kutucuklar/adımlar dahil)
  useEffect(() => {
    if (!isOpen || restoredFromDraftRef.current === true) return
    try {
      const key = draftKeyRef.current
      if (!key) return
      const raw = localStorage.getItem(key)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft && draft.tutorialData) {
        setTutorialData(draft.tutorialData)
        if (typeof draft.currentStep === 'number') {
          setCurrentStep(draft.currentStep)
        }
        restoredFromDraftRef.current = true
      }
    } catch (e) {
      // sessiz geç
    }
  }, [isOpen])

  // Tutorial yükle (düzenleme modu)
  useEffect(() => {
    if (isOpen && tutorialId) {
      // Eğer draft restore yapıldıysa mevcut yüklemeyi atla (geri doldurmayı bozmamak için)
      if (!restoredFromDraftRef.current) {
        loadExistingTutorial()
      }
    } else if (isOpen && !tutorialId) {
      // Yeni tutorial
      if (!restoredFromDraftRef.current) {
        setTutorialData(prev => ({
          ...prev,
          id: '',
          title: '',
          description: '',
          type: TUTORIAL_TYPES.PAGE_GUIDE,
          targetPage: null,
          steps: [createEmptyStep()]
        }))
      }
    }
  }, [isOpen, tutorialId])

  const loadExistingTutorial = async () => {
    try {
      setIsLoading(true)
      const data = await loadTutorial(tutorialId)
      if (data) {
        // Draft restore yapıldıysa yüklenen verilerle üzerine yazma
        if (!restoredFromDraftRef.current) {
          setTutorialData(data)
        }
      }
    } catch (err) {
      setError('Tutorial yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const createEmptyStep = () => ({
    id: `step-${Date.now()}`,
    title: '',
    description: '',
    target: '',
    position: 'bottom',
    highlightType: 'outline',
    content: {
      text: '',
      image: null,
      buttons: [
        {
          text: 'Devam',
          action: 'next',
          style: 'primary'
        }
      ]
    }
  })

  const addStep = () => {
    setTutorialData(prev => ({
      ...prev,
      steps: [...prev.steps, createEmptyStep()]
    }))
  }

  const removeStep = (index) => {
    if (tutorialData.steps.length > 1) {
      setTutorialData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }))
      if (currentStep >= tutorialData.steps.length - 1) {
        setCurrentStep(Math.max(0, tutorialData.steps.length - 2))
      }
    }
  }

  const updateStep = (index, field, value) => {
    setTutorialData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }))
  }

  const updateStepContent = (index, field, value) => {
    setTutorialData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { 
          ...step, 
          content: { ...step.content, [field]: value }
        } : step
      )
    }))
  }

  // Persist draft on every change while modal is open (so returning won't lose filled fields)
  useEffect(() => {
    if (!isOpen) return
    try {
      const key = draftKeyRef.current
      if (!key) return
      const payload = { tutorialData, currentStep, ts: Date.now() }
      localStorage.setItem(key, JSON.stringify(payload))
    } catch (e) {
      // sessiz geç
    }
  }, [tutorialData, currentStep, isOpen])

  // Drag and Drop fonksiyonları
  const handleDragStart = (e, index) => {
    setDraggedStep(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedStep === null || draggedStep === dropIndex) {
      setDraggedStep(null)
      return
    }

    const newSteps = [...tutorialData.steps]
    const draggedItem = newSteps[draggedStep]
    
    // Öğeyi çıkar
    newSteps.splice(draggedStep, 1)
    
    // Yeni pozisyona ekle
    const insertIndex = draggedStep < dropIndex ? dropIndex - 1 : dropIndex
    newSteps.splice(insertIndex, 0, draggedItem)
    
    setTutorialData(prev => ({
      ...prev,
      steps: newSteps
    }))
    
    // Mevcut adımı güncelle
    if (currentStep === draggedStep) {
      setCurrentStep(insertIndex)
    } else if (draggedStep < currentStep && insertIndex >= currentStep) {
      setCurrentStep(currentStep - 1)
    } else if (draggedStep > currentStep && insertIndex <= currentStep) {
      setCurrentStep(currentStep + 1)
    }
    
    setDraggedStep(null)
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      if (!tutorialData.id || !tutorialData.title) {
        setError('ID ve başlık alanları zorunludur')
        return
      }

      await saveTutorial(tutorialData.id, tutorialData)
      // Başarılı kayıttan sonra draft'ı temizle
      try {
        const key = draftKeyRef.current
        if (key) localStorage.removeItem(key)
      } catch {}
      setSuccess('Tutorial başarıyla kaydedildi!')
      setTimeout(() => {
        setSuccess('')
        onClose()
      }, 2000)
    } catch (err) {
      setError('Tutorial kaydedilirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!tutorialId) return
    
    if (window.confirm('Bu tutorial\'ı silmek istediğinizden emin misiniz?')) {
      try {
        setIsLoading(true)
        await deleteTutorial(tutorialId)
        setSuccess('Tutorial başarıyla silindi!')
        setTimeout(() => {
          setSuccess('')
          onClose()
        }, 2000)
      } catch (err) {
        setError('Tutorial silinirken hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!isOpen) return null

  // Admin kontrolü
  if (!isAdmin) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-xl font-bold text-white mb-4">Yetkisiz Erişim</h3>
          <p className="text-gray-300 mb-4">Bu özelliği kullanmak için admin yetkisine sahip olmanız gerekiyor.</p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Standart Header */}
        <div className="bg-slate-900/50 border-b border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              {/* Icon ve Başlık */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">❓</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {tutorialId ? 'Tutorial Düzenle' : 'Yeni Tutorial Oluştur'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {tutorialId ? 'Mevcut tutorial\'ı düzenleyin' : 'Yeni bir tutorial oluşturun'}
                  </p>
                </div>
              </div>
              
              {/* Hedef Sayfa Butonu */}
              {tutorialData.id && (
                <button
                  onClick={() => {
                    const targetPage = tutorialData.id.replace('-tutorial', '')
                    const targetUrl = targetPage === 'home-page' ? '/' : `/${targetPage}`
                    window.open(targetUrl, '_blank')
                  }}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 hover:scale-105"
                  title="Hedef sayfayı yeni sekmede aç"
                >
                  <span className="text-blue-400">🔗</span>
                  Hedef Sayfaya Git
                </button>
              )}
            </div>
            
            {/* Sağ Taraf Kontrolleri */}
            <div className="flex items-center gap-3">
              {/* Tutorial ID Badge */}
              {tutorialData.id && (
                <div className="bg-slate-700/50 px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-400">ID: </span>
                  <span className="text-xs text-gray-300 font-mono">{tutorialData.id}</span>
                </div>
              )}
              
              {/* Kapat Butonu */}
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-700/50 hover:bg-red-600/20 border border-slate-600/50 hover:border-red-500/30 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-300 transition-all duration-200"
                title="Kapat"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Status Messages */}
          <div className="p-6 pb-0">
            {isLoading && (
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-6 text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">Yükleniyor...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-red-400 text-lg">⚠️</span>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-lg">✅</span>
                  <p className="text-green-300">{success}</p>
                </div>
              </div>
            )}
          </div>

          {!isLoading && (
            <div className="p-6 pt-0">
              {/* Temel Bilgiler Bölümü */}
              <div className="bg-slate-700/20 border border-slate-600/30 rounded-xl p-6 mb-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-sm">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Temel Bilgiler</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tutorial Tipi *
                  </label>
                  <select
                    value={tutorialData.type}
                    onChange={(e) => setTutorialData(prev => ({ ...prev, type: e.target.value, targetPage: null }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={TUTORIAL_TYPES.PAGE_GUIDE}>📄 Sayfa Rehberi</option>
                    <option value={TUTORIAL_TYPES.SUB_GUIDE}>📋 Alt Rehber</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tutorial ID *
                  </label>
                  <input
                    type="text"
                    value={tutorialData.id}
                    onChange={(e) => setTutorialData(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="home-page-tutorial"
                  />
                </div>
              </div>

              {/* Hedef Sayfa Seçimi (Sadece Sayfa Rehberi için) */}
              {tutorialData.type === TUTORIAL_TYPES.PAGE_GUIDE && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-sm">📍</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Hedef Sayfa Seçimi</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hedef Sayfa *
                    </label>
                    <select
                      value={tutorialData.targetPage ? `${tutorialData.targetPage.categoryId}:${tutorialData.targetPage.pageId}` : ''}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setTutorialData(prev => ({ ...prev, targetPage: null }))
                          return
                        }
                        
                        const [categoryId, pageId] = e.target.value.split(':')
                        const category = Object.values(PAGE_CATEGORIES).find(cat => cat.id === categoryId)
                        const page = category?.pages.find(p => p.id === pageId)
                        
                        if (page) {
                          setTutorialData(prev => ({
                            ...prev,
                            targetPage: {
                              categoryId: category.id,
                              pageId: page.id,
                              pageName: page.name,
                              pagePath: page.path
                            }
                          }))
                        }
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Hedef sayfa seçin...</option>
                      {Object.values(PAGE_CATEGORIES).map(category => (
                        <optgroup key={category.id} label={category.name}>
                          {category.pages.map(page => (
                            <option 
                              key={page.id} 
                              value={`${category.id}:${page.id}`}
                            >
                              {page.name} ({page.path})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    
                    {/* Seçilen Sayfa Önizlemesi */}
                    {tutorialData.targetPage && (
                      <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-white">{tutorialData.targetPage.pageName}</h4>
                            <p className="text-xs text-gray-400">{tutorialData.targetPage.pagePath}</p>
                          </div>
                          <button
                            onClick={() => window.open(`${window.location.origin}${tutorialData.targetPage.pagePath}`, '_blank')}
                            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-lg text-xs transition-all duration-200"
                          >
                            🔗 Önizle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tutorial Başlığı *
                  </label>
                  <input
                    type="text"
                    value={tutorialData.title}
                    onChange={(e) => setTutorialData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Tutorial başlığı..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Versiyon
                  </label>
                  <input
                    type="text"
                    value={tutorialData.version}
                    onChange={(e) => setTutorialData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={tutorialData.description}
                  onChange={(e) => setTutorialData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  rows="3"
                  placeholder="Tutorial açıklaması..."
                />
              </div>
              </div>

              {/* Tutorial Adımları Bölümü */}
              <div className="bg-slate-700/20 border border-slate-600/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-sm">📋</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Tutorial Adımları</h3>
                    <span className="bg-slate-600/50 px-2 py-1 rounded-full text-xs text-gray-300">
                      {tutorialData.steps.length} adım
                    </span>
                  </div>
                  <button
                    onClick={addStep}
                    className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"
                  >
                    <span className="text-purple-400">+</span>
                    Adım Ekle
                  </button>
                </div>

                {/* Adım Sekmeler */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {tutorialData.steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`relative cursor-move ${
                          draggedStep === index ? 'opacity-50' : ''
                        }`}
                      >
                        <button
                          onClick={() => setCurrentStep(index)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            currentStep === index
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        >
                          <span className="text-xs opacity-60">⋮⋮</span>
                          {step.title || `Adım ${index + 1}`}
                        </button>
                      </div>
                      {/* Ok işareti (son adım hariç) */}
                      {index < tutorialData.steps.length - 1 && (
                        <div className="mx-2 text-gray-500">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 3l5 5-5 5V3z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mevcut Adım Düzenleme */}
                {tutorialData.steps[currentStep] && (
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Adım {currentStep + 1}</h4>
                      {tutorialData.steps.length > 1 && (
                        <button
                          onClick={() => removeStep(currentStep)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Sil
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Başlık
                        </label>
                        <input
                          type="text"
                          value={tutorialData.steps[currentStep].title}
                          onChange={(e) => updateStep(currentStep, 'title', e.target.value)}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Target (CSS Selector)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tutorialData.steps[currentStep].target}
                            onChange={(e) => updateStep(currentStep, 'target', e.target.value)}
                            className="flex-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            placeholder=".main-clock"
                          />
                          <button
                            onClick={() => {
                              if (!tutorialData.targetPage) {
                                alert('Önce hedef sayfa seçmelisiniz!')
                                return
                              }
                              // Seç'e basmadan önce, mevcut form durumunu güvenle kaydet
                              try {
                                const key = draftKeyRef.current
                                if (key) {
                                  const payload = { tutorialData, currentStep, ts: Date.now() }
                                  localStorage.setItem(key, JSON.stringify(payload))
                                }
                              } catch (e) {}
                              
                              // Query param ile auto-activation
                              const baseUrl = `${window.location.origin}${tutorialData.targetPage.pagePath}`
                              const url = new URL(baseUrl, window.location.href)
                              url.searchParams.set('enableSelector', '1')
                              url.searchParams.set('returnUrl', window.location.href)
                              url.searchParams.set('stepIndex', String(currentStep))
                              const newWindow = window.open(url.toString(), '_blank')
                              selectorWindowRef.current = newWindow
                              
                              // Element seçme modunu aktifleştir - daha kısa gecikme
                              setTimeout(() => {
                                if (newWindow && !newWindow.closed) {
                                  newWindow.postMessage({
                                    type: 'ENABLE_ELEMENT_SELECTOR',
                                    stepIndex: currentStep,
                                    returnUrl: window.location.href
                                  }, '*')
                                }
                              }, 1000)
                              
                              // Backup - eğer ilk mesaj çalışmazsa tekrar dene
                              setTimeout(() => {
                                if (newWindow && !newWindow.closed) {
                                  newWindow.postMessage({
                                    type: 'ENABLE_ELEMENT_SELECTOR',
                                    stepIndex: currentStep,
                                    returnUrl: window.location.href
                                  }, '*')
                                }
                              }, 3000)
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                            title="Hedef sayfada element seç"
                          >
                            🎯 Seç
                          </button>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          💡 "Seç" butonuna tıklayarak hedef sayfada elementi seçebilirsiniz
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        İçerik Metni
                      </label>
                      <textarea
                        value={tutorialData.steps[currentStep].content.text}
                        onChange={(e) => updateStepContent(currentStep, 'text', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        rows="3"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Pozisyon
                        </label>
                        <select
                          value={tutorialData.steps[currentStep].position}
                          onChange={(e) => updateStep(currentStep, 'position', e.target.value)}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="top">Üst</option>
                          <option value="bottom">Alt</option>
                          <option value="left">Sol</option>
                          <option value="right">Sağ</option>
                          <option value="center">Merkez</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Vurgulama Tipi
                        </label>
                        <select
                          value={tutorialData.steps[currentStep].highlightType}
                          onChange={(e) => updateStep(currentStep, 'highlightType', e.target.value)}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="outline">Çerçeve</option>
                          <option value="spotlight">Spot Işık</option>
                          <option value="none">Yok</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modern Footer */}
        <div className="bg-slate-900/50 border-t border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              {tutorialId && (
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="text-red-400">🗑️</span>
                  Sil
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 text-gray-300 px-6 py-2 rounded-lg transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 disabled:hover:scale-100"
              >
                <span className="text-purple-200">
                  {isLoading ? '⏳' : '💾'}
                </span>
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TutorialEditModal