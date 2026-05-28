import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGas, isGasConfigured } from './gasClient.js';
import type { AppButton } from '../types';

const DEFAULT_CATEGORIES = ['OPD', 'IPD', 'IV', 'DIS', 'ผู้ช่วย', 'อื่นๆ'];

export async function handleSheetStatus(_req: VercelRequest, res: VercelResponse) {
  if (!isGasConfigured()) {
    return res.status(200).json({
      configured: false,
      connected: false,
      spreadsheetId: process.env.SPREADSHEET_ID || null,
      error: 'ยังไม่ได้ตั้งค่า GAS_WEB_APP_URL และ GAS_API_SECRET',
      rowCount: 0,
    });
  }

  const result = await callGas<{ connected: boolean; spreadsheetId?: string; rowCount?: number }>(
    'status',
    {},
    'GET'
  );

  if (!result.ok) {
    return res.status(200).json({
      configured: true,
      connected: false,
      spreadsheetId: process.env.SPREADSHEET_ID || null,
      error: result.error || 'ไม่สามารถเชื่อมต่อ Google Sheet ได้',
      rowCount: 0,
    });
  }

  return res.status(200).json({
    configured: true,
    connected: !!result.data?.connected,
    spreadsheetId: result.data?.spreadsheetId || process.env.SPREADSHEET_ID || null,
    error: '',
    rowCount: result.data?.rowCount ?? 0,
  });
}

export async function handleGetButtons(_req: VercelRequest, res: VercelResponse) {
  const result = await callGas<AppButton[]>('getButtons', {}, 'GET');
  if (!result.ok) {
    return res.status(502).json({ error: result.error });
  }
  return res.status(200).json(result.data ?? []);
}

export async function handlePostButtons(req: VercelRequest, res: VercelResponse) {
  const newButtons = req.body;
  if (!Array.isArray(newButtons)) {
    return res.status(400).json({ error: 'Body must be an array of buttons' });
  }

  const result = await callGas<{ count: number }>('saveButtons', { buttons: newButtons });
  if (!result.ok) {
    return res.status(502).json({ success: false, error: result.error });
  }

  return res.status(200).json({
    success: true,
    count: result.data?.count ?? newButtons.length,
    syncedWithSheet: true,
  });
}

export async function handleSyncSheet(_req: VercelRequest, res: VercelResponse) {
  const result = await callGas<AppButton[]>('getButtons', {}, 'GET');
  if (!result.ok || !result.data?.length) {
    return res.status(502).json({
      error: result.error || 'ไม่สามารถดึงข้อมูลจาก Google Sheet ได้',
    });
  }
  return res.status(200).json({ success: true, count: result.data.length, buttons: result.data });
}

export async function handleGetCategories(_req: VercelRequest, res: VercelResponse) {
  const result = await callGas<string[]>('getCategories', {}, 'GET');
  if (!result.ok) {
    return res.status(200).json(DEFAULT_CATEGORIES);
  }
  const names = result.data?.filter(Boolean) ?? [];
  return res.status(200).json(names.length > 0 ? names : DEFAULT_CATEGORIES);
}

export async function handlePostCategories(req: VercelRequest, res: VercelResponse) {
  const newCategories = req.body;
  if (!Array.isArray(newCategories)) {
    return res.status(400).json({ error: 'Body must be an array of category names' });
  }

  const seenLower = new Set<string>();
  const cleaned: string[] = [];
  for (const cat of newCategories) {
    const trimmed = String(cat).trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      cleaned.push(trimmed);
    }
  }

  const result = await callGas<{ count: number }>('saveCategories', { categories: cleaned });
  if (!result.ok) {
    return res.status(502).json({
      success: false,
      syncedWithSheet: false,
      error: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    count: cleaned.length,
    syncedWithSheet: true,
  });
}

export async function handleGetNotification(_req: VercelRequest, res: VercelResponse) {
  const result = await callGas<{ enabled: boolean; message: string }>('getNotification', {}, 'GET');
  if (!result.ok || !result.data) {
    return res.status(200).json({ enabled: false, message: '' });
  }
  return res.status(200).json({
    enabled: !!result.data.enabled,
    message: String(result.data.message || '').trim(),
  });
}

export async function handlePostNotification(req: VercelRequest, res: VercelResponse) {
  const { enabled, message } = req.body ?? {};
  const notificationData = {
    enabled: !!enabled,
    message: String(message || '').trim(),
  };

  const result = await callGas('saveNotification', { notification: notificationData });
  if (!result.ok) {
    return res.status(502).json({ error: result.error || 'Failed to save notification' });
  }

  return res.status(200).json({ success: true, notification: notificationData });
}
