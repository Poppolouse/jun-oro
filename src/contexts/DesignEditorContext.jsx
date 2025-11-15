import { createContext, useContext, useReducer } from 'react';

/**
 * DesignEditorContext - Tasarım Modunun Merkezi Beyni
 * 
 * Bu Context, tüm tasarım modu state'ini yönetir.
 * Diğer bileşenler bu beyne rapor verir ve buradan bilgi alır.
 */

const DesignEditorContext = createContext(null);

/**
 * Initial State - Başlangıç Durumu
 */
const initialState = {
  // Sistem modu: 'inactive' | 'select' | 'design'
  mode: 'inactive',
  
  // Farenin üzerinde olduğu element
  hoveredElement: null, // { element: HTMLElement, ers: string, rect: DOMRect }
  
  // Seçilen element (tasarım modunda düzenlenmek için)
  selectedElement: null, // { element: HTMLElement, ers: string, rect: DOMRect }
  
  // Seçim kilidi (bir element seçiliyken başka seçim yapılmasını engeller)
  selectionLocked: false,
  
  // Child taşıma durumu
  childMoveState: {
    isActive: false, // Taşıma modu aktif mi?
    childElement: null, // Taşınacak child element
    childErs: null, // Child'ın ERS kodu
    scanProgress: 0, // 0-100 arası tarama ilerlemesi
    startTime: null // Basılı tutma başlangıç zamanı
  },
  
  // Toast bildirimi (ERS kopyalama için)
  toast: {
    visible: false,
    message: '',
    ers: ''
  }
};

/**
 * Reducer - State Değişikliklerini Yöneten Beyin Fonksiyonu
 */
function designEditorReducer(state, action) {
  // Detaylı log
  if (action.type === 'SET_SELECTED_ELEMENT') {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  🧠 REDUCER: SET_SELECTED_ELEMENT                    ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('⏰ Reducer timestamp:', new Date().toLocaleTimeString('tr-TR', { hour12: false, fractionalSecondDigits: 3 }));
    console.log('📦 Payload:');
    console.log('  - ERS:', action.payload.ers);
    console.log('  - Rect:', {
      width: Math.round(action.payload.rect.width),
      height: Math.round(action.payload.rect.height),
      left: Math.round(action.payload.rect.left),
      top: Math.round(action.payload.rect.top)
    });
    console.log('🔄 State güncelleniyor...');
    console.log('  - Önceki selectedElement:', state.selectedElement ? state.selectedElement.ers : 'null');
    console.log('  - Yeni selectedElement:', action.payload.ers);
    console.log('  - selectionLocked: false → true');
  }
  
  if (action.type === 'SET_MODE') {
    console.log('🧠 Reducer: SET_MODE →', action.payload);
  }
  
  switch (action.type) {
    case 'SET_MODE':
      // Mod değiştiğinde seçimleri temizle
      return {
        ...state,
        mode: action.payload,
        hoveredElement: action.payload === 'inactive' ? null : state.hoveredElement,
        selectedElement: action.payload === 'inactive' ? null : state.selectedElement,
        selectionLocked: false
      };
    
    case 'SET_HOVERED_ELEMENT':
      // Seçim kilitliyse hover değişmez
      if (state.selectionLocked) {
        return state;
      }
      return {
        ...state,
        hoveredElement: action.payload
      };
    
    case 'SET_SELECTED_ELEMENT':
      const newState = {
        ...state,
        selectedElement: action.payload,
        hoveredElement: null, // Seçim yapıldığında hover'ı temizle
        selectionLocked: true // Seçim yap ve kilitle
      };
      console.log('✓ State güncellendi');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return newState;
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedElement: null,
        selectionLocked: false
      };
    
    case 'SHOW_TOAST':
      return {
        ...state,
        toast: {
          visible: true,
          message: action.payload.message,
          ers: action.payload.ers
        }
      };
    
    case 'HIDE_TOAST':
      return {
        ...state,
        toast: {
          ...state.toast,
          visible: false
        }
      };
    
    case 'START_CHILD_SCAN':
      return {
        ...state,
        childMoveState: {
          isActive: false,
          childElement: action.payload.element,
          childErs: action.payload.ers,
          scanProgress: 0,
          startTime: Date.now()
        }
      };
    
    case 'UPDATE_SCAN_PROGRESS':
      return {
        ...state,
        childMoveState: {
          ...state.childMoveState,
          scanProgress: action.payload
        }
      };
    
    case 'ACTIVATE_CHILD_MOVE':
      return {
        ...state,
        childMoveState: {
          ...state.childMoveState,
          isActive: true,
          scanProgress: 100
        }
      };
    
    case 'CANCEL_CHILD_MOVE':
      return {
        ...state,
        childMoveState: {
          isActive: false,
          childElement: null,
          childErs: null,
          scanProgress: 0,
          startTime: null
        }
      };
    
    case 'COMPLETE_CHILD_MOVE':
      // Child elementi yeni parent'a taşı
      const { childElement, newParent } = action.payload;
      if (childElement && newParent) {
        newParent.appendChild(childElement);
      }
      return {
        ...state,
        childMoveState: {
          isActive: false,
          childElement: null,
          childErs: null,
          scanProgress: 0,
          startTime: null
        }
      };
    
    default:
      return state;
  }
}

/**
 * Provider Component - Merkezi Beyni Sağlayan Bileşen
 */
export function DesignEditorProvider({ children }) {
  const [state, dispatch] = useReducer(designEditorReducer, initialState);
  
  return (
    <DesignEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </DesignEditorContext.Provider>
  );
}

/**
 * Custom Hook - Context'e Kolay Erişim
 */
export function useDesignEditor() {
  const context = useContext(DesignEditorContext);
  if (!context) {
    throw new Error('useDesignEditor must be used within DesignEditorProvider');
  }
  return context;
}
