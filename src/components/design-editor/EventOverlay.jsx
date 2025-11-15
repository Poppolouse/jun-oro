import { useCallback, useEffect, useRef } from 'react';
import { useDesignEditor } from '../../contexts/DesignEditorContext';

/**
 * Element Bilgisi Tespit Fonksiyonu
 * Bir HTML elementinden ERS kodunu ve pozisyon bilgilerini çıkarır
 * ERS kodu yoksa, element'in kendisini benzersiz tanımlayıcı olarak kullanır
 */
function getElementInfo(target, clientX, clientY) {
  // Eğer koordinatlar verilmişse, o noktadaki tüm elementleri kontrol et
  // Bu sayede pointer-events: none olan elementler de yakalanır
  if (clientX !== undefined && clientY !== undefined) {
    // Geçici olarak tüm pointer-events'leri devre dışı bırak
    const elements = document.elementsFromPoint(clientX, clientY);
    
    for (const elem of elements) {
      // Design editor elementlerini atla
      if (elem.hasAttribute?.('data-design-editor-ignore')) {
        continue;
      }
      
      // Body ve html'i atla
      if (elem === document.body || elem === document.documentElement) {
        continue;
      }
      
      // Bu element veya parent'larında ERS var mı kontrol et
      const info = findElementWithERS(elem);
      if (info) return info;
    }
    
    // Hiçbirinde ERS yoksa, ilk geçerli elementi döndür
    for (const elem of elements) {
      if (elem.hasAttribute?.('data-design-editor-ignore')) continue;
      if (elem === document.body || elem === document.documentElement) continue;
      
      const tagName = elem.tagName.toLowerCase();
      const className = elem.className ? `.${elem.className.split(' ').join('.')}` : '';
      const id = elem.id ? `#${elem.id}` : '';
      const path = getElementPath(elem);
      
      return {
        element: elem,
        ers: `${tagName}${id}${className} [${path}]`,
        rect: elem.getBoundingClientRect()
      };
    }
  }
  
  // Koordinat yoksa eski yöntemi kullan (target'tan başla)
  return findElementWithERS(target) || createElementInfo(target);
}

/**
 * Element veya parent'larında ERS ara
 */
function findElementWithERS(target) {
  let current = target;
  let depth = 0;
  
  while (current && depth < 50) {
    if (current.hasAttribute?.('data-design-editor-ignore')) {
      return null;
    }
    
    if (current.hasAttribute?.('data-ers')) {
      const ers = current.getAttribute('data-ers');
      const rect = current.getBoundingClientRect();
      
      return {
        element: current,
        ers: ers,
        rect: rect
      };
    }
    
    current = current.parentElement;
    depth++;
  }
  
  return null;
}

/**
 * Element için bilgi objesi oluştur (ERS yoksa)
 */
function createElementInfo(target) {
  if (target && target !== document.body && target !== document.documentElement) {
    const tagName = target.tagName.toLowerCase();
    const className = target.className ? `.${target.className.split(' ').join('.')}` : '';
    const id = target.id ? `#${target.id}` : '';
    const path = getElementPath(target);
    
    return {
      element: target,
      ers: `${tagName}${id}${className} [${path}]`,
      rect: target.getBoundingClientRect()
    };
  }
  
  return null;
}

/**
 * Element'in DOM ağacındaki yolunu bulur
 */
function getElementPath(element) {
  const path = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break; // ID benzersizdir, durabilirz
    } else {
      let sibling = current;
      let nth = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.tagName === current.tagName) nth++;
      }
      if (nth > 1) selector += `:nth-of-type(${nth})`;
      path.unshift(selector);
    }
    
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

/**
 * Child Element Kontrolü - Element'in seçili element'in child'ı mı?
 */
function isChildOfSelected(element, selectedElement) {
  if (!selectedElement) return false;
  
  let current = element.parentElement;
  while (current) {
    if (current === selectedElement.element) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

/**
 * EventOverlay Component - Gözler ve Kulaklar
 * 
 * Window event listener'ları kullanarak kullanıcının fare hareketlerini,
 * tıklamalarını ve sağ tıklamalarını dinler.
 * 
 * Görevler:
 * - mousemove: Hover edilen elementi tespit edip Context'e bildir
 * - click: Tasarım modunda element seçimini yap
 * - contextmenu: Seç modunda ERS kodunu kopyala
 */
function EventOverlay() {
  const { state, dispatch } = useDesignEditor();
  const { mode, selectionLocked, selectedElement, childMoveState } = state;
  
  // Son hover edilen ERS'i tutarak gereksiz dispatch'leri önle
  const lastHoveredERS = useRef(null);
  // Son log edilen değerleri tut (gereksiz log tekrarı önlemek için)
  const lastLoggedMode = useRef(null);
  
  // Basılı tutma timer'ları
  const holdTimerRef = useRef(null);
  const scanIntervalRef = useRef(null);
  
  // Sadece mode değiştiğinde log
  if (lastLoggedMode.current !== mode) {
    console.log('👂 EventOverlay mode değişti:', mode);
    lastLoggedMode.current = mode;
  }
  
  /**
   * Fare Hareketi Handler - Hover Tespiti
   */
  const handleMouseMove = useCallback((e) => {
    // Child taşıma modundaysa hover değişmez
    if (childMoveState.isActive) {
      return;
    }
    
    // Seçim kilitliyse hover değişmez
    if (selectionLocked) {
      return;
    }
    
    const elementInfo = getElementInfo(e.target, e.clientX, e.clientY);
    
    // ERS değişmediyse dispatch yapma (performans)
    const newERS = elementInfo?.ers || null;
    if (newERS === lastHoveredERS.current) {
      return;
    }
    
    lastHoveredERS.current = newERS;
    
    // Debug log
    if (elementInfo) {
      console.log('🎯 Hover:', elementInfo.ers);
    }
    
    // Context'e rapor ver
    dispatch({
      type: 'SET_HOVERED_ELEMENT',
      payload: elementInfo
    });
  }, [selectionLocked, childMoveState.isActive, dispatch]);
  
  /**
   * Mouse Down Handler - Basılı Tutma İçin Child Tarama
   */
  const handleMouseDown = useCallback((e) => {
    // Sadece tasarım modunda ve bir element seçiliyken
    if (mode !== 'design' || !selectedElement) {
      return;
    }
    
    const elementInfo = getElementInfo(e.target, e.clientX, e.clientY);
    
    // Eğer tıklanan element seçili element'in child'ıysa
    if (elementInfo && isChildOfSelected(elementInfo.element, selectedElement)) {
      console.log('🔵 Child element basılı tutuluyor:', elementInfo.ers);
      
      // Taramayı başlat
      dispatch({
        type: 'START_CHILD_SCAN',
        payload: {
          element: elementInfo.element,
          ers: elementInfo.ers
        }
      });
      
      // 3 saniye tarama animasyonu
      let progress = 0;
      scanIntervalRef.current = setInterval(() => {
        progress += 3.33; // 100 / 30 = 3.33 (30 frame = 3 saniye)
        dispatch({
          type: 'UPDATE_SCAN_PROGRESS',
          payload: Math.min(progress, 100)
        });
      }, 100);
      
      // 3 saniye sonra taşıma modunu aktifleştir
      holdTimerRef.current = setTimeout(() => {
        console.log('✅ 3 saniye doldu - Taşıma modu aktif!');
        dispatch({ type: 'ACTIVATE_CHILD_MOVE' });
        
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
      }, 3000);
    }
  }, [mode, selectedElement, dispatch]);
  
  /**
   * Mouse Up Handler - Basılı Tutmayı İptal veya Taşımayı Tamamla
   */
  const handleMouseUp = useCallback((e) => {
    // Timer'ları temizle
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Eğer taşıma modu aktifse
    if (childMoveState.isActive) {
      const targetInfo = getElementInfo(e.target, e.clientX, e.clientY);
      
      if (targetInfo && childMoveState.childElement) {
        // Hedef parent'a taşı
        console.log('🎯 Child yeni parent\'a taşınıyor:', targetInfo.ers);
        dispatch({
          type: 'COMPLETE_CHILD_MOVE',
          payload: {
            childElement: childMoveState.childElement,
            newParent: targetInfo.element
          }
        });
        
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `${childMoveState.childErs} → ${targetInfo.ers}`,
            ers: 'Taşıma başarılı'
          }
        });
      } else {
        // İptal
        dispatch({ type: 'CANCEL_CHILD_MOVE' });
      }
    } else if (childMoveState.scanProgress > 0) {
      // Tarama tamamlanmadan bırakıldı
      console.log('❌ Tarama iptal edildi');
      dispatch({ type: 'CANCEL_CHILD_MOVE' });
    }
  }, [childMoveState, dispatch]);
  
  /**
   * Tıklama Handler - Element Seçimi (Tasarım Modu)
   */
  const handleClick = useCallback((e) => {
    // Child taşıma modundaysa tıklama işleme
    if (childMoveState.isActive) {
      return;
    }
    
    // Sadece tasarım modunda çalış
    if (mode !== 'design') {
      return;
    }
    
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  👆 KULLANICI TIKLADI (EventOverlay)                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('⏰ Click timestamp:', new Date().toLocaleTimeString('tr-TR', { hour12: false, fractionalSecondDigits: 3 }));
    console.log('🎯 Tıklanan element:', e.target.tagName, e.target.className);
    console.log('🔍 getElementInfo çağrılıyor...');
    
    const elementInfo = getElementInfo(e.target, e.clientX, e.clientY);
    
    if (elementInfo) {
      console.log('✅ Element bilgisi alındı:');
      console.log('  - ERS:', elementInfo.ers);
      console.log('  - Rect:', {
        width: Math.round(elementInfo.rect.width),
        height: Math.round(elementInfo.rect.height),
        left: Math.round(elementInfo.rect.left),
        top: Math.round(elementInfo.rect.top)
      });
      
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🧠 dispatch(SET_SELECTED_ELEMENT) çağrılıyor...');
      // Context'e rapor ver: Bu element seçildi
      dispatch({
        type: 'SET_SELECTED_ELEMENT',
        payload: elementInfo
      });
      console.log('✓ dispatch tamamlandı');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('❌ Element bilgisi alınamadı (ERS yok)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }, [mode, childMoveState.isActive, dispatch]);
  
  /**
   * Sağ Tık Handler - ERS Kopyalama (Seç Modu) veya Seçimi İptal
   */
  const handleContextMenu = useCallback((e) => {
    // Seç veya design modunda çalış
    if (mode === 'inactive') {
      return;
    }
    
    const elementInfo = getElementInfo(e.target, e.clientX, e.clientY);
    
    if (elementInfo && elementInfo.ers && mode === 'select') {
      // Seç modunda: ERS kopyala
      e.preventDefault();
      
      // ERS kodunu panoya kopyala
      navigator.clipboard.writeText(elementInfo.ers)
        .then(() => {
          console.log('✅ ERS kodu kopyalandı:', elementInfo.ers);
          dispatch({
            type: 'SHOW_TOAST',
            payload: {
              message: 'ERS kodu kopyalandı',
              ers: elementInfo.ers
            }
          });
        })
        .catch((err) => {
          console.error('❌ ERS kopyalama hatası:', err);
        });
    } else if (mode === 'design') {
      // Design modunda: Seçimi iptal et
      e.preventDefault();
      console.log('🔄 Seçim iptal edildi');
      dispatch({ type: 'CLEAR_SELECTION' });
    }
  }, [mode, dispatch]);
  
  /**
   * Window Event Listener'ları
   * KRİTİK: DOM overlay yerine window listener kullanıyoruz
   * Böylece gerçek elementler yakalanır
   */
  const lastListenerMode = useRef(null);
  
  useEffect(() => {
    if (mode === 'inactive') {
      lastListenerMode.current = null;
      return;
    }
    
    // Sadece mode gerçekten değiştiğinde log
    if (lastListenerMode.current !== mode) {
      console.log('🎧 EventOverlay: Listener\'lar aktif, mode:', mode);
      lastListenerMode.current = mode;
    }
    
    // Event listener'ları ekle
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown, true); // Capture phase
    window.addEventListener('mouseup', handleMouseUp, true); // Capture phase
    window.addEventListener('click', handleClick, true); // Capture phase
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      // Temizlik
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [mode, handleMouseMove, handleMouseDown, handleMouseUp, handleClick, handleContextMenu]);
  
  // Hiçbir görsel element render etme
  return null;
}

export default EventOverlay;
