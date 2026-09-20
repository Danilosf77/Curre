import { getGeminiClient } from './geminiClient.js';
import { formatExperienceBullets } from '../src/utils/textBeautifier.js';

export function generateFallbackResume(data: any) {
  const { personal, targetJob, experiences, education, skills, tools, courses, jobAnalysis } = data;

  const optimizedExp = (experiences || []).map((exp: any) => {
    const bullets = formatExperienceBullets(exp.activitiesRaw || '', exp.resultsRaw || '', exp.role);

    const period = exp.isCurrent
      ? `${exp.startDate || 'Início'} — Atual`
      : `${exp.startDate || 'Início'} — ${exp.endDate || 'Término'}`;

    return {
      id: exp.id,
      company: exp.company,
      role: exp.role,
      period,
      isCurrent: !!exp.isCurrent,
      bullets,
    };
  });

  const summary = `Profissional dedicado(a) com objetivo de atuação como ${targetJob?.roleTitle || 'Profissional'}. Perfil proativo com experiência em ${
    skills?.slice(0, 3)?.join(', ') || 'atividades correlatas'
  }, buscando contribuir com resultados sólidos e evolução contínua na organização.`;

  return {
    personal: personal || {},
    targetRole: targetJob?.roleTitle || 'Profissional',
    professionalSummary: summary,
    experiences: optimizedExp,
    education: education || [],
    skills: skills || [],
    tools: tools || [],
    courses: courses || [],
    jobAnalysis: jobAnalysis || undefined,
    templateStyle: 'liquid-modern',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Função Serverless para Otimização e Geração de Currículo Profissional.
 * Utiliza o modelo Gemini exclusivamente no lado do servidor com variáveis de ambiente.
 * Compatível com Vercel, Netlify, Cloud Functions e Express.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const { personal, targetJob, experiences, education, skills, tools, courses, jobAnalysis } = req.body || {};

  const ai = getGeminiClient();

  if (!ai) {
    return res.json(generateFallbackResume(req.body || {}));
  }

  try {
    const systemPrompt = `Você é o redator profissional sênior e especialista em ATS (Applicant Tracking Systems) do aplicativo CURRÊ ("Corra atrás da vaga certa").
Sua missão é transformar as informações fornecidas pelo usuário em um currículo profissional impecável, dinâmico, moderno, objetivo e de alto impacto para recrutadores.

DIRETRIZES CRÍTICAS DE LINGUAGEM E ESTILO (MUITO IMPORTANTE):
1. PROIBIÇÃO TERMINANTE DE BORDÕES E REPETIÇÕES:
   - É ESTRITAMENTE PROIBIDO usar expressões como "Atuação com foco em...", "Atuou com foco em...", "Com foco em...", "Responsável por..." ou fórmulas repetitivas.
   - NUNCA inicie múltiplos marcadores (bullets) com o mesmo verbo ou com a mesma estrutura sintática.
   - Cada marcador de uma mesma experiência DEVE iniciar com um verbo de ação expressivo, assertivo e diferente no pretérito perfeito (ex.: "Gerenciou", "Estruturou", "Elaborou", "Conduziu", "Aprimorou", "Prestou suporte a", "Implementou", "Negociou", "Mapeou", "Atendeu", "Otimizou", "Coordenou", "Executou").
   - A redação deve soar 100% natural, fluída, elegante e humana — jamais parecendo um texto gerado por molde ou padrão robótico.
2. FIDELIDADE AOS FATOS:
   - NUNCA invente empresas, cargos, períodos, formações, cursos ou competências que o usuário não informou.
   - NUNCA crie dados fictícios ou números não fornecidos.
3. ADAPTAÇÃO PROFISSIONAL:
   - Se o usuário escreveu de forma informal, coloquial ou simples, converta para linguagem executiva clara, direta e orientada a contribuições práticas.
4. RESUMO PROFISSIONAL PERSUASIVO:
   - Crie um "Resumo Profissional" (professionalSummary) objetivo e persuasivo (2 a 3 frases no máximo), destacando a bagagem do candidato voltada ao cargo almejado.
5. PALAVRAS-CHAVE DA VAGA:
   - Se houver descrição da vaga desejada, incorpore naturalmente termos técnicos e palavras-chave da vaga SOMENTE onde houver correspondência com a vivência real informada pelo candidato.
6. CONCISÃO:
   - Mantenha de 2 a 4 marcadores por experiência, diretos e bem pontuados.

DADOS RECEBIDOS:
- Cargo Pretendido: ${targetJob?.roleTitle || ''}
- Objetivo informado pelo usuário: ${targetJob?.briefGoal || ''}
- Vaga Desejada: ${targetJob?.jobDescription ? targetJob.jobDescription.substring(0, 1500) : 'Nenhuma vaga específica fornecida'}
- Dados Pessoais: ${JSON.stringify(personal || {})}
- Experiências informadas: ${JSON.stringify(experiences || [])}
- Formação informada: ${JSON.stringify(education || [])}
- Competências informadas: ${JSON.stringify(skills || [])}
- Ferramentas informadas: ${JSON.stringify(tools || [])}
- Cursos informados: ${JSON.stringify(courses || [])}

Retorne ESTRITAMENTE um objeto JSON válido com a seguinte estrutura:
{
  "targetRole": "Título profissional padronizado e limpo",
  "professionalSummary": "Resumo de 2 a 3 frases profissionais, conciso, fluido e sem clichês",
  "experiences": [
    {
      "id": "mesmo id original",
      "company": "Nome da empresa",
      "role": "Cargo profissional ajustado",
      "period": "Ex: Jan 2021 — Atual ou 2018 — 2020",
      "isCurrent": boolean,
      "bullets": [
        "Frase com verbo de ação dinâmico no início sem repetir abertura anterior",
        "Outra frase com verbo de ação diferente descrevendo contribuição real"
      ]
    }
  ],
  "skills": ["lista organizada das competências informadas pelo usuário"],
  "tools": ["lista organizada das ferramentas/sistemas informados pelo usuário"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.35,
      },
    });

    const rawText = response.text || '{}';
    const aiResult = JSON.parse(rawText);

    // Sanitiza e garante variedade absoluta nos bullets retornados e preserva datas exatas do usuário
    const sanitizedExperiences = (aiResult.experiences || []).map((exp: any) => {
      const originalExp = (experiences || []).find(
        (e: any) => e.id === exp.id || e.company?.trim().toLowerCase() === exp.company?.trim().toLowerCase()
      );
      const exactPeriod = originalExp
        ? (originalExp.isCurrent ? `${originalExp.startDate} — Atual` : `${originalExp.startDate} — ${originalExp.endDate}`)
        : (exp.period || 'Período');

      const cleanedBullets = (exp.bullets || []).map((bullet: string) => {
        let b = bullet.trim();
        b = b.replace(/^(Atua[çc][ãa]o|Atuou|Com)\s+foco\s+em\s+/i, '');
        b = b.replace(/^Respons[aá]vel\s+(por|pela|pelo|pelas|pelos)\s+/i, 'Gestão e condução de ');
        return b.charAt(0).toUpperCase() + b.slice(1);
      });
      return {
        ...exp,
        period: exactPeriod,
        isCurrent: originalExp ? !!originalExp.isCurrent : !!exp.isCurrent,
        bullets: cleanedBullets,
      };
    });

    const finalResume = {
      personal: personal || {},
      targetRole: aiResult.targetRole || targetJob?.roleTitle || 'Profissional',
      professionalSummary: aiResult.professionalSummary || targetJob?.briefGoal || '',
      experiences: sanitizedExperiences.length > 0
        ? sanitizedExperiences
        : (experiences || []).map((e: any) => ({
            id: e.id,
            company: e.company,
            role: e.role,
            period: e.isCurrent ? `${e.startDate} — Atual` : `${e.startDate} — ${e.endDate}`,
            isCurrent: !!e.isCurrent,
            bullets: [e.activitiesRaw || 'Rotinas pertinentes ao cargo'],
          })),
      education: education || [],
      skills: aiResult.skills || skills || [],
      tools: aiResult.tools || tools || [],
      courses: courses || [],
      jobAnalysis: jobAnalysis || undefined,
      templateStyle: 'liquid-modern',
      generatedAt: new Date().toISOString(),
    };

    return res.json(finalResume);
  } catch (error: any) {
    console.warn('Gemini optimize-resume API temporary error, using resilient fallback:', error?.message);
    return res.json(generateFallbackResume(req.body || {}));
  }
}
