import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGetCategories, handlePostCategories } from '../src/lib/apiHandlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return handleGetCategories(req, res);
  }
  if (req.method === 'POST') {
    return handlePostCategories(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
