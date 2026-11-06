import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastItem, ToastType } from '../components/common/Toast';

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, title: string = 'Success') => showToast(message, 'success', title),
    [showToast]
  );
  const error = useCallback(
    (message: string, title: string = 'Error') => showToast(message, 'error', title),
    [showToast]
  );
  const info = useCallback(
    (message: string, title: string = 'Notice') => showToast(message, 'info', title),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title: string = 'Warning') => showToast(message, 'warning', title),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, success, error, info, warning, dismissToast }}
    >
      {children}
      {/* Toast viewport */}
      <aside
        aria-label="Notifications"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

