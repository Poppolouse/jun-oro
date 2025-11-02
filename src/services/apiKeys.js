import apiClient from './api.js';

// Create API client instance for API key management

class ApiKeyService {
  constructor() {
    this.endpoint = '/api-keys';
  }

  /**
   * Get all API keys for a user
   * @param {string} userId - User ID
   * @param {boolean} includeGlobal - Include global keys
   * @returns {Promise<Object>} API response with keys
   */
  async getApiKeys(userId = null, includeGlobal = true) {
    const params = {};
    if (userId) params.userId = userId;
    if (includeGlobal !== undefined) params.includeGlobal = includeGlobal.toString();
    
    return apiClient.get(this.endpoint, params);
  }

  /**
   * Get API key for a specific service
   * @param {string} serviceName - Service name (steam, igdb, twitch, etc.)
   * @param {string} userId - User ID
   * @param {boolean} decrypt - Whether to decrypt the key value
   * @returns {Promise<Object>} API response with key data
   */
  async getServiceApiKey(serviceName, userId = null, decrypt = false) {
    const params = {};
    if (userId) params.userId = userId;
    if (decrypt) params.decrypt = 'true';
    
    return apiClient.get(`${this.endpoint}/service/${serviceName}`, params);
  }

  /**
   * Create a new API key
   * @param {Object} keyData - API key data
   * @param {string} keyData.serviceName - Service name
   * @param {string} keyData.keyName - Display name for the key
   * @param {string} keyData.keyValue - The actual API key value
   * @param {boolean} keyData.isGlobal - Whether this is a global key
   * @param {Object} keyData.metadata - Additional metadata
   * @param {string} userId - User ID (for user-specific keys)
   * @returns {Promise<Object>} API response with created key
   */
  async createApiKey(keyData, userId = null) {
    const params = {};
    if (userId) params.userId = userId;
    
    return apiClient.post(`${this.endpoint}?${new URLSearchParams(params)}`, keyData);
  }

  /**
   * Update an existing API key
   * @param {string} keyId - API key ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} API response with updated key
   */
  async updateApiKey(keyId, updateData) {
    return apiClient.put(`${this.endpoint}/${keyId}`, updateData);
  }

  /**
   * Delete an API key
   * @param {string} keyId - API key ID
   * @returns {Promise<Object>} API response
   */
  async deleteApiKey(keyId) {
    return apiClient.delete(`${this.endpoint}/${keyId}`);
  }

  /**
   * Get a specific API key by ID
   * @param {string} keyId - API key ID
   * @returns {Promise<Object>} API response with key data
   */
  async getApiKeyById(keyId) {
    return apiClient.get(`${this.endpoint}/${keyId}`);
  }

  // Helper methods for common services

  /**
   * Get Steam API key
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Steam API key or null
   */
  async getSteamApiKey(userId = null) {
    try {
      const response = await this.getServiceApiKey('steam', userId, true);
      return response.data?.keyValue || null;
    } catch (error) {
      console.warn('Steam API key not found:', error.message);
      return null;
    }
  }

  /**
   * Get IGDB credentials (Client ID and Access Token)
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} IGDB credentials or null
   */
  async getIgdbCredentials(userId = null) {
    try {
      // Get both Client ID and Access Token separately
      const [clientIdResponse, accessTokenResponse] = await Promise.all([
        this.getServiceApiKey('igdb_client_id', userId, true),
        this.getServiceApiKey('igdb_access_token', userId, true)
      ]);

      const clientId = clientIdResponse.data?.keyValue;
      const accessToken = accessTokenResponse.data?.keyValue;

      if (clientId && accessToken) {
        return {
          clientId,
          accessToken
        };
      }
      return null;
    } catch (error) {
      console.warn('IGDB credentials not found:', error.message);
      return null;
    }
  }

  /**
   * Set Steam API key
   * @param {string} apiKey - Steam API key
   * @param {string} userId - User ID
   * @param {boolean} isGlobal - Whether this is a global key
   * @returns {Promise<Object>} API response
   */
  async setSteamApiKey(apiKey, userId = null, isGlobal = false) {
    const keyData = {
      serviceName: 'steam',
      keyName: 'Steam Web API Key',
      keyValue: apiKey,
      isGlobal,
      metadata: {
        description: 'Steam Web API key for accessing Steam services'
      }
    };
    
    return this.createApiKey(keyData, userId);
  }

  /**
   * Set IGDB API credentials (Client ID and Access Token separately)
   * @param {string} clientId - IGDB Client ID
   * @param {string} accessToken - IGDB Access Token
   * @param {string} userId - User ID
   * @param {boolean} isGlobal - Whether this is a global key
   * @returns {Promise<Object>} API response
   */
  async setIgdbCredentials(clientId, accessToken, userId = null, isGlobal = false) {
    try {
      // Save Client ID and Access Token as separate records
      const [clientIdResult, accessTokenResult] = await Promise.all([
        this.createApiKey({
          serviceName: 'igdb_client_id',
          keyName: 'IGDB Client ID',
          keyValue: clientId,
          isGlobal,
          metadata: {
            description: 'IGDB Client ID for API authentication'
          }
        }, userId),
        this.createApiKey({
          serviceName: 'igdb_access_token',
          keyName: 'IGDB Access Token',
          keyValue: accessToken,
          isGlobal,
          metadata: {
            description: 'IGDB Access Token for API requests'
          }
        }, userId)
      ]);

      return {
        clientId: clientIdResult,
        accessToken: accessTokenResult
      };
    } catch (error) {
      console.error('Error setting IGDB credentials:', error);
      throw error;
    }
  }

  /**
   * Migrate API keys from localStorage to database
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Migration results
   */
  async migrateFromLocalStorage(userId) {
    const results = {
      migrated: [],
      errors: [],
      skipped: []
    };

    try {
      // Check for Steam API key in localStorage
      const steamKey = localStorage.getItem('steamApiKey');
      if (steamKey) {
        try {
          await this.setSteamApiKey(steamKey, userId);
          results.migrated.push('steam');
          localStorage.removeItem('steamApiKey');
        } catch (error) {
          if (error.message.includes('already exists')) {
            results.skipped.push('steam');
          } else {
            results.errors.push({ service: 'steam', error: error.message });
          }
        }
      }

      // Check for IGDB credentials in localStorage
      const igdbClientId = localStorage.getItem('igdbClientId');
      const igdbAccessToken = localStorage.getItem('igdbAccessToken');
      if (igdbClientId && igdbAccessToken) {
        try {
          await this.setIgdbCredentials(igdbClientId, igdbAccessToken, userId);
          results.migrated.push('igdb');
          localStorage.removeItem('igdbClientId');
          localStorage.removeItem('igdbAccessToken');
        } catch (error) {
          if (error.message.includes('already exists')) {
            results.skipped.push('igdb');
          } else {
            results.errors.push({ service: 'igdb', error: error.message });
          }
        }
      }

    } catch (error) {
      console.error('Migration error:', error);
      results.errors.push({ service: 'general', error: error.message });
    }

    return results;
  }
}

// Create and export singleton instance
export const apiKeyService = new ApiKeyService();
export default apiKeyService;