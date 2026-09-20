import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import optimizeResumeHandler from './api/optimize-resume.js';
import analyzeJobHandler from './api/analyze-job.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    app: 'CURRÊ - Corra atrás da vaga certa',
    geminiConfigured: isConfigured,
  });
});

// Funções Serverless montadas nas rotas de API
// Suporta tanto /api/ai/* quanto /api/* para compatibilidade total
app.all('/api/ai/analyze-job', analyzeJobHandler);
app.all('/api/analyze-job', analyzeJobHandler);

app.all('/api/ai/optimize-resume', optimizeResumeHandler);
app.all('/api/optimize-resume', optimizeResumeHandler);

// Vite Middleware for development vs Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CURRÊ server running on http://localhost:${PORT}`);
  });
}

startServer();
