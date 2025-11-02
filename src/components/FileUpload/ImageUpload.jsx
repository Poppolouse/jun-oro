import React, { useState, useRef } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';

const ImageUpload = ({ 
  onUpload, 
  currentImage, 
  uploadType = 'avatar', 
  maxSize = 5, 
  acceptedTypes = 'image/*',
  className = '',
  disabled = false,
  label = 'Resim Yükle'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası seçin');
      return;
    }

    // Validate file size (MB)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Dosya boyutu ${maxSize}MB'dan küçük olmalıdır`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append(getFieldName(uploadType), file);
      
      // Add additional fields based on upload type
      if (uploadType === 'platform-logo') {
        const platformName = prompt('Platform adını girin:');
        if (!platformName) {
          setIsUploading(false);
          return;
        }
        formData.append('platformName', platformName);
      }

      await onUpload(formData);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Yükleme sırasında hata oluştu');
      setPreview(currentImage); // Reset preview on error
    } finally {
      setIsUploading(false);
    }
  };

  const getFieldName = (type) => {
    switch (type) {
      case 'avatar': return 'avatar';
      case 'platform-logo': return 'logo';
      case 'game-cover': return 'cover';
      default: return 'image';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUploadAreaSize = () => {
    switch (uploadType) {
      case 'avatar': return 'w-32 h-32';
      case 'platform-logo': return 'w-24 h-24';
      case 'game-cover': return 'w-48 h-64';
      default: return 'w-32 h-32';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        className={`
          ${getUploadAreaSize()}
          border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200 relative overflow-hidden
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {!disabled && !isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {isUploading ? (
              <Loader2 className="animate-spin mb-2" size={24} />
            ) : (
              <Upload className="mb-2" size={24} />
            )}
            <span className="text-xs text-center px-2">
              {isUploading ? 'Yükleniyor...' : label}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        Max {maxSize}MB • JPG, PNG, GIF, WebP
      </div>
    </div>
  );
};

export default ImageUpload;