/**
 * Sayfa ziyaret takibi için localStorage yönetimi
 */

const PAGE_VISITS_KEY = 'pageVisits'
const USER_TUTORIAL_SETTINGS_KEY = 'userTutorialSettings'

/**
 * Kullanıcının sayfa ziyaret verilerini yükler
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Object} Sayfa ziyaret verileri
 */
export const loadPageVisits = (userId) => {
  try {
    const visits = localStorage.getItem(`${PAGE_VISITS_KEY}_${userId}`)
    return visits ? JSON.parse(visits) : {}
  } catch (error) {
    console.error('Sayfa ziyaret verileri yüklenirken hata:', error)
    return {}
  }
}

/**
 * Kullanıcının sayfa ziyaret verilerini kaydeder
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} visits - Sayfa ziyaret verileri
 */
export const savePageVisits = (userId, visits) => {
  try {
    localStorage.setItem(`${PAGE_VISITS_KEY}_${userId}`, JSON.stringify(visits))
  } catch (error) {
    console.error('Sayfa ziyaret verileri kaydedilirken hata:', error)
  }
}

/**
 * Belirli bir sayfanın ziyaret edilip edilmediğini kontrol eder
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} pageName - Sayfa adı
 * @returns {boolean} Sayfa daha önce ziyaret edildi mi?
 */
export const hasVisitedPage = (userId, pageName) => {
  const visits = loadPageVisits(userId)
  return Boolean(visits[pageName])
}

/**
 * Bir sayfayı ziyaret edildi olarak işaretler
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} pageName - Sayfa adı
 */
export const markPageAsVisited = (userId, pageName) => {
  const visits = loadPageVisits(userId)
  visits[pageName] = {
    firstVisit: new Date().toISOString(),
    visitCount: (visits[pageName]?.visitCount || 0) + 1,
    lastVisit: new Date().toISOString()
  }
  savePageVisits(userId, visits)
}

/**
 * Kullanıcının tutorial ayarlarını yükler
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Object} Tutorial ayarları
 */
export const loadTutorialSettings = (userId) => {
  try {
    const settings = localStorage.getItem(`${USER_TUTORIAL_SETTINGS_KEY}_${userId}`)
    return settings ? JSON.parse(settings) : {
      autoShowTutorials: true,
      completedTutorials: [],
      skippedTutorials: []
    }
  } catch (error) {
    console.error('Tutorial ayarları yüklenirken hata:', error)
    return {
      autoShowTutorials: true,
      completedTutorials: [],
      skippedTutorials: []
    }
  }
}

/**
 * Kullanıcının tutorial ayarlarını kaydeder
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} settings - Tutorial ayarları
 */
export const saveTutorialSettings = (userId, settings) => {
  try {
    localStorage.setItem(`${USER_TUTORIAL_SETTINGS_KEY}_${userId}`, JSON.stringify(settings))
  } catch (error) {
    console.error('Tutorial ayarları kaydedilirken hata:', error)
  }
}

/**
 * Bir tutorial'ın tamamlandığını işaretler
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} tutorialId - Tutorial ID'si
 */
export const markTutorialAsCompleted = (userId, tutorialId) => {
  const settings = loadTutorialSettings(userId)
  if (!settings.completedTutorials.includes(tutorialId)) {
    settings.completedTutorials.push(tutorialId)
  }
  // Eğer atlanmış listesindeyse kaldır
  settings.skippedTutorials = settings.skippedTutorials.filter(id => id !== tutorialId)
  saveTutorialSettings(userId, settings)
}

/**
 * Bir tutorial'ın atlandığını işaretler
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} tutorialId - Tutorial ID'si
 */
export const markTutorialAsSkipped = (userId, tutorialId) => {
  const settings = loadTutorialSettings(userId)
  if (!settings.skippedTutorials.includes(tutorialId)) {
    settings.skippedTutorials.push(tutorialId)
  }
  saveTutorialSettings(userId, settings)
}

/**
 * Bir tutorial'ın gösterilip gösterilmeyeceğini kontrol eder
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} tutorialId - Tutorial ID'si
 * @param {string} pageName - Sayfa adı
 * @returns {boolean} Tutorial gösterilmeli mi?
 */
export const shouldShowTutorial = (userId, tutorialId, pageName) => {
  const settings = loadTutorialSettings(userId)
  
  // Otomatik gösterim kapalıysa gösterme
  if (!settings.autoShowTutorials) {
    return false
  }
  
  // Daha önce tamamlanmışsa gösterme
  if (settings.completedTutorials.includes(tutorialId)) {
    return false
  }
  
  // Daha önce atlanmışsa gösterme
  if (settings.skippedTutorials.includes(tutorialId)) {
    return false
  }
  
  // Sayfa daha önce ziyaret edilmişse gösterme
  if (hasVisitedPage(userId, pageName)) {
    return false
  }
  
  return true
}

/**
 * Otomatik tutorial gösterimini açar/kapatır
 * @param {string} userId - Kullanıcı ID'si
 * @param {boolean} enabled - Açık/kapalı durumu
 */
export const setAutoShowTutorials = (userId, enabled) => {
  const settings = loadTutorialSettings(userId)
  settings.autoShowTutorials = enabled
  saveTutorialSettings(userId, settings)
}

/**
 * Kullanıcının tüm tutorial verilerini sıfırlar
 * @param {string} userId - Kullanıcı ID'si
 */
export const resetUserTutorialData = (userId) => {
  try {
    localStorage.removeItem(`${PAGE_VISITS_KEY}_${userId}`)
    localStorage.removeItem(`${USER_TUTORIAL_SETTINGS_KEY}_${userId}`)
  } catch (error) {
    console.error('Tutorial verileri sıfırlanırken hata:', error)
  }
}

/**
 * Sayfa ziyaret istatistiklerini getirir
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Object} Ziyaret istatistikleri
 */
export const getVisitStats = (userId) => {
  const visits = loadPageVisits(userId)
  const settings = loadTutorialSettings(userId)
  
  return {
    totalPages: Object.keys(visits).length,
    totalVisits: Object.values(visits).reduce((sum, page) => sum + page.visitCount, 0),
    completedTutorials: settings.completedTutorials.length,
    skippedTutorials: settings.skippedTutorials.length,
    autoShowEnabled: settings.autoShowTutorials
  }
}