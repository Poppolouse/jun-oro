// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SessionsService {
  // Kullanıcının aktif oturumlarını al
  async getActiveSessions(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${userId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Aktif oturumlar alınamadı:', error)
      throw error
    }
  }

  // Yeni oturum başlat
  async startSession(userId, sessionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: sessionData.gameId || sessionData.appid,
          gameName: sessionData.gameName || sessionData.name || sessionData.title,
          platform: sessionData.platform || 'Steam',
          campaignId: sessionData.campaignId,
          startTime: sessionData.startTime
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Oturum başlatılamadı:', error)
      throw error
    }
  }

  // Oturum güncelle (duraklatma/devam ettirme)
  async updateSession(sessionId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Oturum güncellenemedi:', error)
      throw error
    }
  }

  // Oturum sonlandır
  async endSession(sessionId, endData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endTime: endData.endTime,
          totalDuration: endData.totalDuration,
          actualPlayTime: endData.actualPlayTime,
          pausedTime: endData.pausedTime,
          notes: endData.notes,
          sessionRating: endData.sessionRating
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Oturum sonlandırılamadı:', error)
      throw error
    }
  }

  // Oturum geçmişini al
  async getSessionHistory(userId, page = 1, limit = 20) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${userId}/history?page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Oturum geçmişi alınamadı:', error)
      throw error
    }
  }

  // Oturum sil
  async deleteSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Oturum silinemedi:', error)
      throw error
    }
  }
}

export default new SessionsService()