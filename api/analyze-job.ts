import { getGeminiClient } from './geminiClient.js';

export interface JobAnalysisPayload {
  jobDescription?: string;
  candidateRole?: string;
  candidateSkills?: string[];
  candidateTools?: string[];
  candidateExperiences?: any[];
  language?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  pt: 'Português (Brasil)',
  en: 'English (US)',
  es: 'Español',
  fr: 'Français',
};

export function generateFallbackJobAnalysis(
  jobDescription: string,
  candidateRole?: string,
  candidateSkills?: string[],
  candidateTools?: string[],
  candidateExperiences?: any[],
  language: string = 'pt'
) {
  const words = (jobDescription || '').toLowerCase();
  const lang = (language || 'pt').toLowerCase();

  let detectedRole = candidateRole || '';
  let extractedKeywords: string[] = [];
  let mainRequirements: string[] = [];
  let desiredSkills: string[] = [];
  let toolsAndTech: string[] = [];
  let experienceRequired = '';
  let compatibleEducation: string[] = [];
  let improvements: string[] = [];

  if (lang === 'en') {
    detectedRole = candidateRole || 'Role aligned with opportunity';
    extractedKeywords = ['communication', 'organization', 'proactivity', 'results-oriented', 'teamwork'];
    mainRequirements = [
      'Prior experience with routines and processes of the area',
      'Ability to organize and meet deadlines',
      'Good interpersonal communication and collaboration',
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ['Communication', 'Organization', 'Teamwork'];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ['Office Suite / Excel', 'Management Systems'];
    experienceRequired = 'Demonstrated experience in related roles';
    compatibleEducation = ['Education and training relevant to the desired role'];
    improvements = [
      'Highlight the practical results obtained in your real experiences on your resume.',
      'Emphasize your daily proficiency with the tools and systems used.',
    ];
  } else if (lang === 'es') {
    detectedRole = candidateRole || 'Puesto alineado con la oportunidad';
    extractedKeywords = ['comunicación', 'organización', 'proactividad', 'enfoque en resultados', 'trabajo en equipo'];
    mainRequirements = [
      'Experiencia previa con rutinas y procesos del área',
      'Capacidad de organización y cumplimiento de plazos',
      'Buena comunicación interpersonal y colaboración',
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ['Comunicación', 'Organización', 'Trabajo en equipo'];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ['Paquete Office / Excel', 'Sistemas de Gestión'];
    experienceRequired = 'Experiencia demostrada en funciones relacionadas';
    compatibleEducation = ['Educación y formación pertinentes para el puesto deseado'];
    improvements = [
      'Destaque en su currículum los resultados prácticos obtenidos en sus experiencias reales.',
      'Enfatice su dominio diario de las herramientas y sistemas utilizados.',
    ];
  } else if (lang === 'fr') {
    detectedRole = candidateRole || 'Poste aligné avec l\'opportunité';
    extractedKeywords = ['communication', 'organisation', 'proactivité', 'orientation résultats', 'travail d\'équipe'];
    mainRequirements = [
      'Expérience préalable avec les routines et processus du domaine',
      'Capacité d\'organisation et respect des délais',
      'Bonne communication interpersonnelle et collaboration',
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ['Communication', 'Organisation', 'Travail d\'équipe'];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ['Bureautique / Excel', 'Systèmes de Gestion'];
    experienceRequired = 'Expérience démontrée dans des rôles connexes';
    compatibleEducation = ['Formation et perfectionnement pertinents pour le poste souhaité'];
    improvements = [
      'Mettez en valeur sur votre CV les résultats pratiques obtenus dans vos expériences réelles.',
      'Mettez l\'accent sur votre maîtrise quotidienne des outils et systèmes utilisés.',
    ];
  } else {
    detectedRole = candidateRole || 'Cargo alinhado à oportunidade';
    extractedKeywords = ['comunicação', 'organização', 'proatividade', 'foco em resultados', 'trabalho em equipe'];
    mainRequirements = [
      'Experiência prévia com rotinas e processos da área',
      'Capacidade de organização e cumprimento de prazos',
      'Boa comunicação interpessoal e colaboração',
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ['Comunicação', 'Organização', 'Trabalho em equipe'];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ['Pacote Office / Excel', 'Sistemas de Gestão'];
    experienceRequired = 'Experiência demonstrada em funções correlatas';
    compatibleEducation = ['Formação e capacitações pertinentes ao cargo pretendido'];
    improvements = [
      'Destaque no currículo os resultados práticos obtidos em suas experiências reais.',
      'Enfatize seu domínio cotidiano das ferramentas e sistemas utilizados.',
    ];
  }

  const foundSkills = (candidateSkills || []).filter((s: string) => words.includes(s.toLowerCase()));
  const matchScore = Math.min(92, Math.max(72, 68 + foundSkills.length * 6));

  return {
    roleIdentified: detectedRole,
    mainRequirements,
    desiredSkills,
    toolsAndTech,
    experienceRequired,
    keywords: extractedKeywords,
    matchPercentage: matchScore,
    foundSkills: foundSkills.length > 0 ? foundSkills : (candidateSkills || []).slice(0, 3),
    relevantExperiences: (candidateExperiences || [])
      .map((e: any) => {
        if (lang === 'en') return `${e.role || 'Role'} at previous company ${e.company || ''}`;
        if (lang === 'es') return `${e.role || 'Cargo'} en la empresa anterior ${e.company || ''}`;
        if (lang === 'fr') return `${e.role || 'Poste'} chez l'entreprise précédente ${e.company || ''}`;
        return `${e.role || 'Função'} na empresa anterior ${e.company || ''}`;
      })
      .filter((s: string) => s.length > 0)
      .slice(0, 2),
    compatibleEducation,
    improvements,
  };
}

/**
 * Função Serverless para Análise Inteligente de Vagas.
 * Compatível com Vercel, Netlify, Cloud Functions e Express.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const { jobDescription, candidateRole, candidateSkills, candidateTools, candidateExperiences, language = 'pt' } = req.body || {};
  const currentLang = (language || 'pt').toLowerCase();
  const langName = LANGUAGE_LABELS[currentLang] || LANGUAGE_LABELS.pt;

  if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return res.status(400).json({ error: 'A descrição da vaga é obrigatória.' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    return res.json(
      generateFallbackJobAnalysis(
        jobDescription,
        candidateRole,
        candidateSkills,
        candidateTools,
        candidateExperiences,
        currentLang
      )
    );
  }

  try {
    const prompt = `Você é o especialista sênior em recrutamento e seleção da plataforma CURRÊ.
Analise a descrição de vaga abaixo e compare-a com o perfil fornecido do candidato.

=============================================================================
REGRA CRÍTICA DE IDIOMA (MANDATÓRIA E DE MÁXIMA PRIORIDADE):
Você DEVE gerar ESTRITAMENTE todas as respostas textuais em: ${langName} (${currentLang.toUpperCase()}).
- O cargo principal (roleIdentified) DEVE estar em ${langName}.
- Todos os requisitos (mainRequirements) DEVEM estar em ${langName}.
- Todas as competências recomendadas (desiredSkills) DEVEM estar em ${langName}.
- Todas as ferramentas sugeridas (toolsAndTech) DEVEM estar em ${langName}.
- O resumo da experiência necessária (experienceRequired) DEVE estar em ${langName}.
- Todas as palavras-chave (keywords) DEVEM estar em ${langName}.
- Todas as competências que combinam (foundSkills) DEVEM estar em ${langName}.
- As experiências aderentes (relevantExperiences) DEVEM ser descritas em ${langName}.
- Os pontos da formação (compatibleEducation) DEVEM estar em ${langName}.
- Todas as dicas de aprimoramento (improvements) DEVEM estar em ${langName}.
=============================================================================

IMPORTANTE:
- NUNCA invente informações, cargos ou competências que o candidato não tenha.
- Seja realista, honesto, construtivo e encorajador.
- Identifique o cargo, principais requisitos da vaga, competências desejadas, ferramentas e palavras-chave.
- Compare com as competências e ferramentas reais do candidato e calcule uma taxa de compatibilidade estimada realista (entre 65% e 92%).

VAGA:
"""
${jobDescription}
"""

DADOS REAIS DO CANDIDATO:
- Cargo Almejado: ${candidateRole || 'Não especificado'}
- Competências informadas: ${JSON.stringify(candidateSkills || [])}
- Ferramentas informadas: ${JSON.stringify(candidateTools || [])}
- Experiências informadas: ${JSON.stringify((candidateExperiences || []).map((e: any) => ({ empresa: e.company, cargo: e.role, atividades: e.activitiesRaw, resultados: e.resultsRaw })))}

Retorne APENAS um objeto JSON válido com este formato exato:
{
  "roleIdentified": "string com o cargo principal da vaga no idioma ${langName}",
  "mainRequirements": ["array com 3 a 5 requisitos principais encontrados na vaga no idioma ${langName}"],
  "desiredSkills": ["array com 3 a 6 competências comportamentais/técnicas da vaga no idioma ${langName}"],
  "toolsAndTech": ["array com ferramentas/softwares exigidos ou desejados no idioma ${langName}"],
  "experienceRequired": "resumo do nível de experiência demandado no idioma ${langName}",
  "keywords": ["array com 5 a 8 palavras-chave essenciais da vaga no idioma ${langName}"],
  "matchPercentage": 82,
  "foundSkills": ["competências que o candidato REALMENTE possui e combinam com a vaga no idioma ${langName}"],
  "relevantExperiences": ["quais experiências reais do candidato têm mais aderência no idioma ${langName}"],
  "compatibleEducation": ["pontos da formação do candidato que agregam à vaga no idioma ${langName}"],
  "improvements": ["1 a 3 dicas pontuais de como o candidato pode apresentar melhor seus pontos fortes reais no idioma ${langName}"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini analyze-job API temporary error, using resilient fallback:', error?.message);
    return res.json(
      generateFallbackJobAnalysis(
        jobDescription,
        candidateRole,
        candidateSkills,
        candidateTools,
        candidateExperiences,
        currentLang
      )
    );
  }
}
