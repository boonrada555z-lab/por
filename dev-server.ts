import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleGetButtons,
  handlePostButtons,
  handleSyncSheet,
  handleGetCategories,
  handlePostCategories,
  handleGetNotification,
  handlePostNotification,
  handleSheetStatus,
} from './src/lib/apiHandlers';

function wrap(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse>
) {
  return async (req: express.Request, res: express.Response) => {
    await handler(req as unknown as VercelRequest, res as unknown as VercelResponse);
  };
}

async function startDevServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.get('/api/health', async (req, res) => {
    const { default: healthHandler } = await import('./api/health');
    return healthHandler(req as never, res as never);
  });
  app.get('/api/sheet-status', wrap(handleSheetStatus));
  app.get('/api/buttons', wrap(handleGetButtons));
  app.post('/api/buttons', wrap(handlePostButtons));
  app.post('/api/buttons/sync-sheet', wrap(handleSyncSheet));
  app.get('/api/categories', wrap(handleGetCategories));
  app.post('/api/categories', wrap(handlePostCategories));
  app.get('/api/notification', wrap(handleGetNotification));
  app.post('/api/notification', wrap(handlePostNotification));

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
  });
}

startDevServer().catch(console.error);
