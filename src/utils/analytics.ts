// Only public production hosts collect events. No resume contents or identifiers.
export const isAnalyticsHost = (host: string) => ['www.curreai.com', 'curreai.com', 'curre.onrender.com'].includes(host);
type EventName = 'inicio_curriculo' | 'etapa_concluida' | 'geracao_iniciada' | 'geracao_concluida' | 'geracao_falhou' | 'preview_visualizado' | 'modelo_selecionado';
type Params = { etapa?: number; idioma?: string; origem?: 'novo' | 'edicao' | 'nova_tentativa'; metodo?: 'ia' | 'basico'; categoria_erro?: 'timeout' | 'limite' | 'servidor' | 'rede_ou_resposta' | 'ia_indisponivel'; modelo?: string; duracao_ms?: number };

export function safeAnalyticsParams(params: Params): Record<string, string | number> {
  const safe: Record<string, string | number> = {};
  if (Number.isInteger(params.etapa) && params.etapa! >= 1 && params.etapa! <= 8) safe.etapa = params.etapa!;
  if (['pt','en','es','fr'].includes(params.idioma || '')) safe.idioma = params.idioma!;
  if (['novo','edicao','nova_tentativa'].includes(params.origem || '')) safe.origem = params.origem!;
  if (['ia','basico'].includes(params.metodo || '')) safe.metodo = params.metodo!;
  if (['timeout','limite','servidor','rede_ou_resposta','ia_indisponivel'].includes(params.categoria_erro || '')) safe.categoria_erro = params.categoria_erro!;
  if (['liquid-modern','executive-clean','ats-professional','impact','corporate-premium','minimalist','creative-color','elegant-serif','timeline-tech','international'].includes(params.modelo || '')) safe.modelo = params.modelo!;
  if (typeof params.duracao_ms === 'number' && Number.isFinite(params.duracao_ms)) safe.duracao_ms = Math.max(0, Math.min(300000, Math.round(params.duracao_ms)));
  return safe;
}

export function trackEvent(name: EventName, params: Params = {}) {
  if (typeof window === 'undefined' || !isAnalyticsHost(window.location.hostname)) return;
  // Ignore arbitrary runtime names and fields even if a caller bypasses TS.
  if (!['inicio_curriculo','etapa_concluida','geracao_iniciada','geracao_concluida','geracao_falhou','preview_visualizado','modelo_selecionado'].includes(name)) return;
  try {
    const tag = (window as any).gtag;
    if (typeof tag === 'function') tag('event', name, safeAnalyticsParams(params));
  } catch { /* Telemetry must never interrupt the user flow. */ }
}

export function generationErrorCategory(error: unknown): Params['categoria_erro'] {
  if (error instanceof Error && error.name === 'AbortError') return 'timeout';
  if (error instanceof Error && error.message === 'API status 429') return 'limite';
  if (error instanceof Error && /^API status 5\d\d$/.test(error.message)) return 'servidor';
  return 'rede_ou_resposta';
}
