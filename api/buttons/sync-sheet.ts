import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleSyncSheet } from '../../src/lib/apiHandlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return handleSyncSheet(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
