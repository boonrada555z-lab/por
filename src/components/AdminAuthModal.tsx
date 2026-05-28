import React from 'react';
import { motion } from 'motion/react';
import { Shield, X, AlertTriangle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminAuthStep: number;
  adminAuthInput: string;
  setAdminAuthInput: (val: string) => void;
  adminAuthError: string;
  adminAuthShaking: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  adminAuthStep,
  adminAuthInput,
  setAdminAuthInput,
  adminAuthError,
  adminAuthShaking,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/35 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 25 }}
        animate={adminAuthShaking ? { x: [-10, 10, -10, 10, 0], scale: 1, y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 25 }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden"
        transition={{ type: 'spring', damping: 22, stiffness: 280, x: { type: 'tween', ease: 'easeInOut', duration: 0.4 } }}
      >
        {/* Top accent border */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#002D62]" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4 font-sans">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-750" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              Admin Authenticator
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress step dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-10 h-2 rounded-full transition-all duration-300 ${adminAuthStep >= 1 ? 'bg-[#002D62]' : 'bg-slate-200'}`} />
          <div className={`w-10 h-2 rounded-full transition-all duration-300 ${adminAuthStep >= 2 ? 'bg-[#002D62]' : 'bg-slate-200'}`} />
          <div className={`w-10 h-2 rounded-full transition-all duration-300 ${adminAuthStep >= 3 ? 'bg-[#002D62]' : 'bg-slate-200'}`} />
        </div>

        <div className="text-center my-3 font-sans">
          <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-extrabold max-w-max inline-block mb-1.5">
            🔑 สำหรับ ผู้ดูแลระบบ ({adminAuthStep}/3)
          </span>
          <div className="leading-relaxed px-1 font-bold">
            {adminAuthStep === 1 && (
              <span className="text-xs text-rose-600 block">สำหรับ admin เท่านั้น</span>
            )}
            {adminAuthStep === 2 && (
              <span className="text-xs text-rose-600 block">สำหรับ admin เท่านั้นไง !!!!</span>
            )}
            {adminAuthStep === 3 && (
              <span className="text-lg text-rose-600 font-extrabold block">ยังอีก !!!!</span>
            )}
          </div>
          <p className="text-[11px] text-slate-450 mt-1 font-semibold">
            กรุณากรอกรหัสผ่านเพื่อยืนยันสิทธิ์เข้าใช้งานระบบแอดมิน
          </p>
        </div>

        {adminAuthError && (
          <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-[11px] text-rose-700 text-center mb-4 flex items-center justify-center gap-1.5 font-sans font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{adminAuthError}</span>
          </div>
        )}

        <form 
          onSubmit={onSubmit} 
          className="space-y-4 font-sans"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center">
              {adminAuthStep === 1 && 'ป้อนรหัสผ่านสำหรับ Admin ขั้นที่ 1'}
              {adminAuthStep === 2 && 'ป้อนรหัสผ่านสำหรับ Admin ขั้นที่ 2'}
              {adminAuthStep === 3 && 'ป้อนรหัสผ่านสำหรับ Admin ขั้นที่ 3'}
            </label>
            
            <input 
              type="password"
              autoFocus
              required
              value={adminAuthInput}
              onChange={(e) => setAdminAuthInput(e.target.value)}
              placeholder="ป้อนรหัสผ่าน"
              className="w-full text-center p-2.5 bg-slate-50 border border-slate-205 text-slate-800 rounded-xl focus:ring-2 focus:ring-blue-105 outline-none text-sm font-mono font-bold"
            />
          </div>
          
          <div className="flex gap-2 font-sans pt-1">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-[#002D62] hover:bg-[#002D62]/90 text-white rounded-xl text-xs font-black cursor-pointer transition-all"
            >
              ยืนยัน (Confirm Step {adminAuthStep})
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
