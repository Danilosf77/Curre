// Development-only: static thumbnails built from the existing, unchanged templates.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from 'playwright';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { LiquidModernTemplate } from '../src/components/templates/LiquidModernTemplate';
import { ExecutiveClassicTemplate } from '../src/components/templates/ExecutiveClassicTemplate';
import { AtsProfessionalTemplate } from '../src/components/templates/AtsProfessionalTemplate';
import { ImpactTemplate } from '../src/components/templates/ImpactTemplate';
import { CorporatePremiumTemplate } from '../src/components/templates/CorporatePremiumTemplate';
import { MinimalistAtsTemplate } from '../src/components/templates/MinimalistAtsTemplate';
import { CreativeColorTemplate } from '../src/components/templates/CreativeColorTemplate';
import { ElegantSerifTemplate } from '../src/components/templates/ElegantSerifTemplate';
import { TimelineTechTemplate } from '../src/components/templates/TimelineTechTemplate';
import { SIGNATURE_COMPONENTS } from '../src/components/templates/SignatureTemplates';
import { InternationalTemplate } from '../src/components/templates/InternationalTemplate';
import type { OptimizedResume } from '../src/types';

const sample: OptimizedResume = {
  personal: { fullName: 'Alex Silva', email: 'alex@example.com', phone: '(11) 99999-0000', cityState: 'São Paulo, SP', linkedin: 'linkedin.com/in/alex-silva', hasPhoto: false },
  targetRole: 'Analista de Projetos', professionalSummary: 'Profissional com experiência em gestão de projetos, análise de indicadores e melhoria de processos. Colaboração entre equipes para transformar planejamento em resultados.',
  experiences: [
    { id: '1', company: 'Empresa Horizonte', role: 'Analista de Projetos', period: '2022 — Atual', isCurrent: true, bullets: ['Coordenou entregas e acompanhou indicadores de desempenho dos projetos.', 'Organizou processos e colaborou com equipes de diferentes áreas.', 'Elaborou relatórios para apoiar decisões e acompanhar os resultados.'] },
    { id: '2', company: 'Grupo Nova', role: 'Assistente Administrativo', period: '2020 — 2022', isCurrent: false, bullets: ['Apoiou a organização de documentos, contratos e rotinas administrativas.', 'Atualizou controles e contribuiu para melhorias no atendimento.'] },
  ],
  education: [{ id: 'e1', course: 'Administração', institution: 'Universidade Metropolitana', startYear: '2017', endYear: '2021', status: 'Concluído' }],
  skills: ['Gestão de projetos', 'Comunicação', 'Análise de dados', 'Organização'], tools: ['Excel', 'Power BI', 'Trello'],
  courses: [{ id: 'c1', name: 'Gestão Ágil de Projetos', institution: 'Escola de Negócios', year: '2023', hours: '40h' }], templateStyle: 'liquid-modern', generatedAt: '',
};
const templates: Record<string, React.ComponentType<any>> = { 'liquid-modern': LiquidModernTemplate, 'executive-clean': ExecutiveClassicTemplate, 'ats-professional': AtsProfessionalTemplate, impact: ImpactTemplate, 'corporate-premium': CorporatePremiumTemplate, minimalist: MinimalistAtsTemplate, 'creative-color': CreativeColorTemplate, 'elegant-serif': ElegantSerifTemplate, 'timeline-tech': TimelineTechTemplate, international: InternationalTemplate, ...SIGNATURE_COMPONENTS };
const css = readdirSync('dist/assets').filter(file => file.endsWith('.css')).map(file => readFileSync(`dist/assets/${file}`, 'utf8')).join('\n');
mkdirSync('public/template-previews', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 820, height: 1050 }, deviceScaleFactor: 1 });
  for (const [id, Template] of Object.entries(templates)) {
    if (process.argv.includes('--signature-only') && !Object.hasOwn(SIGNATURE_COMPONENTS, id)) continue;
    const padding = (Object.hasOwn(SIGNATURE_COMPONENTS, id) || ['impact','minimalist','creative-color','timeline-tech'].includes(id)) ? 'p-0 font-sans' : ['executive-clean','elegant-serif'].includes(id) ? 'p-6 sm:p-10 font-serif' : 'p-6 sm:p-10 font-sans';
    const markup = renderToStaticMarkup(React.createElement(LanguageProvider, { defaultLanguage: 'pt' }, React.createElement('div', { className: `resume-paper bg-white text-slate-900 ${padding}`, style: { width: 820, minHeight: 1050 } }, React.createElement(Template, sample))));
    await page.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet"><style>${css}</style><style>html,body{margin:0;background:white;}#thumbnail{width:328px;height:420px;overflow:hidden;}#thumbnail>div{transform:scale(.4);transform-origin:top left;}</style></head><body><div id="thumbnail">${markup}</div></body></html>`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#thumbnail').screenshot({ path: `public/template-previews/${id}.jpg`, type: 'jpeg', quality: 85 });
    console.log(`Thumbnail: ${id}`);
  }
} finally { await browser.close(); }
