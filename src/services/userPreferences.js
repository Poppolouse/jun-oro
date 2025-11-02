/**
 * User Preferences Service
 * Kullanıcının oyun ekleme/düzenleme tercihlerini localStorage'da saklar
 */

class UserPreferencesService {
  constructor() {
    this.storageKey = 'arkade_user_preferences'
    this.defaultPreferences = {
      // Platform tercihleri
      preferredPlatform: '',
      
      // Durum tercihleri
      preferredStatus: 'Oynamak İstiyorum',
      
      // DLC tercihleri
      includeDLCs: false,
      selectedDLCs: [],
      
      // Campaign tercihleri
      selectedCampaigns: [],
      
      // Oyun versiyonu tercihleri
      preferredVersion: '',
      
      // Son kullanılan tercihler (oyun bazında)
      gameSpecificPreferences: {},
      
      // Genel ayarlar
      autoLoadHLTB: true,
      autoLoadMetacritic: true,
      autoGenerateCampaigns: true
    }
  }

  /**
   * Tüm tercihleri al
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...this.defaultPreferences, ...parsed }
      }
    } catch (error) {
      console.warn('⚠️ Kullanıcı tercihleri yüklenemedi:', error.message)
    }
    return { ...this.defaultPreferences }
  }

  /**
   * Tercihleri kaydet
   */
  savePreferences(preferences) {
    try {
      const current = this.getPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(this.storageKey, JSON.stringify(updated))
      console.log('✅ Kullanıcı tercihleri kaydedildi')
      return true
    } catch (error) {
      console.error('❌ Kullanıcı tercihleri kaydedilemedi:', error.message)
      return false
    }
  }

  /**
   * Belirli bir oyun için tercihleri kaydet
   */
  saveGamePreferences(gameId, gameName, preferences) {
    try {
      const current = this.getPreferences()
      
      if (!current.gameSpecificPreferences) {
        current.gameSpecificPreferences = {}
      }

      current.gameSpecificPreferences[gameId] = {
        gameName,
        ...preferences,
        lastUpdated: Date.now()
      }

      this.savePreferences(current)
      console.log(`✅ ${gameName} için tercihler kaydedildi`)
      return true
    } catch (error) {
      console.error('❌ Oyun tercihleri kaydedilemedi:', error.message)
      return false
    }
  }

  /**
   * Belirli bir oyun için tercihleri al
   */
  getGamePreferences(gameId) {
    try {
      const preferences = this.getPreferences()
      return preferences.gameSpecificPreferences?.[gameId] || null
    } catch (error) {
      console.warn('⚠️ Oyun tercihleri alınamadı:', error.message)
      return null
    }
  }

  /**
   * Platform tercihini kaydet
   */
  savePlatformPreference(platform) {
    return this.savePreferences({ preferredPlatform: platform })
  }

  /**
   * Platform tercihini al
   */
  getPlatformPreference() {
    return this.getPreferences().preferredPlatform
  }

  /**
   * Durum tercihini kaydet
   */
  saveStatusPreference(status) {
    return this.savePreferences({ preferredStatus: status })
  }

  /**
   * Durum tercihini al
   */
  getStatusPreference() {
    return this.getPreferences().preferredStatus
  }

  /**
   * DLC tercihlerini kaydet
   */
  saveDLCPreferences(includeDLCs, selectedDLCs = []) {
    return this.savePreferences({ 
      includeDLCs, 
      selectedDLCs: Array.isArray(selectedDLCs) ? selectedDLCs : []
    })
  }

  /**
   * DLC tercihlerini al
   */
  getDLCPreferences() {
    const prefs = this.getPreferences()
    return {
      includeDLCs: prefs.includeDLCs,
      selectedDLCs: prefs.selectedDLCs || []
    }
  }

  /**
   * Campaign tercihlerini kaydet
   */
  saveCampaignPreferences(selectedCampaigns = []) {
    return this.savePreferences({ 
      selectedCampaigns: Array.isArray(selectedCampaigns) ? selectedCampaigns : []
    })
  }

  /**
   * Campaign tercihlerini al
   */
  getCampaignPreferences() {
    return this.getPreferences().selectedCampaigns || []
  }

  /**
   * Oyun ekleme/düzenleme için tüm tercihleri al
   */
  getGameFormPreferences(gameId = null) {
    const generalPrefs = this.getPreferences()
    const gameSpecific = gameId ? this.getGamePreferences(gameId) : null

    return {
      // Genel tercihler
      platform: generalPrefs.preferredPlatform,
      status: generalPrefs.preferredStatus,
      includeDLCs: generalPrefs.includeDLCs,
      selectedDLCs: generalPrefs.selectedDLCs,
      selectedCampaigns: generalPrefs.selectedCampaigns,
      version: generalPrefs.preferredVersion,
      
      // Oyun-spesifik tercihler (varsa genel tercihleri override eder)
      ...(gameSpecific && {
        platform: gameSpecific.platform || generalPrefs.preferredPlatform,
        status: gameSpecific.status || generalPrefs.preferredStatus,
        includeDLCs: gameSpecific.includeDLCs !== undefined ? gameSpecific.includeDLCs : generalPrefs.includeDLCs,
        selectedDLCs: gameSpecific.selectedDLCs || generalPrefs.selectedDLCs,
        selectedCampaigns: gameSpecific.selectedCampaigns || generalPrefs.selectedCampaigns,
        version: gameSpecific.version || generalPrefs.preferredVersion
      }),

      // Meta bilgiler
      hasGameSpecificPrefs: !!gameSpecific,
      lastUpdated: gameSpecific?.lastUpdated || null
    }
  }

  /**
   * Oyun ekleme/düzenleme formundan tercihleri kaydet
   */
  saveGameFormPreferences(gameId, gameName, formData) {
    const preferences = {
      platform: formData.platform,
      status: formData.status,
      includeDLCs: formData.includeDLCs,
      selectedDLCs: formData.selectedDLCs,
      selectedCampaigns: formData.selectedCampaigns,
      version: formData.version
    }

    // Hem genel hem de oyun-spesifik tercihleri güncelle
    this.savePreferences({
      preferredPlatform: formData.platform,
      preferredStatus: formData.status,
      includeDLCs: formData.includeDLCs,
      selectedDLCs: formData.selectedDLCs,
      selectedCampaigns: formData.selectedCampaigns,
      preferredVersion: formData.version
    })

    // Oyun-spesifik tercihleri de kaydet
    if (gameId && gameName) {
      this.saveGamePreferences(gameId, gameName, preferences)
    }

    return true
  }

  /**
   * Otomatik yükleme tercihlerini al
   */
  getAutoLoadPreferences() {
    const prefs = this.getPreferences()
    return {
      autoLoadHLTB: prefs.autoLoadHLTB,
      autoLoadMetacritic: prefs.autoLoadMetacritic,
      autoGenerateCampaigns: prefs.autoGenerateCampaigns
    }
  }

  /**
   * Otomatik yükleme tercihlerini kaydet
   */
  saveAutoLoadPreferences(autoLoadHLTB, autoLoadMetacritic, autoGenerateCampaigns) {
    return this.savePreferences({
      autoLoadHLTB,
      autoLoadMetacritic,
      autoGenerateCampaigns
    })
  }

  /**
   * Tüm tercihleri sıfırla
   */
  resetPreferences() {
    try {
      localStorage.removeItem(this.storageKey)
      console.log('✅ Kullanıcı tercihleri sıfırlandı')
      return true
    } catch (error) {
      console.error('❌ Tercihler sıfırlanamadı:', error.message)
      return false
    }
  }

  /**
   * Belirli bir oyunun tercihlerini sil
   */
  removeGamePreferences(gameId) {
    try {
      const current = this.getPreferences()
      if (current.gameSpecificPreferences && current.gameSpecificPreferences[gameId]) {
        delete current.gameSpecificPreferences[gameId]
        this.savePreferences(current)
        console.log(`✅ Oyun tercihleri silindi: ${gameId}`)
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Oyun tercihleri silinemedi:', error.message)
      return false
    }
  }

  /**
   * Tercih istatistikleri al
   */
  getPreferenceStats() {
    try {
      const prefs = this.getPreferences()
      const gameCount = Object.keys(prefs.gameSpecificPreferences || {}).length
      
      return {
        totalGamePreferences: gameCount,
        preferredPlatform: prefs.preferredPlatform,
        preferredStatus: prefs.preferredStatus,
        autoLoadEnabled: prefs.autoLoadHLTB && prefs.autoLoadMetacritic,
        lastModified: Math.max(
          ...Object.values(prefs.gameSpecificPreferences || {})
            .map(p => p.lastUpdated || 0)
        ) || null
      }
    } catch (error) {
      console.warn('⚠️ Tercih istatistikleri alınamadı:', error.message)
      return null
    }
  }
}

// Singleton instance
const userPreferences = new UserPreferencesService()
export default userPreferences