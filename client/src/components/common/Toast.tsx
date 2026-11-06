import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const configs = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
      bg: 'bg-white border-emerald-200/80',
      accent: 'bg-emerald-500',
      title: 'text-emerald-950',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
      bg: 'bg-white border-rose-200/80',
      accent: 'bg-rose-500',
      title: 'text-rose-950',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      bg: 'bg-white border-amber-200/80',
      accent: 'bg-amber-500',
      title: 'text-amber-950',
    },
    info: {
      icon: <Info className="w-5 h-5 text-forest-600 flex-shrink-0" />,
      bg: 'bg-white border-forest-200/80',
      accent: 'bg-forest-600',
      title: 'text-forest-950',
    },
  };

  const current = configs[toast.type];

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3 w-full max-w-sm rounded-xl p-3.5 shadow-elevated border
        ${current.bg} overflow-hidden transition-all duration-300 animate-in slide-in-from-top-2 fade-in
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${current.accent}`} />
      <div className="pt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0 pr-2">
        {toast.title && (
          <h4 className={`text-xs font-bold leading-tight ${current.title} mb-0.5`}>
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-stone-700 leading-relaxed break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

