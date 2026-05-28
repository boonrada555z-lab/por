import React from 'react';
import { BarChart3, LayoutGrid, Activity, TrendingUp } from 'lucide-react';
import { AppButton } from '../types';

interface DashboardAnalyticsProps {
  buttons: AppButton[];
  sheetStatus: {
    configured: boolean;
    connected: boolean;
    spreadsheetId: string | null;
    error: string;
    rowCount: number;
  };
  dashboardAnalytics: {
    totalPriority: number;
    categoryRows: Array<{ category: string; count: number; clicks: number }>;
    topButtons: AppButton[];
  };
  totalClicksMetric: number;
  onSyncFromSheet?: () => void;
  isSyncing?: boolean;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  buttons,
  sheetStatus,
  dashboardAnalytics,
  totalClicksMetric,
  onSyncFromSheet,
  isSyncing,
}) => {
  const sheetUrl = sheetStatus.spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${sheetStatus.spreadsheetId}`
    : null;

  return (
    <div id="system-status-stats" className="mt-10 p-6 bg-white border border-slate-250 rounded-2xl shadow-ns relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-700 border border-blue-150 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">แดชบอร์ดสรุปสถิติและข้อมูลลิงก์ระบบงาน (Directory Dashboard)</h4>
            <p className="text-xs text-slate-505">
              ประมวลผลแจกแจงข้อมูลแบบเรียลไทม์จาก Google Sheet {buttons.length} ลิงก์ระบบ
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>ฐานข้อมูลหลัก: Google Sheets</span>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F9D58] flex items-center justify-center font-extrabold text-sm text-white">
              G
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 block">การเชื่อมต่อ Google Sheet (Apps Script API)</span>
              {sheetStatus.spreadsheetId && (
                <span className="text-[10px] font-mono text-slate-450 block">{sheetStatus.spreadsheetId}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sheetStatus.configured ? (
              sheetStatus.connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>เชื่อมต่อ Google Sheet แล้ว (Active)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>เชื่อมต่อไม่สำเร็จ</span>
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>ยังไม่ได้ตั้งค่า Environment</span>
              </span>
            )}
          </div>
        </div>

        {!sheetStatus.configured && (
          <div className="text-xs text-slate-650 leading-relaxed bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-lg font-sans">
            <p className="font-bold text-amber-900 mb-1">ตั้งค่า Vercel Environment Variables</p>
            <p className="text-[11px] text-slate-600">
              ดูขั้นตอนละเอียดในไฟล์ <code className="bg-slate-105 px-1 py-0.5 rounded font-mono">ggsheet.md</code> แล้วเพิ่มตัวแปร:
            </p>
            <ul className="list-disc list-inside ml-2 mt-2 font-mono text-[10px] text-slate-850 space-y-1">
              <li><strong>GAS_WEB_APP_URL</strong> — URL ของ Web App จาก Apps Script</li>
              <li><strong>GAS_API_SECRET</strong> — รหัสลับต้องตรงกับใน Apps Script</li>
              <li><strong>SPREADSHEET_ID</strong> — (ไม่บังคับ) แสดงลิงก์เปิด Sheet</li>
            </ul>
          </div>
        )}

        {sheetStatus.configured && !sheetStatus.connected && (
          <div className="text-xs text-slate-650 leading-relaxed bg-rose-50/40 border border-rose-200 p-3.5 rounded-lg font-sans">
            <p className="font-bold text-rose-950 mb-1">ไม่สามารถเชื่อมต่อ Google Sheet ได้</p>
            <p className="text-rose-800 text-[11px] font-mono leading-tight mb-2.5">ข้อผิดพลาด: {sheetStatus.error}</p>
            <p className="text-[11px] text-slate-600">
              ตรวจสอบว่า Deploy Apps Script เป็น Web App แล้ว ตั้งค่า <strong>Execute as: Me</strong> และ <strong>Who has access: Anyone</strong>
            </p>
          </div>
        )}

        {sheetStatus.configured && sheetStatus.connected && (
          <div className="p-3 bg-emerald-500/5 text-emerald-950 rounded-lg text-xs flex flex-wrap justify-between items-center gap-2 border border-emerald-500/10 font-bold font-sans">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-800">
                ข้อมูลใน Sheet: <strong className="font-mono text-emerald-955 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">{sheetStatus.rowCount} ลิงก์</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {sheetUrl && (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-700 underline"
                >
                  เปิด Google Sheet
                </a>
              )}
              {onSyncFromSheet && (
                <button
                  type="button"
                  onClick={onSyncFromSheet}
                  disabled={isSyncing}
                  className="px-2.5 py-1 text-[10px] bg-slate-800 text-white rounded-md disabled:opacity-50"
                >
                  {isSyncing ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลจาก Sheet'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        
        <div className="space-y-3.5">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <LayoutGrid className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">สถิติระบบแบ่งตามหมวดหมู่</span>
          </div>
          <div className="space-y-2.5">
            {dashboardAnalytics.categoryRows.map((row) => {
              const ratio = Math.round((row.count / buttons.length) * 100) || 0;
              return (
                <div key={row.category} className="space-y-1 font-sans">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-705">{row.category}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{row.count} ลิงก์ ({ratio}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${ratio}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ยอดความถี่เชิงวิเคราะห์ปริมาณ</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-sans">จำนวนการคลิกสะสม</span>
              <span className="text-xl font-black text-slate-800 font-mono block mt-1">{totalClicksMetric} ครั้ง</span>
              <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Clicks counter total</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-sans">ระบบปักหมุดด่วน</span>
              <span className="text-xl font-black text-blue-700 font-mono block mt-1">{dashboardAnalytics.totalPriority} ระบบ</span>
              <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Hospital Priority</span>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50/30 border border-blue-105 rounded-xl text-[11px] leading-relaxed text-slate-650">
            <strong className="text-blue-700 font-bold">ข้อมูลสถิติ:</strong> บันทึกลง Google Sheet อัตโนมัติเมื่อมีการแก้ไขหรือคลิกใช้งาน
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-105 bg-white">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ลิงก์ระบบยอดนิยมที่มีการคลิกสูงสุด</span>
          </div>
          
          <div className="space-y-2">
            {dashboardAnalytics.topButtons.map((btn, idx) => (
              <div key={btn.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-slate-150 transition-colors bg-white font-sans">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-black flex items-center justify-center border border-blue-200">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="text-[11px] font-bold text-slate-800 block leading-tight truncate">{btn.name}</span>
                    <span className="text-[8px] font-mono text-slate-400 block leading-none">
                      {(btn.category || 'อื่นๆ').split(',').map(c => c.trim()).filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                  {btn.clicks} Clicks
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
