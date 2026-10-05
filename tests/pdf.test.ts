import test from 'node:test';
import assert from 'node:assert/strict';
import generatePdf from '../api/generate-pdf.ts';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { RESUME_TEMPLATES } from '../src/data/resumeTemplates.ts';
import { SIGNATURE_IDS } from '../src/components/templates/SignatureTemplates.tsx';
import { checkPdfText } from '../src/utils/pdfReading.ts';

const resume = {
  personal: { fullName: 'Ana Teste', email: 'ana@example.com', phone: '', cityState: 'São Paulo', linkedin: '', hasPhoto: true, photoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=' },
  targetRole: 'Desenvolvedora', professionalSummary: 'Experiência em desenvolvimento de software.',
  experiences: [{ id: 'exp1', company: 'Empresa Teste', role: 'Desenvolvedora', period: '2021 — 2024', isCurrent: false, bullets: ['Desenvolveu sistemas com testes automatizados.'] }],
  education: [], skills: ['TypeScript'], tools: ['Git'], courses: [],
};
const response = () => ({ code: 200, body: undefined as any, headers: {} as Record<string,any>, status(code: number) { this.code = code; return this; }, json(body: any) { this.body = body; return this; }, send(body: any) { this.body = body; return this; }, setHeader(k: string, v: any) { this.headers[k] = v; } });

test('Chromium generates every registered template with uploaded photos', { timeout: 120000 }, async () => {
  for (const template of RESUME_TEMPLATES.map(item => item.id)) {
    const res = response();
    await generatePdf({ method: 'POST', ip: template, body: { resume, template, language: 'pt' } }, res);
    assert.equal(res.code, 200, `${template}: ${JSON.stringify(res.body)}`);
    assert.equal(res.headers['Content-Type'], 'application/pdf');
    assert.equal(res.body.subarray(0,5).toString(), '%PDF-');
    assert.ok(res.body.length > 1000);
    const task = getDocument({data:new Uint8Array(res.body)});
    const pdf = await task.promise;
    try {
      const pages: string[] = [];
      for (let i=1;i<=pdf.numPages;i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map((item:any) => item.str || '').join(' '));
      }
      const checks = checkPdfText(pages.join(' '), resume as any);
      assert.equal(checks.filter(c => c.status === 'missing').length,0, `${template}: ${JSON.stringify(checks)}`);
      const corrupted = checkPdfText('Documento sem dados do candidato',resume as any);
      assert.ok(corrupted.some(c => c.label === 'Nome' && c.status === 'missing'));
    } finally { await task.destroy(); }
  }
});

test('concurrent PDF requests are bounded and capacity recovers', { timeout: 60000 }, async () => {
  const responses = [response(), response(), response()];
  await Promise.all(responses.map((res, i) => generatePdf({ method: 'POST', ip: `concurrent-${i}`, body: { resume } }, res)));
  assert.equal(responses.filter(res => res.code === 503).length, 1);
  assert.equal(responses.filter(res => res.code === 200).length, 2);
  const res = response();
  await generatePdf({ method: 'POST', ip: 'recovered', body: { resume } }, res);
  assert.equal(res.code, 200);
});

test('Signature PDFs preserve long content and reading order across pages and languages', { timeout: 120000 }, async () => {
  const extended = {
    ...resume,
    personal: { ...resume.personal, fullName: 'Ana Maria Teste de Conteúdo Internacional', email: 'nome.sobrenome.contato.profissional@example.com', hasPhoto: false, portfolio: 'https://example.com/portfolio/projetos-internacionais' },
    experiences: Array.from({ length: 7 }, (_, i) => ({ id: `long-${i}`, role: `Cargo ${i}`, company: `Empresa ${i}`, period: '2015 — 2024', isCurrent: false, bullets: Array.from({ length: 5 }, (_, j) => `Evidência ${i}.${j}: Desenvolveu processos de trabalho em colaboração com equipes multidisciplinares, documentando decisões e acompanhando atividades de melhoria contínua.`) })),
    education: [{ id: 'edu', course: 'Administração', institution: 'Universidade Teste', startYear: '2010', endYear: '2014', status: 'Concluído' }],
    courses: [{ id: 'course', name: 'Gestão de Projetos Internacionais', institution: 'Escola Teste', year: '2024', hours: '40h' }],
  };
  for (const template of SIGNATURE_IDS) for (const language of ['pt', 'en', 'es', 'fr']) {
    const res = response();
    await generatePdf({ method: 'POST', ip: `${template}-${language}`, body: { resume: extended, template, language } }, res);
    assert.equal(res.code, 200, `${template}/${language}: ${JSON.stringify(res.body)}`);
    const task = getDocument({ data: new Uint8Array(res.body) });
    const pdf = await task.promise;
    try {
      assert.ok(pdf.numPages > 1, `${template}/${language}: long content must paginate`);
      const texts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texts.push(content.items.map((item: any) => item.str || '').join(' '));
      }
      const text = texts.join(' ').replace(/\s+/g, ' ');
      for (const value of [extended.personal.email, extended.personal.portfolio, extended.courses[0].name]) assert.ok(text.replace(/\s/g, '').includes(value.replace(/\s/g, '')), `${template}/${language}: missing ${value}`);
      let previous = -1;
      for (const exp of extended.experiences) for (const bullet of exp.bullets) {
        const position = text.indexOf(bullet.split(':')[0]);
        assert.ok(position > previous, `${template}/${language}: missing or reordered ${bullet}`);
        previous = position;
      }
      assert.equal(checkPdfText(text, extended as any).filter(check => check.status === 'missing').length, 0);
    } finally { await task.destroy(); }
  }
});

test('internal URLs are rejected before launching Chromium', async () => {
  const res = response();
  await generatePdf({ method: 'POST', body: { resume: { ...resume, personal: { ...resume.personal, photoUrl: 'http://127.0.0.1:3000/api/health' } } } }, res);
  assert.equal(res.code, 400);
});
