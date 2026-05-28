import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Info, Shield } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const accentColorClass = {
    danger: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-indigo-600'
  }[type];

  const iconBgClass = {
    danger: 'bg-red-50 text-red-700 border-red-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  }[type];

  const btnConfirmColor = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: 'bg-indigo-600 hover:bg-indigo-700'
  }[type];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm"
      id="custom-confirm-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 25 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden"
        id="custom-confirm-modal"
      >
        {/* Highlight accent on top based on type */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${accentColorClass}`} />

        <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-4 ${iconBgClass}`}>
          {type === 'danger' && <AlertTriangle className="w-6 h-6" />}
          {type === 'warning' && <AlertTriangle className="w-6 h-6" />}
          {type === 'info' && <Info className="w-6 h-6" />}
        </div>

        <h3 className="text-sm font-black text-slate-800 tracking-tight text-center font-sans">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-2 font-bold leading-relaxed text-center font-sans">
          {message}
        </p>

        <div className="flex gap-2 mt-6 font-sans">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 ${btnConfirmColor} text-white rounded-xl text-xs font-black cursor-pointer transition-all`}
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-100"
          >
            {cancelText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
