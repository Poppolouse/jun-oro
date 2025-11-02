import { useState, useEffect, useCallback } from 'react'
import { tutorialManager } from '../utils/tutorialTypes'
import { 
  hasVisitedPage, 
  markPageAsVisited, 
  shouldShowTutorial,
  markTutorialAsCompleted,
  markTutorialAsSkipped,
  loadTutorialSettings
} from '../utils/pageVisitTracker'

/**
 * Tutorial yönetimi için React hook
 * @param {string} tutorialId - Tutorial ID'si
 * @param {Object} options - Seçenekler
 * @returns {Object} Tutorial durumu ve kontrol fonksiyonları
 */
export const useTutorial = (tutorialId = null, options = {}) => {
  const { autoStart = false, userId = 'default', pageName = null } = options
  
  const [isActive, setIsActive] = useState(false)
  const [currentTutorial, setCurrentTutorial] = useState(null)
  const [currentStep, setCurrentStep] = useState(null)
  const [progress, setProgress] = useState(null)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)

  // Sayfa ziyaret durumunu kontrol et
  useEffect(() => {
    if (pageName && userId) {
      const visited = hasVisitedPage(userId, pageName)
      setHasSeenTutorial(visited)
      
      // Sayfa ilk kez ziyaret ediliyorsa ve tutorial gösterilmesi gerekiyorsa
      if (!visited && tutorialId && shouldShowTutorial(userId, tutorialId, pageName)) {
        // Sayfayı ziyaret edildi olarak işaretle
        markPageAsVisited(userId, pageName)
        
        // Tutorial'ı otomatik başlat
        if (autoStart) {
          setTimeout(() => {
            startTutorial()
          }, 1000) // 1 saniye bekle ki sayfa tam yüklensin
        }
      }
    }
  }, [tutorialId, userId, pageName, autoStart])

  // Tutorial manager callback'lerini kaydet
  useEffect(() => {
    tutorialManager.on({
      onStepShow: (step, stepIndex, tutorial) => {
        setCurrentStep(step)
        setCurrentTutorial(tutorial)
        setProgress(tutorialManager.getProgress())
        setIsActive(true)
      },
      onFinish: (tutorial) => {
        setIsActive(false)
        setCurrentStep(null)
        setCurrentTutorial(null)
        setProgress(null)
        
        // Tutorial tamamlandığını işaretle
        if (tutorialId && userId) {
          markTutorialAsCompleted(userId, tutorialId)
        }
      },
      onSkip: (tutorial) => {
        setIsActive(false)
        setCurrentStep(null)
        setCurrentTutorial(null)
        setProgress(null)
        
        // Tutorial atlandığını işaretle
        if (tutorialId && userId) {
          markTutorialAsSkipped(userId, tutorialId)
        }
      }
    })
  }, [tutorialId, userId])

  /**
   * Tutorial'ı manuel olarak başlat
   * @param {Object} options - Başlatma seçenekleri
   */
  const startTutorial = useCallback(async (options = {}) => {
    if (!tutorialId) {
      console.warn('Tutorial ID belirtilmedi')
      return
    }
    
    try {
      await tutorialManager.startTutorial(tutorialId, options)
    } catch (error) {
      console.error('Tutorial başlatılırken hata:', error)
    }
  }, [tutorialId])

  /**
   * Tutorial'ı durdur
   */
  const stopTutorial = useCallback(() => {
    tutorialManager.skipTutorial()
  }, [])

  /**
   * Sonraki adıma geç
   */
  const nextStep = useCallback(() => {
    tutorialManager.nextStep()
  }, [])

  /**
   * Önceki adıma geç
   */
  const prevStep = useCallback(() => {
    tutorialManager.prevStep()
  }, [])

  /**
   * Belirli bir adıma atla
   * @param {number} stepIndex - Hedef adım indeksi
   */
  const goToStep = useCallback((stepIndex) => {
    tutorialManager.showStep(stepIndex)
  }, [])

  /**
   * Tutorial'ı sıfırla (görülmedi olarak işaretle)
   */
  const resetTutorial = useCallback(() => {
    if (!tutorialId || !userId) return
    
    // Sayfa ziyaret verilerini sıfırla
    if (pageName) {
      const visits = JSON.parse(localStorage.getItem(`pageVisits_${userId}`) || '{}')
      delete visits[pageName]
      localStorage.setItem(`pageVisits_${userId}`, JSON.stringify(visits))
    }
    
    // Tutorial ayarlarını sıfırla
    const settings = loadTutorialSettings(userId)
    settings.completedTutorials = settings.completedTutorials.filter(id => id !== tutorialId)
    settings.skippedTutorials = settings.skippedTutorials.filter(id => id !== tutorialId)
    localStorage.setItem(`userTutorialSettings_${userId}`, JSON.stringify(settings))
    
    setHasSeenTutorial(false)
  }, [tutorialId, userId, pageName])

  /**
   * Tutorial verilerini başlatmadan al
   */
  const getTutorialData = useCallback(async () => {
    if (!tutorialId) return null
    
    try {
      return await tutorialManager.loadTutorial(tutorialId)
    } catch (error) {
      console.error('Tutorial verileri yüklenirken hata:', error)
      return null
    }
  }, [tutorialId])

  return {
    // Durum
    isActive,
    currentTutorial,
    currentStep,
    progress,
    hasSeenTutorial,
    
    // Aksiyonlar
    startTutorial,
    stopTutorial,
    nextStep,
    prevStep,
    goToStep,
    resetTutorial,
    getTutorialData,
    
    // Yardımcılar
    isFirstVisit: !hasSeenTutorial,
    canShowTutorial: !!tutorialId,
    shouldAutoShow: tutorialId && userId && pageName ? shouldShowTutorial(userId, tutorialId, pageName) : false
  }
}

/**
 * Tutorial admin fonksiyonları için hook
 * @returns {Object} Admin fonksiyonları
 */
export const useTutorialAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false)

  // Admin durumunu kontrol et
  useEffect(() => {
    // localStorage'dan kullanıcı bilgilerini al
    const savedUser = localStorage.getItem('arkade_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setIsAdmin(user.role === 'admin')
      } catch (error) {
        console.error('Kullanıcı bilgileri parse edilemedi:', error)
        setIsAdmin(false)
      }
    } else {
      setIsAdmin(false)
    }
  }, [])

  /**
   * Tutorial verilerini kaydet
   * @param {string} tutorialId - Tutorial tanımlayıcısı
   * @param {Object} tutorialData - Tutorial verileri
   */
  const saveTutorial = useCallback(async (tutorialId, tutorialData) => {
    if (!isAdmin) {
      throw new Error('Admin erişimi gerekli')
    }

    try {
      // Gerçek uygulamada bu backend'e kaydedilir
      // Şimdilik demo için localStorage kullanıyoruz
      const tutorials = JSON.parse(localStorage.getItem('customTutorials') || '{}')
      tutorials[tutorialId] = tutorialData
      localStorage.setItem('customTutorials', JSON.stringify(tutorials))
      
      console.log('Tutorial kaydedildi:', tutorialId)
      return true
    } catch (error) {
      console.error('Tutorial kaydedilirken hata:', error)
      throw error
    }
  }, [isAdmin])

  /**
   * Tutorial'ı yükle
   * @param {string} tutorialId - Tutorial tanımlayıcısı
   */
  const loadTutorial = useCallback(async (tutorialId) => {
    try {
      const tutorials = JSON.parse(localStorage.getItem('customTutorials') || '{}')
      return tutorials[tutorialId] || null
    } catch (error) {
      console.error('Tutorial yüklenirken hata:', error)
      return null
    }
  }, [])

  /**
   * Tutorial'ı sil
   * @param {string} tutorialId - Tutorial tanımlayıcısı
   */
  const deleteTutorial = useCallback(async (tutorialId) => {
    if (!isAdmin) {
      throw new Error('Admin erişimi gerekli')
    }

    try {
      const tutorials = JSON.parse(localStorage.getItem('customTutorials') || '{}')
      delete tutorials[tutorialId]
      localStorage.setItem('customTutorials', JSON.stringify(tutorials))
      
      console.log('Tutorial silindi:', tutorialId)
      return true
    } catch (error) {
      console.error('Tutorial silinirken hata:', error)
      throw error
    }
  }, [isAdmin])

  /**
   * Tüm tutorial'ları listele
   */
  const listTutorials = useCallback(async () => {
    try {
      const tutorials = JSON.parse(localStorage.getItem('customTutorials') || '{}')
      return Object.keys(tutorials).map(id => ({
        id,
        ...tutorials[id]
      }))
    } catch (error) {
      console.error('Tutoriallar listelenirken hata:', error)
      return []
    }
  }, [])

  return {
    isAdmin,
    saveTutorial,
    loadTutorial,
    deleteTutorial,
    listTutorials
  }
}