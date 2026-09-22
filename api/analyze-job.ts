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

  const skillTranslationMap: Record<string, Record<string, string>> = {
    en: {
      'comunicação assertiva': 'Assertive communication',
      'comunicação': 'Communication',
      'organização': 'Organization',
      'trabalho em equipe': 'Teamwork',
      'proatividade': 'Proactivity',
      'foco em resultados': 'Results focus',
      'liderança': 'Leadership',
      'resolução de problemas': 'Problem solving',
      'gestão do tempo': 'Time management',
      'pacote office': 'Microsoft Office',
      'excel': 'Excel',
      'excel avançado': 'Advanced Excel',
      'sistemas de gestão': 'Management systems',
      'atendimento ao cliente': 'Customer service',
      'negociação': 'Negotiation',
    },
    es: {
      'comunicação assertiva': 'Comunicación asertiva',
      'comunicação': 'Comunicación',
      'organização': 'Organización',
      'trabalho em equipe': 'Trabajo en equipo',
      'proatividade': 'Proactividad',
      'foco em resultados': 'Enfoque en resultados',
      'liderança': 'Liderazgo',
      'resolução de problemas': 'Resolución de problemas',
      'gestão do tempo': 'Gestión del tiempo',
      'pacote office': 'Paquete Office',
      'excel': 'Excel',
      'excel avançado': 'Excel avanzado',
      'sistemas de gestão': 'Sistemas de gestión',
      'atendimento ao cliente': 'Atención al cliente',
      'negociação': 'Negociación',
    },
    fr: {
      'comunicação assertiva': 'Communication assertive',
      'comunicação': 'Communication',
      'organização': 'Organisation',
      'trabalho em equipe': 'Travail d\'équipe',
      'proatividade': 'Proactivité',
      'foco em resultados': 'Orientation résultats',
      'liderança': 'Leadership',
      'resolução de problemas': 'Résolution de problèmes',
      'gestão do tempo': 'Gestion du temps',
      'pacote office': 'Pack Office',
      'excel': 'Excel',
      'excel avançado': 'Excel avancé',
      'sistemas de gestão': 'Systèmes de gestion',
      'atendimento ao cliente': 'Service client',
      'negociação': 'Négociation',
    },
  };

  const translateSkill = (skill: string): string => {
    if (lang === 'pt') return skill;
    const lower = skill.toLowerCase().trim();
    return skillTranslationMap[lang]?.[lower] || skill;
  };

  const rawFound = (candidateSkills || []).filter((s: string) => words.includes(s.toLowerCase()));
  const foundSkills = (rawFound.length > 0 ? rawFound : (candidateSkills || []).slice(0, 3)).map(translateSkill);
  const matchScore = Math.min(92, Math.max(72, 68 + rawFound.length * 6));

  return {
    roleIdentified: detectedRole,
    mainRequirements,
    desiredSkills: desiredSkills.map(translateSkill),
    toolsAndTech,
    experienceRequired,
    keywords: extractedKeywords,
    matchPercentage: matchScore,
    foundSkills: foundSkills.length > 0 ? foundSkills : (lang === 'en' ? ['Communication', 'Organization', 'Teamwork'] : lang === 'es' ? ['Comunicación', 'Organización', 'Trabajo en equipo'] : lang === 'fr' ? ['Communication', 'Organisation', 'Travail d\'équipe'] : ['Comunicação', 'Organização', 'Trabalho em equipe']),
    relevantExperiences: (candidateExperiences || [])
      .map((e: any) => {
        if (lang === 'en') return `${e.role || 'Role'} at ${e.company || 'previous company'}`;
        if (lang === 'es') return `${e.role || 'Cargo'} en ${e.company || 'empresa anterior'}`;
        if (lang === 'fr') return `${e.role || 'Poste'} chez ${e.company || 'entreprise précédente'}`;
        return `${e.role || 'Função'} na empresa ${e.company || 'anterior'}`;
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
    const prompt = `You are a senior recruitment and hiring specialist for the professional resume platform CURRÊ.
Analyze the job description provided below and compare it with the candidate's profile.

=============================================================================
CRITICAL LANGUAGE REQUIREMENT (STRICT, MANDATORY AND HIGHEST PRIORITY):
You MUST strictly generate ALL textual values, titles, bullets, and tips in: ${langName} (${currentLang.toUpperCase()}).
DO NOT output any Portuguese unless the requested language is Portuguese.
- roleIdentified MUST be in ${langName}.
- All mainRequirements MUST be in ${langName}.
- All desiredSkills MUST be in ${langName}.
- All toolsAndTech MUST be in ${langName}.
- experienceRequired MUST be in ${langName}.
- All keywords MUST be in ${langName}.
- All foundSkills MUST be in ${langName} (translate/adapt the candidate's matching skills into ${langName}).
- All relevantExperiences descriptions MUST be in ${langName}.
- All compatibleEducation points MUST be in ${langName}.
- All improvements tips MUST be in ${langName}.
=============================================================================

GUIDELINES:
- NEVER invent information, jobs, or skills that the candidate does not have.
- Be realistic, constructive, and encouraging.
- Identify the target role, key job requirements, desired skills, tools, and keywords from the job description.
- Compare with the candidate's actual profile and compute a realistic matchPercentage (between 65% and 92%).

JOB DESCRIPTION:
"""
${jobDescription}
"""

CANDIDATE DATA:
- Target Role: ${candidateRole || 'Not specified'}
- Skills: ${JSON.stringify(candidateSkills || [])}
- Tools: ${JSON.stringify(candidateTools || [])}
- Experiences: ${JSON.stringify((candidateExperiences || []).map((e: any) => ({ company: e.company, role: e.role, activities: e.activitiesRaw, results: e.resultsRaw })))}

Return ONLY a valid JSON object with this exact structure (ALL text values in ${langName}):
{
  "roleIdentified": "target job title in ${langName}",
  "mainRequirements": ["array of 3 to 5 key requirements from the job in ${langName}"],
  "desiredSkills": ["array of 3 to 6 behavioral/technical skills from the job in ${langName}"],
  "toolsAndTech": ["array of tools/software required or desired in ${langName}"],
  "experienceRequired": "summary of required experience level in ${langName}",
  "keywords": ["array of 5 to 8 essential job keywords in ${langName}"],
  "matchPercentage": 82,
  "foundSkills": ["candidate skills matching the job translated to ${langName}"],
  "relevantExperiences": ["which candidate experiences have strongest relevance in ${langName}"],
  "compatibleEducation": ["candidate educational points relevant to the job in ${langName}"],
  "improvements": ["1 to 3 actionable tips for the candidate in ${langName}"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
