import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsing for JSON payloads and file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Mount API Router
  app.use('/api', apiRouter);

  // Health-check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      platform: 'Vultr Cloud Compute',
      region: 'EWR-NJ / Ubuntu 24.04 LTS',
    });
  });

  if (isProd) {
    // In production, serve static assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, mount Vite as Express middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FinPilot AI] Server operational at http://0.0.0.0:${PORT}`);
    console.log(`[FinPilot AI] Mode: ${isProd ? 'Production' : 'Development'} (Vultr VM Host)`);
  });
}

startServer().catch((err) => {
  console.error('[FinPilot AI] Failed to boot server:', err);
  process.exit(1);
});
