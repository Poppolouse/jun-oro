import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDesignEditor } from '../../contexts/DesignEditorContext';

/**
 * ToastNotification Component
 * 
 * ERS kopyalama bildirimi gösterir
 * 2 saniye sonra otomatik kapanır
 */
function ToastNotification() {
  const { state, dispatch } = useDesignEditor();
  const { toast } = state;

  /**
   * Toast görünür olduğunda 2 saniye sonra kapat
   */
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST' });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [toast.visible, dispatch]);

  if (!toast.visible) {
    return null;
  }

  return createPortal(
    <div
      data-design-editor-ignore="true"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
        pointerEvents: 'none'
      }}
    >
      <div style={{
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid #10b981',
        borderRadius: '12px',
        padding: '16px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px'
      }}>
        {/* Başarı ikonu */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        {/* İçerik */}
        <div style={{ flex: 1 }}>
          <p style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: '14px',
            margin: 0,
            marginBottom: '4px'
          }}>
            {toast.message}
          </p>
          <p style={{
            color: '#10b981',
            fontFamily: 'monospace',
            fontSize: '11px',
            margin: 0,
            wordBreak: 'break-all'
          }}>
            {toast.ers}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ToastNotification;
