/** Public diagnostics contain no provider message, credentials or resume text. */
export function aiFailure(error: any) {
  const status = Number(error?.status ?? error?.code);
  const message = typeof error?.message === 'string' ? error.message : '';
  const quota = status === 429 || /RESOURCE_EXHAUSTED|quota exceeded/i.test(message);
  const timeout = /timeout|timed out|abort/i.test(message);
  const category = quota ? 'provider_quota' : timeout ? 'provider_timeout' : status === 404 ? 'model_unavailable' : status === 401 || status === 403 ? 'provider_auth' : error instanceof SyntaxError ? 'invalid_json' : message === 'Invalid response' || message === 'Invalid AI resume structure' ? 'invalid_structure' : 'provider_failure';
  return {
    category,
    providerStatus: Number.isFinite(status) ? status : null,
    message: quota ? 'O serviço de IA atingiu a cota disponível. A geração e a revisão dependem da liberação dessa cota no Google AI Studio.' : timeout ? 'O serviço de IA demorou além do limite. Tente novamente em instantes.' : category === 'provider_auth' ? 'O serviço de IA recusou a autenticação. Verifique a configuração da chave no servidor.' : category === 'model_unavailable' ? 'O modelo de IA está indisponível para esta conta.' : 'O serviço de IA não concluiu a solicitação. Tente novamente em instantes.',
  };
}
