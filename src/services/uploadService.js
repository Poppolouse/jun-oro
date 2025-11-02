const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class UploadService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/upload`;
  }

  /**
   * Upload user avatar
   * @param {FormData} formData - Form data containing avatar file and userId
   * @returns {Promise<Object>} Upload result with URL and user data
   */
  async uploadAvatar(formData) {
    try {
      const response = await fetch(`${this.baseURL}/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Avatar yükleme başarısız');
      }

      return result;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }

  /**
   * Upload platform logo
   * @param {FormData} formData - Form data containing logo file and platformName
   * @returns {Promise<Object>} Upload result with URL and platform data
   */
  async uploadPlatformLogo(formData) {
    try {
      const response = await fetch(`${this.baseURL}/platform-logo`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Platform logosu yükleme başarısız');
      }

      return result;
    } catch (error) {
      console.error('Platform logo upload error:', error);
      throw error;
    }
  }

  /**
   * Upload game cover
   * @param {FormData} formData - Form data containing cover file and gameId
   * @returns {Promise<Object>} Upload result with URL and game data
   */
  async uploadGameCover(formData) {
    try {
      const response = await fetch(`${this.baseURL}/game-cover`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Oyun kapağı yükleme başarısız');
      }

      return result;
    } catch (error) {
      console.error('Game cover upload error:', error);
      throw error;
    }
  }

  /**
   * Delete user avatar
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteAvatar(userId) {
    try {
      const response = await fetch(`${this.baseURL}/avatar/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Avatar silme başarısız');
      }

      return result;
    } catch (error) {
      console.error('Avatar delete error:', error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for direct upload
   * @param {string} fileName - File name
   * @param {string} contentType - MIME type
   * @param {string} uploadType - Type of upload (avatar, platform-logo, game-cover)
   * @returns {Promise<Object>} Presigned URL data
   */
  async generatePresignedUrl(fileName, contentType, uploadType) {
    try {
      const response = await fetch(`${this.baseURL}/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName,
          contentType,
          uploadType
        }),
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Presigned URL oluşturma başarısız');
      }

      return result;
    } catch (error) {
      console.error('Presigned URL error:', error);
      throw error;
    }
  }

  /**
   * Upload file directly to R2 using presigned URL
   * @param {string} presignedUrl - Presigned upload URL
   * @param {File} file - File to upload
   * @param {string} contentType - MIME type
   * @returns {Promise<Response>} Upload response
   */
  async uploadToPresignedUrl(presignedUrl, file, contentType) {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType
        }
      });

      if (!response.ok) {
        throw new Error('Dosya yükleme başarısız');
      }

      return response;
    } catch (error) {
      console.error('Direct upload error:', error);
      throw error;
    }
  }

  /**
   * Get file extension from filename
   * @param {string} filename - File name
   * @returns {string} File extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {string[]} allowedTypes - Allowed MIME types
   * @returns {boolean} Is valid
   */
  validateFileType(file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']) {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   * @param {File} file - File to validate
   * @param {number} maxSizeMB - Maximum size in MB
   * @returns {boolean} Is valid
   */
  validateFileSize(file, maxSizeMB = 5) {
    return file.size <= maxSizeMB * 1024 * 1024;
  }

  /**
   * Resize image before upload (client-side)
   * @param {File} file - Image file
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @param {number} quality - JPEG quality (0-1)
   * @returns {Promise<Blob>} Resized image blob
   */
  async resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}

export default new UploadService();