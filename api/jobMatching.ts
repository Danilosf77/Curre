const stopWords = new Set('a o os as um uma de do da dos das e em no na nos nas por para com que se vaga vagas candidato candidata buscamos procuramos the and for with in of to an a job role is are we you your y el la los las un una en de del con para puesto et le la les un une des du dans pour avec poste'.split(' '));
const tokens = (value: string) => (value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[\p{L}\p{N}+#]+(?:[.-][\p{L}\p{N}+#]+)*/gu) || []);

export function containsKeyword(text: string, keyword: string): boolean {
  const phrase = tokens(keyword).join(' ');
  return !!phrase && ` ${tokens(text).join(' ')} `.includes(` ${phrase} `);
}

export function keywordOverlap(description: string, profile: string) {
  const keywords = [...new Set(tokens(description).filter(word => !stopWords.has(word)))];
  return { keywords, percentage: keywords.length ? Math.round(100 * keywords.filter(word => containsKeyword(profile, word)).length / keywords.length) : 0 };
}
