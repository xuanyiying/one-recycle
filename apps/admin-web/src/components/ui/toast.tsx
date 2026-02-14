'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

type PendingToast = { message: string; type: ToastType };

let globalAddToast: ((message: string, type?: ToastType) => void) | null = null;
const pendingToasts: PendingToast[] = [];

function flushPendingToasts() {
  if (globalAddToast && pendingToasts.length > 0) {
    const toasts = [...pendingToasts];
    pendingToasts.length = 0;
    toasts.forEach((t) => globalAddToast?.(t.message, t.type));
  }
}

export const toast = {
  success: (message: string) => {
    if (globalAddToast) {
      globalAddToast(message, 'success');
    } else {
      pendingToasts.push({ message, type: 'success' });
    }
  },
  error: (message: string) => {
    if (globalAddToast) {
      globalAddToast(message, 'error');
    } else {
      pendingToasts.push({ message, type: 'error' });
    }
  },
  warning: (message: string) => {
    if (globalAddToast) {
      globalAddToast(message, 'warning');
    } else {
      pendingToasts.push({ message, type: 'warning' });
    }
  },
  info: (message: string) => {
    if (globalAddToast) {
      globalAddToast(message, 'info');
    } else {
      pendingToasts.push({ message, type: 'info' });
    }
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  React.useEffect(() => {
    globalAddToast = addToast;
    flushPendingToasts();
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export const Toaster = ToastProvider;

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'text-success border-success/30 bg-success/5',
  error: 'text-error border-error/30 bg-error/5',
  warning: 'text-warning border-warning/30 bg-warning/5',
  info: 'text-info border-info/30 bg-info/5',
};

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-terminal animate-in slide-in-from-right-5 fade-in duration-200 font-mono text-sm',
            'bg-card backdrop-blur-sm',
            toastStyles[toast.type]
          )}
        >
          <span className="flex-shrink-0">{toastIcons[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 rounded-md p-0.5 hover:bg-muted/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
