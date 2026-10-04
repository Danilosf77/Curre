export function keywordOverlapLabel(language: string) {
  return ({ pt: 'Correspondência de palavras-chave (sem IA)', en: 'Keyword overlap (without AI)', es: 'Coincidencia de palabras clave (sin IA)', fr: 'Correspondance de mots-clés (sans IA)' } as Record<string, string>)[language] || 'Correspondência de palavras-chave (sem IA)';
}
export function basicResumeLabel(language: string) {
  return ({ pt: 'Versão básica gerada com seus dados. A otimização por IA não foi concluída.', en: 'Basic version generated from your data. AI optimization was not completed.', es: 'Versión básica generada con tus datos. La optimización con IA no se completó.', fr: "Version de base créée à partir de vos données. L’optimisation par IA n’a pas abouti." } as Record<string, string>)[language] || 'Versão básica gerada com seus dados. A otimização por IA não foi concluída.';
}
