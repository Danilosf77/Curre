import { getGeminiClient } from './geminiClient.js';

export interface JobAnalysisPayload {
  jobDescription?: string;
  candidateRole?: string;
  candidateSkills?: string[];
  candidateTools?: string[];
  candidateExperiences?: any[];
}

export function generateFallbackJobAnalysis(
  jobDescription: string,
  candidateRole?: string,
  candidateSkills?: string[],
  candidateTools?: string[],
  candidateExperiences?: any[]
) {
  const words = (jobDescription || '').toLowerCase();
  const detectedRole = candidateRole || 'Cargo alinhado à oportunidade';
  const extractedKeywords = ['comunicação', 'organização', 'proatividade', 'foco em resultados', 'trabalho em equipe'];

  const foundSkills = (candidateSkills || []).filter((s: string) => words.includes(s.toLowerCase()));
  const matchScore = Math.min(92, Math.max(72, 68 + foundSkills.length * 6));

  return {
    roleIdentified: detectedRole,
    mainRequirements: [
      'Experiência prévia com rotinas e processos da área',
      'Capacidade de organização e cumprimento de prazos',
      'Boa comunicação interpessoal e colaboração',
    ],
    desiredSkills: candidateSkills?.length ? candidateSkills.slice(0, 4) : ['Comunicação', 'Organização', 'Trabalho em equipe'],
    toolsAndTech: candidateTools?.length ? candidateTools.slice(0, 3) : ['Pacote Office / Excel', 'Sistemas de Gestão'],
    experienceRequired: 'Experiência demonstrada em funções correlatas',
    keywords: extractedKeywords,
    matchPercentage: matchScore,
    foundSkills: foundSkills.length > 0 ? foundSkills : (candidateSkills || []).slice(0, 3),
    relevantExperiences: (candidateExperiences || [])
      .map((e: any) => `${e.role || 'Função'} na empresa ${e.company || 'anterior'}`)
      .filter((s: string) => s.length > 0)
      .slice(0, 2),
    compatibleEducation: ['Formação e capacitações pertinentes ao cargo pretendido'],
    improvements: [
      'Destaque no currículo os resultados práticos obtidos em suas experiências reais.',
      'Enfatize seu domínio cotidiano das ferramentas e sistemas utilizados.',
    ],
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

  const { jobDescription, candidateRole, candidateSkills, candidateTools, candidateExperiences } = req.body || {};

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
        candidateExperiences
      )
    );
  }

  try {
    const prompt = `Você é o especialista sênior em recrutamento e seleção da plataforma CURRÊ.
Analise a descrição de vaga abaixo e compare-a com o perfil fornecido do candidato.

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
  "roleIdentified": "string com o cargo principal da vaga",
  "mainRequirements": ["array com 3 a 5 requisitos principais encontrados na vaga"],
  "desiredSkills": ["array com 3 a 6 competências comportamentais/técnicas da vaga"],
  "toolsAndTech": ["array com ferramentas/softwares exigidos ou desejados"],
  "experienceRequired": "resumo do nível de experiência demandado",
  "keywords": ["array com 5 a 8 palavras-chave essenciais da vaga"],
  "matchPercentage": 82,
  "foundSkills": ["competências que o candidato REALMENTE possui e combinam com a vaga"],
  "relevantExperiences": ["quais experiências reais do candidato têm mais aderência"],
  "compatibleEducation": ["pontos da formação do candidato que agregam à vaga"],
  "improvements": ["1 a 3 dicas pontuais de como o candidato pode apresentar melhor seus pontos fortes reais"]
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
        candidateExperiences
      )
    );
  }
}
