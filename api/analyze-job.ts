import { getGeminiClient, generateGeminiContent } from './geminiClient.js';
import { validatePayload, validateAiAnalysis } from './validation.js';
import { containsKeyword, keywordOverlap } from './jobMatching.js';

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
  const lang = (language || "pt").toLowerCase();
  const labels: Record<string, string> = { pt: "Cargo alinhado à oportunidade", en: "Role aligned with opportunity", es: "Puesto alineado con la oportunidad", fr: "Poste adapté à la candidature" };
  const detectedRole = candidateRole || labels[lang] || labels.pt;
  const tips: Record<string, string[]> = { pt: ["Destaque resultados reais e as ferramentas utilizadas nas suas experiências."], en: ["Highlight real results and the tools used in your experience."], es: ["Destaque resultados reales y las herramientas utilizadas en su experiencia."], fr: ["Mettez en valeur les résultats réels et les outils utilisés dans vos expériences."] };
  const improvements = tips[lang] || tips.pt;

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

  const rawFound = (candidateSkills || []).filter((s: string) => containsKeyword(jobDescription, s));
  const foundSkills = rawFound.map(translateSkill);
  // This fallback measures literal keyword overlap, not hiring probability.
  const profile = [...(candidateSkills || []), ...(candidateTools || []), candidateRole || '', ...(candidateExperiences || []).map(e => `${e.role || ''} ${e.activitiesRaw || ''} ${e.resultsRaw || ''}`)].join(' ').toLowerCase();
  const { keywords, percentage: matchScore } = keywordOverlap(jobDescription, profile);

  return {
    roleIdentified: detectedRole,
    mainRequirements: jobDescription.split(/[\n.!?]+/).map(line => line.trim()).filter(Boolean).slice(0, 5),
    desiredSkills: foundSkills,
    toolsAndTech: (candidateTools || []).filter(tool => containsKeyword(jobDescription, tool)),
    experienceRequired: '',
    keywords: keywords.slice(0, 12),
    matchPercentage: matchScore,
    foundSkills,
    analysisSource: 'keyword-overlap',
    relevantExperiences: (candidateExperiences || [])
      .filter((e: any) => keywords.some(word => containsKeyword(`${e.role || ''} ${e.activitiesRaw || ''} ${e.resultsRaw || ''}`, word)))
      .map((e: any) => {
        if (lang === 'en') return `${e.role || 'Role'} at ${e.company || 'previous company'}`;
        if (lang === 'es') return `${e.role || 'Cargo'} en ${e.company || 'empresa anterior'}`;
        if (lang === 'fr') return `${e.role || 'Poste'} chez ${e.company || 'entreprise précédente'}`;
        return `${e.role || 'Função'} na empresa ${e.company || 'anterior'}`;
      })
      .filter((s: string) => s.length > 0)
      .slice(0, 2),
    compatibleEducation: [],
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

  if (!validatePayload('analysis', req.body)) return res.status(400).json({ error: 'Dados da vaga ou do candidato inválidos.' });
  const { jobDescription, candidateRole, candidateSkills, candidateTools, candidateExperiences, language = 'pt' } = req.body;
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
- Compare with the candidate's actual profile and compute a realistic matchPercentage between 0 and 100. Missing qualifications must lower the score; never impose a minimum score.

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

    const response = await generateGeminiContent(ai, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    if (!validateAiAnalysis(parsed)) throw new Error('Invalid AI analysis structure');
    return res.json({ ...parsed, analysisSource: 'ai' });
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
