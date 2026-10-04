import { useEffect, useRef, useState } from 'react';
import type { OptimizedResume, TemplateStyle } from '../types';
import { checkPdfText } from '../utils/pdfReading';
import { requestAi } from '../utils/aiRequests';

export function ResumeReview({resume, template, language}: {resume:OptimizedResume; template:TemplateStyle; language:string}) {
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [reading,setReading] = useState<{text:string;pages:number;checks:ReturnType<typeof checkPdfText>} | null>(null);
  const [review,setReview] = useState<any>(null);
  const [job,setJob] = useState(resume.sourceForm?.targetJob.jobDescription || '');
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    request.current?.abort(); request.current = null; setBusy(false); setReading(null); setReview(null); setError('');
    setJob(resume.sourceForm?.targetJob.jobDescription || '');
    return () => { request.current?.abort(); request.current = null; };
  }, [resume,template,language]);
  const run = async (ai:boolean) => {
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError(''); setReview(null);
    const timeout = setTimeout(() => controller.abort(), 60000);
    let document: any;
    let loadingTask: any;
    try {
      let result = reading;
      if (!result) {
        const response = await fetch('/api/generate-pdf',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({resume,template,language}), signal:controller.signal});
        if (!response.ok) throw new Error('Não foi possível gerar o arquivo para verificação. O download continua disponível pelo fluxo habitual.');
        const pdfjs = await import('pdfjs-dist');
        const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        loadingTask = pdfjs.getDocument({data:new Uint8Array(await response.arrayBuffer())});
        document = await loadingTask.promise;
        if (document.numPages > 30) throw new Error('O arquivo excede o limite de 30 páginas para revisão.');
        const pages:string[] = [];
        for (let i=1;i<=document.numPages;i++) {
          const page = await document.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item:any) => item.str || '').join(' '));
        }
        const text = pages.join('\n\n');
        if (text.length > 60000) throw new Error('Texto muito extenso para revisão.');
        result = {text,pages:document.numPages,checks:checkPdfText(text,resume)};
        if (controller.signal.aborted) return;
        setReading(result);
      }
      if (ai) {
        const data = await requestAi('/api/review-resume',{text:result.text,jobDescription:job,language},controller.signal);
        if (!controller.signal.aborted) setReview(data);
      }
    } catch (e:any) {
      if (!controller.signal.aborted) setError(ai ? 'Não conseguimos concluir a revisão agora. Tente novamente mais tarde. Seu currículo continua disponível.' : e.message || 'Não foi possível verificar o currículo.');
      else if (request.current === controller) setError('A verificação foi interrompida. Tente novamente.');
    } finally {
      clearTimeout(timeout); await loadingTask?.destroy();
      if (request.current === controller) setBusy(false);
    }
  };
  return <details className="no-print mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
    <summary className="cursor-pointer font-bold">Verificação do currículo <span className="ml-2 text-xs font-normal text-slate-500">Ver detalhes</span></summary>
    <div className="mt-4 space-y-4">
      <section><h3 className="font-bold">Leitura do arquivo</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Extrai o texto de um PDF gerado com o modelo atual e compara com seu conteúdo. Não certifica leitura por todos os ATS nem valida visualmente a ordem das colunas.</p>
        <button disabled={busy} onClick={() => run(false)} className="mt-3 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Verificando…' : 'Verificar PDF'}</button>
        {reading && <div className="mt-3"><p>{reading.pages} página(s) · {reading.text.trim().split(/\s+/).filter(Boolean).length} palavras extraídas</p><ul className="mt-2 space-y-1">{reading.checks.map(c => <li key={c.label}><span className={c.status === 'found' ? 'font-bold text-emerald-600 dark:text-emerald-400' : undefined}>{c.status === 'found' ? '✓' : c.status === 'empty' ? '—' : '⚠'}</span> {c.label}: {c.status === 'found' ? 'encontrado no PDF' : c.status === 'empty' ? 'não informado no currículo' : 'conteúdo não localizado integralmente'}</li>)}</ul><details className="mt-3"><summary className="cursor-pointer">Ver texto na ordem extraída</summary><p className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">{reading.text}</p></details></div>}
      </section>
      <section className="border-t border-slate-200 pt-4 dark:border-slate-700"><h3 className="font-bold">Revisão para a vaga por IA</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ao solicitar, o texto extraído e a vaga são enviados à IA para sugestões. Seu currículo não será modificado. A revisão não garante aprovação.</p><label className="mt-3 block">Descrição da vaga (opcional)<textarea value={job} maxLength={12000} disabled={busy} onChange={e => {setJob(e.target.value);setReview(null);}} className="mt-1 block w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-600" rows={3} placeholder="Cole a vaga para avaliar a relevância do currículo" /></label><button disabled={busy} onClick={() => run(true)} className="mt-3 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Analisando…' : 'Solicitar revisão por IA'}</button>
        {review && <div className="mt-3 space-y-3"><p>{review.summary}</p><h4 className="font-bold">Pontos fortes</h4><ul>{review.strengths.map((s:string,i:number) => <li key={i}>• {s}</li>)}</ul><h4 className="font-bold">Sugestões</h4>{review.suggestions.map((s:any,i:number) => <div key={i} className="rounded-lg bg-slate-100 p-3 dark:bg-slate-900"><p className="text-xs text-slate-500">Evidência: {s.evidence}</p><p>{s.action}</p></div>)}<ul className="text-xs text-slate-500">{review.limitations.map((s:string,i:number) => <li key={i}>• {s}</li>)}</ul></div>}
      </section>
      {error && <p role="alert" className="text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  </details>;
}
