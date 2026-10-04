import test from 'node:test';
import assert from 'node:assert/strict';
import generatePdf from '../api/generate-pdf.ts';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { checkPdfText } from '../src/utils/pdfReading.ts';

const resume = {
  personal: { fullName: 'Ana Teste', email: 'ana@example.com', phone: '', cityState: 'São Paulo', linkedin: '', hasPhoto: true, photoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=' },
  targetRole: 'Desenvolvedora', professionalSummary: 'Experiência em desenvolvimento de software.',
  experiences: [{ id: 'exp1', company: 'Empresa Teste', role: 'Desenvolvedora', period: '2021 — 2024', isCurrent: false, bullets: ['Desenvolveu sistemas com testes automatizados.'] }],
  education: [], skills: ['TypeScript'], tools: ['Git'], courses: [],
};
const response = () => ({ code: 200, body: undefined as any, headers: {} as Record<string,any>, status(code: number) { this.code = code; return this; }, json(body: any) { this.body = body; return this; }, send(body: any) { this.body = body; return this; }, setHeader(k: string, v: any) { this.headers[k] = v; } });

test('Chromium generates all ten templates with uploaded photos', { timeout: 120000 }, async () => {
  for (const template of ['liquid-modern','executive-clean','ats-professional','impact','corporate-premium','minimalist','creative-color','elegant-serif','timeline-tech','international']) {
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

test('internal URLs are rejected before launching Chromium', async () => {
  const res = response();
  await generatePdf({ method: 'POST', body: { resume: { ...resume, personal: { ...resume.personal, photoUrl: 'http://127.0.0.1:3000/api/health' } } } }, res);
  assert.equal(res.code, 400);
});
