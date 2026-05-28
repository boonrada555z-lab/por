import React from 'react';
import { motion } from 'motion/react';
import { Bell, X, Volume2 } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  if (!isOpen || !message) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/35 flex items-center justify-center p-4 z-[120] backdrop-blur-sm"
      id="popup-notification-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 25 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden font-sans"
        id="popup-notification-modal"
      >
        {/* Colored top indicator line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-[#B82025]" />

        {/* Modal Close Icon */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic header announcement */}
        <div className="flex items-center gap-3.5 border-b border-rose-100 pb-3.5 mb-5 font-sans">
          <div className="w-11 h-11 bg-rose-50 text-[#B82025] border border-rose-100 rounded-2xl flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 leading-none">
              การแจ้งเตือนประชาสัมพันธ์ด่วน <span>🔔</span>
            </h3>
            <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest block leading-none mt-1">BPH Administrative Announcement</span>
          </div>
        </div>

        {/* Content detail rendering scrollable */}
        <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap max-h-60 overflow-y-auto pr-2 my-2.5 font-sans antialiased text-justify">
          {message}
        </p>

        {/* Control Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-100 font-sans mt-5">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-[#B82025] hover:bg-red-750 text-white text-xs font-black rounded-xl cursor-pointer shadow-md tracking-wider transition-all"
          >
            ฉันรับทราบประกาศแล้ว (Acknowledge)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
