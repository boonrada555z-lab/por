import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { AppButton } from '../types';

interface RedirectionModalProps {
  activeApp: AppButton | null;
}

export const RedirectionModal: React.FC<RedirectionModalProps> = ({ activeApp }) => {
  if (!activeApp) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/35 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 25 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden font-sans text-center"
      >
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600 animate-pulse" />
        
        <div className="w-12 h-12 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ExternalLink className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-black text-slate-800 tracking-tight">
          กำลังเปลี่ยนเส้นทางความปลอดภัย
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-bold">
          เพื่อความปลอดภัยของระบบ กำลังเปิดลิงก์ {activeApp.name} ในหน้าต่างใหม่...
        </p>

        {/* Progress Bar Animation */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-6 mb-2 border border-slate-200/60 font-sans">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            className="bg-indigo-600 h-full rounded-full"
            transition={{ duration: 0.65 }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
          BPH SECURE ENVELOPE GATEWAY
        </span>
      </motion.div>
    </motion.div>
  );
};
