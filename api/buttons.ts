import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleGetButtons,
  handlePostButtons,
  handleSyncSheet,
} from '../src/lib/apiHandlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return handleGetButtons(req, res);
  }
  if (req.method === 'POST') {
    const action = req.query.action;
    if (action === 'sync') {
      return handleSyncSheet(req, res);
    }
    return handlePostButtons(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
