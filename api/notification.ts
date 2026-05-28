import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGetNotification, handlePostNotification } from '../src/lib/apiHandlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return handleGetNotification(req, res);
  }
  if (req.method === 'POST') {
    return handlePostNotification(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
