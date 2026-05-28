import React from 'react';
import { motion } from 'motion/react';
import { Edit, X, Check, Trash2, ChevronDown } from 'lucide-react';
import { AppButton, ButtonSize } from '../types';
import { COLOR_PRESETS, EMOJI_PICKER } from '../data';

interface ButtonFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  onClose: () => void;
  formName: string;
  setFormName: (v: string) => void;
  formUrl: string;
  setFormUrl: (v: string) => void;
  formColor: string;
  setFormColor: (v: string) => void;
  formSize: ButtonSize;
  setFormSize: (v: ButtonSize) => void;
  formIcon: string;
  setFormIcon: (v: string) => void;
  formCategory: string;
  toggleFormCategory: (cat: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formIsPriority: boolean;
  setFormIsPriority: (v: boolean) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (v: boolean | ((p: boolean) => boolean)) => void;
  categoriesList: string[];
  dynamicCategories: string[];
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
}

export const ButtonFormModal: React.FC<ButtonFormModalProps> = ({
  isOpen,
  editingId,
  onClose,
  formName,
  setFormName,
  formUrl,
  setFormUrl,
  formColor,
  setFormColor,
  formSize,
  setFormSize,
  formIcon,
  setFormIcon,
  formCategory,
  toggleFormCategory,
  formDescription,
  setFormDescription,
  formIsPriority,
  setFormIsPriority,
  showCategoryDropdown,
  setShowCategoryDropdown,
  categoriesList,
  dynamicCategories,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !editingId) return null;

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
        className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden"
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-150 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
              <Edit className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight font-sans block">
                {editingId === 'NEW' ? 'เพิ่มแอปพลิเคชันเชื่อมโยงยา' : 'ปรับแต่งแก้ไขปุ่มทางด่วน'}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">BPH AppPortal Configurator</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-650 cursor-pointer p-1 bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="button-settings-form" onSubmit={onSave} className="space-y-4">
          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 font-sans">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">วัตถุประสงค์สัจจะของปุ่ม (Button Name)</label>
              <input 
                type="text" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)}
                placeholder="ระบบดึงฉลากยา" 
                className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium font-sans auto-cols-auto"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ที่อยู่เว็บไซต์เชื่อมต่อ (Target URL)</label>
              <input 
                type="url" 
                value={formUrl} 
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://service.bph.net" 
                className="w-full p-2 bg-white border border-slate-250 text-blue-600 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Description Box */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">คำระบุบทบาทการเข้าถึง (Short Description)</label>
            <textarea 
              value={formDescription} 
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="ระบุวัตถุประสงค์งานระบบความปลอดภัยย่อย..." 
              className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-sans"
              rows={2}
            />
          </div>

          {/* Category Selection Grid with Dropdown & Short Pills */}
          <div className="space-y-1 relative" id="category-picker-wrapper font-sans">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">หมวดสิทธิ์สมาพันธ์ (Category - เลือกได้มากกว่า 1)</label>
            <div className="relative">
              <input 
                type="text"
                readOnly
                value={formCategory}
                placeholder="คลิกเพื่อเลือกหมวดหมู่..."
                className="w-full p-2 pr-8 bg-slate-50 border border-slate-250 text-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium cursor-pointer"
                onFocus={() => setShowCategoryDropdown(true)}
                onClick={() => setShowCategoryDropdown(prev => !prev)}
              />
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(prev => !prev)}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 animate-none"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {showCategoryDropdown && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1.5 space-y-0.5">
                {categoriesList.map((cat) => {
                  const isSelected = formCategory.split(',').map(c => c.trim().toLowerCase()).includes(cat.toLowerCase());
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleFormCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  );
                })}
                {dynamicCategories.filter(cat => cat !== 'All' && !categoriesList.some(cl => cl.toLowerCase() === cat.toLowerCase())).map((cat) => {
                  const isSelected = formCategory.split(',').map(c => c.trim().toLowerCase()).includes(cat.toLowerCase());
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleFormCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-705'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 mt-1.5">
              {categoriesList.map((cat) => {
                const isSelected = formCategory.split(',').map(c => c.trim().toLowerCase()).includes(cat.toLowerCase());
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleFormCategory(cat)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200 text-blue-750 font-extrabold shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-805'
                    }`}
                  >
                    {isSelected ? `✓ ${cat}` : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ขนาดบอร์ดปุ่มลัด (Size)</label>
            <select 
              value={formSize} 
              onChange={(e) => setFormSize(e.target.value as ButtonSize)}
              className="w-full p-2 bg-white border border-slate-250 text-slate-750 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="small">เล็ก (Small)</option>
              <option value="medium">ปกติ (Medium)</option>
              <option value="large">กว้าง (Large)</option>
              <option value="xl">ใหญ่พิเศษ (X-Large)</option>
            </select>
          </div>

          {/* Color Preset Config */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ปรับแต่งเฉดสีสัญลักษณ์ย่อย (Color Preset Style)</label>
            <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = formColor === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFormColor(preset.id)}
                    className={`flex flex-col items-center justify-center p-1 border rounded-lg transition-all text-center cursor-pointer ${
                      isSelected 
                        ? 'bg-white border-blue-500 ring-2 ring-blue-100 text-blue-700 font-bold' 
                        : 'bg-transparent border-transparent hover:bg-white text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${preset.bgClass} inline-block mb-1 border border-slate-204`}></span>
                    <span className="text-[8px] font-mono tracking-tight truncate w-full">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji Symbols Picker */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ภาพไอคอนปุ่มหลัก (Emoji)</label>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">{formIcon}</span>
            </div>
            <div className="grid grid-cols-6 gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-lg max-h-20 overflow-y-auto">
              {EMOJI_PICKER.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormIcon(emoji)}
                  className={`p-1.5 text-xs rounded-md transition-all hover:bg-white flex items-center justify-center cursor-pointer select-none border border-transparent ${
                    formIcon === emoji 
                      ? 'bg-white border-blue-200 scale-110 shadow-sm' 
                      : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Switch */}
          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <input 
              type="checkbox" 
              id="form-is-priority" 
              checked={formIsPriority} 
              onChange={(e) => setFormIsPriority(e.target.checked)}
              className="w-4 h-4 text-blue-650 bg-white border-slate-350 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="form-is-priority" className="text-xs font-bold text-slate-707 cursor-pointer select-none">
              ปักหมุดเร่งด่วนพิเศษ (Hospital Priority)
            </label>
          </div>

          {/* Saves & Deletes Actions */}
          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <Check className="w-3.5 h-3.5" />
              บันทึกตั้งค่าปุ่ม
            </button>
            
            {editingId !== 'NEW' && (
              <button 
                type="button" 
                onClick={() => onDelete(editingId)}
                className="py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 text-center"
                title="ลบปุ่มทางด่วนนี้ถาวร"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ลบปุ่ม
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
