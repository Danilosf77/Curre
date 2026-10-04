import { getGeminiClient, generateGeminiContent } from './geminiClient.js';
import { aiFailure } from './aiFailure.js';
import { validatePayload, validateAiResume } from './validation.js';
import { formatExperienceBullets } from '../src/utils/textBeautifier.js';

const LANGUAGE_LABELS: Record<string, string> = {
  pt: 'Português (Brasil)',
  en: 'English (US)',
  es: 'Español',
  fr: 'Français',
};

export function generateFallbackResume(data: any) {
  const { personal, targetJob, experiences, education, skills, tools, courses, jobAnalysis, language = 'pt' } = data;
  const lang = (language || 'pt').toLowerCase();

  const presentLabel = lang === 'fr' ? 'Actuel' : lang === 'en' ? 'Present' : lang === 'es' ? 'Actualidad' : 'Atual';
  const startLabel = lang === 'fr' ? 'Début' : lang === 'en' ? 'Start' : lang === 'es' ? 'Inicio' : 'Início';
  const endLabel = lang === 'fr' ? 'Fin' : lang === 'en' ? 'End' : lang === 'es' ? 'Fin' : 'Término';

  const optimizedExp = (experiences || []).map((exp: any) => {
    const bullets = formatExperienceBullets(exp.activitiesRaw || '', exp.resultsRaw || '', exp.role);

    const period = exp.isCurrent
      ? `${exp.startDate || startLabel} — ${presentLabel}`
      : `${exp.startDate || startLabel} — ${exp.endDate || endLabel}`;

    return {
      id: exp.id,
      company: exp.company,
      role: exp.role,
      period,
      isCurrent: !!exp.isCurrent,
      bullets,
    };
  });

  let summary = '';
  const roleName = targetJob?.roleTitle || (lang === 'fr' ? 'Professionnel' : lang === 'en' ? 'Professional' : lang === 'es' ? 'Profesional' : 'Profissional');
  const skillsSample = skills?.slice(0, 3)?.join(', ') || '';

  if (lang === 'fr') {
    summary = `Professionnel rigoureux et engagé visant le poste de ${roleName}. Profil polyvalent avec une solide expérience en ${
      skillsSample || 'gestion et activités connexes'
    }, motivé à apporter des résultats tangibles et une contribution continue à l'organisation.`;
  } else if (lang === 'en') {
    summary = `Dedicated and results-driven professional seeking a role as ${roleName}. Proactive background with strong capabilities in ${
      skillsSample || 'related industry operations'
    }, committed to delivering solid performance and continuous value to the team.`;
  } else if (lang === 'es') {
    summary = `Profesional responsable y proactivo con el objetivo de desempeñarse como ${roleName}. Amplia experiencia en ${
      skillsSample || 'actividades afines'
    }, con sólida capacidad de organización y enfoque en la consecución de resultados positivos.`;
  } else {
    summary = `Profissional dedicado(a) com objetivo de atuação como ${roleName}. Perfil proativo com experiência em ${
      skillsSample || 'atividades correlatas'
    }, buscando contribuir com resultados sólidos e evolução contínua na organização.`;
  }

  return {
    personal: personal || {},
    targetRole: roleName,
    professionalSummary: summary,
    experiences: optimizedExp,
    education: education || [],
    skills: skills || [],
    tools: tools || [],
    courses: courses || [],
    jobAnalysis: jobAnalysis || undefined,
    templateStyle: 'liquid-modern',
    language: lang,
    generatedAt: new Date().toISOString(),
    isAiGenerated: false,
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

  if (!validatePayload('optimization', req.body)) return res.status(400).json({ error: 'Dados do currículo inválidos.' });
  const { personal, targetJob, experiences, education, skills, tools, courses, jobAnalysis, language = 'pt' } = req.body;
  const currentLang = (language || 'pt').toLowerCase();
  const langName = LANGUAGE_LABELS[currentLang] || LANGUAGE_LABELS.pt;

  const ai = getGeminiClient();

  if (!ai) {
    return res.json(generateFallbackResume(req.body || {}));
  }

  try {
    const presentWord = currentLang === 'fr' ? 'Actuel' : currentLang === 'en' ? 'Present' : currentLang === 'es' ? 'Actualidad' : 'Atual';

    const systemPrompt = `Você é o redator profissional sênior e especialista em ATS (Applicant Tracking Systems) do aplicativo CURRÊ.
Sua missão é transformar as informações fornecidas pelo usuário em um currículo profissional impecável, dinâmico, moderno, objetivo e de alto impacto para recrutadores.

=============================================================================
REGRA CRÍTICA DE IDIOMA (MANDATÓRIA E DE MÁXIMA PRIORIDADE):
O currículo DEVE ser redigido integralmente no idioma: ${langName} (${currentLang.toUpperCase()}).
- Título do cargo almejado (targetRole): DEVE estar em ${langName}.
- Resumo profissional (professionalSummary): DEVE estar em ${langName}.
- Cargos de cada experiência (role): DEVEM estar em ${langName}.
- Marcadores de atividades e resultados (bullets): DEVEM ser redigidos em ${langName}.
- Se as informações de entrada tiverem sido digitadas em português ou outro idioma, você DEVE traduzir e adaptá-las elegantemente para ${langName}.
=============================================================================

DIRETRIZES CRÍTICAS DE LINGUAGEM E ESTILO:
1. PROIBIÇÃO TERMINANTE DE BORDÕES E REPETIÇÕES:
   - Não use fórmulas repetitivas ("Responsável por...", "Atuou com foco em...", "Responsible for...", "Chargé de...").
   - NUNCA inicie múltiplos marcadores com o mesmo verbo ou estrutura sintática.
   - Cada marcador de uma mesma experiência DEVE iniciar com um verbo de ação dinâmico e expressivo no tempo correto.
   - A redação deve soa 100% natural, fluida e de alto nível humano no idioma ${langName}.
2. FIDELIDADE ABSOLUTA AOS FATOS:
   - NUNCA invente empresas, cargos, períodos, formações, cursos ou competências que o usuário não informou.
   - NUNCA crie números fictícios.
3. ADAPTAÇÃO PROFISSIONAL:
   - Converta descrições simples ou coloquiais em linguagem corporativa assertiva e orientada a contribuições práticas.
4. RESUMO PROFISSIONAL PERSUASIVO:
   - Crie um "Resumo Profissional" (professionalSummary) objetivo de 2 a 3 frases, destacando o perfil alinhado ao cargo almejado.
5. PALAVRAS-CHAVE DA VAGA:
   - Se houver descrição da vaga desejada, incorpore naturalmente termos relevantes nos bullets SOMENTE onde houver correspondência com a vivência real do candidato.
6. CONCISÃO:
   - Mantenha de 2 a 4 marcadores por experiência, diretos e bem pontuados.

DADOS RECEBIDOS:
- Idioma Solicitado: ${langName} (${currentLang})
- Cargo Pretendido: ${targetJob?.roleTitle || ''}
- Objetivo informado: ${targetJob?.briefGoal || ''}
- Vaga Desejada: ${targetJob?.jobDescription ? targetJob.jobDescription.substring(0, 1500) : 'Nenhuma vaga específica fornecida'}
- Dados Pessoais: ${JSON.stringify(personal || {})}
- Experiências informadas: ${JSON.stringify(experiences || [])}
- Formação informada: ${JSON.stringify(education || [])}
- Competências informadas: ${JSON.stringify(skills || [])}
- Ferramentas informadas: ${JSON.stringify(tools || [])}
- Cursos informados: ${JSON.stringify(courses || [])}

Retorne ESTRITAMENTE um objeto JSON válido com a seguinte estrutura (todos os valores textuais no idioma ${langName}):
{
  "targetRole": "Título profissional limpo e padronizado em ${langName}",
  "professionalSummary": "Resumo de 2 a 3 frases profissionais em ${langName}",
  "experiences": [
    {
      "id": "mesmo id original",
      "company": "Nome da empresa",
      "role": "Cargo profissional ajustado em ${langName}",
      "period": "Ex: 03/2022 — ${presentWord}",
      "isCurrent": boolean,
      "bullets": [
        "Frase com verbo de ação dinâmico no início em ${langName}",
        "Outra frase com verbo de ação diferente descrevendo contribuição real em ${langName}"
      ]
    }
  ],
  "skills": ["lista organizada das competências no idioma ${langName}"],
  "tools": ["lista organizada das ferramentas/sistemas"]
}`;

    const response = await generateGeminiContent(ai, {
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const rawText = response.text || '{}';
    const aiResult = JSON.parse(rawText);
    if (!validateAiResume(aiResult)) throw new Error('Invalid AI resume structure');

    // Sanitiza e garante variedade absoluta nos bullets retornados e preserva datas exatas do usuário
    const sanitizedExperiences = (aiResult.experiences || []).map((exp: any) => {
      const originalExp = (experiences || []).find(
        (e: any) => e.id === exp.id || e.company?.trim().toLowerCase() === exp.company?.trim().toLowerCase()
      );
      const exactPeriod = originalExp
        ? (originalExp.isCurrent ? `${originalExp.startDate} — ${presentWord}` : `${originalExp.startDate} — ${originalExp.endDate}`)
        : (exp.period || 'Período');

      const cleanedBullets = (exp.bullets || []).map((bullet: string) => {
        let b = bullet.trim();
        b = b.replace(/^(Atua[çc][ãa]o|Atuou|Com)\s+foco\s+em\s+/i, '');
        b = b.replace(/^Respons[aá]vel\s+(por|pela|pelo|pelas|pelos)\s+/i, '');
        b = b.replace(/^(Responsible for|In charge of)\s+/i, '');
        b = b.replace(/^(Responsable de|Encargado de)\s+/i, '');
        b = b.replace(/^(Responsable de|En charge de)\s+/i, '');
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
            period: e.isCurrent ? `${e.startDate} — ${presentWord}` : `${e.startDate} — ${e.endDate}`,
            isCurrent: !!e.isCurrent,
            bullets: [e.activitiesRaw || 'Rotinas pertinentes ao cargo'],
          })),
      education: education || [],
      skills: aiResult.skills || skills || [],
      tools: aiResult.tools || tools || [],
      courses: courses || [],
      jobAnalysis: jobAnalysis || undefined,
      templateStyle: 'liquid-modern',
      language: currentLang,
      generatedAt: new Date().toISOString(),
      isAiGenerated: true,
    };

    console.log('[Gemini API optimize-resume SUCCESS]: Currículo otimizado com sucesso usando Gemini');
    return res.json(finalResume);
  } catch (error: any) {
    const failure = aiFailure(error);
    console.error('[Gemini API optimize-resume ERROR]', { status: failure.providerStatus, category: failure.category });
    const fallback = generateFallbackResume(req.body || {});
    return res.json({
      ...fallback,
      isAiGenerated: false,
      apiError: failure.message,
      aiFailureCode: failure.category,
    });
  }
}
