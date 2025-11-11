// API Base Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: "GET",
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// User API
export const userApi = {
  // Get all users with pagination
  getUsers: (params = {}) => apiClient.get("/users", params),

  // Get user by ID
  getUser: (userId) => apiClient.get(`/users/${userId}`),

  // Create new user
  createUser: (userData) => apiClient.post("/users", userData),

  // Update user
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),

  // Delete user
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),

  // Update last activity
  updateActivity: (userId) => apiClient.post(`/users/${userId}/activity`),

  // Get user stats
  getUserStats: (userId) => apiClient.get(`/users/${userId}/stats`),
};

// Game API
export const gameApi = {
  // Get all games with filters
  getGames: (params = {}) => apiClient.get("/games", params),

  // Get game by ID
  getGame: (gameId) => apiClient.get(`/games/${gameId}`),

  // Create or update game (upsert)
  upsertGame: (gameData) => apiClient.post("/games", gameData),

  // Update game
  updateGame: (gameId, gameData) => apiClient.put(`/games/${gameId}`, gameData),

  // Delete game
  deleteGame: (gameId) => apiClient.delete(`/games/${gameId}`),

  // Get game stats
  getGameStats: (gameId) => apiClient.get(`/games/${gameId}/stats`),

  // Bulk create/update games
  bulkUpsert: (gamesData) =>
    apiClient.post("/games/batch", { games: gamesData }),

  // Search suggestions
  getSearchSuggestions: (query) =>
    apiClient.get("/games/search/suggestions", { q: query }),
};

// Library API
export const libraryApi = {
  // Get user library
  getLibrary: (userId, params = {}) =>
    apiClient.get(`/library/${userId}`, params),

  // Add game to library
  addToLibrary: (libraryEntry) =>
    apiClient.post(`/library/${libraryEntry.userId}/games`, libraryEntry),

  // Update library entry
  updateEntry: (userId, gameId, entryData) =>
    apiClient.put(`/library/${userId}/games/${gameId}`, entryData),

  // Remove game from library
  removeFromLibrary: (userId, gameId) =>
    apiClient.delete(`/library/${userId}/games/${gameId}`),

  // Get specific library entry
  getEntry: (userId, gameId) =>
    apiClient.get(`/library/${userId}/games/${gameId}`),

  // Get library stats
  getStats: (userId) => apiClient.get(`/library/${userId}/stats`),

  // Import library data
  importData: (userId, libraryData) =>
    apiClient.post(`/library/${userId}/import`, libraryData),
};

// Session API
export const sessionApi = {
  // Get user sessions
  getSessions: (userId, params = {}) =>
    apiClient.get(`/sessions/${userId}`, params),

  // Create new session
  createSession: (userId, sessionData) =>
    apiClient.post(`/sessions/${userId}`, sessionData),

  // Update session
  updateSession: (sessionId, sessionData) =>
    apiClient.put(`/sessions/${sessionId}`, sessionData),

  // End session
  endSession: (sessionId, endData) =>
    apiClient.post(`/sessions/${sessionId}/end`, endData),

  // Get session history
  getHistory: (userId, params = {}) =>
    apiClient.get(`/sessions/${userId}/history`, params),

  // Delete session
  deleteSession: (sessionId) => apiClient.delete(`/sessions/${sessionId}`),
};

// Preferences API
export const preferencesApi = {
  // Get user preferences
  getPreferences: (userId) => apiClient.get(`/preferences/${userId}`),

  // Update preferences
  updatePreferences: (userId, prefsData) =>
    apiClient.put(`/preferences/${userId}`, prefsData),

  // Get game-specific preferences
  getGamePreferences: (userId, gameId) =>
    apiClient.get(`/preferences/${userId}/game/${gameId}`),

  // Update game-specific preferences
  updateGamePreferences: (userId, gameId, prefsData) =>
    apiClient.put(`/preferences/${userId}/game/${gameId}`, prefsData),

  // Delete game preferences
  deleteGamePreferences: (userId, gameId) =>
    apiClient.delete(`/preferences/${userId}/game/${gameId}`),

  // Reset preferences to default
  resetPreferences: (userId) => apiClient.post(`/preferences/${userId}/reset`),
};

// Stats API
export const statsApi = {
  // Get user stats
  getStats: (userId) => apiClient.get(`/stats/${userId}`),

  // Get dashboard stats
  getDashboard: (userId) => apiClient.get(`/stats/${userId}/dashboard`),

  // Get playtime analytics
  getPlaytime: (userId, params = {}) =>
    apiClient.get(`/stats/${userId}/playtime`, params),

  // Recalculate stats
  recalculateStats: (userId) => apiClient.post(`/stats/${userId}/recalculate`),
};

// Campaign API
export const campaignApi = {
  // Get campaigns for game
  getCampaigns: (gameId) => apiClient.get(`/campaigns/${gameId}`),

  // Create campaign
  createCampaign: (gameId, campaignData) =>
    apiClient.post(`/campaigns/${gameId}`, campaignData),

  // Update campaign
  updateCampaign: (campaignId, campaignData) =>
    apiClient.put(`/campaigns/${campaignId}`, campaignData),

  // Delete campaign
  deleteCampaign: (campaignId) => apiClient.delete(`/campaigns/${campaignId}`),

  // Bulk create campaigns
  bulkCreate: (gameId, campaigns) =>
    apiClient.post(`/campaigns/${gameId}/bulk`, { campaigns }),

  // Reorder campaigns
  reorderCampaigns: (gameId, campaignIds) =>
    apiClient.put(`/campaigns/${gameId}/reorder`, { campaignIds }),

  // Get campaign stats
  getCampaignStats: (gameId) => apiClient.get(`/campaigns/${gameId}/stats`),

  // Complete campaign
  completeCampaign: (campaignId, completionData) =>
    apiClient.post(`/campaigns/${campaignId}/complete`, completionData),
};

// Notification API
export const notificationApi = {
  // Get notifications
  getNotifications: (userId, params = {}) =>
    apiClient.get(`/notifications/${userId}`, params),

  // Create notification
  createNotification: (userId, notificationData) =>
    apiClient.post(`/notifications/${userId}`, notificationData),

  // Mark as read
  markAsRead: (notificationId) =>
    apiClient.put(`/notifications/${notificationId}/read`),

  // Mark all as read
  markAllAsRead: (userId) => apiClient.put(`/notifications/${userId}/read-all`),

  // Delete notification
  deleteNotification: (notificationId) =>
    apiClient.delete(`/notifications/${notificationId}`),

  // Clear notifications
  clearNotifications: (userId, params = {}) =>
    apiClient.delete(`/notifications/${userId}/clear`, params),

  // Get unread count
  getUnreadCount: (userId) =>
    apiClient.get(`/notifications/${userId}/unread-count`),

  // Bulk create notifications
  bulkCreate: (notifications) =>
    apiClient.post("/notifications/bulk", { notifications }),
};

// Updates API
export const updatesApi = {
  // Get all updates
  getUpdates: (params = {}) => apiClient.get("/updates", params),

  // Get specific update
  getUpdate: (updateId) => apiClient.get(`/updates/${updateId}`),

  // Create update
  createUpdate: (updateData) => apiClient.post("/updates", updateData),

  // Update system update
  updateUpdate: (updateId, updateData) =>
    apiClient.put(`/updates/${updateId}`, updateData),

  // Delete update
  deleteUpdate: (updateId) => apiClient.delete(`/updates/${updateId}`),

  // Get active roadmap
  getActiveRoadmap: () => apiClient.get("/updates/roadmap/active"),

  // Get recent changelog
  getRecentChangelog: (params = {}) =>
    apiClient.get("/updates/changelog/recent", params),

  // Complete update
  completeUpdate: (updateId, completionData) =>
    apiClient.post(`/updates/${updateId}/complete`, completionData),

  // Cancel update
  cancelUpdate: (updateId, reason) =>
    apiClient.post(`/updates/${updateId}/cancel`, { reason }),

  // Get update stats
  getUpdateStats: () => apiClient.get("/updates/stats"),

  // Get homepage updates
  getHomepageUpdates: (params = {}) =>
    apiClient.get("/updates/homepage", params),

  // Substep operations
  getSubsteps: (updateId) => apiClient.get(`/updates/${updateId}/substeps`),
  createSubstep: (updateId, substepData) =>
    apiClient.post(`/updates/${updateId}/substeps`, substepData),
  updateSubstep: (updateId, stepId, substepData) =>
    apiClient.put(`/updates/${updateId}/substeps/${stepId}`, substepData),
  deleteSubstep: (updateId, stepId) =>
    apiClient.delete(`/updates/${updateId}/substeps/${stepId}`),
};

export default apiClient;
