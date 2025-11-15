import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDesignEditor } from '../../contexts/DesignEditorContext';

/**
 * Dock Component - Alt Basit Menü
 * 
 * Sadece "Temizle" butonu içeren minimal alt bar.
 * ERS kodu göstermiyor, sadece seçimi temizleyip yeni seçim yapılmasını sağlıyor.
 */
function Dock() {
  const { state, dispatch } = useDesignEditor();
  const { mode, selectedElement } = state;
  
  // Dock pozisyonu (sürüklenebilir)
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 100, // Ortada
    y: window.innerHeight - 80 // Alt kısımda
  });
  
  // Sürükleme durumu
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0
  });
  
  // Görünürlük kontrolü
  if (mode === 'inactive' || !selectedElement) {
    return null;
  }
  
  // Seçimi temizle ve yeni seçim moduna geç
  const handleClearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };
  
  // Sürükleme başlangıcı
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  // Sürükleme hareketi - SADECE YATAY (X ekseni)
  const handleMouseMove = (e) => {
    if (!dragRef.current.active) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    
    const newX = dragRef.current.startPosX + deltaX;
    const minX = 0;
    const maxX = window.innerWidth - 200;
    
    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: position.y
    });
  };
  
  // Sürükleme bitişi
  const handleMouseUp = () => {
    dragRef.current.active = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
  
  return createPortal(
    <div
      data-design-editor-ignore="true"
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10000,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        borderRadius: '12px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        cursor: dragRef.current.active ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      <button
        onClick={handleClearSelection}
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        }}
      >
        <span>✕</span>
        <span>Temizle</span>
      </button>
    </div>,
    document.body
  );
}

export default Dock;
