import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { LiquidModernTemplate } from '../src/components/templates/LiquidModernTemplate.js';
import { ExecutiveClassicTemplate } from '../src/components/templates/ExecutiveClassicTemplate.js';
import { AtsProfessionalTemplate } from '../src/components/templates/AtsProfessionalTemplate.js';
import { ImpactTemplate } from '../src/components/templates/ImpactTemplate.js';
import { CorporatePremiumTemplate } from '../src/components/templates/CorporatePremiumTemplate.js';
import { MinimalistAtsTemplate } from '../src/components/templates/MinimalistAtsTemplate.js';
import { LanguageProvider } from '../src/i18n/LanguageContext.js';

let cachedStyles: string | null = null;

function getStyles(): string {
  if (cachedStyles) return cachedStyles;

  const styleChunks: string[] = [];

  // 1. Tenta carregar o CSS gerado pelo build do Vite em dist/assets/*.css
  try {
    const assetsDir = path.join(process.cwd(), 'dist', 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      for (const file of files) {
        if (file.endsWith('.css')) {
          styleChunks.push(fs.readFileSync(path.join(assetsDir, file), 'utf-8'));
        }
      }
    }
  } catch (err) {
    // Ignora erro de leitura em dev
  }

  // 2. Carrega regras específicas de impressão e classes utilitárias de src/index.css
  try {
    const indexCssPath = path.join(process.cwd(), 'src', 'index.css');
    if (fs.existsSync(indexCssPath)) {
      styleChunks.push(fs.readFileSync(indexCssPath, 'utf-8'));
    }
  } catch (err) {
    // Ignora erro de leitura
  }

  // 3. Regras canônicas para garantir renderização perfeita em A4 vetorial
  const a4PrintFixes = `
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    #resume-document, .resume-paper {
      width: 210mm !important;
      max-width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 auto !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      transform: none !important;
      overflow: visible !important;
      background: #ffffff !important;
      color: #0f172a !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .impact-resume-layout {
      display: grid !important;
      grid-template-columns: 30% 70% !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      min-height: 297mm !important;
      flex: 1 0 auto !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background-color: #ffffff !important;
    }
    .impact-resume-sidebar {
      display: flex !important;
      flex-direction: column !important;
      gap: 1rem !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      padding: 1.25rem !important;
      box-sizing: border-box !important;
      background-color: #0f172a !important;
      color: #f1f5f9 !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
      overflow: visible !important;
    }
    .impact-resume-content {
      display: flex !important;
      flex-direction: column !important;
      gap: 1.25rem !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      padding: 1.5rem !important;
      box-sizing: border-box !important;
      background-color: #ffffff !important;
      color: #0f172a !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
      overflow: visible !important;
    }
    .impact-resume-content * {
      max-width: 100% !important;
      box-sizing: border-box !important;
      overflow-wrap: break-word !important;
      word-break: break-word !important;
    }
    article, section, .break-inside-avoid, .experience-card, .contact-item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    h1, h2, h3, h4 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
  `;
  styleChunks.push(a4PrintFixes);

  cachedStyles = styleChunks.join('\n');
  return cachedStyles;
}

function sanitizeFilename(fullName?: string): string {
  if (!fullName || typeof fullName !== 'string') return 'Curriculo';
  const clean = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos/acentos
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // caracteres seguros para sistema de arquivos
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .trim();
  return clean ? `Curriculo_${clean}` : 'Curriculo';
}

export default async function generatePdfHandler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const startTime = Date.now();
  const { resume, template = 'liquid-modern', language = 'pt' } = req.body || {};

  if (!resume || typeof resume !== 'object') {
    return res.status(400).json({
      error: 'Dados do currículo inválidos ou não fornecidos.',
    });
  }

  const safeFilename = sanitizeFilename(resume.personal?.fullName);
  const selectedLang = ['pt', 'en', 'es', 'fr'].includes(language) ? language : 'pt';

  // Seleciona o componente React baseado no template selecionado
  let TemplateComponent: React.ComponentType<any> = LiquidModernTemplate;
  let templateClass = 'p-6 sm:p-10 font-sans';

  switch (template) {
    case 'executive-clean':
      TemplateComponent = ExecutiveClassicTemplate;
      templateClass = 'p-6 sm:p-10 font-serif';
      break;
    case 'ats-professional':
      TemplateComponent = AtsProfessionalTemplate;
      templateClass = 'p-6 sm:p-10 font-sans';
      break;
    case 'impact':
      TemplateComponent = ImpactTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'corporate-premium':
      TemplateComponent = CorporatePremiumTemplate;
      templateClass = 'p-6 sm:p-10 font-sans';
      break;
    case 'minimalist':
      TemplateComponent = MinimalistAtsTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'liquid-modern':
    default:
      TemplateComponent = LiquidModernTemplate;
      templateClass = 'p-6 sm:p-10 font-sans';
      break;
  }

  // 1. Renderiza o template para HTML estático (SSR)
  let resumeMarkup = '';
  try {
    resumeMarkup = renderToStaticMarkup(
      React.createElement(
        LanguageProvider,
        { defaultLanguage: selectedLang },
        React.createElement(
          'div',
          {
            id: 'resume-document',
            className: `resume-paper select-none bg-white text-slate-900 ${templateClass}`,
          },
          React.createElement(TemplateComponent, {
            personal: resume.personal || {},
            targetRole: resume.targetRole || '',
            professionalSummary: resume.professionalSummary || '',
            experiences: resume.experiences || [],
            education: resume.education || [],
            skills: resume.skills || [],
            tools: resume.tools || [],
            courses: resume.courses || [],
          })
        )
      )
    );
  } catch (renderErr: any) {
    console.error('[PDF Generation] Erro na renderização do template React:', renderErr?.message);
    return res.status(500).json({
      error: 'Erro interno ao renderizar a estrutura do currículo.',
      details: renderErr?.message,
    });
  }

  // 2. Constrói o documento HTML completo com estilos e fontes incorporados
  const css = getStyles();
  const fullHtml = `<!DOCTYPE html>
<html lang="${selectedLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeFilename}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
  <style>
    ${css}
  </style>
</head>
<body class="bg-white text-slate-900 m-0 p-0">
  ${resumeMarkup}
</body>
</html>`;

  // 3. Executa o Chromium headless via Playwright para gerar o PDF vetorial
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ],
      });
    } catch (launchErr: any) {
      if (launchErr?.message?.includes("Executable doesn't exist")) {
        console.warn('[PDF Generation] Chromium não encontrado. Tentando instalar automaticamente via Playwright...');
        try {
          const { execSync } = await import('child_process');
          execSync('npx playwright install chromium', { stdio: 'inherit' });
          browser = await chromium.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--font-render-hinting=none',
            ],
          });
        } catch (installErr: any) {
          console.error('[PDF Generation] Falha ao instalar Chromium sob demanda:', installErr?.message);
          throw launchErr;
        }
      } else {
        throw launchErr;
      }
    }

    context = await browser.newContext({
      viewport: { width: 794, height: 1123 }, // 96 DPI A4 (794x1123 px)
      deviceScaleFactor: 2,
    });

    page = await context.newPage();

    // Carrega o conteúdo HTML gerado
    await page.setContent(fullHtml, { waitUntil: 'load', timeout: 20000 });

    // Aguarda prontidão das fontes web
    await page.evaluate(async () => {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
    });

    // Aguarda carregamento e decodificação de imagens caso existam
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
          }
          return new Promise<void>((resolve) => {
            img.onload = () => (img.decode ? img.decode().then(resolve).catch(resolve) : resolve());
            img.onerror = () => resolve();
          });
        })
      );
    });

    // Gera o PDF vetorial em A4 preservando cores de fundo e gráficos
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[PDF Generation] Sucesso: ${safeFilename}.pdf gerado (${pdfBuffer.length} bytes em ${duration}ms)`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (playwrightErr: any) {
    console.error('[PDF Generation] Erro no Chromium headless/Playwright:', playwrightErr?.message);

    const isMissingDeps =
      playwrightErr?.message?.includes('Host system is missing dependencies') ||
      playwrightErr?.message?.includes('error while loading shared libraries') ||
      playwrightErr?.message?.includes('Executable doesn\'t exist');

    return res.status(500).json({
      error: 'Falha na inicialização do Chromium headless no servidor.',
      details: playwrightErr?.message,
      environmentHelp: isMissingDeps
        ? 'O Chromium não foi encontrado ou está sem dependências. Execute "npx playwright install chromium" para baixar o navegador no ambiente.'
        : undefined,
    });
  } finally {
    // Garante fechamento imediato de recursos para não vazar memória no servidor
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}
