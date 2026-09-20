/**
 * Utilitário de refinamento de experiências profissionais para o CURRÊ.
 * Transforma anotações brutas e coloquiais em marcadores profissionais,
 * fluidos e variados, sem jargões repetitivos como "Atuação com foco".
 */

// Conjunto variado de verbos de ação para rotação natural quando necessário
const DIVERSE_ACTION_OPENERS = [
  'Gestão e acompanhamento de',
  'Desenvolvimento e execução de',
  'Elaboração, controle e organização de',
  'Condução de rotinas voltadas a',
  'Suporte estratégico e operacional em',
  'Mapeamento, análise e otimização de',
  'Estruturação e padronização de processos de',
  'Apoio técnico e operacional nas demandas de',
  'Planejamento e implementação de atividades de',
  'Supervisão e monitoramento contínuo de',
];

// Mapeamento abrangente de termos coloquiais e verbos conjugados para linguagem executiva formal
const COLLOQUIAL_REPLACEMENTS: Array<{ regex: RegExp; replacement: string }> = [
  { regex: /^(eu\s+)?(cuidava\s+de|ficava\s+com|tomava\s+conta\s+de|cuidar\s+de)\s+/i, replacement: 'Gestão e controle de ' },
  { regex: /^(eu\s+)?(fazia|realizava|executava|fazer|executar)\s+/i, replacement: 'Execução e acompanhamento de ' },
  { regex: /^(eu\s+)?(ajudava\s+a|auxiliava\s+em|dava\s+suporte\s+a|ajudar\s+a|auxiliar\s+em)\s+/i, replacement: 'Prestação de suporte operacional em ' },
  { regex: /^(eu\s+)?(atendia|falava\s+com|atender)\s+/i, replacement: 'Atendimento consultivo e relacionamento com ' },
  { regex: /^(eu\s+)?(organizava|arrumava|organizar)\s+/i, replacement: 'Organização e estruturação de ' },
  { regex: /^(eu\s+)?(vendia|fazia\s+vendas|vender)\s+/i, replacement: 'Prospecção ativa e condução de negociações de ' },
  { regex: /^(eu\s+)?(criava|desenvolvia|criar|desenvolver)\s+/i, replacement: 'Criação e desenvolvimento de ' },
  { regex: /^(eu\s+)?(lançava|digitava|lançar|digitar)\s+/i, replacement: 'Registro, conciliação e lançamento de ' },
  { regex: /^(eu\s+)?(analisava|verificava|conferia|analisar|conferir)\s+/i, replacement: 'Análise criteriosa e conferência de ' },
  { regex: /^(eu\s+)?(gerenciava|coordenava|liderava|gerenciar|coordenar)\s+/i, replacement: 'Coordenação e liderança de ' },
  { regex: /^(eu\s+)?(emitia|gerava|extraía|emitir|gerar)\s+/i, replacement: 'Emissão e consolidação de ' },
  { regex: /^(eu\s+)?(treinava|capacitava|ensinava|treinar)\s+/i, replacement: 'Capacitação e treinamento de ' },
  { regex: /^(eu\s+)?(implantava|instalava|configurava|instalar|implantar)\s+/i, replacement: 'Implantação, configuração e suporte a ' },
  { regex: /^(eu\s+)?(negociava|alinhava|negociar)\s+/i, replacement: 'Negociação estratégica e alinhamento com ' },
  { regex: /^(eu\s+)?(monitorava|acompanhava|monitorar|acompanhar)\s+/i, replacement: 'Monitoramento contínuo e acompanhamento de ' },
  { regex: /^(eu\s+)?(revisava|auditava|revisar|auditar)\s+/i, replacement: 'Auditoria, revisão e validação de ' },
  { regex: /^(eu\s+)?(redigia|escrevia|redigir|escrever)\s+/i, replacement: 'Redação e elaboração de ' },
  { regex: /^(eu\s+)?(controlava|controlar)\s+/i, replacement: 'Controle sistemático e acompanhamento de ' },
];

/**
 * Converte um texto de atividades em marcadores refinados, fluídos e sem repetição.
 */
export function formatExperienceBullets(
  rawActivities: string,
  rawResults?: string,
  role?: string
): string[] {
  const cleanActivities = (rawActivities || '').trim();
  const cleanResults = (rawResults || '').trim();
  const bullets: string[] = [];

  if (cleanActivities) {
    // Separa por quebras de linha ou pontos finais
    const rawLines = cleanActivities
      .split(/\n|(?<=[.!?])\s+/)
      .map((s) => s.replace(/^[-•*–—\d.)\s]+/, '').trim())
      .filter((s) => s.length > 2);

    const usedOpeners = new Set<string>();

    rawLines.forEach((line, index) => {
      let refinedLine = line;

      // 1. Testa se bate com algum padrão coloquial conhecido
      let matchedColloquial = false;
      for (const item of COLLOQUIAL_REPLACEMENTS) {
        if (item.regex.test(refinedLine)) {
          refinedLine = refinedLine.replace(item.regex, item.replacement);
          matchedColloquial = true;
          break;
        }
      }

      // 2. Se não tinha padrão coloquial e a frase começa como verbo no infinitivo ou substantivo solto
      if (!matchedColloquial) {
        // Se a frase já começar com maiúscula e parecer um substantivo ou verbo de ação formal, preserva
        if (/^(Gestão|Controle|Elaboração|Desenvolvimento|Atendimento|Organização|Coordenação|Planejamento|Análise|Suporte|Implementação|Liderança|Condução|Manutenção|Monitoramento|Emissão|Capacitação|Negociação|Auditoria|Execução)\b/i.test(refinedLine)) {
          refinedLine = refinedLine.charAt(0).toUpperCase() + refinedLine.slice(1);
        } else {
          // Seleciona um abridor variado que ainda não foi usado nesta experiência
          const availableOpeners = DIVERSE_ACTION_OPENERS.filter((op) => !usedOpeners.has(op));
          const opener = availableOpeners[index % availableOpeners.length] || DIVERSE_ACTION_OPENERS[index % DIVERSE_ACTION_OPENERS.length];
          usedOpeners.add(opener);

          const firstLetterLower = refinedLine.charAt(0).toLowerCase() + refinedLine.slice(1);
          refinedLine = `${opener} ${firstLetterLower}`;
        }
      } else {
        refinedLine = refinedLine.charAt(0).toUpperCase() + refinedLine.slice(1);
      }

      // Ajusta contrações gramaticais naturais em português (ex: "de a" -> "da")
      refinedLine = refinedLine
        .replace(/\bde\s+a\b/gi, 'da')
        .replace(/\bde\s+o\b/gi, 'do')
        .replace(/\bde\s+as\b/gi, 'das')
        .replace(/\bde\s+os\b/gi, 'dos')
        .replace(/\bem\s+a\b/gi, 'na')
        .replace(/\bem\s+o\b/gi, 'no')
        .replace(/\bem\s+as\b/gi, 'nas')
        .replace(/\bem\s+os\b/gi, 'nos');

      // Garante pontuação final suave
      if (!/[.!]$/.test(refinedLine)) {
        refinedLine += '.';
      }

      bullets.push(refinedLine);
    });
  }

  // Se nenhuma linha foi detectada, cria uma descrição profissional padrão elegante
  if (bullets.length === 0) {
    bullets.push(`Condução e execução das responsabilidades estratégicas e operacionais do cargo de ${role || 'atuação'}.`);
  }

  // Incorpora o resultado real informado pelo usuário sem fórmula robótica
  if (cleanResults) {
    const cleanRes = cleanResults.replace(/^[-•*–—\s]+/, '').trim();
    const formattedRes = cleanRes.charAt(0).toUpperCase() + cleanRes.slice(1);
    
    // Se o usuário já escreveu uma frase completa, usa diretamente com elegância
    if (/^(Com|Através|Alcançou|Atingiu|Reduziu|Aumentou|Conquistou|Otimizou|Obteve|Gerou)\b/i.test(formattedRes)) {
      bullets.push(`${formattedRes}${/[.!]$/.test(formattedRes) ? '' : '.'}`);
    } else {
      bullets.push(`Resultado de destaque: ${formattedRes}${/[.!]$/.test(formattedRes) ? '' : '.'}`);
    }
  }

  return bullets.slice(0, 4);
}
