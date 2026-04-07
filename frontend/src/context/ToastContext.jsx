import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ icon, title, description, duration = 5000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, icon, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
          <style>{`
            @keyframes toastIn {
              from { opacity: 0; transform: translateX(40px) scale(0.95); }
              to   { opacity: 1; transform: translateX(0) scale(1); }
            }
            @keyframes toastOut {
              from { opacity: 1; transform: translateX(0) scale(1); }
              to   { opacity: 0; transform: translateX(40px) scale(0.95); }
            }
          `}</style>
          {toasts.map(t => (
            <div
              key={t.id}
              onClick={() => dismissToast(t.id)}
              className="pointer-events-auto flex items-center gap-4 px-5 py-4 bg-[#1a1530] border border-[rgba(139,92,246,0.35)] rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(139,92,246,0.15)] cursor-pointer max-w-[360px] backdrop-blur-md"
              style={{
                animation: t.exiting
                  ? 'toastOut 0.3s ease-in forwards'
                  : 'toastIn 0.35s cubic-bezier(0.2,0,0.2,1)',
              }}
            >
              {t.icon && (
                <div className="flex-shrink-0 w-12 h-12 rounded-[12px] bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center overflow-hidden">
                  {typeof t.icon === 'string' && t.icon.startsWith('http') ? (
                    <img src={t.icon} alt="" className="w-9 h-9 object-contain" />
                  ) : (
                    <span className="text-2xl">{t.icon}</span>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[0.8rem] font-extrabold text-[#f0eeff] leading-tight">{t.title}</span>
                {t.description && (
                  <span className="text-[0.72rem] text-[#a78bfa] font-medium leading-tight">{t.description}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
