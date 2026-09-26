import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import optimizeResumeHandler from './api/optimize-resume.js';
import analyzeJobHandler from './api/analyze-job.js';
import generatePdfHandler from './api/generate-pdf.js';

dotenv.config();

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (Number(process.env.PORT) || 3000) : 3000;

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

// ============================================================
// PROTEÇÃO CONTRA ABUSO / ESTOURO DE COTA DA API GEMINI
// ============================================================

// --- 1. Rate limit por IP: no máx. 8 chamadas de IA a cada 15 min ---
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const RATE_MAX_PER_IP = 8;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function rateLimitByIp(req: any, res: any, next: any) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_MAX_PER_IP) {
    const waitMin = Math.ceil((entry.resetAt - now) / 60000);
    return res.status(429).json({
      error: `Muitas requisições. Tente novamente em ${waitMin} minuto(s).`,
    });
  }

  entry.count++;
  next();
}

// Limpa entradas antigas do Map de tempos em tempos, pra não vazar memória
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipHits.entries()) {
    if (now > entry.resetAt) ipHits.delete(ip);
  }
}, RATE_WINDOW_MS);

// --- 2. Teto diário global: protege contra ataques distribuídos (vários IPs) ---
const DAILY_BUDGET = 500; // limite diário de cota/orçamento
let dailyCalls = 0;
let dailyResetAt = new Date().setHours(24, 0, 0, 0);

function dailyBudgetGuard(req: any, res: any, next: any) {
  const now = Date.now();
  if (now > dailyResetAt) {
    dailyCalls = 0;
    dailyResetAt = new Date().setHours(24, 0, 0, 0);
  }

  if (dailyCalls >= DAILY_BUDGET) {
    return res.status(429).json({
      error: 'Limite diário de geração de currículos atingido. Tente novamente amanhã.',
    });
  }

  dailyCalls++;
  next();
}

// Aplica as duas proteções só nas rotas que chamam a IA (custam cota)
const aiGuards = [rateLimitByIp, dailyBudgetGuard];

// Funções Serverless montadas nas rotas de API
// Suporta tanto /api/ai/* quanto /api/* para compatibilidade total
app.all('/api/ai/analyze-job', ...aiGuards, analyzeJobHandler);
app.all('/api/analyze-job', ...aiGuards, analyzeJobHandler);

app.all('/api/ai/optimize-resume', ...aiGuards, optimizeResumeHandler);
app.all('/api/optimize-resume', ...aiGuards, optimizeResumeHandler);

// Endpoint de geração direta de PDF vetorial via Chromium Headless (Playwright)
app.post('/api/generate-pdf', generatePdfHandler);

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
      // Do not let the catch-all return index.html for sitemap.xml or robots.txt
      if (req.path === '/sitemap.xml' || req.path === '/robots.txt') {
        return res.status(404).type('text/plain').send('Not Found');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CURRÊ server running on http://localhost:${PORT}`);
  });
}

startServer();
