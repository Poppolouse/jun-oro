import React, { useState, useEffect, useRef } from 'react'
import { FaGamepad, FaHeart, FaGithub, FaTwitter, FaDiscord, FaSteam, FaCode, FaRocket, FaGem, FaCoffee } from 'react-icons/fa'
import elementRegistry from '../../elementRegistry.json'
import { useAuth } from '../contexts/AuthContext'

const SiteFooter = () => {
  const currentYear = new Date().getFullYear()
  const { user } = useAuth()
  const isAdminUser = user?.role === 'admin'
  
  // Debug mode states
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [hoveredElement, setHoveredElement] = useState(null)
  const [selectedElement, setSelectedElement] = useState(null)
  const [showProperties, setShowProperties] = useState(false)
  const [measureMode, setMeasureMode] = useState(false)
  const [measureStart, setMeasureStart] = useState(null)
  const [measureEnd, setMeasureEnd] = useState(null)
  const [resizeMode, setResizeMode] = useState(false)
  const [resizeElement, setResizeElement] = useState(null)
  const [resizeStart, setResizeStart] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const overlayRef = useRef(null)
  const propertiesPanelRef = useRef(null)

  // Debug overlay'i oluştur/kaldır
  useEffect(() => {
    if (isDebugMode && isAdminUser) {
      createDebugOverlay()
    } else {
      removeDebugOverlay()
      setHoveredElement(null)
      setSelectedElement(null)
      setShowProperties(false)
      setMeasureMode(false)
      setResizeMode(false)
      setResizeElement(null)
      setResizeStart(null)
      setIsDragging(false)
    }

    return () => removeDebugOverlay()
  }, [isDebugMode, isAdminUser])

  const createDebugOverlay = () => {
    if (overlayRef.current) return

    const overlay = document.createElement('div')
    overlay.id = 'debug-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      background: transparent;
    `
    document.body.appendChild(overlay)
    overlayRef.current = overlay

    // Event listeners ekle
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)
    document.addEventListener('contextmenu', handleRightClick)
  }

  const removeDebugOverlay = () => {
    if (overlayRef.current) {
      document.body.removeChild(overlayRef.current)
      overlayRef.current = null
    }

    // Event listeners kaldır
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleClick)
    document.removeEventListener('contextmenu', handleRightClick)

    // Tüm debug highlight'larını temizle
    document.querySelectorAll('.debug-highlight').forEach(el => {
      el.classList.remove('debug-highlight')
    })
    
    // Tüm debug-selected sınıflarını temizle
    document.querySelectorAll('.debug-selected').forEach(el => {
      el.classList.remove('debug-selected')
    })
  }

  const handleMouseMove = (e) => {
    if (!isDebugMode) return

    // Mouse pozisyonunu güncelle
    setMousePosition({ x: e.clientX, y: e.clientY })

    const element = document.elementFromPoint(e.clientX, e.clientY)
    // Tooltip'leri ve debug elementlerini filtrele
    if (!element || 
        element.closest('footer') || 
        element.closest('#debug-overlay') ||
        element.style?.position === 'fixed' ||
        element.closest('[style*="position: fixed"]')) return

    // Tüm eski highlight'ları temizle (sadece debug-highlight, debug-selected'ı koru)
    document.querySelectorAll('.debug-highlight').forEach(el => {
      el.classList.remove('debug-highlight')
    })

    // Yeni element'i highlight et (seçili element değilse)
    if (element !== selectedElement) {
      element.classList.add('debug-highlight')
    }
    
    setHoveredElement(element)

    // Measure mode için
    if (measureMode && measureStart) {
      setMeasureEnd({ x: e.clientX, y: e.clientY })
    }
  }

  const handleClick = (e) => {
    if (!isDebugMode) return
    e.preventDefault()
    e.stopPropagation()

    const element = document.elementFromPoint(e.clientX, e.clientY)
    // Tooltip'leri ve debug elementlerini filtrele
    if (!element || 
        element.closest('footer') || 
        element.closest('#debug-overlay') ||
        element.style?.position === 'fixed' ||
        element.closest('[style*="position: fixed"]')) return

    if (measureMode) {
      if (!measureStart) {
        setMeasureStart({ x: e.clientX, y: e.clientY })
      } else {
        setMeasureEnd({ x: e.clientX, y: e.clientY })
        setMeasureMode(false)
      }
      return
    }

    if (resizeMode) {
      setResizeElement(element)
      return
    }

    // Element seç ve özelliklerini göster
    if (selectedElement === element) {
      // Aynı elemente tekrar tıklandı - seçimi kaldır
      selectedElement.classList.remove('debug-selected')
      setSelectedElement(null)
      setShowProperties(false)
    } else {
      // Farklı element seçildi
      if (selectedElement) {
        selectedElement.classList.remove('debug-selected')
      }
      
      element.classList.add('debug-selected')
      setSelectedElement(element)
      setShowProperties(true)
    }
  }

  const handleRightClick = (e) => {
    if (!isDebugMode) return
    e.preventDefault()

    const element = document.elementFromPoint(e.clientX, e.clientY)
    if (!element || element.closest('footer') || element.closest('#debug-overlay')) return

    // Unique ID'yi (öncelik data-registry) kopyala
    const uniqueId = element.getAttribute('data-registry') || element.id || ''

    if (uniqueId) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          void navigator.clipboard.writeText(uniqueId).catch(() => {})
        }
      } catch {}
      // Toast göster (yalnızca ID)
      showToast(`🆔 ID kopyalandı: ${uniqueId}`)
    } else {
      // ID yoksa bilgi ver
      showToast('❌ Bu elementin unique ID\'si yok (id veya data-registry bulunamadı)')
    }
  }

  // ERS sisteminden element bilgilerini getir
  const getERSInfo = (element) => {
    if (!element) return null

    // Element'in ID'si veya data-registry attribute'u ile ERS'de ara
    const elementId = element.id
    const registryAttr = element.getAttribute('data-registry')
    
    // ERS'de bu element'i bul
    const ersElement = elementRegistry.elements.find(item => {
      return item.selector === `#${elementId}` || 
             item.registryId === registryAttr ||
             item.registryId === elementId
    })

    return ersElement || null
  }

  const getElementName = (element) => {
    let name = element.tagName.toLowerCase()
    
    if (element.id) {
      name += `#${element.id}`
    }
    
    if (element.className) {
      // className string değilse string'e çevir
      const classNameStr = typeof element.className === 'string' 
        ? element.className 
        : element.className.toString()
      
      const classes = classNameStr.split(' ').filter(c => c && !c.startsWith('debug-'))
      if (classes.length > 0) {
        name += `.${classes.join('.')}`
      }
    }

    return name
  }

  const getElementProperties = (element) => {
    if (!element) return {}

    const computedStyle = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    const ersInfo = getERSInfo(element)

    // className string değilse string'e çevir
    const classNameStr = element.className 
      ? (typeof element.className === 'string' ? element.className : element.className.toString())
      : ''

    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || 'yok',
      classes: classNameStr.split(' ').filter(c => c && !c.startsWith('debug-')),
      ers: ersInfo ? {
        registryId: ersInfo.registryId,
        label: ersInfo.label,
        component: ersInfo.metadata?.component,
        feature: ersInfo.metadata?.feature,
        type: ersInfo.metadata?.type,
        criticalPath: ersInfo.metadata?.criticalPath
      } : null,
      dimensions: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left)
      },
      styles: {
        display: computedStyle.display,
        position: computedStyle.position,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        border: computedStyle.border,
        zIndex: computedStyle.zIndex
      }
    }
  }

  const showToast = (message) => {
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #00ff88;
      color: black;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `
    
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.remove()
    }, 2000)
  }

  const calculateDistance = () => {
    if (!measureStart || !measureEnd) return 0
    const dx = measureEnd.x - measureStart.x
    const dy = measureEnd.y - measureStart.y
    return Math.round(Math.sqrt(dx * dx + dy * dy))
  }

  const properties = selectedElement ? getElementProperties(selectedElement) : null

  return (
    <>
      {/* CSS Styles */}
      <style>{`
        .debug-highlight {
          outline: 2px solid #00ff88 !important;
          outline-offset: -2px !important;
          background-color: rgba(0, 255, 136, 0.1) !important;
        }
        
        .debug-selected {
          outline: 3px solid #ff6b6b !important;
          outline-offset: -3px !important;
          background-color: rgba(255, 107, 107, 0.1) !important;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .debug-measure-line {
          position: fixed;
          background: #00ff88;
          z-index: 9998;
          pointer-events: none;
        }

        .debug-resize-overlay {
          position: fixed;
          border: 2px dashed #ffd700;
          background: rgba(255, 215, 0, 0.1);
          z-index: 9997;
          pointer-events: none;
        }

        .debug-resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #ffd700;
          border: 1px solid #000;
          cursor: nw-resize;
          z-index: 9998;
        }

        .debug-resize-handle.se {
          bottom: -4px;
          right: -4px;
          cursor: se-resize;
        }

        .debug-resize-handle.sw {
          bottom: -4px;
          left: -4px;
          cursor: sw-resize;
        }

        .debug-resize-handle.ne {
          top: -4px;
          right: -4px;
          cursor: ne-resize;
        }

        .debug-resize-handle.nw {
          top: -4px;
          left: -4px;
          cursor: nw-resize;
        }
      `}</style>

      {/* Measure Line */}
      {measureMode && measureStart && measureEnd && (
        <>
          {/* Gerçek çizgi */}
          <div
            style={{
              position: 'fixed',
              left: `${measureStart.x}px`,
              top: `${measureStart.y}px`,
              width: `${Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2))}px`,
              height: '2px',
              background: '#00ff88',
              transformOrigin: '0 50%',
              transform: `rotate(${Math.atan2(measureEnd.y - measureStart.y, measureEnd.x - measureStart.x)}rad)`,
              zIndex: 9998,
              pointerEvents: 'none'
            }}
          />
          
          {/* Başlangıç noktası */}
          <div
            style={{
              position: 'fixed',
              left: `${measureStart.x - 4}px`,
              top: `${measureStart.y - 4}px`,
              width: '8px',
              height: '8px',
              background: '#00ff88',
              borderRadius: '50%',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          />
          
          {/* Bitiş noktası */}
          <div
            style={{
              position: 'fixed',
              left: `${measureEnd.x - 4}px`,
              top: `${measureEnd.y - 4}px`,
              width: '8px',
              height: '8px',
              background: '#00ff88',
              borderRadius: '50%',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          />
          
          {/* Mesafe etiketi */}
          <div
            style={{
              position: 'fixed',
              left: `${(measureStart.x + measureEnd.x) / 2}px`,
              top: `${(measureStart.y + measureEnd.y) / 2}px`,
              transform: 'translate(-50%, -50%)',
              background: '#00ff88',
              color: 'black',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 10000,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {calculateDistance()}px
          </div>
        </>
      )}

      {/* Resize Overlay */}
      {resizeMode && resizeElement && (
        <div
          className="debug-resize-overlay"
          style={{
            left: `${resizeElement.getBoundingClientRect().left}px`,
            top: `${resizeElement.getBoundingClientRect().top}px`,
            width: `${resizeElement.getBoundingClientRect().width}px`,
            height: `${resizeElement.getBoundingClientRect().height}px`
          }}
        >
          <div className="debug-resize-handle nw" />
          <div className="debug-resize-handle ne" />
          <div className="debug-resize-handle sw" />
          <div className="debug-resize-handle se" />
        </div>
      )}

      {/* Element Properties Panel */}
      {showProperties && properties && (
        <div
          ref={propertiesPanelRef}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '350px',
            maxHeight: '80vh',
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            fontSize: '14px',
            zIndex: 10000,
            overflow: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#00ff88' }}>Element Özellikleri</h3>
            <button
              onClick={() => setShowProperties(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff6b6b',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#00d4ff' }}>Tag:</strong> {properties.tag}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#00d4ff' }}>ID:</strong> {properties.id}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#00d4ff' }}>Classes:</strong>
            <div style={{ marginTop: '4px' }}>
              {properties.classes.map((cls, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    background: 'rgba(0, 255, 136, 0.2)',
                    color: '#00ff88',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginRight: '4px',
                    marginBottom: '4px'
                  }}
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          {/* ERS Bilgileri */}
          {properties.ers && (
            <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
              <strong style={{ color: '#ffd700', display: 'block', marginBottom: '8px' }}>🎯 ERS Bilgileri</strong>
              
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffd700' }}>Registry ID:</strong> 
                <span style={{ color: '#00ff88', marginLeft: '8px', fontFamily: 'monospace' }}>{properties.ers.registryId}</span>
              </div>
              
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffd700' }}>Label:</strong> 
                <span style={{ color: 'white', marginLeft: '8px' }}>{properties.ers.label}</span>
              </div>
              
              {properties.ers.component && (
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#ffd700' }}>Component:</strong> 
                  <span style={{ color: '#00d4ff', marginLeft: '8px' }}>{properties.ers.component}</span>
                </div>
              )}
              
              {properties.ers.feature && (
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#ffd700' }}>Feature:</strong> 
                  <span style={{ color: '#ff6b6b', marginLeft: '8px' }}>{properties.ers.feature}</span>
                </div>
              )}
              
              {properties.ers.type && (
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#ffd700' }}>Type:</strong> 
                  <span style={{ color: '#9d4edd', marginLeft: '8px' }}>{properties.ers.type}</span>
                </div>
              )}
              
              {properties.ers.criticalPath !== undefined && (
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#ffd700' }}>Critical Path:</strong> 
                  <span style={{ 
                    color: properties.ers.criticalPath ? '#00ff88' : '#ff6b6b', 
                    marginLeft: '8px',
                    fontWeight: 'bold'
                  }}>
                    {properties.ers.criticalPath ? '✅ Evet' : '❌ Hayır'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#00d4ff' }}>Boyutlar:</strong>
            <div style={{ marginTop: '4px', fontSize: '12px' }}>
              <div>Genişlik: {properties.dimensions.width}px</div>
              <div>Yükseklik: {properties.dimensions.height}px</div>
              <div>Top: {properties.dimensions.top}px</div>
              <div>Left: {properties.dimensions.left}px</div>
            </div>
          </div>

          <div>
            <strong style={{ color: '#00d4ff' }}>Stiller:</strong>
            <div style={{ marginTop: '4px', fontSize: '12px' }}>
              {Object.entries(properties.styles).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '2px' }}>
                  <span style={{ color: '#ffd700' }}>{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mouse Hover Tooltip - Sadece Unique ID */}
      {isDebugMode && hoveredElement && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y - 40}px`,
            background: 'rgba(0, 0, 0, 0.95)',
            color: '#00ff88',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            zIndex: 10001,
            pointerEvents: 'auto',
            border: '1px solid #00ff88',
            boxShadow: '0 2px 8px rgba(0, 255, 136, 0.4)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={(e) => {
            e.stopPropagation();
            
            // hoveredElement zaten filtrelenmiş olmalı, direkt kullan
            const elementId = hoveredElement?.id || hoveredElement?.getAttribute('data-registry') || 'no-id';
            
            try { void navigator.clipboard.writeText(elementId).catch(() => {}) } catch {}
            {
              // Kopyalama feedback'i
              const tooltip = e.target.closest('div');
              const originalBg = tooltip.style.background;
              tooltip.style.background = 'rgba(0, 255, 0, 0.9)';
              tooltip.style.color = '#000';
              setTimeout(() => {
                tooltip.style.background = originalBg;
                tooltip.style.color = '#00ff88';
              }, 300);
            }
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 255, 136, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.95)';
          }}
        >
          {(() => {
            const elementId = hoveredElement.id || hoveredElement.getAttribute('data-registry');
            return elementId ? (
              <span>🆔 {elementId} <small style={{ opacity: 0.7 }}>(click to copy)</small></span>
            ) : (
              <span style={{ color: '#ff6b6b' }}>❌ No ID</span>
            );
          })()}
        </div>
      )}

      {/* Selected Element Tooltip */}
      {isDebugMode && selectedElement && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y + 15}px`,
            background: 'rgba(255, 107, 107, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 10001,
            pointerEvents: 'none',
            border: '1px solid #ff6b6b',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          Seçili: {getElementName(selectedElement)}
        </div>
      )}

    <footer 
      className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-t border-[#00ff88]/20 mt-auto relative"
      data-registry="F"
      id="site-footer"
    >
      <div 
        className="max-w-7xl mx-auto px-6 py-8"
        data-registry="F1"
        id="footer-container"
      >
        {/* Ana Footer İçeriği */}
        <div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          data-registry="F1.1"
          id="footer-content"
        >
          
          {/* Logo ve Açıklama */}
          <div 
            className="md:col-span-2"
            data-registry="F1.1.1"
            id="footer-brand-section"
          >
            <div 
              className="flex items-center gap-3 mb-4"
              data-registry="F1.1.1.1"
              id="footer-brand"
            >
              <div 
                className="w-10 h-10 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-lg flex items-center justify-center"
                data-registry="F1.1.1.1.1"
                id="footer-logo"
              >
                <FaGamepad 
                  className="text-black text-xl"
                  data-registry="F1.1.1.1.1.1"
                  id="footer-logo-icon"
                />
              </div>
              <div
                data-registry="F1.1.1.1.2"
                id="footer-brand-info"
              >
                <h3 
                  className="text-xl font-bold text-white"
                  data-registry="F1.1.1.1.2.1"
                  id="footer-brand-title"
                >
                  Jun Oro
                </h3>
                <p 
                  className="text-sm text-gray-400"
                  data-registry="F1.1.1.1.2.2"
                  id="footer-brand-subtitle"
                >
                  Gaming Library Manager
                </p>
              </div>
            </div>
            <p 
              className="text-gray-300 text-sm leading-relaxed mb-4"
              data-registry="F1.1.1.2"
              id="footer-description"
            >
              Oyun kütüphanenizi organize edin, oyun deneyimlerinizi takip edin ve 
              gaming yolculuğunuzda her anı kaydedin. Modern, hızlı ve kullanıcı dostu 
              arayüzle oyun dünyasında kaybolun.
            </p>
            <div 
              className="flex items-center gap-2 text-sm text-gray-400"
              data-registry="F1.1.1.3"
              id="footer-credits"
            >
              <span>Made with</span>
              <FaHeart 
                className="text-red-500 animate-pulse"
                data-registry="F1.1.1.3.1"
                id="footer-heart-icon"
              />
              <span>and</span>
              <FaCoffee 
                className="text-amber-500"
                data-registry="F1.1.1.3.2"
                id="footer-coffee-icon"
              />
              <span>by developers</span>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div
            data-registry="F1.1.2"
            id="footer-quick-links-section"
          >
            <h4 
              className="text-white font-semibold mb-4 flex items-center gap-2 line-through opacity-60"
              data-registry="F1.1.2.1"
              id="footer-quick-links-title"
            >
              <FaRocket 
                className="text-[#00ff88]"
                data-registry="F1.1.2.1.1"
                id="footer-quick-links-icon"
              />
              Hızlı Erişim
            </h4>
            <ul 
              className="space-y-2 opacity-60"
              data-registry="F1.1.2.2"
              id="footer-quick-links-list"
            >
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2 line-through"
                  data-registry="F1.1.2.2.1"
                  id="footer-quick-link-library"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  Kütüphane
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2 line-through"
                  data-registry="F1.1.2.2.2"
                  id="footer-quick-link-dashboard"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2 line-through"
                  data-registry="F1.1.2.2.3"
                  id="footer-quick-link-stats"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  İstatistikler
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2 line-through"
                  data-registry="F1.1.2.2.4"
                  id="footer-quick-link-settings"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  Ayarlar
                </a>
              </li>
            </ul>
          </div>

          {/* Yardım */}
          <div
            data-registry="F1.1.3"
            id="footer-help-section"
          >
            <h4 
              className="text-white font-semibold mb-4 flex items-center gap-2"
              data-registry="F1.1.3.1"
              id="footer-help-title"
            >
              <FaGem 
                className="text-[#00d4ff]"
                data-registry="F1.1.3.1.1"
                id="footer-help-icon"
              />
              Yardım
            </h4>
            <ul 
              className="space-y-2"
              data-registry="F1.1.3.2"
              id="footer-help-list"
            >
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2"
                  data-registry="F1.1.3.2.1"
                  id="footer-help-docs"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  Dokümantasyon
                </a>
              </li>
              <li>
                <a 
                  href="/faq" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2"
                  data-registry="F1.1.3.2.2"
                  id="footer-help-faq"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  SSS
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2"
                  data-registry="F1.1.3.2.3"
                  id="footer-help-contact"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  İletişim
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-2"
                  data-registry="F1.1.3.2.4"
                  id="footer-help-feedback"
                >
                  <span className="w-1 h-1 bg-[#00ff88] rounded-full"></span>
                  Geri Bildirim
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div 
          className="border-t border-gray-700 pt-6"
          data-registry="F1.2"
          id="footer-bottom"
        >
          <div 
            className="flex flex-col md:flex-row justify-between items-center gap-4"
            data-registry="F1.2.1"
            id="footer-bottom-content"
          >
            
            {/* Copyright */}
            <div 
              className="flex items-center gap-4 text-sm text-gray-400"
              data-registry="F1.2.1.1"
              id="footer-copyright"
            >
              <span>© {currentYear} Jun Oro. Tüm hakları saklıdır.</span>
              <div 
                className="hidden md:flex items-center gap-1"
                data-registry="F1.2.1.1.1"
                id="footer-version"
              >
                <FaCode 
                  className="text-[#00ff88]"
                  data-registry="F1.2.1.1.1.1"
                  id="footer-version-icon"
                />
                <span>v1.0.0</span>
              </div>
            </div>

            {/* Teknoloji Stack */}
            <div 
              className="flex items-center gap-4 text-xs text-gray-500"
              data-registry="F1.2.1.2"
              id="footer-tech-stack"
            >
              <div 
                className="flex items-center gap-1"
                data-registry="F1.2.1.2.1"
                id="footer-tech-react"
              >
                <div className="w-2 h-2 bg-[#61dafb] rounded-full"></div>
                <span>React</span>
              </div>
              <div 
                className="flex items-center gap-1"
                data-registry="F1.2.1.2.2"
                id="footer-tech-tailwind"
              >
                <div className="w-2 h-2 bg-[#06b6d4] rounded-full"></div>
                <span>Tailwind</span>
              </div>
              <div 
                className="flex items-center gap-1"
                data-registry="F1.2.1.2.3"
                id="footer-tech-vite"
              >
                <div className="w-2 h-2 bg-[#646cff] rounded-full"></div>
                <span>Vite</span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Controls */}
      {isDebugMode && isAdminUser && (
        <div 
          className="border-t border-gray-700 pt-4 mt-4"
          data-registry="F1.3"
          id="footer-debug-section"
        >
            <div 
              className="flex flex-wrap items-center gap-4 text-sm"
              data-registry="F1.3.1"
              id="footer-debug-controls"
            >
              {/* Debug Tools */}
              <div 
                className="flex items-center gap-2"
                data-registry="F1.3.1.1"
                id="footer-debug-tools"
              >
                <button
                  onClick={() => {
                    setMeasureMode(!measureMode)
                    setMeasureStart(null)
                    setMeasureEnd(null)
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    measureMode 
                      ? 'bg-[#00d4ff] text-black' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  data-registry="F1.3.1.1.1"
                  id="footer-debug-measure-btn"
                >
                  📏 Ölçü
                </button>

                <button
                  onClick={() => {
                    setResizeMode(!resizeMode)
                    setResizeElement(null)
                    setResizeStart(null)
                    setIsDragging(false)
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    resizeMode 
                      ? 'bg-[#ffd700] text-black' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  data-registry="F1.3.1.1.2"
                  id="footer-debug-resize-btn"
                >
                  ↔️ Resize
                </button>
              </div>

              {/* Info Display */}
              <div 
                className="flex-1 text-xs text-gray-400"
                data-registry="F1.3.1.2"
                id="footer-debug-info"
              >
                {hoveredElement && (
                  <span className="text-[#00ff88]">
                    Hover: {getElementName(hoveredElement)}
                  </span>
                )}
                {selectedElement && (
                  <span className="text-[#ff6b6b] ml-4">
                    Seçili: {getElementName(selectedElement)}
                  </span>
                )}
                {measureMode && (
                  <span className="text-[#00d4ff] ml-4">
                    Ölçü modu: İki nokta tıklayın
                  </span>
                )}
              </div>

              {/* Instructions */}
              <div 
                className="text-xs text-gray-500 text-right"
                data-registry="F1.3.1.3"
                id="footer-debug-instructions"
              >
                <div>Sol tık: Özellikler | Sağ tık: İsim kopyala</div>
                <div>Mouse: Highlight | Ölçü: İki nokta seç</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Debug Toggle Button */}
      {isAdminUser && (
        <div 
          className="absolute bottom-4 left-4"
          data-registry="F2"
          id="footer-debug-toggle-container"
        >
          <button
            onClick={() => setIsDebugMode(!isDebugMode)}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
              isDebugMode 
                ? 'bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            data-registry="F2.1"
            id="footer-debug-toggle-btn"
          >
            🐛 Debug {isDebugMode ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </footer>
    </>
  )
}

export default SiteFooter