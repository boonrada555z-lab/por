import { AppButton } from './types';

/** ไม่มีปุ่มตัวอย่าง — โหลดจาก Google Sheet เท่านั้น */
export const INITIAL_BUTTONS: AppButton[] = [];

export interface ColorPreset {
  id: string;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'navy', name: 'Navy Blue', bgClass: 'bg-blue-650 hover:bg-blue-700', borderClass: 'border-slate-200', textClass: 'text-blue-700', badgeBg: 'bg-blue-50 text-blue-700 border border-blue-100' },
  { id: 'blue', name: 'Azure Blue', bgClass: 'bg-indigo-600 hover:bg-indigo-700', borderClass: 'border-slate-200', textClass: 'text-indigo-700', badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
  { id: 'crimson', name: 'Crimson Red', bgClass: 'bg-rose-600 hover:bg-rose-700', borderClass: 'border-slate-200', textClass: 'text-red-700', badgeBg: 'bg-rose-50 text-rose-700 border border-rose-100' },
  { id: 'coral', name: 'Bright Orange', bgClass: 'bg-orange-600 hover:bg-orange-700', borderClass: 'border-slate-200', textClass: 'text-orange-700', badgeBg: 'bg-orange-50 text-orange-700 border border-orange-100' },
  { id: 'cyan', name: 'Cyan Blue', bgClass: 'bg-cyan-600 hover:bg-cyan-700', borderClass: 'border-slate-200', textClass: 'text-cyan-700', badgeBg: 'bg-cyan-50 text-cyan-700 border border-cyan-100' },
  { id: 'rose', name: 'Rose Pink', bgClass: 'bg-rose-500 hover:bg-rose-600', borderClass: 'border-slate-200', textClass: 'text-rose-700', badgeBg: 'bg-rose-50 text-rose-700 border border-rose-100' },
  { id: 'indigo', name: 'Violet Purple', bgClass: 'bg-violet-600 hover:bg-violet-750', borderClass: 'border-slate-200', textClass: 'text-violet-700', badgeBg: 'bg-violet-50 text-violet-700 border border-violet-100' },
  { id: 'slate', name: 'Slate Gray', bgClass: 'bg-slate-600 hover:bg-slate-700', borderClass: 'border-slate-200', textClass: 'text-slate-750', badgeBg: 'bg-slate-100 text-slate-750 border border-slate-200' },
];

export const CATEGORIES = ['All', 'OPD', 'IPD', 'IV', 'DIS', 'ผู้ช่วย', 'อื่นๆ'];

export const EMOJI_PICKER = ['💊', '📊', '✉️', '📂', '🛡️', '🚒', '🔨', '⏰', '🚀', '💻', '💡', '💬', '📞', '💵', '📦', '🔍', '🗺️', '🔑', '🎯'];
