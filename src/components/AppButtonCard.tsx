import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Edit, ExternalLink } from 'lucide-react';
import { AppButton } from '../types';

interface AppButtonCardProps {
  btn: AppButton;
  isAdminMode: boolean;
  onEdit: (btn: AppButton) => void;
  onLaunch: (btn: AppButton) => void;
}

export const AppButtonCard: React.FC<AppButtonCardProps> = ({
  btn,
  isAdminMode,
  onEdit,
  onLaunch,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'col-span-1 p-5',
    medium: 'col-span-1 p-5.5',
    large: 'col-span-1 sm:col-span-2 p-5.5 flex flex-col justify-between min-h-[170px]',
    xl: 'col-span-1 sm:col-span-2 p-5.5 flex flex-col justify-between min-h-[195px] border-l-4 border-l-[#002D62]'
  }[btn.size || 'medium'] || 'col-span-1 p-5.5';

  const getTheme = () => {
    const categoryStr = btn.category || 'อื่นๆ';
    const cat = categoryStr.split(',')[0].trim().toUpperCase();
    if (cat.includes('OPD')) {
      return {
        bg: '#f0fdf4',
        border: '#10b981',
        glow: '0px 8px 25px rgba(16, 185, 129, 0.15)',
        badgeBg: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
        activeBg: '#dcfce7',
        textColor: '#065f46',
      };
    }
    if (cat.includes('IPD')) {
      return {
        bg: '#f5f3ff',
        border: '#8b5cf6',
        glow: '0px 8px 25px rgba(139, 92, 246, 0.15)',
        badgeBg: 'bg-violet-100/80 text-violet-850 border-violet-200',
        activeBg: '#ede9fe',
        textColor: '#5b21b6',
      };
    }
    if (cat.includes('IV')) {
      return {
        bg: '#ecfeff',
        border: '#06b6d4',
        glow: '0px 8px 25px rgba(6, 182, 212, 0.15)',
        badgeBg: 'bg-cyan-100/80 text-cyan-850 border-cyan-200',
        activeBg: '#cffafe',
        textColor: '#0e7490',
      };
    }
    if (cat.includes('DIS')) {
      return {
        bg: '#fff7ed',
        border: '#f97316',
        glow: '0px 8px 25px rgba(249, 115, 22, 0.15)',
        badgeBg: 'bg-orange-100/80 text-orange-850 border-orange-200',
        activeBg: '#ffedd5',
        textColor: '#c2410c',
      };
    }
    if (cat.includes('HELP') || cat.includes('ผู้ช่วย')) {
      return {
        bg: '#fff1f2',
        border: '#f43f5e',
        glow: '0px 8px 25px rgba(244, 63, 94, 0.15)',
        badgeBg: 'bg-rose-100/80 text-rose-850 border-rose-200',
        activeBg: '#ffe4e6',
        textColor: '#be123c',
      };
    }
    
    return {
      bg: '#eff6ff',
      border: '#3b82f6',
      glow: '0px 8px 25px rgba(59, 130, 246, 0.15)',
      badgeBg: 'bg-blue-100/80 text-blue-850 border-blue-200',
      activeBg: '#dbeafe',
      textColor: '#1e40af',
    };
  };

  const theme = getTheme();

  const cardStyle = isHovered 
    ? {
        background: theme.bg,
        borderColor: theme.border,
        boxShadow: theme.glow,
        color: theme.textColor,
      }
    : {
        background: '#ffffff',
        borderColor: btn.isPriority ? '#fca5a5' : '#e2e8f0',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
        color: '#0f172a',
      };

  const handleEditClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(btn);
  };

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLaunch(btn);
  };

  return (
    <motion.div
      key={btn.id}
      id={`button-item-${btn.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
      className={`relative rounded-xl group border overflow-hidden flex flex-col transition-[background,border-color,box-shadow,color] duration-500 ease-out ${sizeClasses} ${
        isAdminMode ? '' : 'cursor-pointer'
      }`}
      layout
      whileHover={isAdminMode ? { y: -2 } : { scale: 1.03, y: -2, zIndex: 10 }}
      whileTap={isAdminMode ? undefined : { 
        scale: 0.98,
        y: 2,
        background: theme.activeBg,
        boxShadow: '0px 0px 0px rgba(0,0,0,0)',
        transition: { duration: 0.08 }
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
    >
      {/* ส่วนเนื้อหา — คลิกเปิดลิงก์ได้เฉพาะโหมดผู้ใช้ทั่วไป */}
      <div
        className={`flex flex-col flex-1 min-h-0 ${isAdminMode ? '' : 'cursor-pointer'}`}
        onClick={isAdminMode ? undefined : () => onLaunch(btn)}
        role={isAdminMode ? undefined : 'button'}
        tabIndex={isAdminMode ? undefined : 0}
        onKeyDown={isAdminMode ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onLaunch(btn);
          }
        }}
      >
        <div className="flex justify-between items-start mb-2.5 gap-2 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl select-none transition-all duration-300 shrink-0 ${
              isHovered 
                ? 'bg-white border border-slate-300 text-slate-800 rotate-6 scale-110 shadow-xs' 
                : 'bg-slate-50 border border-slate-200 text-slate-800'
            }`}>
              {btn.icon}
            </div>
            
            {(btn.size === 'small' || btn.size === 'medium') && (
              <div className="truncate font-sans min-w-0">
                <h3 
                  className={`font-black text-[15px] sm:text-[17px] tracking-tight truncate transition-all duration-300 ${
                    isHovered ? 'tracking-wide' : ''
                  }`}
                  style={{ color: isHovered ? theme.textColor : '#0f172a' }}
                >
                  {btn.name}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(btn.category || 'อื่นๆ').split(',').map(c => c.trim()).filter(Boolean).map(cat => (
                    <span 
                      key={cat} 
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider font-bold transition-colors duration-300 ${
                        isHovered 
                          ? theme.badgeBg 
                          : 'text-blue-750 bg-blue-50/50 border-blue-100'
                      }`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {btn.isPriority && (
              <span className={`text-[10px] border font-bold px-1.5 py-0.5 rounded shadow-ns uppercase tracking-wider font-mono transition-colors duration-300 ${
                isHovered 
                  ? 'bg-rose-100 text-rose-800 border-rose-300' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                PRIORITY
              </span>
            )}
          </div>
        </div>

        {(btn.size === 'large' || btn.size === 'xl') && (
          <div className="my-2.5 font-sans">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 
                className="text-[17px] sm:text-[19px] font-black tracking-tight transition-all duration-300"
                style={{ color: isHovered ? theme.textColor : '#0f172a' }}
              >
                {btn.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                {(btn.category || 'อื่นๆ').split(',').map(c => c.trim()).filter(Boolean).map(cat => (
                  <span 
                    key={cat} 
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase border transition-colors duration-300 ${
                      isHovered 
                        ? theme.badgeBg 
                        : 'text-blue-700 bg-blue-50 border border-blue-100'
                    }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <p className={`text-[15px] leading-relaxed font-sans line-clamp-3 transition-colors duration-300 ${
              isHovered ? 'text-slate-600 font-medium' : 'text-slate-655'
            }`}>
              {btn.description || 'ไม่มีคำระบุขยายวัตถุประสงค์สมาสของสารสนเทศนี้ภายนอกโรงพยาบาล'}
            </p>
          </div>
        )}

        {(btn.size === 'small' || btn.size === 'medium') && btn.description && (
          <p className={`text-[15px] leading-snug line-clamp-2 my-1.5 flex-1 font-sans transition-colors duration-300 ${
            isHovered ? 'text-slate-600 font-medium' : 'text-slate-655'
          }`}>
            {btn.description}
          </p>
        )}

        <div className={`mt-auto pt-3 border-t flex items-center justify-between gap-2 transition-colors duration-300 ${
          isHovered ? 'border-slate-200/60' : 'border-slate-100'
        }`}>
          <span className={`text-xs font-sans flex items-center gap-1.5 select-none font-medium transition-colors duration-300 ${
            isHovered ? 'text-slate-500' : 'text-slate-500'
          }`}>
            📊 เปิดใช้งาน <strong className="font-mono font-extrabold transition-colors duration-300" style={{ color: isHovered ? theme.textColor : '#1e293b' }}>{btn.clicks}</strong> ครั้ง
          </span>
        </div>
      </div>

      {/* แถบปุ่ม Admin — แยกจากการคลิกเปิดลิงก์ */}
      {isAdminMode && (
        <div
          className="relative z-20 flex gap-2 px-1 pb-1 pt-2 border-t border-slate-200/80 bg-white/60"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleEditClick}
            className="flex-1 min-h-[48px] px-3 py-2.5 bg-[#002D62] hover:bg-[#001D42] active:bg-[#001530] text-white rounded-xl text-sm font-extrabold cursor-pointer transition-all shadow-md inline-flex items-center justify-center gap-2 select-none touch-manipulation"
            title="แก้ไขปุ่มนี้"
            aria-label={`แก้ไข ${btn.name}`}
          >
            <Edit className="w-5 h-5 shrink-0" />
            <span>แก้ไข</span>
          </button>
          <button
            type="button"
            onClick={handleLaunchClick}
            className="min-h-[48px] min-w-[48px] px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold cursor-pointer transition-all border border-slate-250 inline-flex items-center justify-center gap-1.5 select-none touch-manipulation"
            title="เปิดลิงก์"
            aria-label={`เปิด ${btn.name}`}
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline">เปิด</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
