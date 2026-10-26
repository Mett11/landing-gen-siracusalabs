/**
 * Main Full-Stack Server Entry Point
 * Mounts Express API routes and Vite middleware on port 3000.
 */

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/auth.js';
import { projectsRouter } from './server/routes/projects.js';
import { aiRouter } from './server/routes/ai.js';
import { cloudflareRouter } from './server/routes/cloudflare.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Request parsing with safe limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/cloudflare', cloudflareRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SIRACUSA LABS — AI Landing Studio',
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });

  // Client mounting
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SIRACUSA LABS] Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SIRACUSA LABS] Fatal server error:', err);
  process.exit(1);
});
