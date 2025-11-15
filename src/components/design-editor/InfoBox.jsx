import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDesignEditor } from '../../contexts/DesignEditorContext';

/**
 * InfoBox Component - Detaylı Bilgi Paneli
 * 
 * Seçili elementin detaylı CSS özelliklerini gösteren ve düzenlemeye izin veren
 * sürüklenebilir sağ panel.
 */
function InfoBox() {
  const { state, dispatch } = useDesignEditor();
  const { mode, selectedElement } = state;
  
  // Element CSS özellikleri
  const [properties, setProperties] = useState({
    width: 0,
    height: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    backgroundColor: '#000000',
    color: '#ffffff',
    display: 'block'
  });
  
  // Panel pozisyonu (sürüklenebilir)
  const [position, setPosition] = useState({
    x: window.innerWidth - 320, // Sağ tarafta
    y: 100 // Üst kısımda
  });
  
  // Sürükleme durumu
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0
  });
  
  // Element değiştiğinde CSS özelliklerini yükle
  useEffect(() => {
    if (!selectedElement) return;
    
    const element = selectedElement.element;
    const computed = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    setProperties({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      marginTop: parseInt(computed.marginTop) || 0,
      marginRight: parseInt(computed.marginRight) || 0,
      marginBottom: parseInt(computed.marginBottom) || 0,
      marginLeft: parseInt(computed.marginLeft) || 0,
      paddingTop: parseInt(computed.paddingTop) || 0,
      paddingRight: parseInt(computed.paddingRight) || 0,
      paddingBottom: parseInt(computed.paddingBottom) || 0,
      paddingLeft: parseInt(computed.paddingLeft) || 0,
      backgroundColor: rgbToHex(computed.backgroundColor),
      color: rgbToHex(computed.color),
      display: computed.display
    });
  }, [selectedElement]);
  
  // Görünürlük kontrolü
  if (mode === 'inactive' || !selectedElement) {
    return null;
  }
  
  // Element bilgilerini al
  const element = selectedElement.element;
  const computedStyle = window.getComputedStyle(element);
  
  // Özellik değişikliği handler'ı
  const handlePropertyChange = (property, value) => {
    setProperties(prev => ({ ...prev, [property]: value }));
    
    // DOM'a anında uygula
    const element = selectedElement.element;
    
    switch (property) {
      case 'width':
        element.style.width = `${value}px`;
        break;
      case 'height':
        element.style.height = `${value}px`;
        break;
      case 'marginTop':
      case 'marginRight':
      case 'marginBottom':
      case 'marginLeft':
        element.style[property] = `${value}px`;
        break;
      case 'paddingTop':
      case 'paddingRight':
      case 'paddingBottom':
      case 'paddingLeft':
        element.style[property] = `${value}px`;
        break;
      case 'backgroundColor':
      case 'color':
        element.style[property] = value;
        break;
      case 'display':
        element.style.display = value;
        break;
    }
    
    // Boyut değişikliklerinde highlight'ı güncelle
    if (property === 'width' || property === 'height') {
      const rect = element.getBoundingClientRect();
      dispatch({
        type: 'SET_SELECTED_ELEMENT',
        payload: {
          element,
          ers: selectedElement.ers,
          rect
        }
      });
    }
  };
  
  // Önemli CSS özellikleri
  const cssProperties = [
    { label: 'Display', value: computedStyle.display },
    { label: 'Position', value: computedStyle.position },
    { label: 'Width', value: computedStyle.width },
    { label: 'Height', value: computedStyle.height },
    { label: 'Padding', value: computedStyle.padding },
    { label: 'Margin', value: computedStyle.margin },
    { label: 'Background', value: computedStyle.backgroundColor },
    { label: 'Color', value: computedStyle.color },
    { label: 'Font Size', value: computedStyle.fontSize },
    { label: 'Font Family', value: computedStyle.fontFamily?.split(',')[0] },
    { label: 'Border', value: computedStyle.border || 'none' },
    { label: 'Border Radius', value: computedStyle.borderRadius },
    { label: 'Z-Index', value: computedStyle.zIndex }
  ];
  
  // Sürükleme başlangıcı
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    
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
  
  // Sürükleme hareketi
  const handleMouseMove = (e) => {
    if (!dragRef.current.active) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    setPosition({
      x: dragRef.current.startPosX + deltaX,
      y: dragRef.current.startPosY + deltaY
    });
  };
  
  // Sürükleme bitişi
  const handleMouseUp = () => {
    dragRef.current.active = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Paneli kapat
  const handleClose = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
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
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        borderRadius: '12px',
        width: '350px',
        maxHeight: '700px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        cursor: dragRef.current.active ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '4px'
          }}>
            Element Özellikleri
          </div>
          <div style={{
            fontSize: '10px',
            color: '#60a5fa',
            fontFamily: 'monospace'
          }}>
            {element.tagName.toLowerCase()}#{element.id || 'no-id'}
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          ✕
        </button>
      </div>
      
      {/* ERS Kodu */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)'
      }}>
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          ERS Code
        </div>
        <div style={{
          fontSize: '11px',
          color: '#60a5fa',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          lineHeight: '1.4'
        }}>
          {selectedElement.ers}
        </div>
      </div>
      
      {/* Düzenleme Özellikleri */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px'
      }}>
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 'bold'
        }}>
          Düzenleme
        </div>
        
        {/* Boyutlar */}
        <PropertySlider
          label="Genişlik"
          value={properties.width}
          min={20}
          max={2000}
          onChange={(v) => handlePropertyChange('width', v)}
        />
        
        <PropertySlider
          label="Yükseklik"
          value={properties.height}
          min={20}
          max={2000}
          onChange={(v) => handlePropertyChange('height', v)}
        />
        
        {/* Display */}
        <PropertyDropdown
          label="Display"
          value={properties.display}
          options={['block', 'inline-block', 'flex', 'grid', 'inline', 'none']}
          onChange={(v) => handlePropertyChange('display', v)}
        />
        
        {/* Renkler */}
        <PropertyColor
          label="Arkaplan Rengi"
          value={properties.backgroundColor}
          onChange={(v) => handlePropertyChange('backgroundColor', v)}
        />
        
        <PropertyColor
          label="Metin Rengi"
          value={properties.color}
          onChange={(v) => handlePropertyChange('color', v)}
        />
        
        {/* Margin */}
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Margin (Dış Boşluk)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <PropertySlider
              label="Üst"
              value={properties.marginTop}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('marginTop', v)}
              compact
            />
            <PropertySlider
              label="Sağ"
              value={properties.marginRight}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('marginRight', v)}
              compact
            />
            <PropertySlider
              label="Alt"
              value={properties.marginBottom}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('marginBottom', v)}
              compact
            />
            <PropertySlider
              label="Sol"
              value={properties.marginLeft}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('marginLeft', v)}
              compact
            />
          </div>
        </div>
        
        {/* Padding */}
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Padding (İç Boşluk)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <PropertySlider
              label="Üst"
              value={properties.paddingTop}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('paddingTop', v)}
              compact
            />
            <PropertySlider
              label="Sağ"
              value={properties.paddingRight}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('paddingRight', v)}
              compact
            />
            <PropertySlider
              label="Alt"
              value={properties.paddingBottom}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('paddingBottom', v)}
              compact
            />
            <PropertySlider
              label="Sol"
              value={properties.paddingLeft}
              min={0}
              max={100}
              onChange={(v) => handlePropertyChange('paddingLeft', v)}
              compact
            />
          </div>
        </div>
        
        {/* Computed Styles (read-only) */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{
            fontSize: '10px',
            color: '#9ca3af',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Computed Styles
          </div>
          
          {cssProperties.map((prop, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: index < cssProperties.length - 1 ? '1px solid rgba(55, 65, 81, 0.3)' : 'none',
                gap: '12px'
              }}
            >
              <div style={{
                fontSize: '10px',
                color: '#9ca3af',
                minWidth: '80px',
                flexShrink: 0
              }}>
                {prop.label}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#fff',
                fontFamily: 'monospace',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {prop.value}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(59, 130, 246, 0.3)',
        fontSize: '10px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        💡 Sürükleyerek taşıyabilirsin
      </div>
    </div>,
    document.body
  );
}

// Yardımcı Bileşenler
function PropertySlider({ label, value, min, max, onChange, compact }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '4px',
        color: '#9ca3af',
        fontSize: compact ? '9px' : '10px'
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color: '#fff' }}>{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          cursor: 'pointer',
          accentColor: '#3b82f6'
        }}
      />
    </div>
  );
}

function PropertyDropdown({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ marginBottom: '4px', color: '#9ca3af', fontSize: '10px' }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px',
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '10px',
          cursor: 'pointer'
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function PropertyColor({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ marginBottom: '4px', color: '#9ca3af', fontSize: '10px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '32px',
            height: '26px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: '5px',
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '10px',
            fontFamily: 'monospace'
          }}
        />
      </div>
    </div>
  );
}

// RGB -> HEX dönüştürücü
function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '#000000';
  
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export default InfoBox;
