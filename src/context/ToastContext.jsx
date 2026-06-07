// Developer: AKARSHANA
// src/context/ToastContext.jsx — Global toast notification system
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCheckCircle, HiExclamationCircle,
  HiInformationCircle, HiX,
} from "react-icons/hi";

const ToastCtx = createContext(null);

const STYLES = {
  success: {
    Icon: HiCheckCircle,
    color: "text-green-400",
    border: "border-green-400/30",
    bg: "bg-green-400/5",
  },
  error: {
    Icon: HiExclamationCircle,
    color: "text-red-400",
    border: "border-red-400/30",
    bg: "bg-red-400/5",
  },
  info: {
    Icon: HiInformationCircle,
    color: "text-cyan",
    border: "border-cyan/30",
    bg: "bg-cyan/5",
  },
  warning: {
    Icon: HiExclamationCircle,
    color: "text-yellow-400",
    border: "border-yellow-400/30",
    bg: "bg-yellow-400/5",
  },
};

function ToastItem({ toast, onRemove }) {
  const s = STYLES[toast.type] || STYLES.info;
  const { Icon } = s;

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-start gap-3 glass-card p-4 border ${s.border} ${s.bg}
                  w-[300px] shadow-xl`}
    >
      <Icon className={`${s.color} shrink-0 mt-0.5`} size={18} />
      <span className="text-sm text-white/80 font-rajdhani flex-1 leading-relaxed">
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/25 hover:text-white shrink-0 transition-colors mt-0.5"
      >
        <HiX size={13} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      duration
    );
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container — fixed bottom-right, above cart bar */}
      <div className="fixed bottom-24 right-4 z-[9997] flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
