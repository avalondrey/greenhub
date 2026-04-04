import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((msg, duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(msg);
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(46,204,113,0.4)',
          borderRadius: 12, padding: '12px 24px', fontSize: 14, color: '#2ecc71',
          zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
          animation: 'slideUp 0.2s ease',
        }}>
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
