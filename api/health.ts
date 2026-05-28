import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGas, isGasConfigured, normalizeGasUrl } from '../src/lib/gasClient.js';

/** ตรวจสอบการเชื่อมต่อ GAS (ใช้ debug หลัง deploy) */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const configured = isGasConfigured();
  const gasUrl = process.env.GAS_WEB_APP_URL?.trim();
  const hasSecret = !!process.env.GAS_API_SECRET?.trim();

  if (!configured) {
    return res.status(200).json({
      configured: false,
      hasUrl: !!gasUrl,
      hasSecret,
      connected: false,
      hint: 'ตั้ง GAS_WEB_APP_URL และ GAS_API_SECRET ใน Vercel แล้ว Redeploy',
    });
  }

  const result = await callGas<{ connected: boolean; spreadsheetId?: string; rowCount?: number }>(
    'status',
    {},
    'GET'
  );

  return res.status(200).json({
    configured: true,
    hasUrl: true,
    hasSecret: true,
    gasUrlPreview: gasUrl ? normalizeGasUrl(gasUrl).slice(0, 55) + '...' : null,
    connected: result.ok,
    error: result.error || null,
    data: result.data || null,
  });
}
