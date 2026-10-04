import test from 'node:test';
import { aiFailure } from '../api/aiFailure.ts';
import { generateGeminiContent } from '../api/geminiClient.ts';
import assert from 'node:assert/strict';
import { validatePayload, isSafePhoto, validateAiAnalysis, validateAiResume, payloadGuard } from '../api/validation.ts';
import { createRateLimiter, createConcurrencyLimit } from '../api/resourceLimits.ts';
import analyze, { generateFallbackJobAnalysis } from '../api/analyze-job.ts';
import optimize from '../api/optimize-resume.ts';
import { restoreResumeForm } from '../src/utils/resumeForm.ts';
import type { OptimizedResume } from '../src/types.ts';
import { handlePdfRequest } from '../api/pdfNetwork.ts';
import { validReview, reviewGuard } from '../api/review-resume.ts';
import { safeAnalyticsParams, trackEvent, isAnalyticsHost, generationErrorCategory } from '../src/utils/analytics.ts';

const response = () => ({ code: 200, body: undefined as any, headers: {} as Record<string,string>, status(code: number) { this.code = code; return this; }, json(body: any) { this.body = body; return this; }, setHeader(k: string, v: string) { this.headers[k] = v; } });

test('AI failure diagnostics distinguish quota, timeout and malformed output without leaking provider data', () => {
  const failure = aiFailure({status:429,message:'RESOURCE_EXHAUSTED secret-key private-resume'});
  assert.equal(failure.category,'provider_quota');
  assert.equal(JSON.stringify(failure).includes('secret-key'),false);
  assert.equal(JSON.stringify(failure).includes('private-resume'),false);
  assert.equal(aiFailure(new Error('Request timed out')).category,'provider_timeout');
  assert.equal(aiFailure(new SyntaxError('private output')).category,'invalid_json');
  assert.equal(aiFailure({status:403}).category,'provider_auth');
});

test('Gemini uses the alternative model for overload but does not retry exhausted quota', async () => {
  const models: string[] = [];
  const client = {models:{generateContent:async (params:any) => {
    models.push(params.model);
    if (models.length === 1) throw {status:503};
    return {text:'ok'};
  }}};
  assert.equal((await generateGeminiContent(client as any,{model:'gemini-3.8-flash',contents:'test'})).text,'ok');
  assert.deepEqual(models,['gemini-3.8-flash','gemini-3.5-flash']);
  let calls=0;
  await assert.rejects(generateGeminiContent({models:{generateContent:async () => {calls++;throw {status:429};}}} as any,{model:'gemini-3.8-flash',contents:'test'}));
  assert.equal(calls,1);
});

test('analytics excludes local hosts and personal or arbitrary event data', () => {
  assert.equal(isAnalyticsHost('localhost'),false);
  assert.equal(isAnalyticsHost('127.0.0.1'),false);
  assert.equal(isAnalyticsHost('www.curreai.com.attacker.test'),false);
  assert.equal(isAnalyticsHost('www.curreai.com'),true);
  assert.deepEqual(safeAnalyticsParams({etapa:3,idioma:'pt',email:'private@example.com',resume:{personal:'private'},modelo:'arbitrary personal text',categoria_erro:'secret error'} as any),{etapa:3,idioma:'pt'});
  const previous = (globalThis as any).window;
  const events:any[] = [];
  try {
    (globalThis as any).window = {location:{hostname:'localhost'},gtag:(...args:any[]) => events.push(args)};
    trackEvent('etapa_concluida',{etapa:2}); assert.equal(events.length,0);
    (globalThis as any).window.location.hostname = 'www.curreai.com';
    trackEvent('etapa_concluida',{etapa:2,idioma:'pt'});
    trackEvent('private name' as any,{etapa:2});
    assert.deepEqual(events,[['event','etapa_concluida',{etapa:2,idioma:'pt'}]]);
    (globalThis as any).window.gtag = () => {throw new Error('Blocked analytics');};
    assert.doesNotThrow(() => trackEvent('inicio_curriculo'));
  } finally { if (previous === undefined) delete (globalThis as any).window; else (globalThis as any).window = previous; }
  assert.equal(generationErrorCategory(new Error('API status 429')),'limite');
  assert.equal(generationErrorCategory(new Error('Secret provider response')),'rede_ou_resposta');
});

test('review rejects oversized and malformed inputs before consuming AI quota', () => {
  for (const body of [null,{text:'x'.repeat(60001),jobDescription:'',language:'pt'},{text:'x'.repeat(50),jobDescription:42,language:'pt'},{text:'x'.repeat(50),jobDescription:'',language:'xx'}]) {
    assert.equal(validReview(body),false);
    let calls = 0;
    const res = response();
    reviewGuard({method:'POST',body},res,() => calls++);
    assert.equal(res.code,400); assert.equal(calls,0);
  }
  assert.equal(validReview({text:'x'.repeat(50),jobDescription:'',language:'pt'}),true);
});

test('API rejects malformed nested fields and language before calling AI', async () => {
  for (const body of [null, [], { jobDescription: 'SQL', language: 42 }, { jobDescription: 'SQL', candidateSkills: 'SQL' }, { jobDescription: 'SQL', candidateExperiences: [null] }, { jobDescription: 'x'.repeat(12001) }]) {
    const res = response();
    await analyze({ method: 'POST', body }, res);
    assert.equal(res.code, 400);
  }
  const res = response();
  await optimize({ method: 'POST', body: { experiences: [{ activitiesRaw: 123 }] } }, res);
  assert.equal(res.code, 400);
  assert.ok(validatePayload('optimization', { personal: { fullName: 'Ana' }, targetJob: { roleTitle: 'Dev' }, experiences: [], language: 'pt' }));
});

test('invalid methods and payloads never reach quota middleware', () => {
  for (const req of [{ method: 'GET', body: {} }, { method: 'POST', body: { language: 2 } }]) {
    let counted = false;
    const res = response();
    payloadGuard('analysis')(req, res, () => { counted = true; });
    assert.equal(counted, false);
    assert.ok([400,405].includes(res.code));
  }
});

test('PDF rejects remote URLs, SVGs, invalid image bytes, and oversized images', () => {
  for (const photo of ['http://127.0.0.1/private', 'http://169.254.169.254/', 'https://example.com/photo.jpg', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,YWJj', 'data:image/png;base64,' + 'a'.repeat(2000000)]) {
    assert.equal(isSafePhoto(photo), false);
    assert.equal(validatePayload('pdf', { resume: { personal: { photoUrl: photo } } }), false);
  }
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=';
  assert.ok(isSafePhoto(png));
  assert.ok(validatePayload('pdf', { resume: { personal: { photoUrl: png } }, template: 'impact' }));
});

test('PDF network blocks private hosts, lookalike hosts, ports, methods and redirects', async () => {
  const run = async (url: string, method = 'GET', status = 200) => {
    let aborted = false, fetched = false, fulfilled = false;
    await handlePdfRequest({ request: () => ({ url: () => url, method: () => method }), abort: async () => { aborted = true; }, fetch: async (options: any) => { fetched = true; assert.equal(options.maxRedirects, 0); return { status: () => status }; }, fulfill: async () => { fulfilled = true; } } as any);
    return { aborted, fetched, fulfilled };
  };
  for (const url of ['http://127.0.0.1/', 'http://169.254.169.254/', 'https://fonts.gstatic.com.evil.example/font', 'https://fonts.gstatic.com:444/font', 'https://example.com/photo']) assert.deepEqual(await run(url), { aborted: true, fetched: false, fulfilled: false });
  assert.equal((await run('https://fonts.gstatic.com/font', 'POST')).fetched, false);
  assert.deepEqual(await run('https://fonts.gstatic.com/font', 'GET', 302), { aborted: true, fetched: true, fulfilled: false });
  assert.deepEqual(await run('https://fonts.gstatic.com/font'), { aborted: false, fetched: true, fulfilled: true });
});

test('rate limit enforces window, separates IPs, and provides Retry-After', () => {
  let now = 1000;
  const limit = createRateLimiter(2, 1000, () => now);
  const call = (ip: string) => { const res = response(); let allowed = false; limit({ ip }, res, () => { allowed = true; }); return { res, allowed }; };
  assert.ok(call('a').allowed); assert.ok(call('a').allowed);
  assert.equal(call('a').res.code, 429); assert.equal(call('a').res.headers['Retry-After'], '1');
  assert.ok(call('b').allowed); now = 2000; assert.ok(call('a').allowed);
});

test('PDF concurrency slots stay bounded and release is idempotent', () => {
  const slots = createConcurrencyLimit(2);
  const a = slots.acquire()!; const b = slots.acquire()!;
  assert.equal(slots.acquire(), null); a(); a();
  const c = slots.acquire()!; assert.equal(slots.acquire(), null); b(); c();
  assert.ok(slots.acquire()); assert.ok(slots.acquire()); assert.equal(slots.acquire(), null);
});

test('fallback never grants a minimum match or fabricates matching skills', () => {
  const result = generateFallbackJobAnalysis('Python SQL', '', [], [], []);
  assert.equal(result.matchPercentage, 0); assert.deepEqual(result.foundSkills, []);
  assert.equal(result.analysisSource, 'keyword-overlap');
  const matched = generateFallbackJobAnalysis('Python SQL', '', ['Python'], [], []);
  assert.equal(matched.matchPercentage, 50); assert.deepEqual(matched.foundSkills, ['Python']);
  assert.deepEqual(generateFallbackJobAnalysis('NoSQL', '', ['SQL'], [], []).foundSkills, []);
  assert.equal(generateFallbackJobAnalysis('Comunicação.', '', ['Comunicacao'], [], []).matchPercentage, 100);
  assert.equal(generateFallbackJobAnalysis('Go e C++', '', ['Go', 'C++'], [], []).matchPercentage, 100);
});

test('malformed AI JSON is rejected even when syntactically valid', () => {
  assert.equal(validateAiAnalysis({ matchPercentage: 72 }), false);
  assert.equal(validateAiResume({ targetRole: 'Dev', professionalSummary: 'Text', experiences: [{ bullets: [42] }] }), false);
  assert.ok(validateAiAnalysis(generateFallbackJobAnalysis('Python', '', [], [], [])));
});

test('saved resumes restore raw inputs and legacy data without blanking experience', () => {
  const resume: OptimizedResume = { personal: { fullName: 'Ana', email: '', phone: '', cityState: '', linkedin: '', hasPhoto: false }, targetRole: 'Dev', professionalSummary: 'Resumo', experiences: [{ id: '1', company: 'Empresa', role: 'Dev', period: '03/2021 — 04/2024', isCurrent: false, bullets: ['Entregou software'] }], education: [], skills: ['SQL'], tools: [], courses: [], templateStyle: 'impact', generatedAt: '' };
  const legacy = restoreResumeForm(resume);
  assert.equal(legacy.experiences[0].startDate, '03/2021'); assert.equal(legacy.experiences[0].endDate, '04/2024');
  assert.equal(legacy.experiences[0].activitiesRaw, 'Entregou software'); assert.equal(legacy.targetJob.roleTitle, 'Dev');
  const source = { ...legacy, targetJob: { ...legacy.targetJob, jobDescription: 'Vaga original' }, experiences: [{ ...legacy.experiences[0], activitiesRaw: 'Texto original' }] };
  assert.equal(restoreResumeForm({ ...resume, sourceForm: source }).experiences[0].activitiesRaw, 'Texto original');
  assert.equal(restoreResumeForm({ ...resume, sourceForm: source }).targetJob.jobDescription, 'Vaga original');
});
