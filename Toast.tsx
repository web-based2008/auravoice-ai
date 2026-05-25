import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertTriangle, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children, lang }: { children: ReactNode; lang: 'en' | 'ar' }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const isRtl = lang === 'ar';

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        id="toast-container"
        className={`fixed z-50 bottom-6 max-w-sm w-full px-4 flex flex-col gap-2 pointer-events-none ${
          isRtl ? 'left-0 sm:left-6' : 'right-0 sm:right-6'
        }`}
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgColor = 'bg-slate-900/90 border-cyan-500/30 text-slate-100';
            let Icon = Sparkles;
            let iconColor = 'text-cyan-400';

            if (toast.type === 'success') {
              bgColor = 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100';
              Icon = Check;
              iconColor = 'text-emerald-400';
            } else if (toast.type === 'error') {
              bgColor = 'bg-rose-950/90 border-rose-500/30 text-rose-100';
              Icon = X;
              iconColor = 'text-rose-400';
            } else if (toast.type === 'warning') {
              bgColor = 'bg-amber-950/90 border-amber-500/30 text-amber-100';
              Icon = AlertTriangle;
              iconColor = 'text-amber-400';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.23 }}
                className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border pointer-events-auto w-full`}
              >
                <div className={`p-1.5 rounded-lg bg-white/5 ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
