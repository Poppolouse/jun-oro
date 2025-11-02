import { useEffect, useRef, useState } from 'react'

function ElementSelector() {
  const [isActive, setIsActive] = useState(false)
  const [hoveredElement, setHoveredElement] = useState(null)
  const [selectedElement, setSelectedElement] = useState(null)
  const [navigationSteps, setNavigationSteps] = useState([])
  const [isRecordingPath, setIsRecordingPath] = useState(false)
  const [returnUrl, setReturnUrl] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const floatingTooltipRef = useRef(null)
  const highlightCandidateRef = useRef(null)
  const highlightTimerRef = useRef(null)

  // Handshake: yeni sekme hazır olduğunda admin pencereye haber ver
  useEffect(() => {
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'ELEMENT_SELECTOR_READY' }, '*')
      }
    } catch (e) {
      // sessiz geç
    }
  }, [])

  // URL parametresi ile auto-activation (enableSelector=1&returnUrl=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const enable = params.get('enableSelector')
      const ret = params.get('returnUrl')
      const sIdx = params.get('stepIndex')
      if (enable === '1') {
        setIsActive(true)
        if (ret) setReturnUrl(decodeURIComponent(ret))
        if (sIdx) setStepIndex(parseInt(sIdx, 10) || 0)
        document.body.style.cursor = 'crosshair'
      }
    } catch (e) {
      // sessiz geç
    }
  }, [])

  useEffect(() => {
    // Message listener for enabling element selector
    const handleMessage = (event) => {
      if (event.data.type === 'ENABLE_ELEMENT_SELECTOR') {
        setIsActive(true)
        setReturnUrl(event.data.returnUrl)
        if (typeof event.data.stepIndex === 'number') {
          setStepIndex(event.data.stepIndex)
        }
        document.body.style.cursor = 'crosshair'
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!isActive) return

    // Instruction overlay'i etkinlik başladığında göster
    if (!document.getElementById('element-selector-overlay')) {
      showInstructionOverlay()
    }
    ensureSelectorStyles()
    ensureFloatingTooltip()

    const handleMouseOver = (e) => {
      // No-op: highlight logic is handled in mousemove to reduce flicker
      e.preventDefault()
      e.stopPropagation()
    }

    // Flicker fix: mouseout ile highlight anlık kayboluyordu.
    // Temizlemeyi sadece yeni bir element hover olduğunda yapıyoruz.

    const handleMouseMove = (e) => {
      const tooltip = floatingTooltipRef.current
      const targetUnderPointer = document.elementFromPoint(e.clientX, e.clientY)
      
      // Ignore overlay and footer
      if (!targetUnderPointer || targetUnderPointer.id === 'element-selector-overlay' || targetUnderPointer.closest?.('#element-selector-overlay') || targetUnderPointer.closest?.('footer')) {
        if (tooltip) tooltip.style.display = 'none'
        return
      }
      
      // Choose a stable highlight target (prefer data-registry ancestor)
      const getHighlightTarget = (el) => {
        let cur = el
        let depth = 0
        while (cur && depth < 4) {
          if (cur.getAttribute && cur.getAttribute('data-registry')) return cur
          const tag = (cur.tagName || '').toLowerCase()
          const role = cur.getAttribute && cur.getAttribute('role')
          if (tag === 'button' || tag === 'a' || role === 'button') return cur
          cur = cur.parentElement
          depth += 1
        }
        return el
      }
      const el = getHighlightTarget(targetUnderPointer)

      // Update highlight with small stabilization to avoid flicker
      if (hoveredElement !== el) {
        // store candidate and delay applying highlight slightly
        highlightCandidateRef.current = el
        if (highlightTimerRef.current) {
          clearTimeout(highlightTimerRef.current)
        }
        highlightTimerRef.current = setTimeout(() => {
          const candidate = highlightCandidateRef.current
          if (!candidate) return
          if (hoveredElement && hoveredElement !== candidate) {
            try { hoveredElement.classList.remove('selector-highlight') } catch {}
          }
          try { candidate.classList.add('selector-highlight') } catch {}
          setHoveredElement(candidate)
        }, 50)
      }
      
      // Update floating tooltip text and position with small animation
      if (tooltip) {
        const { registryId } = generateSelector(el)
        tooltip.textContent = registryId ? `ID: ${registryId}` : 'ID: -'
        tooltip.style.left = `${e.clientX}px`
        tooltip.style.top = `${e.clientY}px`
        tooltip.style.display = 'block'
        // micro animation
        try {
          tooltip.style.transform = 'translate(-50%, -140%) scale(1.06)'
          tooltip.style.opacity = '1'
          setTimeout(() => {
            tooltip.style.transform = 'translate(-50%, -140%) scale(1)'
          }, 120)
        } catch {}
      }
    }

    const handleRightClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const element = e.target
      const { selector, registryId } = generateSelector(element)
      
      // Eğer path recording aktifse, son adımı da kaydet
      if (isRecordingPath) {
        recordNavigationStep(element)
        stopPathRecording()
      }
      
      // Send selector back to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'ELEMENT_SELECTED',
          selector: selector,
          registryId,
          stepIndex,
          navigationSteps: navigationSteps,
          elementInfo: {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: element.textContent?.substring(0, 50) + '...'
          }
        }, '*')
      }

      // Persist selection bilgisi (modal geri açılışı için)
      try {
        const payload = {
          selector,
          registryId,
          stepIndex,
          pageUrl: window.location.pathname,
          timestamp: Date.now(),
        }
        localStorage.setItem('junoro:tutorialSelection', JSON.stringify(payload))
      } catch (err) {}

      // ERS Registry ID kopyala (varsa)
      try {
        if (registryId && navigator.clipboard && navigator.clipboard.writeText) {
          void navigator.clipboard.writeText(registryId).catch(() => {})
        }
      } catch (err) {}
      
      // Clean up
      cleanup()
      setSelectedElement(element)
      
      // Show success message and redirect back
      showSuccessMessage(registryId ? `[data-registry="${registryId}"]` : selector, () => {
        // Opener varsa onu öne getirip bu pencereyi kapat, değilse geri dön
        try {
          if (window.opener && !window.opener.closed) {
            try { window.opener.focus() } catch {}
            window.close()
          } else if (returnUrl) {
            window.location.href = returnUrl
          } else if (document.referrer) {
            // referrer varsa geri dönmeyi dene
            window.history.back()
          } else {
            // Son çare: admin sayfasına yönlendir (mevcut origin kullan)
            window.location.href = `${window.location.origin}/admin/tutorials?openEditModal=1`
          }
        } catch {}
      })
    }

    const handleLeftClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Sol tık ile navigasyon adımı kaydet
      if (isRecordingPath) {
        const element = e.target
        recordNavigationStep(element)
      }
    }

    const recordNavigationStep = (element) => {
      const stepInfo = {
        selector: generateSelector(element),
        action: detectElementAction(element),
        description: getElementDescription(element),
        timestamp: Date.now()
      }
      
      setNavigationSteps(prev => [...prev, stepInfo])
      
      // Visual feedback
      showStepRecorded(stepInfo)
    }

    const detectElementAction = (element) => {
      const tagName = element.tagName.toLowerCase()
      const type = element.type?.toLowerCase()
      const role = element.getAttribute('role')
      
      // Button veya clickable elementler
      if (tagName === 'button' || role === 'button') return 'click'
      if (tagName === 'a') return 'navigate'
      if (tagName === 'input') {
        if (type === 'text' || type === 'email' || type === 'password') return 'type'
        if (type === 'checkbox' || type === 'radio') return 'check'
        return 'click'
      }
      if (tagName === 'select') return 'select'
      if (tagName === 'textarea') return 'type'
      
      // Expandable elementler
      if (element.getAttribute('aria-expanded') !== null) return 'expand'
      if (element.classList.contains('dropdown') || element.classList.contains('accordion')) return 'expand'
      
      // Modal tetikleyiciler
      if (element.getAttribute('data-modal') || element.getAttribute('data-toggle')) return 'open_modal'
      
      return 'click'
    }

    const getElementDescription = (element) => {
      // Text content
      const text = element.textContent?.trim()
      if (text && text.length < 50) return text
      
      // Placeholder
      const placeholder = element.getAttribute('placeholder')
      if (placeholder) return `Input: ${placeholder}`
      
      // Alt text
      const alt = element.getAttribute('alt')
      if (alt) return alt
      
      // Title
      const title = element.getAttribute('title')
      if (title) return title
      
      // Class-based description
      const className = element.className
      if (className.includes('button')) return 'Button'
      if (className.includes('input')) return 'Input Field'
      if (className.includes('dropdown')) return 'Dropdown'
      if (className.includes('modal')) return 'Modal Trigger'
      
      return element.tagName.toLowerCase()
    }

    const showStepRecorded = (stepInfo) => {
      // Geçici bir visual feedback göster
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      `
      notification.textContent = `Adım kaydedildi: ${stepInfo.description}`
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 2000)
    }

    const startPathRecording = () => {
      setIsRecordingPath(true)
      setNavigationSteps([])
      
      // Kullanıcıya bilgi ver
      const info = document.createElement('div')
      info.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1f2937;
        color: white;
        padding: 20px;
        border-radius: 12px;
        font-size: 16px;
        z-index: 10000;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      `
      info.innerHTML = `
        <div style="margin-bottom: 12px;">🎯 Yol Kaydetme Modu Aktif</div>
        <div style="font-size: 14px; opacity: 0.8;">
          Sol tık: Adım kaydet<br>
          Sağ tık: Element seç ve bitir
        </div>
      `
      
      document.body.appendChild(info)
      
      setTimeout(() => {
        info.remove()
      }, 3000)
    }

    const stopPathRecording = () => {
      setIsRecordingPath(false)
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cleanup()
        setIsActive(false)
      }
    }

    // Add event listeners
    document.addEventListener('mouseover', handleMouseOver, true)
    // mouseout kaldırıldı (flicker fix)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleLeftClick, true)
    document.addEventListener('contextmenu', handleRightClick, true)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true)
      // mouseout yok
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleLeftClick, true)
      document.removeEventListener('contextmenu', handleRightClick, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      cleanup()
    }
  }, [isActive, hoveredElement])

  const generateSelector = (element) => {
    // Öncelik: ERS data-registry
    const findRegistryElement = (el) => {
      let cur = el
      let depth = 0
      while (cur && depth < 4) {
        const rid = cur.getAttribute && cur.getAttribute('data-registry')
        if (rid) return { el: cur, rid }
        cur = cur.parentElement
        depth += 1
      }
      return null
    }

    const reg = findRegistryElement(element)
    if (reg) {
      return { selector: `[data-registry="${reg.rid}"]`, registryId: reg.rid }
    }

    // Try ID first
    if (element.id) {
      return { selector: `#${element.id}`, registryId: null }
    }
    
    // Try class names
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.trim())
      if (classes.length > 0) {
        return { selector: `.${classes[0]}`, registryId: null }
      }
    }
    
    // Try data attributes
    const dataAttrs = Array.from(element.attributes).filter(attr => attr.name.startsWith('data-'))
    if (dataAttrs.length > 0) {
      return { selector: `[${dataAttrs[0].name}="${dataAttrs[0].value}"]`, registryId: null }
    }
    
    // Fallback to tag name with nth-child
    const parent = element.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName)
      const index = siblings.indexOf(element) + 1
      return { selector: `${element.tagName.toLowerCase()}:nth-child(${index})`, registryId: null }
    }
    
    return { selector: element.tagName.toLowerCase(), registryId: null }
  }

  const cleanup = () => {
    document.body.style.cursor = ''
    if (hoveredElement) {
      try { hoveredElement.classList.remove('selector-highlight') } catch {}
    }
    // clear highlight stabilization timer
    if (highlightTimerRef.current) {
      try { clearTimeout(highlightTimerRef.current) } catch {}
      highlightTimerRef.current = null
    }
    highlightCandidateRef.current = null
    
    // Remove instruction overlay
    const overlay = document.getElementById('element-selector-overlay')
    if (overlay) {
      overlay.remove()
    }
    // Remove floating tooltip
    if (floatingTooltipRef.current) {
      try { floatingTooltipRef.current.remove() } catch {}
      floatingTooltipRef.current = null
    }
    
    // Clear any remaining highlights
    document.querySelectorAll('*').forEach(el => {
      try { el.classList.remove('selector-highlight') } catch {}
    })
    
    // Clean up global functions
    delete window.startPathRecording
    delete window.stopPathRecording
    delete window.cancelElementSelector
    
    setHoveredElement(null)
    setSelectedElement(null)
    setNavigationSteps([])
    setIsRecordingPath(false)
  }

  const showInstructionOverlay = () => {
    const overlay = document.createElement('div')
    overlay.id = 'element-selector-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      border: 2px solid #8b5cf6;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      min-width: 400px;
    `
    
    const updateOverlayContent = () => {
      const stepsHtml = navigationSteps.length > 0 ? `
        <div style="margin: 12px 0; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: left;">
          <div style="font-weight: bold; margin-bottom: 8px;">Kaydedilen Adımlar:</div>
          <div style="max-height: 120px; overflow-y: auto;">
            ${navigationSteps.map((step, index) => `
              <div style="font-size: 12px; margin-bottom: 4px; color: #d1d5db;">
                ${index + 1}. ${step.description} (${step.action})
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''
      
      overlay.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">🎯 Element Seçme Modu</div>
          <div style="font-size: 14px; color: #d1d5db; margin-bottom: 12px;">
            ${isRecordingPath 
              ? '🎯 Yol kaydetme aktif: Sol tık ile adımları kaydedin, sağ tık ile elementi seçin.'
              : 'Hedeflemek istediğiniz elemente <span style="color: #8b5cf6; font-weight: bold;">SAĞ TIKLAYIN</span><br><span style="color: #fbbf24;">Mouse ile üzerine gelince highlight olur</span>'
            }
          </div>
          ${stepsHtml}
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px;">
            ${!isRecordingPath ? `
              <button onclick="window.startPathRecording()" style="
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
              ">Yol Kaydetmeyi Başlat</button>
            ` : `
              <button onclick="window.stopPathRecording()" style="
                padding: 8px 16px;
                background: #f97316;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
              ">Yol Kaydetmeyi Durdur</button>
            `}
            <button onclick="window.cancelElementSelector()" style="
              padding: 8px 16px;
              background: #6b7280;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            ">İptal</button>
          </div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">
            <span style="color: #8b5cf6;">ESC</span> tuşu ile iptal edebilirsiniz
          </div>
        </div>
      `
    }
    
    // Global functions for button clicks
    window.startPathRecording = () => {
      setIsRecordingPath(true)
      setNavigationSteps([])
      updateOverlayContent()
    }
    
    window.stopPathRecording = () => {
      setIsRecordingPath(false)
      updateOverlayContent()
    }
    
    window.cancelElementSelector = () => {
      cleanup()
      setIsActive(false)
    }
    
    updateOverlayContent()
    document.body.appendChild(overlay)
    ensureFloatingTooltip()
    
    // Update overlay when navigation steps change
    const updateInterval = setInterval(() => {
      if (document.getElementById('element-selector-overlay')) {
        updateOverlayContent()
      } else {
        clearInterval(updateInterval)
      }
    }, 500)
  }

  // Minimal CSS and floating tooltip helpers
  const ensureSelectorStyles = () => {
    if (document.getElementById('element-selector-style')) return
    const style = document.createElement('style')
    style.id = 'element-selector-style'
    style.textContent = `
      .selector-highlight {
        outline: 2px solid #8b5cf6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.35), 0 0 14px rgba(139, 92, 246, 0.45) !important;
        transition: outline-color 160ms ease, box-shadow 160ms ease !important;
      }
      #element-selector-floating-tooltip {
        position: fixed;
        z-index: 10001;
        pointer-events: none;
        background: rgba(17, 24, 39, 0.90);
        color: #e5e7eb;
        font-size: 12px;
        line-height: 1;
        padding: 6px 8px;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: 1px solid rgba(99,102,241,0.5);
        backdrop-filter: blur(6px);
        transform: translate(-50%, -140%) scale(1);
        opacity: 0.95;
        transition: transform 120ms ease, opacity 120ms ease;
        white-space: nowrap;
        display: none;
      }
    `
    document.head.appendChild(style)
  }

  const ensureFloatingTooltip = () => {
    ensureSelectorStyles()
    let el = document.getElementById('element-selector-floating-tooltip')
    if (!el) {
      el = document.createElement('div')
      el.id = 'element-selector-floating-tooltip'
      el.textContent = ''
      document.body.appendChild(el)
    }
    floatingTooltipRef.current = el
  }

  const showSuccessMessage = (selector, callback) => {
    const message = document.createElement('div')
    message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(34, 197, 94, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    `
    message.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">✅ Element Seçildi!</div>
        <div style="font-size: 12px; font-family: monospace; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px;">
          ${selector}
        </div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">ERS Registry ID (varsa) panoya kopyalandı. Tutorial sayfasına geri dönülüyor...</div>
      </div>
    `
    document.body.appendChild(message)
    
    setTimeout(() => {
      message.remove()
      if (callback) {
        callback()
      } else {
        window.close()
      }
    }, 2000)
  }

  return null // This component doesn't render anything
}

export default ElementSelector