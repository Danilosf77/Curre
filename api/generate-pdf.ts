import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { validatePayload } from './validation.js';
import { createConcurrencyLimit, createRateLimiter } from './resourceLimits.js';
import { restrictPdfNetwork } from './pdfNetwork.js';

const pdfSlots = createConcurrencyLimit(2);
const pdfRateLimit = createRateLimiter(12, 15 * 60 * 1000);
import { LiquidModernTemplate } from '../src/components/templates/LiquidModernTemplate.js';
import { ExecutiveClassicTemplate } from '../src/components/templates/ExecutiveClassicTemplate.js';
import { AtsProfessionalTemplate } from '../src/components/templates/AtsProfessionalTemplate.js';
import { ImpactTemplate } from '../src/components/templates/ImpactTemplate.js';
import { CorporatePremiumTemplate } from '../src/components/templates/CorporatePremiumTemplate.js';
import { MinimalistAtsTemplate } from '../src/components/templates/MinimalistAtsTemplate.js';
import { CreativeColorTemplate } from '../src/components/templates/CreativeColorTemplate.js';
import { ElegantSerifTemplate } from '../src/components/templates/ElegantSerifTemplate.js';
import { TimelineTechTemplate } from '../src/components/templates/TimelineTechTemplate.js';
import { GlobalClassicTemplate, ExecutiveSignatureTemplate, NordicTemplate, EditorialTemplate } from '../src/components/templates/SignatureTemplates.js';
import { InternationalTemplate } from '../src/components/templates/InternationalTemplate.js';
import { LanguageProvider } from '../src/i18n/LanguageContext.js';

let cachedBaseStyles: string | null = null;

function getBaseStyles(): string {
  if (cachedBaseStyles) return cachedBaseStyles;

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

  cachedBaseStyles = styleChunks.join('\n');
  return cachedBaseStyles;
}

function getStyles(template: string = 'liquid-modern'): string {
  const baseCss = getBaseStyles();
  const isImpact = template === 'impact';

  // 3. Regras canônicas para garantir renderização perfeita em A4 vetorial
  const a4PrintFixes = `
    @page {
      size: A4 portrait;
      margin: ${isImpact ? '0' : '12mm'};
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
      overflow-wrap: anywhere !important;
      word-break: normal;
    }
    p, span, a, h1, h2, h3, h4, li, div {
      overflow-wrap: anywhere !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background: ${isImpact ? 'linear-gradient(to right, #0f172a 0mm, #0f172a 67.2mm, #ffffff 67.2mm, #ffffff 210mm) !important' : '#ffffff !important'};
      color: #0f172a !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    #resume-document, .resume-paper {
      position: relative !important;
      z-index: 1 !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      transform: none !important;
      overflow: visible !important;
      background: transparent !important;
      color: #0f172a !important;
      box-sizing: border-box !important;
      height: auto !important;
      min-height: 0 !important;
    }
    /* Regras canônicas para a tabela de impressão do template Impact */
    table.impact-print-table {
      width: 210mm !important;
      max-width: 210mm !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
    }

    colgroup col.impact-col-sidebar {
      width: 67.2mm !important;
    }
    colgroup col.impact-col-main {
      width: 142.8mm !important;
    }

    /* Spacers de margem de 12mm no topo (thead) e base (tfoot) de cada página */
    thead.impact-print-spacer,
    tfoot.impact-print-spacer {
      height: 12mm !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }

    thead.impact-print-spacer th,
    tfoot.impact-print-spacer td {
      height: 12mm !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      font-size: 0 !important;
      line-height: 0 !important;
    }

    thead.impact-print-spacer th.impact-sidebar-spacer,
    tfoot.impact-print-spacer td.impact-sidebar-spacer {
      width: 67.2mm !important;
      min-width: 67.2mm !important;
      max-width: 67.2mm !important;
      background: transparent !important;
      border: none !important;
    }

    thead.impact-print-spacer th.impact-main-spacer,
    tfoot.impact-print-spacer td.impact-main-spacer {
      width: 142.8mm !important;
      min-width: 142.8mm !important;
      max-width: 142.8mm !important;
      background: transparent !important;
      border: none !important;
    }

    /* Células do conteúdo no tbody */
    tbody td.impact-sidebar-cell {
      width: 67.2mm !important;
      min-width: 67.2mm !important;
      max-width: 67.2mm !important;
      padding: 0 5mm 0 12mm !important;
      vertical-align: top !important;
      border: none !important;
      background: transparent !important;
      color: #f1f5f9 !important;
      box-sizing: border-box !important;
    }

    tbody td.impact-main-cell {
      width: 142.8mm !important;
      min-width: 142.8mm !important;
      max-width: 142.8mm !important;
      padding: 0 12mm 0 8mm !important;
      vertical-align: top !important;
      border: none !important;
      background: transparent !important;
      color: #0f172a !important;
      box-sizing: border-box !important;
    }

    tbody td.impact-main-cell * {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    section {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }
    h1, h2, h3, h4, .section-header {
      break-after: avoid !important;
      page-break-after: avoid !important;
      break-inside: avoid !important;
    }
    .space-y-4 > div,
    .experience-item,
    .experience-card,
    .break-inside-avoid {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 0.85rem !important;
    }
    li,
    ul > li,
    .contact-item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  `;

  return `${baseCss}\n${a4PrintFixes}`;
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

  if (!validatePayload('pdf', req.body)) {
    return res.status(400).json({
      error: 'Dados do currículo inválidos ou não fornecidos.',
    });
  }

  let allowed = false;
  pdfRateLimit(req, res, () => { allowed = true; });
  if (!allowed) return;

  const safeFilename = sanitizeFilename(resume.personal?.fullName);
  const selectedLang = ['pt', 'en', 'es', 'fr'].includes(language) ? language : 'pt';

  // Seleciona o componente React baseado no template selecionado
  let TemplateComponent: React.ComponentType<any> = LiquidModernTemplate;
  let templateClass = 'p-0 font-sans';

  switch (template) {
    case 'executive-clean':
      TemplateComponent = ExecutiveClassicTemplate;
      templateClass = 'p-0 font-serif';
      break;
    case 'ats-professional':
      TemplateComponent = AtsProfessionalTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'impact':
      TemplateComponent = ImpactTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'corporate-premium':
      TemplateComponent = CorporatePremiumTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'minimalist':
      TemplateComponent = MinimalistAtsTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'creative-color':
      TemplateComponent = CreativeColorTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'elegant-serif':
      TemplateComponent = ElegantSerifTemplate;
      templateClass = 'p-0 font-serif';
      break;
    case 'timeline-tech':
      TemplateComponent = TimelineTechTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'global-classic':
      TemplateComponent = GlobalClassicTemplate;
      break;
    case 'executive-signature':
      TemplateComponent = ExecutiveSignatureTemplate;
      break;
    case 'nordic':
      TemplateComponent = NordicTemplate;
      break;
    case 'editorial':
      TemplateComponent = EditorialTemplate;
      break;
    case 'international':
      TemplateComponent = InternationalTemplate;
      templateClass = 'p-0 font-sans';
      break;
    case 'liquid-modern':
    default:
      TemplateComponent = LiquidModernTemplate;
      templateClass = 'p-0 font-sans';
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
    });
  }

  // 2. Constrói o documento HTML completo com estilos e fontes incorporados
  const css = getStyles(template);
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
  const release = pdfSlots.acquire();
  if (!release) {
    res.setHeader('Retry-After', '5');
    return res.status(503).json({ error: 'Geração de PDF ocupada. Tente novamente em instantes.' });
  }
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let timedOut = false;
  const deadline = setTimeout(() => {
    timedOut = true;
    void browser?.close().catch(() => {});
  }, 30000);

  try {
      browser = await chromium.launch({
        headless: true,
        timeout: 10000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ],
      });
    context = await browser.newContext({
      serviceWorkers: 'block',
      viewport: { width: 794, height: 1123 }, // 96 DPI A4 (794x1123 px)
      deviceScaleFactor: 2,
    });

    // Only trusted font hosts may use the network. Photos are validated data URLs.
    await restrictPdfNetwork(context);
    context.setDefaultTimeout(15000);

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

    // Formatação de impressão de duas colunas para o template Impact
    if (template === 'impact') {
      await page.evaluate(() => {
        const layout = document.querySelector('.impact-resume-layout') as HTMLElement;
        const sidebar = document.querySelector('.impact-resume-sidebar') as HTMLElement;
        const content = document.querySelector('.impact-resume-content') as HTMLElement;
        if (!layout || !sidebar || !content) return;

        const table = document.createElement('table');
        table.className = 'impact-print-table';
        table.innerHTML = `
          <colgroup>
            <col class="impact-col-sidebar" />
            <col class="impact-col-main" />
          </colgroup>
          <thead class="impact-print-spacer">
            <tr>
              <th class="impact-sidebar-spacer"></th>
              <th class="impact-main-spacer"></th>
            </tr>
          </thead>
          <tfoot class="impact-print-spacer">
            <tr>
              <td class="impact-sidebar-spacer"></td>
              <td class="impact-main-spacer"></td>
            </tr>
          </tfoot>
          <tbody>
            <tr>
              <td class="impact-sidebar-cell"></td>
              <td class="impact-main-cell"></td>
            </tr>
          </tbody>
        `;
        const sidebarCell = table.querySelector('.impact-sidebar-cell')!;
        const mainCell = table.querySelector('.impact-main-cell')!;

        while (sidebar.firstChild) {
          sidebarCell.appendChild(sidebar.firstChild);
        }
        while (content.firstChild) {
          mainCell.appendChild(content.firstChild);
        }

        layout.parentNode?.replaceChild(table, layout);
      });

      // Força o navegador a completar pelo menos dois ciclos de repintura
      // após a reestruturação do DOM (flexbox → tabela) do template Impact,
      // antes de capturar o PDF. Sem isso, ocasionalmente o Chromium gera
      // o PDF um instante cedo demais, deixando um pequeno artefato visual
      // na fronteira entre a barra lateral e o conteúdo principal.
      await page.evaluate(() => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }));
    }

    // Gera o PDF vetorial em A4 com margem de 12mm (ou margens via padding/table no Impact)
    const isImpact = template === 'impact';
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: isImpact
        ? {
            top: '0mm',
            bottom: '0mm',
            left: '0mm',
            right: '0mm',
          }
        : {
            top: '12mm',
            bottom: '12mm',
            left: '12mm',
            right: '12mm',
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

    return res.status(timedOut ? 504 : 500).json({
      error: timedOut ? 'A geração do PDF demorou demais. Tente novamente.' : 'Não foi possível gerar o PDF no servidor.',
      environmentHelp: isMissingDeps
        ? 'O Chromium não foi encontrado ou está sem dependências. Execute "npx playwright install chromium" para baixar o navegador no ambiente.'
        : undefined,
    });
  } finally {
    clearTimeout(deadline);
    // Garante fechamento imediato de recursos para não vazar memória no servidor
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    release();
  }
}
