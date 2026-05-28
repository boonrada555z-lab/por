import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleSheetStatus } from '../src/lib/apiHandlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return handleSheetStatus(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
