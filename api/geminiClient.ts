import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';
import { aiFailure } from './aiFailure.js';

let cachedClient: GoogleGenAI | null = null;
export const getGeminiModel = () => process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

/**
 * Retorna o cliente autenticado do Gemini de forma segura e encapsulada no lado do servidor.
 * A chave de API NUNCA é enviada ao navegador do cliente e é lida exclusivamente
 * da variável de ambiente `process.env.GEMINI_API_KEY`.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 18000,
        retryOptions: {
          attempts: 1,
          initialDelay: 1,
          maxDelay: 2,
          httpStatusCodes: [408, 500, 502, 503, 504],
        },
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return cachedClient;
}

export async function generateGeminiContent(client: GoogleGenAI, params: GenerateContentParameters) {
  try {
    return await client.models.generateContent(params);
  } catch (error) {
    const failure = aiFailure(error);
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.5-flash';
    if (fallbackModel === params.model || !['provider_busy', 'provider_internal', 'provider_network', 'provider_timeout', 'model_unavailable'].includes(failure.category)) throw error;
    console.warn('[Gemini model fallback]', {from: params.model, to: fallbackModel, category: failure.category});
    return client.models.generateContent({...params, model: fallbackModel});
  }
}
