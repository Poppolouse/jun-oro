import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDesignEditor } from '../../contexts/DesignEditorContext';

const cloneRect = (rect) => ({
  left: rect.left,
  top: rect.top,
  width: rect.width,
  height: rect.height,
  right: rect.right,
  bottom: rect.bottom,
  x: rect.x,
  y: rect.y
});

function Highlighter() {
  const { state, dispatch } = useDesignEditor();
  const { mode, hoveredElement, selectedElement, childMoveState } = state;
  
  const lastLogRef = useRef({ mode: null, hasHover: null, hasSelection: null });
    const [resizeRect, setResizeRect] = useState(null);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const renderTriggerRef = useRef(0);
    const lastAppliedRectRef = useRef(null);
  const markedElementRef = useRef(null);
  
  const dragRef = useRef({
    active: false,
    handle: null,
    startX: 0,
    startY: 0,
    startRect: null,
    element: null,
    ers: null,
    childSnapshots: []
  });
  
  const captureChildSnapshots = useCallback((parentElement, parentRect) => {
    const children = Array.from(parentElement.children);
    const snapshots = [];
    
    children.forEach(child => {
      const childRect = child.getBoundingClientRect();
      const widthRatio = childRect.width / parentRect.width;
      const heightRatio = childRect.height / parentRect.height;
      
      snapshots.push({
        element: child,
        widthRatio,
        heightRatio
      });
    });
    
    return snapshots;
  }, []);
  
  // 🔥 selectedElement değiştiğinde force re-render
  const lastLoggedSelectedElement = useRef(null);
  useEffect(() => {
    if (selectedElement) {
      // Spam önleme - aynı element için log yapma
      const elementKey = `${selectedElement.ers}-${Math.round(selectedElement.rect.width)}-${Math.round(selectedElement.rect.height)}`;
      if (lastLoggedSelectedElement.current === elementKey) {
        // Sessizce updateTrigger'ı artır, log yapma
        setUpdateTrigger(prev => prev + 1);
        return;
      }
      lastLoggedSelectedElement.current = elementKey;
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔵 useEffect TRIGGERED - selectedElement değişti');
      console.log('📦 selectedElement.ers:', selectedElement.ers);
      console.log('📏 selectedElement.rect:', {
        width: Math.round(selectedElement.rect.width),
        height: Math.round(selectedElement.rect.height),
        left: Math.round(selectedElement.rect.left),
        top: Math.round(selectedElement.rect.top)
      });
      console.log('🔢 updateTrigger:', updateTrigger);
      setUpdateTrigger(prev => prev + 1);
      console.log('✅ useEffect tamamlandı');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }, [selectedElement]);

  useEffect(() => {
    if (markedElementRef.current && markedElementRef.current !== selectedElement?.element) {
      markedElementRef.current.removeAttribute('data-design-editor-selected');
      markedElementRef.current = null;
    }
    if (selectedElement?.element) {
      markedElementRef.current = selectedElement.element;
      selectedElement.element.setAttribute('data-design-editor-selected', 'true');
    } else if (!selectedElement && markedElementRef.current) {
      markedElementRef.current.removeAttribute('data-design-editor-selected');
      markedElementRef.current = null;
    }
    return () => {
      if (markedElementRef.current) {
        markedElementRef.current.removeAttribute('data-design-editor-selected');
        markedElementRef.current = null;
      }
    };
  }, [selectedElement]);
  
  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    
    const { handle, startX, startY, startRect } = dragRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newRect = { ...startRect };
    
    switch (handle) {
      case 'n':
        newRect.top = startRect.top + deltaY;
        newRect.height = startRect.height - deltaY;
        break;
      case 's':
        newRect.height = startRect.height + deltaY;
        break;
      case 'e':
        newRect.width = startRect.width + deltaX;
        break;
      case 'w':
        newRect.left = startRect.left + deltaX;
        newRect.width = startRect.width - deltaX;
        break;
      case 'ne':
        newRect.top = startRect.top + deltaY;
        newRect.height = startRect.height - deltaY;
        newRect.width = startRect.width + deltaX;
        break;
      case 'nw':
        newRect.top = startRect.top + deltaY;
        newRect.height = startRect.height - deltaY;
        newRect.left = startRect.left + deltaX;
        newRect.width = startRect.width - deltaX;
        break;
      case 'se':
        newRect.height = startRect.height + deltaY;
        newRect.width = startRect.width + deltaX;
        break;
      case 'sw':
        newRect.height = startRect.height + deltaY;
        newRect.left = startRect.left + deltaX;
        newRect.width = startRect.width - deltaX;
        break;
    }
    
    if (newRect.width < 20) newRect.width = 20;
    if (newRect.height < 20) newRect.height = 20;
    
    dragRef.current.lastRect = newRect;
    setResizeRect(newRect);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    if (!dragRef.current.active) return;
    
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  🔴 MOUSE UP - RESIZE BİTİYOR                        ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('⏰ Timestamp:', new Date().toLocaleTimeString('tr-TR', { hour12: false, fractionalSecondDigits: 3 }));
    
    const { element, ers, childSnapshots, lastRect } = dragRef.current;
    const finalRect = lastRect || resizeRect || dragRef.current.startRect;
    
    console.log('📊 Resize bilgileri:');
    console.log('  - ERS:', ers);
    console.log('  - Başlangıç boyutu:', { width: Math.round(finalRect.width), height: Math.round(finalRect.height) });
    console.log('  - Çocuk element sayısı:', childSnapshots.length);
    
    // resizeRect'ten final boyutları al
    console.log('');
    console.log('🧹 ADIM 1: DOM güncellemesi ve state temizliği');
    if (finalRect && element) {
      console.log('  📦 finalRect mevcut, DOM güncelleniyor:');
      console.log('    - Yeni boyut:', { width: Math.round(finalRect.width), height: Math.round(finalRect.height) });
      console.log('    - Eski style.width:', element.style.width);
      console.log('    - Eski style.height:', element.style.height);
      
      element.style.width = `${finalRect.width}px`;
      element.style.height = `${finalRect.height}px`;
      
      const measuredRect = element.getBoundingClientRect();
      lastAppliedRectRef.current = cloneRect(measuredRect);
      
      console.log('    - Yeni style.width:', element.style.width);
      console.log('    - Yeni style.height:', element.style.height);
      console.log('    - Ölçülen gerçek boyut:', {
        width: Math.round(measuredRect.width),
        height: Math.round(measuredRect.height),
        left: Math.round(measuredRect.left),
        top: Math.round(measuredRect.top)
      });
      console.log('  ✓ DOM güncellendi');
      
      console.log('');
      console.log('  👶 Çocuk elementler ölçeklendiriliyor:');
      childSnapshots.forEach((snapshot, index) => {
        const newWidth = finalRect.width * snapshot.widthRatio;
        const newHeight = finalRect.height * snapshot.heightRatio;
        
        console.log(`    Çocuk ${index + 1}:`, {
          ratio: { w: snapshot.widthRatio.toFixed(2), h: snapshot.heightRatio.toFixed(2) },
          yeni: { w: Math.round(newWidth), h: Math.round(newHeight) }
        });
        
        snapshot.element.style.width = `${newWidth}px`;
        snapshot.element.style.height = `${newHeight}px`;
      });
      console.log('  ✓ Çocuklar ölçeklendirildi');
    } else {
      console.warn('⚠️ finalRect bulunamadı, DOM güncellenemedi');
    }
    
    console.log('  🗑️  resizeRect = null yapılıyor');
    setResizeRect(null);
    console.log('✓ resizeRect temizlendi');
    
    // DOM güncellemesinin tamamlanmasını bekle
    console.log('');
      console.log('');
      console.log('🧠 ADIM 2: Context güncelleniyor (önceden hesaplanan rect ile)');
      const appliedRect = lastAppliedRectRef.current || cloneRect(element.getBoundingClientRect());
      console.log('  Kullanılan rect:', {
        width: Math.round(appliedRect.width),
        height: Math.round(appliedRect.height),
        left: Math.round(appliedRect.left),
        top: Math.round(appliedRect.top)
      });
      console.log('  🔍 DOM style doğrulama:');
      console.log('    - style.width:', element.style.width);
      console.log('    - style.height:', element.style.height);
    
      dispatch({
        type: 'SET_SELECTED_ELEMENT',
        payload: {
          element,
          ers,
          rect: appliedRect
        }
      });
      console.log('✓ dispatch tamamlandı');
    
      console.log('');
      console.log('🔄 ADIM 3: Render trigger güncelleniyor');
      renderTriggerRef.current += 1;
      console.log('  renderTriggerRef.current:', renderTriggerRef.current);
    
      setUpdateTrigger(prev => {
        console.log(`  setUpdateTrigger: prev = ${prev}, yeni = ${prev + 1}`);
        return prev + 1;
      });
      console.log('✓ setUpdateTrigger tamamlandı');
    
      console.log('');
      console.log('✅ handleMouseUp TAMAMLANDI - Tüm güncellemeler yapıldı');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('');
    console.log('⚠️  handleMouseUp fonksiyonu BİTTİ');
    console.log('🎧 Event listener\'lar kaldırılıyor');
    dragRef.current.active = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    console.log('✓ Listener\'lar kaldırıldı');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [dispatch, handleMouseMove]);
  
  const handleMouseDown = useCallback((e, handle) => {
    if (!selectedElement) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 🔥 HER ZAMAN GÜNCEL BOYUTU AL (DOM'dan direkt)
    const rect = selectedElement.element.getBoundingClientRect();
    
    dragRef.current = {
      active: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      },
      element: selectedElement.element,
      ers: selectedElement.ers,
      childSnapshots: captureChildSnapshots(selectedElement.element, rect),
      lastRect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }
    };
    
    setResizeRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [selectedElement, captureChildSnapshots, handleMouseMove, handleMouseUp]);
  
  if (mode === 'inactive') {
    if (lastLogRef.current.mode !== 'inactive') {
      lastLogRef.current = { mode: 'inactive', hasHover: null, hasSelection: null };
    }
    return null;
  }
  
  const currentLog = {
    mode,
    hasHover: !!hoveredElement,
    hasSelection: !!selectedElement
  };
  
  if (lastLogRef.current.mode !== currentLog.mode || 
      lastLogRef.current.hasHover !== currentLog.hasHover || 
      lastLogRef.current.hasSelection !== currentLog.hasSelection) {
    lastLogRef.current = currentLog;
  }
  
  return createPortal(
    <>
      {hoveredElement && !selectedElement && (
        <div
          data-design-editor-ignore="true"
          style={{
            position: 'absolute',
            left: hoveredElement.rect.left + window.scrollX,
            top: hoveredElement.rect.top + window.scrollY,
            width: hoveredElement.rect.width,
            height: hoveredElement.rect.height,
            border: '2px solid #3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'all 0.1s ease'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-24px',
            left: 0,
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap'
          }}>
            {hoveredElement.ers}
          </div>
        </div>
      )}
      
      {/* Child Tarama Efekti */}
      {childMoveState.childElement && !childMoveState.isActive && (
        <ChildScanOverlay 
          element={childMoveState.childElement}
          progress={childMoveState.scanProgress}
          ers={childMoveState.childErs}
        />
      )}
      
      {/* Child Taşıma Modu - Sürüklenen Element */}
      {childMoveState.isActive && childMoveState.childElement && (
        <DraggedChildPreview 
          element={childMoveState.childElement}
          ers={childMoveState.childErs}
        />
      )}
      
      {selectedElement && (() => {
        // 🔥 HER RENDER'DA GERÇEK DOM BOYUTUNU AL
        // updateTrigger'ı kullanarak React'e bu IIFE'nin yeniden çalışması gerektiğini söyle
        const _ = updateTrigger; // eslint-disable-line no-unused-vars
        const liveRect = selectedElement.element.getBoundingClientRect();
        
        // LOG YAPMA - Sadece önemli eventlerde log vardır (mouseup, click)
        
        return (
          <>
            {resizeRect && (
              <div
                data-design-editor-ignore="true"
                style={{
                  position: 'absolute',
                  left: liveRect.left + window.scrollX,
                  top: liveRect.top + window.scrollY,
                  width: liveRect.width,
                  height: liveRect.height,
                  border: '2px dashed #6b7280',
                  backgroundColor: 'rgba(107, 114, 128, 0.05)',
                  pointerEvents: 'none',
                  zIndex: 9998
                }}
              />
            )}
            
            <div
              data-design-editor-ignore="true"
              style={{
                position: 'absolute',
                left: resizeRect ? resizeRect.left + window.scrollX : liveRect.left + window.scrollX,
                top: resizeRect ? resizeRect.top + window.scrollY : liveRect.top + window.scrollY,
                width: resizeRect ? resizeRect.width : liveRect.width,
                height: resizeRect ? resizeRect.height : liveRect.height,
              border: '2px solid #10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-24px',
              left: 0,
              backgroundColor: '#10b981',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap'
            }}>
              {selectedElement.ers}
            </div>
            
            {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(handle => {
              const styles = {
                n: { top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
                s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
                e: { top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'ew-resize' },
                w: { top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'ew-resize' },
                ne: { top: '-4px', right: '-4px', cursor: 'nesw-resize' },
                nw: { top: '-4px', left: '-4px', cursor: 'nwse-resize' },
                se: { bottom: '-4px', right: '-4px', cursor: 'nwse-resize' },
                sw: { bottom: '-4px', left: '-4px', cursor: 'nesw-resize' }
              };
              
              return (
                <div
                  key={handle}
                  data-design-editor-ignore="true"
                  onMouseDown={(e) => handleMouseDown(e, handle)}
                  style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10b981',
                    border: '1px solid white',
                    borderRadius: '50%',
                    pointerEvents: 'auto',
                    ...styles[handle]
                  }}
                />
              );
            })}
          </div>
        </>
        );
      })()}
    </>,
    document.body
  );
}

// Child Tarama Overlay - 3 saniye tarama animasyonu
function ChildScanOverlay({ element, progress, ers }) {
  const rect = element.getBoundingClientRect();
  
  return (
    <div
      data-design-editor-ignore="true"
      style={{
        position: 'absolute',
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
        border: '3px solid #f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        pointerEvents: 'none',
        zIndex: 10001,
        overflow: 'hidden'
      }}
    >
      {/* Tarama çubuğu */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(245, 158, 11, 0.3)'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#f59e0b',
          transition: 'width 0.1s linear'
        }} />
      </div>
      
      {/* Tarama efekti */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${progress}%`,
        background: 'linear-gradient(to bottom, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0))',
        transition: 'height 0.1s linear',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '-24px',
        left: 0,
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: '6px',
        alignItems: 'center'
      }}>
        <span>⏱️</span>
        <span>{ers}</span>
        <span>({Math.round(progress)}%)</span>
      </div>
    </div>
  );
}

// Sürüklenen Child Preview
function DraggedChildPreview({ element, ers }) {
  const rect = element.getBoundingClientRect();
  
  return (
    <div
      data-design-editor-ignore="true"
      style={{
        position: 'absolute',
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
        border: '3px dashed #10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        pointerEvents: 'none',
        zIndex: 10002,
        animation: 'pulse 1s infinite'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-24px',
        left: 0,
        backgroundColor: '#10b981',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: '6px',
        alignItems: 'center'
      }}>
        <span>🎯</span>
        <span>{ers}</span>
        <span>(Taşınıyor...)</span>
      </div>
    </div>
  );
}

export default Highlighter;
