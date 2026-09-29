var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");

// api/geminiClient.ts
var import_genai = require("@google/genai");
var cachedClient = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return cachedClient;
}

// src/utils/textBeautifier.ts
var DIVERSE_ACTION_OPENERS = [
  "Gest\xE3o e acompanhamento de",
  "Desenvolvimento e execu\xE7\xE3o de",
  "Elabora\xE7\xE3o, controle e organiza\xE7\xE3o de",
  "Condu\xE7\xE3o de rotinas voltadas a",
  "Suporte estrat\xE9gico e operacional em",
  "Mapeamento, an\xE1lise e otimiza\xE7\xE3o de",
  "Estrutura\xE7\xE3o e padroniza\xE7\xE3o de processos de",
  "Apoio t\xE9cnico e operacional nas demandas de",
  "Planejamento e implementa\xE7\xE3o de atividades de",
  "Supervis\xE3o e monitoramento cont\xEDnuo de"
];
var COLLOQUIAL_REPLACEMENTS = [
  { regex: /^(eu\s+)?(cuidava\s+de|ficava\s+com|tomava\s+conta\s+de|cuidar\s+de)\s+/i, replacement: "Gest\xE3o e controle de " },
  { regex: /^(eu\s+)?(fazia|realizava|executava|fazer|executar)\s+/i, replacement: "Execu\xE7\xE3o e acompanhamento de " },
  { regex: /^(eu\s+)?(ajudava\s+a|auxiliava\s+em|dava\s+suporte\s+a|ajudar\s+a|auxiliar\s+em)\s+/i, replacement: "Presta\xE7\xE3o de suporte operacional em " },
  { regex: /^(eu\s+)?(atendia|falava\s+com|atender)\s+/i, replacement: "Atendimento consultivo e relacionamento com " },
  { regex: /^(eu\s+)?(organizava|arrumava|organizar)\s+/i, replacement: "Organiza\xE7\xE3o e estrutura\xE7\xE3o de " },
  { regex: /^(eu\s+)?(vendia|fazia\s+vendas|vender)\s+/i, replacement: "Prospec\xE7\xE3o ativa e condu\xE7\xE3o de negocia\xE7\xF5es de " },
  { regex: /^(eu\s+)?(criava|desenvolvia|criar|desenvolver)\s+/i, replacement: "Cria\xE7\xE3o e desenvolvimento de " },
  { regex: /^(eu\s+)?(lançava|digitava|lançar|digitar)\s+/i, replacement: "Registro, concilia\xE7\xE3o e lan\xE7amento de " },
  { regex: /^(eu\s+)?(analisava|verificava|conferia|analisar|conferir)\s+/i, replacement: "An\xE1lise criteriosa e confer\xEAncia de " },
  { regex: /^(eu\s+)?(gerenciava|coordenava|liderava|gerenciar|coordenar)\s+/i, replacement: "Coordena\xE7\xE3o e lideran\xE7a de " },
  { regex: /^(eu\s+)?(emitia|gerava|extraía|emitir|gerar)\s+/i, replacement: "Emiss\xE3o e consolida\xE7\xE3o de " },
  { regex: /^(eu\s+)?(treinava|capacitava|ensinava|treinar)\s+/i, replacement: "Capacita\xE7\xE3o e treinamento de " },
  { regex: /^(eu\s+)?(implantava|instalava|configurava|instalar|implantar)\s+/i, replacement: "Implanta\xE7\xE3o, configura\xE7\xE3o e suporte a " },
  { regex: /^(eu\s+)?(negociava|alinhava|negociar)\s+/i, replacement: "Negocia\xE7\xE3o estrat\xE9gica e alinhamento com " },
  { regex: /^(eu\s+)?(monitorava|acompanhava|monitorar|acompanhar)\s+/i, replacement: "Monitoramento cont\xEDnuo e acompanhamento de " },
  { regex: /^(eu\s+)?(revisava|auditava|revisar|auditar)\s+/i, replacement: "Auditoria, revis\xE3o e valida\xE7\xE3o de " },
  { regex: /^(eu\s+)?(redigia|escrevia|redigir|escrever)\s+/i, replacement: "Reda\xE7\xE3o e elabora\xE7\xE3o de " },
  { regex: /^(eu\s+)?(controlava|controlar)\s+/i, replacement: "Controle sistem\xE1tico e acompanhamento de " }
];
function formatExperienceBullets(rawActivities, rawResults, role) {
  const cleanActivities = (rawActivities || "").trim();
  const cleanResults = (rawResults || "").trim();
  const bullets = [];
  if (cleanActivities) {
    const rawLines = cleanActivities.split(/\n|(?<=[.!?])\s+/).map((s) => s.replace(/^[-•*–—\d.)\s]+/, "").trim()).filter((s) => s.length > 2);
    const usedOpeners = /* @__PURE__ */ new Set();
    rawLines.forEach((line, index) => {
      let refinedLine = line;
      let matchedColloquial = false;
      for (const item of COLLOQUIAL_REPLACEMENTS) {
        if (item.regex.test(refinedLine)) {
          refinedLine = refinedLine.replace(item.regex, item.replacement);
          matchedColloquial = true;
          break;
        }
      }
      if (!matchedColloquial) {
        if (/^(Gestão|Controle|Elaboração|Desenvolvimento|Atendimento|Organização|Coordenação|Planejamento|Análise|Suporte|Implementação|Liderança|Condução|Manutenção|Monitoramento|Emissão|Capacitação|Negociação|Auditoria|Execução)\b/i.test(refinedLine)) {
          refinedLine = refinedLine.charAt(0).toUpperCase() + refinedLine.slice(1);
        } else {
          const availableOpeners = DIVERSE_ACTION_OPENERS.filter((op) => !usedOpeners.has(op));
          const opener = availableOpeners[index % availableOpeners.length] || DIVERSE_ACTION_OPENERS[index % DIVERSE_ACTION_OPENERS.length];
          usedOpeners.add(opener);
          const firstLetterLower = refinedLine.charAt(0).toLowerCase() + refinedLine.slice(1);
          refinedLine = `${opener} ${firstLetterLower}`;
        }
      } else {
        refinedLine = refinedLine.charAt(0).toUpperCase() + refinedLine.slice(1);
      }
      refinedLine = refinedLine.replace(/\bde\s+a\b/gi, "da").replace(/\bde\s+o\b/gi, "do").replace(/\bde\s+as\b/gi, "das").replace(/\bde\s+os\b/gi, "dos").replace(/\bem\s+a\b/gi, "na").replace(/\bem\s+o\b/gi, "no").replace(/\bem\s+as\b/gi, "nas").replace(/\bem\s+os\b/gi, "nos");
      if (!/[.!]$/.test(refinedLine)) {
        refinedLine += ".";
      }
      bullets.push(refinedLine);
    });
  }
  if (bullets.length === 0) {
    bullets.push(`Condu\xE7\xE3o e execu\xE7\xE3o das responsabilidades estrat\xE9gicas e operacionais do cargo de ${role || "atua\xE7\xE3o"}.`);
  }
  if (cleanResults) {
    const cleanRes = cleanResults.replace(/^[-•*–—\s]+/, "").trim();
    const formattedRes = cleanRes.charAt(0).toUpperCase() + cleanRes.slice(1);
    if (/^(Com|Através|Alcançou|Atingiu|Reduziu|Aumentou|Conquistou|Otimizou|Obteve|Gerou)\b/i.test(formattedRes)) {
      bullets.push(`${formattedRes}${/[.!]$/.test(formattedRes) ? "" : "."}`);
    } else {
      bullets.push(`Resultado de destaque: ${formattedRes}${/[.!]$/.test(formattedRes) ? "" : "."}`);
    }
  }
  return bullets.slice(0, 4);
}

// api/optimize-resume.ts
var LANGUAGE_LABELS = {
  pt: "Portugu\xEAs (Brasil)",
  en: "English (US)",
  es: "Espa\xF1ol",
  fr: "Fran\xE7ais"
};
function generateFallbackResume(data) {
  const { personal, targetJob, experiences, education, skills, tools, courses, jobAnalysis, language = "pt" } = data;
  const lang = (language || "pt").toLowerCase();
  const presentLabel = lang === "fr" ? "Actuel" : lang === "en" ? "Present" : lang === "es" ? "Actualidad" : "Atual";
  const startLabel = lang === "fr" ? "D\xE9but" : lang === "en" ? "Start" : lang === "es" ? "Inicio" : "In\xEDcio";
  const endLabel = lang === "fr" ? "Fin" : lang === "en" ? "End" : lang === "es" ? "Fin" : "T\xE9rmino";
  const optimizedExp = (experiences || []).map((exp) => {
    const bullets = formatExperienceBullets(exp.activitiesRaw || "", exp.resultsRaw || "", exp.role);
    const period = exp.isCurrent ? `${exp.startDate || startLabel} \u2014 ${presentLabel}` : `${exp.startDate || startLabel} \u2014 ${exp.endDate || endLabel}`;
    return {
      id: exp.id,
      company: exp.company,
      role: exp.role,
      period,
      isCurrent: !!exp.isCurrent,
      bullets
    };
  });
  let summary = "";
  const roleName = targetJob?.roleTitle || (lang === "fr" ? "Professionnel" : lang === "en" ? "Professional" : lang === "es" ? "Profesional" : "Profissional");
  const skillsSample = skills?.slice(0, 3)?.join(", ") || "";
  if (lang === "fr") {
    summary = `Professionnel rigoureux et engag\xE9 visant le poste de ${roleName}. Profil polyvalent avec une solide exp\xE9rience en ${skillsSample || "gestion et activit\xE9s connexes"}, motiv\xE9 \xE0 apporter des r\xE9sultats tangibles et une contribution continue \xE0 l'organisation.`;
  } else if (lang === "en") {
    summary = `Dedicated and results-driven professional seeking a role as ${roleName}. Proactive background with strong capabilities in ${skillsSample || "related industry operations"}, committed to delivering solid performance and continuous value to the team.`;
  } else if (lang === "es") {
    summary = `Profesional responsable y proactivo con el objetivo de desempe\xF1arse como ${roleName}. Amplia experiencia en ${skillsSample || "actividades afines"}, con s\xF3lida capacidad de organizaci\xF3n y enfoque en la consecuci\xF3n de resultados positivos.`;
  } else {
    summary = `Profissional dedicado(a) com objetivo de atua\xE7\xE3o como ${roleName}. Perfil proativo com experi\xEAncia em ${skillsSample || "atividades correlatas"}, buscando contribuir com resultados s\xF3lidos e evolu\xE7\xE3o cont\xEDnua na organiza\xE7\xE3o.`;
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
    jobAnalysis: jobAnalysis || void 0,
    templateStyle: "liquid-modern",
    language: lang,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9todo n\xE3o permitido. Utilize POST." });
  }
  const { personal, targetJob, experiences, education, skills, tools, courses, jobAnalysis, language = "pt" } = req.body || {};
  const currentLang = (language || "pt").toLowerCase();
  const langName = LANGUAGE_LABELS[currentLang] || LANGUAGE_LABELS.pt;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json(generateFallbackResume(req.body || {}));
  }
  try {
    const presentWord = currentLang === "fr" ? "Actuel" : currentLang === "en" ? "Present" : currentLang === "es" ? "Actualidad" : "Atual";
    const systemPrompt = `Voc\xEA \xE9 o redator profissional s\xEAnior e especialista em ATS (Applicant Tracking Systems) do aplicativo CURR\xCA.
Sua miss\xE3o \xE9 transformar as informa\xE7\xF5es fornecidas pelo usu\xE1rio em um curr\xEDculo profissional impec\xE1vel, din\xE2mico, moderno, objetivo e de alto impacto para recrutadores.

=============================================================================
REGRA CR\xCDTICA DE IDIOMA (MANDAT\xD3RIA E DE M\xC1XIMA PRIORIDADE):
O curr\xEDculo DEVE ser redigido integralmente no idioma: ${langName} (${currentLang.toUpperCase()}).
- T\xEDtulo do cargo almejado (targetRole): DEVE estar em ${langName}.
- Resumo profissional (professionalSummary): DEVE estar em ${langName}.
- Cargos de cada experi\xEAncia (role): DEVEM estar em ${langName}.
- Marcadores de atividades e resultados (bullets): DEVEM ser redigidos em ${langName}.
- Se as informa\xE7\xF5es de entrada tiverem sido digitadas em portugu\xEAs ou outro idioma, voc\xEA DEVE traduzir e adapt\xE1-las elegantemente para ${langName}.
=============================================================================

DIRETRIZES CR\xCDTICAS DE LINGUAGEM E ESTILO:
1. PROIBI\xC7\xC3O TERMINANTE DE BORD\xD5ES E REPETI\xC7\xD5ES:
   - N\xE3o use f\xF3rmulas repetitivas ("Respons\xE1vel por...", "Atuou com foco em...", "Responsible for...", "Charg\xE9 de...").
   - NUNCA inicie m\xFAltiplos marcadores com o mesmo verbo ou estrutura sint\xE1tica.
   - Cada marcador de uma mesma experi\xEAncia DEVE iniciar com um verbo de a\xE7\xE3o din\xE2mico e expressivo no tempo correto.
   - A reda\xE7\xE3o deve soa 100% natural, fluida e de alto n\xEDvel humano no idioma ${langName}.
2. FIDELIDADE ABSOLUTA AOS FATOS:
   - NUNCA invente empresas, cargos, per\xEDodos, forma\xE7\xF5es, cursos ou compet\xEAncias que o usu\xE1rio n\xE3o informou.
   - NUNCA crie n\xFAmeros fict\xEDcios.
3. ADAPTA\xC7\xC3O PROFISSIONAL:
   - Converta descri\xE7\xF5es simples ou coloquiais em linguagem corporativa assertiva e orientada a contribui\xE7\xF5es pr\xE1ticas.
4. RESUMO PROFISSIONAL PERSUASIVO:
   - Crie um "Resumo Profissional" (professionalSummary) objetivo de 2 a 3 frases, destacando o perfil alinhado ao cargo almejado.
5. PALAVRAS-CHAVE DA VAGA:
   - Se houver descri\xE7\xE3o da vaga desejada, incorpore naturalmente termos relevantes nos bullets SOMENTE onde houver correspond\xEAncia com a viv\xEAncia real do candidato.
6. CONCIS\xC3O:
   - Mantenha de 2 a 4 marcadores por experi\xEAncia, diretos e bem pontuados.

DADOS RECEBIDOS:
- Idioma Solicitado: ${langName} (${currentLang})
- Cargo Pretendido: ${targetJob?.roleTitle || ""}
- Objetivo informado: ${targetJob?.briefGoal || ""}
- Vaga Desejada: ${targetJob?.jobDescription ? targetJob.jobDescription.substring(0, 1500) : "Nenhuma vaga espec\xEDfica fornecida"}
- Dados Pessoais: ${JSON.stringify(personal || {})}
- Experi\xEAncias informadas: ${JSON.stringify(experiences || [])}
- Forma\xE7\xE3o informada: ${JSON.stringify(education || [])}
- Compet\xEAncias informadas: ${JSON.stringify(skills || [])}
- Ferramentas informadas: ${JSON.stringify(tools || [])}
- Cursos informados: ${JSON.stringify(courses || [])}

Retorne ESTRITAMENTE um objeto JSON v\xE1lido com a seguinte estrutura (todos os valores textuais no idioma ${langName}):
{
  "targetRole": "T\xEDtulo profissional limpo e padronizado em ${langName}",
  "professionalSummary": "Resumo de 2 a 3 frases profissionais em ${langName}",
  "experiences": [
    {
      "id": "mesmo id original",
      "company": "Nome da empresa",
      "role": "Cargo profissional ajustado em ${langName}",
      "period": "Ex: 03/2022 \u2014 ${presentWord}",
      "isCurrent": boolean,
      "bullets": [
        "Frase com verbo de a\xE7\xE3o din\xE2mico no in\xEDcio em ${langName}",
        "Outra frase com verbo de a\xE7\xE3o diferente descrevendo contribui\xE7\xE3o real em ${langName}"
      ]
    }
  ],
  "skills": ["lista organizada das compet\xEAncias no idioma ${langName}"],
  "tools": ["lista organizada das ferramentas/sistemas"]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });
    const rawText = response.text || "{}";
    const aiResult = JSON.parse(rawText);
    const sanitizedExperiences = (aiResult.experiences || []).map((exp) => {
      const originalExp = (experiences || []).find(
        (e) => e.id === exp.id || e.company?.trim().toLowerCase() === exp.company?.trim().toLowerCase()
      );
      const exactPeriod = originalExp ? originalExp.isCurrent ? `${originalExp.startDate} \u2014 ${presentWord}` : `${originalExp.startDate} \u2014 ${originalExp.endDate}` : exp.period || "Per\xEDodo";
      const cleanedBullets = (exp.bullets || []).map((bullet) => {
        let b = bullet.trim();
        b = b.replace(/^(Atua[çc][ãa]o|Atuou|Com)\s+foco\s+em\s+/i, "");
        b = b.replace(/^Respons[aá]vel\s+(por|pela|pelo|pelas|pelos)\s+/i, "");
        b = b.replace(/^(Responsible for|In charge of)\s+/i, "");
        b = b.replace(/^(Responsable de|Encargado de)\s+/i, "");
        b = b.replace(/^(Responsable de|En charge de)\s+/i, "");
        return b.charAt(0).toUpperCase() + b.slice(1);
      });
      return {
        ...exp,
        period: exactPeriod,
        isCurrent: originalExp ? !!originalExp.isCurrent : !!exp.isCurrent,
        bullets: cleanedBullets
      };
    });
    const finalResume = {
      personal: personal || {},
      targetRole: aiResult.targetRole || targetJob?.roleTitle || "Profissional",
      professionalSummary: aiResult.professionalSummary || targetJob?.briefGoal || "",
      experiences: sanitizedExperiences.length > 0 ? sanitizedExperiences : (experiences || []).map((e) => ({
        id: e.id,
        company: e.company,
        role: e.role,
        period: e.isCurrent ? `${e.startDate} \u2014 ${presentWord}` : `${e.startDate} \u2014 ${e.endDate}`,
        isCurrent: !!e.isCurrent,
        bullets: [e.activitiesRaw || "Rotinas pertinentes ao cargo"]
      })),
      education: education || [],
      skills: aiResult.skills || skills || [],
      tools: aiResult.tools || tools || [],
      courses: courses || [],
      jobAnalysis: jobAnalysis || void 0,
      templateStyle: "liquid-modern",
      language: currentLang,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isAiGenerated: true
    };
    console.log("[Gemini API optimize-resume SUCCESS]: Curr\xEDculo otimizado com sucesso usando gemini-3.8-flash");
    return res.json(finalResume);
  } catch (error) {
    console.error("[Gemini API optimize-resume ERROR]: Falha na chamada da API Gemini:", error?.status || "", error?.message || error);
    const fallback = generateFallbackResume(req.body || {});
    return res.json({
      ...fallback,
      isAiGenerated: false,
      apiError: error?.message || "Gemini API call failed"
    });
  }
}

// api/analyze-job.ts
var LANGUAGE_LABELS2 = {
  pt: "Portugu\xEAs (Brasil)",
  en: "English (US)",
  es: "Espa\xF1ol",
  fr: "Fran\xE7ais"
};
function generateFallbackJobAnalysis(jobDescription, candidateRole, candidateSkills, candidateTools, candidateExperiences, language = "pt") {
  const words = (jobDescription || "").toLowerCase();
  const lang = (language || "pt").toLowerCase();
  let detectedRole = candidateRole || "";
  let extractedKeywords = [];
  let mainRequirements = [];
  let desiredSkills = [];
  let toolsAndTech = [];
  let experienceRequired = "";
  let compatibleEducation = [];
  let improvements = [];
  if (lang === "en") {
    detectedRole = candidateRole || "Role aligned with opportunity";
    extractedKeywords = ["communication", "organization", "proactivity", "results-oriented", "teamwork"];
    mainRequirements = [
      "Prior experience with routines and processes of the area",
      "Ability to organize and meet deadlines",
      "Good interpersonal communication and collaboration"
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ["Communication", "Organization", "Teamwork"];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ["Office Suite / Excel", "Management Systems"];
    experienceRequired = "Demonstrated experience in related roles";
    compatibleEducation = ["Education and training relevant to the desired role"];
    improvements = [
      "Highlight the practical results obtained in your real experiences on your resume.",
      "Emphasize your daily proficiency with the tools and systems used."
    ];
  } else if (lang === "es") {
    detectedRole = candidateRole || "Puesto alineado con la oportunidad";
    extractedKeywords = ["comunicaci\xF3n", "organizaci\xF3n", "proactividad", "enfoque en resultados", "trabajo en equipo"];
    mainRequirements = [
      "Experiencia previa con rutinas y procesos del \xE1rea",
      "Capacidad de organizaci\xF3n y cumplimiento de plazos",
      "Buena comunicaci\xF3n interpersonal y colaboraci\xF3n"
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ["Comunicaci\xF3n", "Organizaci\xF3n", "Trabajo en equipo"];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ["Paquete Office / Excel", "Sistemas de Gesti\xF3n"];
    experienceRequired = "Experiencia demostrada en funciones relacionadas";
    compatibleEducation = ["Educaci\xF3n y formaci\xF3n pertinentes para el puesto deseado"];
    improvements = [
      "Destaque en su curr\xEDculum los resultados pr\xE1cticos obtenidos en sus experiencias reales.",
      "Enfatice su dominio diario de las herramientas y sistemas utilizados."
    ];
  } else if (lang === "fr") {
    detectedRole = candidateRole || "Poste align\xE9 avec l'opportunit\xE9";
    extractedKeywords = ["communication", "organisation", "proactivit\xE9", "orientation r\xE9sultats", "travail d'\xE9quipe"];
    mainRequirements = [
      "Exp\xE9rience pr\xE9alable avec les routines et processus du domaine",
      "Capacit\xE9 d'organisation et respect des d\xE9lais",
      "Bonne communication interpersonnelle et collaboration"
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ["Communication", "Organisation", "Travail d'\xE9quipe"];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ["Bureautique / Excel", "Syst\xE8mes de Gestion"];
    experienceRequired = "Exp\xE9rience d\xE9montr\xE9e dans des r\xF4les connexes";
    compatibleEducation = ["Formation et perfectionnement pertinents pour le poste souhait\xE9"];
    improvements = [
      "Mettez en valeur sur votre CV les r\xE9sultats pratiques obtenus dans vos exp\xE9riences r\xE9elles.",
      "Mettez l'accent sur votre ma\xEEtrise quotidienne des outils et syst\xE8mes utilis\xE9s."
    ];
  } else {
    detectedRole = candidateRole || "Cargo alinhado \xE0 oportunidade";
    extractedKeywords = ["comunica\xE7\xE3o", "organiza\xE7\xE3o", "proatividade", "foco em resultados", "trabalho em equipe"];
    mainRequirements = [
      "Experi\xEAncia pr\xE9via com rotinas e processos da \xE1rea",
      "Capacidade de organiza\xE7\xE3o e cumprimento de prazos",
      "Boa comunica\xE7\xE3o interpessoal e colabora\xE7\xE3o"
    ];
    desiredSkills = candidateSkills?.length ? candidateSkills.slice(0, 4) : ["Comunica\xE7\xE3o", "Organiza\xE7\xE3o", "Trabalho em equipe"];
    toolsAndTech = candidateTools?.length ? candidateTools.slice(0, 3) : ["Pacote Office / Excel", "Sistemas de Gest\xE3o"];
    experienceRequired = "Experi\xEAncia demonstrada em fun\xE7\xF5es correlatas";
    compatibleEducation = ["Forma\xE7\xE3o e capacita\xE7\xF5es pertinentes ao cargo pretendido"];
    improvements = [
      "Destaque no curr\xEDculo os resultados pr\xE1ticos obtidos em suas experi\xEAncias reais.",
      "Enfatize seu dom\xEDnio cotidiano das ferramentas e sistemas utilizados."
    ];
  }
  const skillTranslationMap = {
    en: {
      "comunica\xE7\xE3o assertiva": "Assertive communication",
      "comunica\xE7\xE3o": "Communication",
      "organiza\xE7\xE3o": "Organization",
      "trabalho em equipe": "Teamwork",
      "proatividade": "Proactivity",
      "foco em resultados": "Results focus",
      "lideran\xE7a": "Leadership",
      "resolu\xE7\xE3o de problemas": "Problem solving",
      "gest\xE3o do tempo": "Time management",
      "pacote office": "Microsoft Office",
      "excel": "Excel",
      "excel avan\xE7ado": "Advanced Excel",
      "sistemas de gest\xE3o": "Management systems",
      "atendimento ao cliente": "Customer service",
      "negocia\xE7\xE3o": "Negotiation"
    },
    es: {
      "comunica\xE7\xE3o assertiva": "Comunicaci\xF3n asertiva",
      "comunica\xE7\xE3o": "Comunicaci\xF3n",
      "organiza\xE7\xE3o": "Organizaci\xF3n",
      "trabalho em equipe": "Trabajo en equipo",
      "proatividade": "Proactividad",
      "foco em resultados": "Enfoque en resultados",
      "lideran\xE7a": "Liderazgo",
      "resolu\xE7\xE3o de problemas": "Resoluci\xF3n de problemas",
      "gest\xE3o do tempo": "Gesti\xF3n del tiempo",
      "pacote office": "Paquete Office",
      "excel": "Excel",
      "excel avan\xE7ado": "Excel avanzado",
      "sistemas de gest\xE3o": "Sistemas de gesti\xF3n",
      "atendimento ao cliente": "Atenci\xF3n al cliente",
      "negocia\xE7\xE3o": "Negociaci\xF3n"
    },
    fr: {
      "comunica\xE7\xE3o assertiva": "Communication assertive",
      "comunica\xE7\xE3o": "Communication",
      "organiza\xE7\xE3o": "Organisation",
      "trabalho em equipe": "Travail d'\xE9quipe",
      "proatividade": "Proactivit\xE9",
      "foco em resultados": "Orientation r\xE9sultats",
      "lideran\xE7a": "Leadership",
      "resolu\xE7\xE3o de problemas": "R\xE9solution de probl\xE8mes",
      "gest\xE3o do tempo": "Gestion du temps",
      "pacote office": "Pack Office",
      "excel": "Excel",
      "excel avan\xE7ado": "Excel avanc\xE9",
      "sistemas de gest\xE3o": "Syst\xE8mes de gestion",
      "atendimento ao cliente": "Service client",
      "negocia\xE7\xE3o": "N\xE9gociation"
    }
  };
  const translateSkill = (skill) => {
    if (lang === "pt") return skill;
    const lower = skill.toLowerCase().trim();
    return skillTranslationMap[lang]?.[lower] || skill;
  };
  const rawFound = (candidateSkills || []).filter((s) => words.includes(s.toLowerCase()));
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
    foundSkills: foundSkills.length > 0 ? foundSkills : lang === "en" ? ["Communication", "Organization", "Teamwork"] : lang === "es" ? ["Comunicaci\xF3n", "Organizaci\xF3n", "Trabajo en equipo"] : lang === "fr" ? ["Communication", "Organisation", "Travail d'\xE9quipe"] : ["Comunica\xE7\xE3o", "Organiza\xE7\xE3o", "Trabalho em equipe"],
    relevantExperiences: (candidateExperiences || []).map((e) => {
      if (lang === "en") return `${e.role || "Role"} at ${e.company || "previous company"}`;
      if (lang === "es") return `${e.role || "Cargo"} en ${e.company || "empresa anterior"}`;
      if (lang === "fr") return `${e.role || "Poste"} chez ${e.company || "entreprise pr\xE9c\xE9dente"}`;
      return `${e.role || "Fun\xE7\xE3o"} na empresa ${e.company || "anterior"}`;
    }).filter((s) => s.length > 0).slice(0, 2),
    compatibleEducation,
    improvements
  };
}
async function handler2(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9todo n\xE3o permitido. Utilize POST." });
  }
  const { jobDescription, candidateRole, candidateSkills, candidateTools, candidateExperiences, language = "pt" } = req.body || {};
  const currentLang = (language || "pt").toLowerCase();
  const langName = LANGUAGE_LABELS2[currentLang] || LANGUAGE_LABELS2.pt;
  if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
    return res.status(400).json({ error: "A descri\xE7\xE3o da vaga \xE9 obrigat\xF3ria." });
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
    const prompt = `You are a senior recruitment and hiring specialist for the professional resume platform CURR\xCA.
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
- Target Role: ${candidateRole || "Not specified"}
- Skills: ${JSON.stringify(candidateSkills || [])}
- Tools: ${JSON.stringify(candidateTools || [])}
- Experiences: ${JSON.stringify((candidateExperiences || []).map((e) => ({ company: e.company, role: e.role, activities: e.activitiesRaw, results: e.resultsRaw })))}

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
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });
    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error) {
    console.warn("Gemini analyze-job API temporary error, using resilient fallback:", error?.message);
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

// api/generate-pdf.ts
var import_react2 = __toESM(require("react"), 1);
var import_server = require("react-dom/server");
var import_playwright = require("playwright");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// src/components/templates/LiquidModernTemplate.tsx
var import_lucide_react = require("lucide-react");

// src/components/templates/ContactItem.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var ContactItem = ({
  icon,
  text,
  href,
  className = "",
  iconClassName = "",
  textClassName = ""
}) => {
  if (!text) return null;
  const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `contact-item inline-flex items-center gap-1.5 ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `contact-icon inline-flex items-center justify-center shrink-0 ${iconClassName}`, children: icon }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `contact-text ${textClassName}`, children: text })
  ] });
  if (href) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "a",
      {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-inherit hover:underline inline-flex items-center",
        children: inner
      }
    );
  }
  return inner;
};

// src/i18n/LanguageContext.tsx
var import_react = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var TRANSLATIONS = {
  pt: {
    "step_1_ph_linkedin": "ex: linkedin.com/in/seunome",
    "step_1_ph_portfolio": "ex: meutrabalho.com / portfolio",
    "step_3_err_company": "Informe o nome da empresa.",
    "step_3_err_role": "Informe o cargo ocupado.",
    "step_3_pattern_hint": "Padr\xE3o: mm/aaaa",
    "step_3_err_start_incomplete": "Data incompleta. Preencha mm/aaaa (ex: 03/2020).",
    "step_3_err_start_empty": "Informe a data de in\xEDcio (mm/aaaa).",
    "step_3_err_end_incomplete": "Data incompleta. Preencha mm/aaaa (ex: 11/2023).",
    "step_3_err_end_empty": 'Informe a data de t\xE9rmino (ou marque abaixo "Trabalho atualmente").',
    "step_3_err_end_before_start": "A data de t\xE9rmino n\xE3o pode ser anterior \xE0 data de in\xEDcio.",
    "step_3_err_activities": "Descreva brevemente as atividades que voc\xEA desempenhava.",
    "step_3_err_add_one": "Adicione pelo menos 1 experi\xEAncia profissional ou marque a op\xE7\xE3o de primeiro emprego acima.",
    "step_4_err_add_one": "Adicione pelo menos 1 forma\xE7\xE3o acad\xEAmica ou n\xEDvel de escolaridade.",
    "step_4_formation_prefix": "Forma\xE7\xE3o #",
    "step_4_err_course": "Informe o curso ou escolaridade (ex: Ensino M\xE9dio).",
    "step_4_err_institution": "Informe o nome da escola ou faculdade.",
    "step_4_err_start_year": "Informe um ano v\xE1lido com 4 d\xEDgitos (ex: 2018).",
    "step_4_err_end_year": "Informe um ano v\xE1lido com 4 d\xEDgitos (ex: 2022).",
    "step_4_err_end_before_start": "O ano de conclus\xE3o n\xE3o pode ser anterior ao ano de in\xEDcio.",
    "step_5_err_select_one": "Selecione pelo menos uma compet\xEAncia profissional ou ferramenta para o seu curr\xEDculo.",
    "step_6_err_fill_all": "Preencha o Nome e a Institui\xE7\xE3o de cada curso adicionado ou remova o item em branco.",
    "step_6_course_prefix": "Curso #",
    "step_6_err_course_name": "Informe o nome do curso.",
    "step_6_err_institution": "Informe a institui\xE7\xE3o.",
    "step_6_err_year": "Informe um ano com 4 d\xEDgitos (ex: 2023).",
    "step_7_matched_skills": "\u2713 Compet\xEAncias encontradas no seu perfil:",
    "step_7_essential_keywords": "Palavras-chave essenciais da vaga:",
    "step_7_ai_tips": "\u{1F4A1} Dicas da IA para este processo seletivo:",
    "step_8_warning_incomplete_title": "Aten\xE7\xE3o: Campos obrigat\xF3rios incompletos",
    "step_8_warning_incomplete_desc": "Para garantir que seu curr\xEDculo passe nos filtros das empresas e tenha qualidade profissional, preencha os itens marcados como Pendente abaixo clicando em Editar.",
    step_2_missing_error: "Informe o cargo almejado (etapa 2).",
    step_3_no_exp_title: "Em busca do primeiro emprego / Sem experi\xEAncia formal anterior",
    step_3_no_exp_sub: "Marque esta op\xE7\xE3o se voc\xEA for estudante, jovem aprendiz ou estiver ingressando no mercado de trabalho agora.",
    step_3_no_exp_alert_title: "Perfil Sem Experi\xEAncia Formal Selecionado",
    step_3_no_exp_alert_desc: "Perfeito! O CURR\xCA ir\xE1 estruturar seu curr\xEDculo com foco estrat\xE9gico na sua Forma\xE7\xE3o Acad\xEAmica, Cursos & Certifica\xE7\xF5es e Habilidades Pr\xE1ticas, destacando o seu potencial para os recrutadores.",
    step_3_no_exp_revert: "Prefiro preencher minhas experi\xEAncias profissionais",
    step_3_ai_tip: "N\xE3o se preocupe em usar palavras dif\xEDceis. Escreva de forma simples o que voc\xEA fazia no dia a dia que nossa IA organiza em realiza\xE7\xF5es profissionais de impacto.",
    step_3_company_number: "Experi\xEAncia #",
    label_remove: "Remover",
    label_present: "Atual",
    btn_add: "Adicionar",
    step_3_company_label: "Nome da Empresa",
    step_3_company_placeholder: "ex: Distribuidora Silva, Padaria Central, Escrit\xF3rio Modelo",
    step_3_role_label: "Cargo / Fun\xE7\xE3o",
    step_3_role_placeholder: "ex: Assistente Administrativo, Auxiliar de Loja",
    step_3_start_label: "Data de In\xEDcio",
    step_3_end_label: "Data de T\xE9rmino",
    step_3_pattern_mmyyyy: "Padr\xE3o: mm/aaaa",
    step_3_current_job: "Trabalho atualmente nesta empresa",
    step_3_activities_label: "Atividades e responsabilidades do dia a dia",
    step_3_activities_placeholder: "ex: Atendia clientes, organizava o estoque, emitia relat\xF3rios e controlava o caixa...",
    step_3_results_label: "Resultados, conquistas ou melhorias alcan\xE7adas (Opcional)",
    step_3_results_placeholder: "ex: Reduziu tempo de confer\xEAncia em 30% ap\xF3s padronizar rotinas...",
    step_3_error_company: "Informe o nome da empresa.",
    step_3_error_role: "Informe o cargo ocupado.",
    step_3_error_start_date: "Informe a data de in\xEDcio (mm/aaaa).",
    step_3_error_end_date: "Informe a data de t\xE9rmino (ou marque que trabalha atualmente).",
    step_3_error_chronology: "A data de t\xE9rmino n\xE3o pode ser anterior \xE0 data de in\xEDcio.",
    step_3_error_activities: "Descreva brevemente as atividades que voc\xEA desempenhava.",
    step_3_missing_error: "Preencha suas experi\xEAncias ou marque primeiro emprego.",
    step_4_course_label: "Curso / Escolaridade",
    step_4_course_ph: "ex: Ensino M\xE9dio Completo, Administra\xE7\xE3o de Empresas, T\xE9cnico em Log\xEDstica...",
    step_4_inst_label: "Institui\xE7\xE3o de Ensino / Escola",
    step_4_inst_ph: "ex: Escola Estadual Santos Dumont, Universidade Federal, SENAI...",
    step_4_start_year: "Ano de In\xEDcio",
    step_4_end_year: "Ano de Conclus\xE3o / Previs\xE3o",
    step_4_status_label: "Situa\xE7\xE3o",
    step_4_formation_num: "Forma\xE7\xE3o",
    step_4_error_min_detail: "Adicione pelo menos 1 forma\xE7\xE3o acad\xEAmica ou n\xEDvel de escolaridade.",
    step_4_error_course: "Informe o curso ou escolaridade (ex: Ensino M\xE9dio).",
    step_4_error_inst: "Informe o nome da escola ou faculdade.",
    step_4_error_start_year: "Informe um ano v\xE1lido com 4 d\xEDgitos (ex: 2018).",
    step_4_error_end_year: "Informe um ano v\xE1lido com 4 d\xEDgitos (ex: 2022).",
    step_4_error_chronology: "O ano de conclus\xE3o n\xE3o pode ser anterior ao ano de in\xEDcio.",
    step_4_missing_error: "Preencha pelo menos 1 forma\xE7\xE3o acad\xEAmica.",
    step_5_skills_title: "Habilidades profissionais (clique para marcar):",
    step_5_skills_custom_ph: "Digitar outra compet\xEAncia (ex: Reda\xE7\xE3o, Negocia\xE7\xE3o...)",
    step_5_tools_title: "Sistemas, softwares e ferramentas:",
    step_5_tools_custom_ph: "Digitar outro software (ex: Canva, Trello...)",
    step_5_error_detail: "Selecione pelo menos uma compet\xEAncia profissional ou ferramenta para o seu curr\xEDculo.",
    step_5_missing_error: "Selecione pelo menos uma compet\xEAncia ou ferramenta.",
    step_6_empty: "Nenhum curso adicionado ainda.",
    step_6_add_first: "+ Adicionar meu primeiro curso",
    step_6_course_num: "Curso",
    step_6_name_label: "Nome do Curso",
    step_6_name_ph: "ex: Excel do B\xE1sico ao Avan\xE7ado, Atendimento ao Cliente...",
    step_6_inst_label: "Institui\xE7\xE3o",
    step_6_inst_ph: "ex: SENAC, Udemy, SEBRAE...",
    step_6_year_label: "Ano",
    step_6_hours_label: "Carga Hor\xE1ria (opcional)",
    step_6_hours_ph: "ex: 40 horas",
    step_6_error_detail: "Preencha o Nome e a Institui\xE7\xE3o de cada curso adicionado ou remova o item em branco.",
    step_6_error_name: "Informe o nome do curso.",
    step_6_error_inst: "Informe a institui\xE7\xE3o.",
    step_6_error_year: "Informe um ano com 4 d\xEDgitos (ex: 2023).",
    step_6_missing_error: "Revise os cursos adicionados.",
    step_7_tag: "Diferencial Inteligente CURR\xCA",
    step_7_desc_label: "Descri\xE7\xE3o ou requisitos da vaga (Copie e cole do LinkedIn, Gupy, WhatsApp...)",
    step_7_desc_ph: "Cole aqui o texto do an\xFAncio da vaga (atividades, requisitos, diferenciais)...",
    step_7_ethics_text: "Compromisso de \xC9tica: A IA N\xC3O inventa compet\xEAncias ou empregos falsos. Ela apenas reorganiza e destaca suas informa\xE7\xF5es reais com os termos que os recrutadores valorizam.",
    step_7_analyzing_btn: "Analisando requisitos com IA...",
    step_7_analyze_btn: "ANALISAR VAGA COM IA",
    step_7_analysis_completed: "An\xE1lise de Vaga Conclu\xEDda",
    step_7_mapped_role: "Cargo Mapeado",
    step_7_estimated_match: "Compatibilidade estimada",
    step_7_skills_found: "\u2713 Compet\xEAncias encontradas no seu perfil:",
    step_7_keywords_essential: "Palavras-chave essenciais da vaga:",
    step_7_ai_tips_title: "\u{1F4A1} Dicas da IA para este processo seletivo:",
    step_8_tag: "Tudo pronto para a m\xE1gica!",
    step_8_edit_btn: "Editar",
    step_8_btn_sub: "Gera\xE7\xE3o inteligente r\xE1pida e profissional \u2022 100% gratuita sem cadastro obrigat\xF3rio.",
    step_8_btn_sub_disabled: "Preencha todos os campos obrigat\xF3rios acima para habilitar a gera\xE7\xE3o.",
    step_8_items_count: "item(s)",
    step_8_optional_provided: "Preenchido",
    field_linkedin_ph: "ex: linkedin.com/in/seunome",
    field_portfolio_ph: "ex: meutrabalho.com / portfolio",
    // Slogan & Brand
    brand_slogan: "Corra atr\xE1s da vaga certa.",
    footer_developed_by: "Site desenvolvido por",
    footer_tagline: "Plataforma inteligente de curr\xEDculos com IA otimizada para recrutadores e sistemas ATS.",
    footer_terms: "Termos & LGPD",
    nav_create: "Criar curr\xEDculo",
    nav_how_it_works: "Como funciona",
    nav_features: "Recursos",
    nav_saved_resume: "Ver Curr\xEDculo Salvo",
    nav_login_cloud: "Entrar / Nuvem",
    nav_cta_create: "Criar Agora",
    nav_mobile_create: "Criar",
    nav_header: "Navega\xE7\xE3o",
    nav_smart_features: "Recursos inteligentes",
    nav_cloud_active: "Nuvem Ativa",
    nav_login_cloud_full: "Entrar / Salvar na Nuvem",
    nav_optional: "Opcional",
    // Modals Info
    how_title: "Como funciona o CURR\xCA?",
    how_subtitle: "Corra atr\xE1s da vaga certa em apenas 3 passos simples",
    how_step_1_title: "Preencha suas informa\xE7\xF5es",
    how_step_1_desc: "Informe seus dados de contato, forma\xE7\xE3o e experi\xEAncias. N\xE3o se preocupe em usar palavras dif\xEDceis \u2014 escreva com suas pr\xF3prias palavras como era sua rotina.",
    how_step_2_title: "Cole a vaga desejada (opcional)",
    how_step_2_desc: "A IA analisa os requisitos e palavras-chave da vaga para destacar as suas experi\xEAncias e qualifica\xE7\xF5es reais mais compat\xEDveis.",
    how_step_3_title: "Receba seu curr\xEDculo em PDF",
    how_step_3_desc: "Pronto para envio! Em formato profissional aprovado por recrutadores e pronto para impress\xE3o ou envio por e-mail e WhatsApp.",
    how_info_box: "A IA do CURR\xCA nunca inventa experi\xEAncias falsas. Apenas valoriza sua hist\xF3ria real.",
    how_btn_start: "CRIAR MEU CURR\xCDCULO AGORA",
    feat_modal_title: "Recursos do CURR\xCA",
    feat_modal_subtitle: "Tecnologia desenhada para seu crescimento profissional",
    feat_item_1_title: "Refinamento de Reda\xE7\xE3o",
    feat_item_1_desc: "Converte frases simples em marcadores de a\xE7\xE3o de alto impacto reconhecidos em sele\xE7\xF5es.",
    feat_item_2_title: "Leitor de Vaga Inteligente",
    feat_item_2_desc: "Extrai compet\xEAncias-chave da vaga e posiciona seu perfil com m\xE1xima relev\xE2ncia.",
    feat_item_3_title: "Padr\xE3o Limpo ATS",
    feat_item_3_desc: "Formatado para passar sem erros em rob\xF4s de triagem (Gupy, Kenoby, LinkedIn).",
    feat_item_4_title: "Privacidade Total",
    feat_item_4_desc: "N\xE3o pedimos documentos confidenciais como CPF ou RG. Seus dados s\xE3o seus.",
    feat_modal_btn_close: "Fechar",
    // Hero
    hero_badge: "Intelig\xEAncia Artificial Feita para Quem Precisa de Resultados",
    hero_title_p1: "Seu pr\xF3ximo emprego pode come\xE7ar com um ",
    hero_title_highlight: "curr\xEDculo melhor.",
    hero_subtitle: "Crie um curr\xEDculo profissional com intelig\xEAncia artificial e adapte sua apresenta\xE7\xE3o para a vaga que voc\xEA deseja.",
    hero_cta_start: "CRIAR MEU CURR\xCDCULO",
    hero_cta_how: "COMO FUNCIONA",
    hero_trust_free: "100% gratuito",
    hero_trust_no_signup: "Sem cadastro obrigat\xF3rio",
    hero_trust_cloud: "Salvar na Nuvem (Opcional)",
    hero_saved_session: "SESS\xC3O SALVA",
    hero_saved_ready: "Pronto para download ou edi\xE7\xE3o",
    hero_saved_open: "Abrir Salvo",
    hero_saved_new: "Novo",
    // Simulation
    sim_title_1: "1. Informa\xE7\xF5es b\xE1sicas",
    sim_badge_1: "Preenchimento simples",
    sim_title_2: "2. Experi\xEAncia informal",
    sim_badge_2: "Linguagem pr\xF3pria",
    sim_title_3: "3. Otimiza\xE7\xE3o com IA CURR\xCA",
    sim_badge_3: "Padr\xE3o de recrutamento",
    sim_title_4: "4. Alinhamento com a vaga",
    sim_badge_4: "Curr\xEDculo pronto em PDF!",
    sim_no_fake: "Sem inventar experi\xEAncias",
    sim_try_now: "Experimente agora \u2192",
    // Features
    feat_1_title: "F\xE1cil como uma conversa",
    feat_1_desc: "Escreva suas tarefas cotidianas com suas pr\xF3prias palavras. O CURR\xCA transforma tudo em realiza\xE7\xF5es de alto impacto.",
    feat_2_title: "Alinhado \xE0 Vaga de Emprego",
    feat_2_desc: "Cole a descri\xE7\xE3o da oportunidade e o CURR\xCA destaca as compet\xEAncias e palavras-chave mais buscadas pelos recrutadores.",
    feat_3_title: "\xC9tico e 100% Confi\xE1vel",
    feat_3_desc: "Garantia estrita de integridade: a IA nunca inventa empresas ou cargos falsos. Apenas valoriza o que voc\xEA realmente fez.",
    // Wizard Steps & Labels
    wiz_back_home: "Voltar ao in\xEDcio",
    wiz_prev_step: "Etapa anterior",
    wiz_fill_sample: "Preencher exemplo",
    wiz_step_label: "Etapa",
    wiz_of_label: "de",
    step_1_title: "Dados Pessoais",
    step_2_title: "Objetivo Profissional",
    step_3_title: "Experi\xEAncia Profissional",
    step_4_title: "Forma\xE7\xE3o Acad\xEAmica",
    step_5_title: "Compet\xEAncias & Ferramentas",
    step_6_title: "Cursos & Certifica\xE7\xF5es",
    step_7_title: "Alinhamento com a Vaga",
    step_8_title: "Revis\xE3o e Gera\xE7\xE3o",
    // Wizard Step 1
    step_1_heading: "Seus Dados de Contato",
    step_1_sub: "Informa\xE7\xF5es que o recrutador usar\xE1 para te chamar para a entrevista. N\xE3o pedimos CPF ou documentos.",
    field_full_name: "Nome Completo",
    field_name_placeholder: "ex: Maria Eduarda Ferreira",
    field_name_error: "Informe seu nome e sobrenome (m\xEDnimo 3 caracteres).",
    label_required: "Obrigat\xF3rio",
    label_optional: "Opcional",
    field_city_state: "Cidade / Estado",
    field_city_placeholder: "ex: S\xE3o Paulo, SP",
    field_city_error: "Informe sua cidade e estado (ex: S\xE3o Paulo, SP).",
    field_phone: "Telefone / WhatsApp",
    field_phone_format: "Padr\xE3o: (11) 98765-4321",
    field_phone_placeholder: "(11) 98765-4321",
    field_phone_error: "Informe um telefone ou WhatsApp completo no formato (xx) 9xxxx-xxxx.",
    field_email: "E-mail profissional",
    field_email_placeholder: "ex: seuemail@gmail.com",
    field_email_error: "Informe um endere\xE7o de e-mail v\xE1lido.",
    field_linkedin: "LinkedIn (opcional)",
    field_portfolio: "Portf\xF3lio / Site (opcional)",
    field_photo_toggle: "Quero adicionar uma foto no curr\xEDculo",
    field_photo_change: "Alterar foto",
    field_photo_upload: "Carregar imagem",
    // Wizard Step 2
    step_2_heading: "Qual cargo voc\xEA est\xE1 buscando?",
    step_2_sub: "O objetivo profissional ajuda o recrutador a identificar imediatamente onde voc\xEA quer atuar.",
    step_2_role_label: "Cargo Almejado",
    step_2_role_placeholder: "Exemplo: Analista Administrativo",
    step_2_role_error: "Informe o cargo almejado para direcionar seu curr\xEDculo (ou escolha uma das sugest\xF5es abaixo).",
    step_2_suggestions_label: "Sugest\xF5es populares (clique para aplicar):",
    step_2_goal_label: "Objetivo profissional / Resumo pessoal (opcional)",
    step_2_goal_placeholder: "Ex: Busco uma vaga como Analista Administrativo para organizar fluxos de rotinas, faturamento e suporte a equipes, trazendo efici\xEAncia e comprometimento.",
    step_2_ai_tip: "Dica da IA: Se deixar em branco ou escrever com suas pr\xF3prias palavras, nossa intelig\xEAncia artificial criar\xE1 automaticamente um resumo executivo persuasivo e elegante para voc\xEA na etapa final.",
    // Wizard Step 3
    step_3_heading: "Vamos contar sua experi\xEAncia profissional",
    step_3_sub: "Adicione seus trabalhos anteriores ou atual. A IA organizar\xE1 cronologicamente.",
    step_3_add_btn: "+ ADICIONAR EXPERI\xCANCIA",
    step_3_no_exp_btn: "N\xE3o tenho experi\xEAncia formal (Primeiro Emprego)",
    step_3_no_exp_checkbox: "Em busca do primeiro emprego / Sem experi\xEAncia formal anterior",
    step_3_no_exp_desc: "Marque esta op\xE7\xE3o se voc\xEA for estudante, jovem aprendiz ou estiver ingressando no mercado de trabalho agora.",
    step_3_no_exp_active_title: "Perfil Sem Experi\xEAncia Formal Selecionado",
    step_3_no_exp_active_desc: "Perfeito! O CURR\xCA ir\xE1 estruturar seu curr\xEDculo com foco estrat\xE9gico na sua Forma\xE7\xE3o Acad\xEAmica, Cursos & Certifica\xE7\xF5es e Habilidades Pr\xE1ticas, destacando o seu potencial para os recrutadores.",
    step_3_no_exp_switch_back: "Prefiro preencher minhas experi\xEAncias profissionais",
    step_3_exp_num: "Experi\xEAncia",
    step_3_remove_exp: "Remover",
    step_3_field_company: "Empresa",
    step_3_field_company_placeholder: "ex: Distribuidora Silva, Padaria Central, Escrit\xF3rio Modelo",
    step_3_field_role: "Cargo",
    step_3_field_role_placeholder: "ex: Assistente Administrativo, Auxiliar de Loja",
    step_3_field_start: "In\xEDcio (M\xEAs/Ano)",
    step_3_field_end: "T\xE9rmino (M\xEAs/Ano)",
    step_3_field_current: "Trabalho atualmente nesta empresa",
    step_3_field_activities: "Atividades e responsabilidades do dia a dia",
    step_3_field_activities_tip: "Dica: escreva com suas pr\xF3prias palavras o que fazia. A IA polir\xE1 com linguagem executiva.",
    step_3_field_results: "Resultados, conquistas ou melhorias alcan\xE7adas (Opcional)",
    step_3_field_results_tip: "Dica: mencione n\xFAmeros, metas batidas ou processos otimizados (ex: reduziu tempo em 30%).",
    // Wizard Step 4
    step_4_heading: "Forma\xE7\xE3o Escolar ou Acad\xEAmica",
    step_4_sub: "Indique sua escolaridade: ensino fundamental, m\xE9dio, t\xE9cnico, gradua\xE7\xE3o ou p\xF3s-gradua\xE7\xE3o.",
    step_4_add_btn: "+ ADICIONAR FORMA\xC7\xC3O",
    step_4_error_min: "Adicione pelo menos 1 n\xEDvel de escolaridade ou forma\xE7\xE3o acad\xEAmica.",
    step_4_field_course: "Curso / Escolaridade",
    step_4_field_institution: "Institui\xE7\xE3o de Ensino",
    step_4_field_start_year: "Ano de In\xEDcio",
    step_4_field_end_year: "Ano de Conclus\xE3o / Previs\xE3o",
    step_4_field_status: "Situa\xE7\xE3o",
    step_4_status_completed: "Conclu\xEDdo",
    step_4_status_in_progress: "Em andamento",
    step_4_status_interrupted: "Interrompido",
    // Wizard Step 5
    step_5_heading: "Compet\xEAncias e Ferramentas",
    step_5_sub: "Selecione as habilidades e ferramentas que voc\xEA possui ou digite outras. Pelo menos uma \xE9 necess\xE1ria.",
    step_5_error: "Selecione pelo menos uma compet\xEAncia profissional ou ferramenta para o seu curr\xEDculo.",
    step_5_label: "Habilidades profissionais (clique para marcar):",
    step_5_tools_label: "Sistemas, softwares e ferramentas:",
    step_5_custom_placeholder: "Digitar outra compet\xEAncia (ex: Reda\xE7\xE3o, Negocia\xE7\xE3o...)",
    step_5_tools_custom_placeholder: "Digitar outro software (ex: Canva, Trello...)",
    step_5_add_btn: "Adicionar",
    // Wizard Step 6
    step_6_heading: "Cursos e Certifica\xE7\xF5es Extras",
    step_6_sub: "Cursos livres, workshops, idiomas ou certificados t\xE9cnicos que enriquecem seu perfil.",
    step_6_add_btn: "+ ADICIONAR CURSO",
    step_6_empty_title: "Nenhum curso adicionado ainda.",
    step_6_empty_sub: "Esta se\xE7\xE3o \xE9 opcional, mas ajuda a destacar seu interesse cont\xEDnuo em aprender!",
    step_6_empty_btn: "+ Adicionar meu primeiro curso",
    step_6_field_name: "Nome do Curso",
    step_6_field_institution: "Institui\xE7\xE3o",
    step_6_field_year: "Ano",
    step_6_field_hours: "Carga Hor\xE1ria (opcional)",
    // Wizard Step 7
    step_7_heading: "Quer deixar seu curr\xEDculo ainda mais alinhado \xE0 vaga?",
    step_7_sub: "Cole a descri\xE7\xE3o da vaga. A IA vai analisar os requisitos e ajudar a destacar as experi\xEAncias e compet\xEAncias mais relevantes do seu perfil.",
    step_7_badge: "Diferencial Inteligente CURR\xCA",
    step_7_textarea_label: "Descri\xE7\xE3o ou requisitos da vaga (Copie e cole do LinkedIn, Gupy, WhatsApp...)",
    step_7_ethics_title: "Compromisso de \xC9tica e Verdade:",
    step_7_ethics_desc: "A IA N\xC3O inventa compet\xEAncias, experi\xEAncias ou qualifica\xE7\xF5es que voc\xEA n\xE3o possui. Ela apenas reorganiza e destaca suas informa\xE7\xF5es reais com os termos que os recrutadores valorizam.",
    step_7_btn_analyze: "ANALISAR VAGA COM IA",
    step_7_btn_analyzing: "Analisando requisitos com IA...",
    step_7_skip_hint: "(Se preferir, voc\xEA pode pular esta etapa clicando em Pr\xF3ximo)",
    // Wizard Step 8
    step_8_badge: "Tudo pronto para a m\xE1gica!",
    step_8_heading: "Confira suas informa\xE7\xF5es",
    step_8_sub: "Voc\xEA pode revisar cada se\xE7\xE3o abaixo antes de gerar seu curr\xEDculo profissional com IA.",
    step_8_warning_title: "Aten\xE7\xE3o: Campos obrigat\xF3rios incompletos",
    step_8_warning_desc: "Para garantir que seu curr\xEDculo passe nos filtros das empresas e tenha qualidade profissional, preencha os itens marcados como Pendente abaixo clicando em Editar.",
    step_8_status_completed: "Preenchido",
    step_8_status_pending: "Pendente (*)",
    step_8_btn_edit: "Editar",
    step_8_btn_generate: "\u2728 GERAR MEU CURR\xCDCULO",
    step_8_guarantee: "Gera\xE7\xE3o inteligente r\xE1pida e profissional \u2022 100% gratuita sem cadastro obrigat\xF3rio.",
    step_8_pending_notice: "Preencha todos os campos obrigat\xF3rios acima para habilitar a gera\xE7\xE3o.",
    // Wizard Bottom Nav
    wiz_back: "Voltar",
    wiz_next: "Pr\xF3ximo",
    wiz_req_warning: "Preencha os campos obrigat\xF3rios (*) para avan\xE7ar",
    wiz_generate_btn: "GERAR MEU CURR\xCDCULO",
    wiz_jump_review: "Ir para Revis\xE3o (Etapa 8)",
    // Resume sections
    sec_summary: "Resumo Profissional",
    sec_experience: "Experi\xEAncia Profissional",
    sec_education: "Forma\xE7\xE3o Acad\xEAmica",
    sec_skills: "Compet\xEAncias & Habilidades",
    sec_courses: "Cursos & Certifica\xE7\xF5es",
    sec_contact: "Contato",
    // Template Labels
    tmpl_summary: "Resumo Profissional",
    tmpl_experience: "Experi\xEAncia Profissional",
    tmpl_skills: "Compet\xEAncias & Tecnologias",
    tmpl_skills_core: "Principais Compet\xEAncias",
    tmpl_skills_main: "Compet\xEAncias Principais",
    tmpl_tools: "Sistemas, Softwares & Ferramentas",
    tmpl_tools_soft: "Ferramentas & Softwares",
    tmpl_education: "Forma\xE7\xE3o Acad\xEAmica",
    tmpl_education_short: "Forma\xE7\xE3o",
    tmpl_courses: "Cursos & Certifica\xE7\xF5es",
    tmpl_courses_short: "Cursos",
    tmpl_certifications: "Certifica\xE7\xF5es",
    tmpl_contact: "Contato",
    tmpl_contact_location: "Localiza\xE7\xE3o:",
    tmpl_present: "Atual",
    tmpl_status_completed: "Conclu\xEDdo",
    tmpl_status_in_progress: "Em andamento",
    tmpl_status_interrupted: "Interrompido",
    tmpl_qualifications: "Resumo de Qualifica\xE7\xF5es",
    tmpl_qualifications_synthesis: "S\xEDntese de Qualifica\xE7\xF5es",
    tmpl_profile: "Perfil Profissional",
    tmpl_trajectory: "Trajet\xF3ria Profissional",
    tmpl_exec_skills: "Compet\xEAncias Diretivas & Ferramentas",
    tmpl_exec_mgmt: "Gest\xE3o & Lideran\xE7a",
    tmpl_exec_systems: "Sistemas & Tecnologias",
    tmpl_exec_cert: "Certifica\xE7\xF5es & Aperfei\xE7oamento Profissional",
    tmpl_skills_tech_alt: "Compet\xEAncias & Habilidades T\xE9cnicas",
    tmpl_skills_label: "Compet\xEAncias:",
    tmpl_tools_label: "Ferramentas & Tecnologias:",
    tmpl_default_bullet: "Condu\xE7\xE3o e execu\xE7\xE3o das responsabilidades operacionais e estrat\xE9gicas da fun\xE7\xE3o.",
    tmpl_default_bullet_modern: "Atua\xE7\xE3o direcionada ao atingimento de metas operacionais e estrat\xE9gicas.",
    tmpl_default_bullet_exec: "Lideran\xE7a de iniciativas estrat\xE9gicas e gest\xE3o cont\xEDnua de processos organizacionais.",
    tmpl_default_bullet_ats: "Execu\xE7\xE3o de rotinas operacionais e projetos corporativos da \xE1rea.",
    tmpl_default_bullet_corp: "Respons\xE1vel pela condu\xE7\xE3o de processos t\xE9cnicos e atendimento a requisitos organizacionais.",
    step_7_err_paste_job: "Cole a descri\xE7\xE3o da vaga no campo acima para analisar.",
    step_7_err_fail: "N\xE3o foi poss\xEDvel analisar a vaga agora. Voc\xEA pode continuar mesmo assim.",
    field_photo_tip: "Dica: Use uma foto n\xEDtida e com boa ilumina\xE7\xE3o.",
    // Preview
    prev_download_pdf: "Baixar Curr\xEDculo PDF",
    prev_edit_info: "Editar Informa\xE7\xF5es",
    prev_choose_template: "Escolha o Modelo Visual",
    prev_model_modern: "Moderno Clean",
    prev_model_classic: "Executivo Cl\xE1ssico",
    prev_model_sidebar: "Lateral Estruturado",
    prev_btn_adapt: "Adaptar para vaga",
    prev_btn_edit: "Editar",
    prev_btn_regenerate: "Gerar novamente",
    prev_btn_save: "Salvar",
    prev_btn_saved: "Salvo!",
    prev_btn_download: "BAIXAR CURR\xCDCULO EM PDF",
    prev_btn_downloading: "GERANDO PDF VETORIAL NO SERVIDOR...",
    prev_cloud_connected: "Conectado como",
    prev_cloud_prompt_title: "Deseja acessar este curr\xEDculo em outro celular ou computador?",
    prev_cloud_prompt_desc: "Seu curr\xEDculo j\xE1 est\xE1 pronto e salvo no navegador atual. Se preferir deix\xE1-lo guardado na nuvem para n\xE3o perder, fa\xE7a login gratuito (com 1 clique).",
    prev_cloud_btn: "Salvar na Nuvem (Login)",
    prev_match_title: "Compatibilidade com esta vaga",
    prev_match_badge: "Recurso Inteligente \u2022 An\xE1lise de Vaga",
    prev_match_score_sub: "Ader\xEAncia ao perfil",
    prev_match_found_skills: "Compet\xEAncias Encontradas",
    prev_match_relevant_exp: "Experi\xEAncias Relevantes",
    prev_match_improvements: "Pontos de Melhoria",
    prev_match_disclaimer: "* A an\xE1lise de compatibilidade \xE9 um diagn\xF3stico t\xE9cnico comparativo e n\xE3o garante contrata\xE7\xE3o nem aprova\xE7\xE3o em processos seletivos.",
    // Preview extra & badges
    prev_ready_badge: "Curr\xEDculo Pronto",
    prev_ai_optimized: "\u2022 Otimizado com IA",
    prev_default_title: "Seu Curr\xEDculo",
    prev_cloud_synced_badge: "Nuvem Sincronizada",
    prev_cloud_synced_desc: "Este curr\xEDculo est\xE1 salvo na sua nuvem e protegido para acesso em qualquer dispositivo.",
    prev_cloud_synced_tag: "Salvo na Nuvem",
    prev_cloud_opt_badge: "Opcional \u2022 Salvar na Nuvem",
    prev_tmpl_style_title: "Escolha o Estilo do Curr\xEDculo:",
    prev_tip_download: "Dica: O download do PDF A4 em alta defini\xE7\xE3o come\xE7ar\xE1 diretamente sem abrir janela de impress\xE3o.",
    prev_print_pdf_hint: "Download direto: O PDF vetorial em alta defini\xE7\xE3o ser\xE1 gerado no servidor e salvo diretamente no seu dispositivo.",
    // Templates Ribbon
    tmpl_modern_badge: "Tech & Inova\xE7\xE3o",
    tmpl_modern_desc: "Design limpo e objetivo, sem ru\xEDdo visual. Padr\xE3o para startups e big techs.",
    tmpl_executive_badge: "Lideran\xE7a & Finan\xE7as",
    tmpl_executive_desc: "Diagrama\xE7\xE3o nobre com tipografia serifada e autoridade executiva.",
    tmpl_ats_badge: "Triagem Online & ATS",
    tmpl_ats_desc: "Coluna \xFAnica 100% linear, otimizada para rob\xF4s de recrutamento e portais.",
    tmpl_impact_badge: "Vendas & Produto",
    tmpl_impact_desc: "Painel lateral estruturado com alto contraste e presen\xE7a visual memor\xE1vel.",
    tmpl_corporate_badge: "Bancos & Multinacionais",
    tmpl_corporate_desc: "Grid matem\xE1tico minimalista para grandes ind\xFAstrias e governan\xE7a global.",
    tmpl_minimalist_badge: "Primeiro Emprego & Est\xE1gio",
    tmpl_minimalist_desc: "Coluna lateral leve em tons neutros, ideal para pouco tempo de experi\xEAncia.",
    tmpl_creative_badge: "Design & Moda",
    tmpl_creative_desc: "Cabe\xE7alho com faixa colorida e tipografia expressiva para perfis criativos.",
    tmpl_elegant_badge: "Diretoria & Jur\xEDdico",
    tmpl_elegant_desc: "Serifada com filetes dourados, sofistica\xE7\xE3o cl\xE1ssica discreta.",
    tmpl_tech_badge: "Engenharia & Dados",
    tmpl_tech_badge_short: "Tech",
    tmpl_tech_desc: "Linha do tempo vertical que conta sua carreira cronologicamente.",
    tmpl_intl_badge: "Exterior & Multinacionais",
    tmpl_intl_desc: "Formato internacional limpo, sem foto e 100% compat\xEDvel com ATS globais.",
    // Job Analysis panel
    job_analysis_badge: "Recurso Inteligente \u2022 An\xE1lise de Vaga",
    job_analysis_title: "Compatibilidade com esta vaga",
    job_analysis_match: "Ader\xEAncia ao perfil",
    job_analysis_skills_found: "Compet\xEAncias Encontradas",
    job_analysis_exp_relevant: "Experi\xEAncias Relevantes",
    job_analysis_improvements: "Pontos de Melhoria",
    job_analysis_disclaimer: "* A an\xE1lise de compatibilidade \xE9 um diagn\xF3stico t\xE9cnico comparativo e n\xE3o garante contrata\xE7\xE3o nem aprova\xE7\xE3o em processos seletivos.",
    tmpl_achievements: "Conquistas & Resultados",
    tmpl_skills_tools: "Compet\xEAncias & Tecnologias",
    // ATS Audit Bar
    ats_audit_title: "Auditoria de Leitura ATS:",
    ats_audit_sections: "se\xE7\xF5es estruturadas \u2022 Ordem determin\xEDstica \u2022 100% texto index\xE1vel",
    ats_score_label: "Score Estrutural:",
    ats_verification_note: "(Verifica\xE7\xE3o t\xE9cnica de parsing)",
    // Mobile bar
    prev_mobile_creating: "Criando PDF...",
    prev_mobile_download: "Baixar PDF",
    prev_mobile_edit: "Editar",
    // Landing Hero Simulation
    sim_header_brand: "CURR\xCA \u2022 Transforma\xE7\xE3o em Tempo Real",
    sim_header_ai_active: "IA Ativa",
    sim_detail_1: "Jo\xE3o Silva \u2022 Analista Administrativo",
    sim_detail_2: '"Cuidava das notas e planilhas no setor..."',
    sim_detail_3: '\u2192 "Gerenciou rotinas fiscais e controle de faturamento via Excel"',
    sim_detail_4: "Requisitos correspondentes: 92% de compatibilidade",
    sim_default_role: "Profissional",
    // Landing Hero Saved Resume
    hero_saved_resume_title: "Curr\xEDculo Salvo",
    hero_saved_cloud_tooltip: "Deseja salvar na nuvem? Login gratuito opcional",
    // Navbar Tooltips
    nav_cloud_connected_title: "Conta conectada na nuvem",
    nav_cloud_active_title: "Nuvem ativa",
    nav_login_tooltip: "Entrar (Opcional - para salvar na nuvem)",
    nav_menu_aria: "Abrir menu",
    // Adapt Job Modal
    adapt_modal_title: "Adaptar para Outra Vaga",
    adapt_current_role: "Cargo atual do curr\xEDculo:",
    adapt_modal_desc: "Cole a descri\xE7\xE3o ou requisitos da nova vaga que voc\xEA deseja disputar. O CURR\xCA vai reanalisar suas experi\xEAncias reais e destacar os pontos mais compat\xEDveis para esta nova oportunidade.",
    adapt_job_label: "Descri\xE7\xE3o da nova vaga",
    adapt_job_placeholder: "Cole aqui o texto da nova vaga (requisitos, atividades, conhecimentos desejados)...",
    adapt_truth_guarantee: "Suas experi\xEAncias e dados cadastrados ser\xE3o mantidos 100% verdadeiros.",
    adapt_cancel: "Cancelar",
    adapt_submitting: "Adaptando com IA...",
    adapt_submit: "Adaptar Curr\xEDculo",
    // Loading Overlay
    loading_phase_1: "Analisando seu perfil...",
    loading_phase_2: "Organizando suas experi\xEAncias...",
    loading_phase_3: "Adaptando seu curr\xEDculo...",
    loading_phase_4: "Finalizando...",
    loading_brand_badge: "CURR\xCA \u2022 IA em A\xE7\xE3o",
    loading_description: "Refinando suas palavras, estruturando cronologia e aplicando padr\xF5es de triagem profissional.",
    loading_moment: "Apenas alguns instantes..."
  },
  en: {
    "step_1_ph_linkedin": "e.g. linkedin.com/in/yourname",
    "step_1_ph_portfolio": "e.g. mywork.com / portfolio",
    "step_3_err_company": "Enter the company name.",
    "step_3_err_role": "Enter your job title.",
    "step_3_pattern_hint": "Format: mm/yyyy",
    "step_3_err_start_incomplete": "Incomplete date. Format mm/yyyy (e.g. 03/2020).",
    "step_3_err_start_empty": "Enter the start date (mm/yyyy).",
    "step_3_err_end_incomplete": "Incomplete date. Format mm/yyyy (e.g. 11/2023).",
    "step_3_err_end_empty": 'Enter the end date (or check "Currently working here" below).',
    "step_3_err_end_before_start": "End date cannot be earlier than start date.",
    "step_3_err_activities": "Briefly describe your main activities.",
    "step_3_err_add_one": "Add at least 1 work experience or check the first job option above.",
    "step_4_err_add_one": "Add at least 1 education entry or schooling level.",
    "step_4_formation_prefix": "Education #",
    "step_4_err_course": "Enter degree or school level (e.g. High School, B.S.).",
    "step_4_err_institution": "Enter school or university name.",
    "step_4_err_start_year": "Enter a valid 4-digit year (e.g. 2018).",
    "step_4_err_end_year": "Enter a valid 4-digit year (e.g. 2022).",
    "step_4_err_end_before_start": "Graduation year cannot be earlier than start year.",
    "step_5_err_select_one": "Select at least one professional skill or tool for your resume.",
    "step_6_err_fill_all": "Fill Course and Institution for each item or remove blank entries.",
    "step_6_course_prefix": "Course #",
    "step_6_err_course_name": "Enter course name.",
    "step_6_err_institution": "Enter institution name.",
    "step_6_err_year": "Enter a 4-digit year (e.g. 2023).",
    "step_7_matched_skills": "\u2713 Skills found in your profile:",
    "step_7_essential_keywords": "Essential keywords from the job:",
    "step_7_ai_tips": "\u{1F4A1} AI tips for this selection process:",
    "step_8_warning_incomplete_title": "Notice: Incomplete mandatory fields",
    "step_8_warning_incomplete_desc": "To ensure your resume passes screening filters and maintains high quality, fill the items marked as Pending below by clicking Edit.",
    step_2_missing_error: "Please specify your target job title (step 2).",
    step_3_no_exp_title: "Looking for first job / No prior formal work experience",
    step_3_no_exp_sub: "Check this option if you are a student, recent graduate, or just entering the workforce.",
    step_3_no_exp_alert_title: "No Formal Experience Profile Selected",
    step_3_no_exp_alert_desc: "Great! CURR\xCA will strategically structure your resume around Education, Skills, and Certifications to highlight your high potential.",
    step_3_no_exp_revert: "I prefer to enter my professional experience",
    step_3_ai_tip: "Do not worry about complex jargon. Write simply what you did day-to-day, and our AI will polish it into high-impact executive achievements.",
    step_3_company_number: "Experience #",
    label_remove: "Remove",
    label_present: "Present",
    btn_add: "Add",
    step_3_company_label: "Company Name",
    step_3_company_placeholder: "e.g. Apex Logistics, Metro Retail, Central Office",
    step_3_role_label: "Job Title",
    step_3_role_placeholder: "e.g. Administrative Assistant, Sales Associate",
    step_3_start_label: "Start Date",
    step_3_end_label: "End Date",
    step_3_pattern_mmyyyy: "Format: mm/yyyy",
    step_3_current_job: "I currently work here",
    step_3_activities_label: "Day-to-day duties and responsibilities",
    step_3_activities_placeholder: "e.g. Answered customer calls, organized inventory, audited invoices, and updated spreadsheets...",
    step_3_results_label: "Key achievements or measurable improvements (Optional)",
    step_3_results_placeholder: "e.g. Reduced invoice audit time by 30% after streamlining Excel workflows...",
    step_3_error_company: "Please enter the company name.",
    step_3_error_role: "Please enter your job title.",
    step_3_error_start_date: "Enter start date (mm/yyyy).",
    step_3_error_end_date: "Enter end date (or check currently working here).",
    step_3_error_chronology: "End date cannot be earlier than start date.",
    step_3_error_activities: "Briefly describe your duties and responsibilities.",
    step_3_missing_error: "Fill in your experience or select first job.",
    step_4_course_label: "Degree / Program of Study",
    step_4_course_ph: "e.g. High School Diploma, B.S. in Business Administration...",
    step_4_inst_label: "School / College / University",
    step_4_inst_ph: "e.g. City College of New York, State University...",
    step_4_start_year: "Start Year",
    step_4_end_year: "Graduation / Expected Year",
    step_4_status_label: "Status",
    step_4_formation_num: "Education",
    step_4_error_min_detail: "Add at least one educational degree or schooling level.",
    step_4_error_course: "Please enter your degree or course of study.",
    step_4_error_inst: "Please enter the school or institution name.",
    step_4_error_start_year: "Enter a valid 4-digit year (e.g. 2018).",
    step_4_error_end_year: "Enter a valid 4-digit year (e.g. 2022).",
    step_4_error_chronology: "Graduation year cannot be earlier than start year.",
    step_4_missing_error: "Please complete at least 1 education entry.",
    step_5_skills_title: "Professional skills (click to select):",
    step_5_skills_custom_ph: "Type another skill (e.g. Copywriting, Negotiation...)",
    step_5_tools_title: "Software, tools, and systems:",
    step_5_tools_custom_ph: "Type another tool (e.g. Canva, Trello, Salesforce...)",
    step_5_error_detail: "Please select at least one professional skill or tool for your resume.",
    step_5_missing_error: "Select at least one skill or tool.",
    step_6_empty: "No additional certifications added yet.",
    step_6_add_first: "+ Add my first certification",
    step_6_course_num: "Course",
    step_6_name_label: "Course / Certificate Name",
    step_6_name_ph: "e.g. Excel from Beginner to Advanced, Customer Service...",
    step_6_inst_label: "Issuing Organization",
    step_6_inst_ph: "e.g. Coursera, Udemy, Local College...",
    step_6_year_label: "Year",
    step_6_hours_label: "Total Hours (optional)",
    step_6_hours_ph: "e.g. 40 hours",
    step_6_error_detail: "Fill in course name and institution for all added items.",
    step_6_error_name: "Please enter the course name.",
    step_6_error_inst: "Please enter the issuing institution.",
    step_6_error_year: "Enter a 4-digit year (e.g. 2023).",
    step_6_missing_error: "Please review your added certifications.",
    step_7_tag: "CURR\xCA Smart Advantage",
    step_7_desc_label: "Job description or requirements (Paste from LinkedIn, Indeed...)",
    step_7_desc_ph: "Paste the job posting text here (responsibilities, required skills, bonus points)...",
    step_7_ethics_text: "Ethical Guarantee: The AI NEVER invents fake skills or jobs. It accurately aligns your genuine experience with recruiter-preferred terminology.",
    step_7_analyzing_btn: "Analyzing job posting with AI...",
    step_7_analyze_btn: "ANALYZE JOB WITH AI",
    step_7_analysis_completed: "Job Analysis Completed",
    step_7_mapped_role: "Target Role Mapped",
    step_7_estimated_match: "Estimated Match",
    step_7_skills_found: "\u2713 Matching skills found in your profile:",
    step_7_keywords_essential: "Essential job keywords:",
    step_7_ai_tips_title: "\u{1F4A1} AI Recommendations for this application:",
    step_8_tag: "Ready for AI Generation!",
    step_8_edit_btn: "Edit",
    step_8_btn_sub: "Fast, executive-grade AI resume generation \u2022 100% free with no mandatory sign-up.",
    step_8_btn_sub_disabled: "Complete all required fields above to enable resume generation.",
    step_8_items_count: "item(s)",
    step_8_optional_provided: "Provided",
    field_linkedin_ph: "e.g. linkedin.com/in/yourprofile",
    field_portfolio_ph: "e.g. mysite.com / portfolio",
    // Slogan & Brand
    brand_slogan: "Run after the right job.",
    footer_developed_by: "Site developed by",
    footer_tagline: "Intelligent resume platform with AI optimized for recruiters and ATS systems.",
    footer_terms: "Terms & Privacy",
    nav_create: "Build resume",
    nav_how_it_works: "How it works",
    nav_features: "Features",
    nav_saved_resume: "View Saved Resume",
    nav_login_cloud: "Sign in / Cloud",
    nav_cta_create: "Create Now",
    nav_mobile_create: "Create",
    nav_header: "Navigation",
    nav_smart_features: "Smart features",
    nav_cloud_active: "Active Cloud",
    nav_login_cloud_full: "Sign in / Save to Cloud",
    nav_optional: "Optional",
    // Modals Info
    how_title: "How CURR\xCA works?",
    how_subtitle: "Chase the right job in just 3 simple steps",
    how_step_1_title: "Fill in your information",
    how_step_1_desc: "Enter your contact details, education, and experience. Don't worry about using difficult words \u2014 write in your own words what your routine was like.",
    how_step_2_title: "Paste the desired job (optional)",
    how_step_2_desc: "The AI analyzes the requirements and keywords of the job post to highlight your most compatible real experiences and qualifications.",
    how_step_3_title: "Get your resume in PDF",
    how_step_3_desc: "Ready to send! In a professional format approved by recruiters and ready for printing or sending via email and WhatsApp.",
    how_info_box: "CURR\xCA's AI never invents false experiences. It only highlights your real story.",
    how_btn_start: "CREATE MY RESUME NOW",
    feat_modal_title: "CURR\xCA Features",
    feat_modal_subtitle: "Technology designed for your professional growth",
    feat_item_1_title: "Writing Refinement",
    feat_item_1_desc: "Converts simple sentences into high-impact action bullet points recognized in job selections.",
    feat_item_2_title: "Smart Job Reader",
    feat_item_2_desc: "Extracts key skills from the job post and positions your profile with maximum relevance.",
    feat_item_3_title: "Clean ATS Format",
    feat_item_3_desc: "Formatted to pass without errors through sorting robots (such as Gupy, Kenoby, LinkedIn).",
    feat_item_4_title: "Total Privacy",
    feat_item_4_desc: "We do not request confidential documents such as SSN, ID, or tax numbers. Your data belongs to you.",
    feat_modal_btn_close: "Close",
    // Hero
    hero_badge: "Artificial Intelligence Built for Those Who Need Results",
    hero_title_p1: "Your next job starts with a ",
    hero_title_highlight: "better resume.",
    hero_subtitle: "Create a professional AI-optimized resume and tailor your qualifications to the job you want to land.",
    hero_cta_start: "BUILD MY RESUME",
    hero_cta_how: "HOW IT WORKS",
    hero_trust_free: "100% Free",
    hero_trust_no_signup: "No sign-up required",
    hero_trust_cloud: "Cloud Save (Optional)",
    hero_saved_session: "SAVED SESSION",
    hero_saved_ready: "Ready for download or editing",
    hero_saved_open: "Open Saved",
    hero_saved_new: "New",
    // Simulation
    sim_title_1: "1. Basic Information",
    sim_badge_1: "Simple form",
    sim_title_2: "2. Informal Experience",
    sim_badge_2: "Your own words",
    sim_title_3: "3. CURR\xCA AI Optimization",
    sim_badge_3: "Recruiter standard",
    sim_title_4: "4. Job Alignment",
    sim_badge_4: "PDF ready to export!",
    sim_no_fake: "Zero fabricated experience",
    sim_try_now: "Try it now \u2192",
    // Features
    feat_1_title: "Simple as a conversation",
    feat_1_desc: "Write down your daily tasks in plain words. CURR\xCA transforms them into high-impact achievement bullet points.",
    feat_2_title: "Targeted to Job Descriptions",
    feat_2_desc: "Paste the opportunity details and CURR\xCA highlights the exact skills and keywords recruiters look for.",
    feat_3_title: "Ethical and 100% Reliable",
    feat_3_desc: "Strict integrity guarantee: AI never fabricates fake companies or titles. It only elevates what you genuinely accomplished.",
    // Wizard Steps & Labels
    wiz_back_home: "Back to home",
    wiz_prev_step: "Previous step",
    wiz_fill_sample: "Fill sample data",
    wiz_step_label: "Step",
    wiz_of_label: "of",
    step_1_title: "Personal Info",
    step_2_title: "Target Job",
    step_3_title: "Work Experience",
    step_4_title: "Education",
    step_5_title: "Skills & Tools",
    step_6_title: "Courses & Certifications",
    step_7_title: "Job Target Alignment",
    step_8_title: "Review & Generate",
    // Wizard Step 1
    step_1_heading: "Your Contact Details",
    step_1_sub: "Information recruiters will use to contact you for an interview. We never ask for sensitive documents.",
    field_full_name: "Full Name",
    field_name_placeholder: "e.g., Emily Johnson",
    field_name_error: "Enter your full name (minimum 3 characters).",
    label_required: "Required",
    label_optional: "Optional",
    field_city_state: "City / State / Country",
    field_city_placeholder: "e.g., New York, NY",
    field_city_error: "Enter your city and state/country.",
    field_phone: "Phone / WhatsApp",
    field_phone_format: "Format: (555) 123-4567 or +1 (555) 123-4567",
    field_phone_placeholder: "(555) 123-4567",
    field_phone_error: "Enter a valid phone number (e.g. (555) 123-4567).",
    field_email: "Professional Email",
    field_email_placeholder: "e.g., yourname@email.com",
    field_email_error: "Enter a valid email address.",
    field_linkedin: "LinkedIn (optional)",
    field_portfolio: "Portfolio / Website (optional)",
    field_photo_toggle: "Add a photo to the resume",
    field_photo_change: "Change photo",
    field_photo_upload: "Upload photo",
    // Wizard Step 2
    step_2_heading: "What position are you seeking?",
    step_2_sub: "Your career objective helps recruiters instantly know where you want to work.",
    step_2_role_label: "Target Job Title",
    step_2_role_placeholder: "e.g., Administrative Analyst",
    step_2_role_error: "Enter your target job title (or choose one of the suggestions below).",
    step_2_suggestions_label: "Popular suggestions (click to apply):",
    step_2_goal_label: "Career objective / Personal summary (optional)",
    step_2_goal_placeholder: "e.g., Seeking a role as Administrative Analyst to organize workflows, billing, and team support, bringing measurable efficiency and dedication.",
    step_2_ai_tip: "AI Tip: If left blank or written in your own words, our AI will craft a polished, persuasive executive summary for you in the final step.",
    // Wizard Step 3
    step_3_heading: "Let's detail your work experience",
    step_3_sub: "Add your past or current positions. AI will organize them chronologically.",
    step_3_add_btn: "+ ADD EXPERIENCE",
    step_3_no_exp_btn: "I have no formal experience (First Job)",
    step_3_no_exp_checkbox: "Seeking first job / No prior formal work experience",
    step_3_no_exp_desc: "Check this option if you are a student, apprentice, or newly entering the workforce.",
    step_3_no_exp_active_title: "No Formal Experience Profile Selected",
    step_3_no_exp_active_desc: "Great! CURR\xCA will strategically structure your resume around your Education, Certifications, and Practical Skills to showcase your high potential.",
    step_3_no_exp_switch_back: "I prefer to enter work experiences",
    step_3_exp_num: "Experience",
    step_3_remove_exp: "Remove",
    step_3_field_company: "Company",
    step_3_field_company_placeholder: "e.g., Apex Logistics, Retail Store, Central Office",
    step_3_field_role: "Job Title",
    step_3_field_role_placeholder: "e.g., Administrative Assistant, Office Clerk",
    step_3_field_start: "Start Date (MM/YYYY)",
    step_3_field_end: "End Date (MM/YYYY)",
    step_3_field_current: "Currently working in this role",
    step_3_field_activities: "Daily responsibilities and activities",
    step_3_field_activities_tip: "Tip: Describe in your own words what you did. AI will refine it into professional action verbs.",
    step_3_field_results: "Key results, achievements, or improvements (Optional)",
    step_3_field_results_tip: "Tip: Mention numbers, targets reached, or time saved (e.g., cut turnaround time by 30%).",
    // Wizard Step 4
    step_4_heading: "Your Educational Background",
    step_4_sub: "Indicate your highest degree: high school, technical degree, college, or graduate studies.",
    step_4_add_btn: "+ ADD EDUCATION",
    step_4_error_min: "Please add at least 1 degree or education level.",
    step_4_field_course: "Degree / Field of Study",
    step_4_field_institution: "School / Institution",
    step_4_field_start_year: "Start Year",
    step_4_field_end_year: "Graduation / Expected Year",
    step_4_field_status: "Status",
    step_4_status_completed: "Completed",
    step_4_status_in_progress: "In progress",
    step_4_status_interrupted: "Interrupted",
    // Wizard Step 5
    step_5_heading: "Skills and Tools",
    step_5_sub: "Select or write the competencies and software you master to highlight in your resume.",
    step_5_error: "Select at least one professional skill or tool for your resume.",
    step_5_label: "Professional skills (click to select):",
    step_5_tools_label: "Systems, software and tools:",
    step_5_custom_placeholder: "Type another skill (e.g., Negotiation, Copywriting...)",
    step_5_tools_custom_placeholder: "Type another tool (e.g., Canva, Trello...)",
    step_5_add_btn: "Add",
    // Wizard Step 6
    step_6_heading: "Extra Courses & Certifications",
    step_6_sub: "Workshops, languages, online courses, and certificates that strengthen your profile.",
    step_6_add_btn: "+ ADD COURSE",
    step_6_empty_title: "No courses added yet.",
    step_6_empty_sub: "This section is optional, but highlights your drive for continuous learning!",
    step_6_empty_btn: "+ Add my first course",
    step_6_field_name: "Course Name",
    step_6_field_institution: "Institution",
    step_6_field_year: "Year",
    step_6_field_hours: "Hours / Duration (optional)",
    // Wizard Step 7
    step_7_heading: "Want to tailor your resume directly to the job?",
    step_7_sub: "Paste the job description here. Our AI will analyze the requirements and spotlight your most relevant strengths and keywords.",
    step_7_badge: "Smart AI Advantage",
    step_7_textarea_label: "Job description or requirements (Copy & paste from LinkedIn, job boards...)",
    step_7_ethics_title: "Ethics & Authenticity Guarantee:",
    step_7_ethics_desc: "The AI NEVER invents qualifications, experiences, or skills you don't possess. It simply re-articulates and emphasizes your real background using the exact terms recruiters look for.",
    step_7_btn_analyze: "ANALYZE JOB WITH AI",
    step_7_btn_analyzing: "Analyzing requirements with AI...",
    step_7_skip_hint: "(If you prefer, you can skip this step by clicking Next)",
    // Wizard Step 8
    step_8_badge: "All set for the magic!",
    step_8_heading: "Review your information",
    step_8_sub: "You can review each section below before generating your AI-optimized resume.",
    step_8_warning_title: "Attention: Required fields incomplete",
    step_8_warning_desc: "To ensure your resume passes screening filters and presents high professional quality, please complete items marked as Pending below by clicking Edit.",
    step_8_status_completed: "Completed",
    step_8_status_pending: "Pending (*)",
    step_8_btn_edit: "Edit",
    step_8_btn_generate: "\u2728 GENERATE MY RESUME",
    step_8_guarantee: "Fast, professional intelligent generation \u2022 100% free with no mandatory signup.",
    step_8_pending_notice: "Complete all required fields above to enable generation.",
    // Wizard Bottom Nav
    wiz_back: "Back",
    wiz_next: "Next",
    wiz_req_warning: "Fill in all required fields (*) to proceed",
    wiz_generate_btn: "GENERATE MY RESUME",
    wiz_jump_review: "Go to Review (Step 8)",
    // Resume sections
    sec_summary: "Professional Summary",
    sec_experience: "Work Experience",
    sec_education: "Education",
    sec_skills: "Skills & Competencies",
    sec_courses: "Courses & Certifications",
    sec_contact: "Contact",
    // Template Labels
    tmpl_summary: "Professional Summary",
    tmpl_experience: "Work Experience",
    tmpl_skills: "Skills & Technologies",
    tmpl_skills_core: "Core Competencies",
    tmpl_skills_main: "Core Competencies",
    tmpl_tools: "Systems, Software & Tools",
    tmpl_tools_soft: "Tools & Software",
    tmpl_education: "Education",
    tmpl_education_short: "Education",
    tmpl_courses: "Courses & Certifications",
    tmpl_courses_short: "Courses",
    tmpl_certifications: "Certifications",
    tmpl_contact: "Contact",
    tmpl_contact_location: "Location:",
    tmpl_present: "Present",
    tmpl_status_completed: "Completed",
    tmpl_status_in_progress: "In progress",
    tmpl_status_interrupted: "Interrupted",
    tmpl_qualifications: "Qualifications Summary",
    tmpl_qualifications_synthesis: "Qualifications Summary",
    tmpl_profile: "Professional Profile",
    tmpl_trajectory: "Career History",
    tmpl_exec_skills: "Executive Skills & Tools",
    tmpl_exec_mgmt: "Management & Leadership",
    tmpl_exec_systems: "Systems & Technologies",
    tmpl_exec_cert: "Certifications & Professional Development",
    tmpl_skills_tech_alt: "Technical Skills & Competencies",
    tmpl_skills_label: "Skills:",
    tmpl_tools_label: "Tools & Technologies:",
    tmpl_default_bullet: "Executed operational duties and delivered strategic contributions in this role.",
    tmpl_default_bullet_modern: "Dedicated performance toward achieving operational and strategic milestones.",
    tmpl_default_bullet_exec: "Leadership of strategic initiatives and ongoing optimization of business processes.",
    tmpl_default_bullet_ats: "Execution of day-to-day operations and area corporate projects.",
    tmpl_default_bullet_corp: "Responsible for conducting technical procedures and delivering organizational goals.",
    step_7_err_paste_job: "Paste the job description in the field above to analyze.",
    step_7_err_fail: "Could not analyze the job right now. You can continue anyway.",
    field_photo_tip: "Tip: Use a clear photo with good lighting.",
    // Preview
    prev_download_pdf: "Download Resume PDF",
    prev_edit_info: "Edit Information",
    prev_choose_template: "Choose Visual Template",
    prev_model_modern: "Clean Modern",
    prev_model_classic: "Classic Executive",
    prev_model_sidebar: "Structured Sidebar",
    prev_btn_adapt: "Tailor to Job",
    prev_btn_edit: "Edit",
    prev_btn_regenerate: "Regenerate",
    prev_btn_save: "Save",
    prev_btn_saved: "Saved!",
    prev_btn_download: "DOWNLOAD RESUME AS PDF",
    prev_btn_downloading: "GENERATING VECTOR PDF ON SERVER...",
    prev_cloud_connected: "Connected as",
    prev_cloud_prompt_title: "Want to access this resume on other devices?",
    prev_cloud_prompt_desc: "Your resume is ready and saved in this browser. To back it up securely in the cloud, sign in for free with 1 click.",
    prev_cloud_btn: "Save to Cloud (Sign in)",
    prev_match_title: "Compatibility with this job",
    prev_match_badge: "Smart Feature \u2022 Job Analysis",
    prev_match_score_sub: "Profile match",
    prev_match_found_skills: "Matching Skills Found",
    prev_match_relevant_exp: "Relevant Experience",
    prev_match_improvements: "Areas for Improvement",
    prev_match_disclaimer: "* Compatibility analysis is an informational assessment and does not guarantee job hiring or interview calls.",
    // Preview extra & badges
    prev_ready_badge: "Resume Ready",
    prev_ai_optimized: "\u2022 AI-Optimized",
    prev_default_title: "Your Resume",
    prev_cloud_synced_badge: "Cloud Synchronized",
    prev_cloud_synced_desc: "This resume is saved in your cloud and protected for access on any device.",
    prev_cloud_synced_tag: "Saved in Cloud",
    prev_cloud_opt_badge: "Optional \u2022 Save to Cloud",
    prev_tmpl_style_title: "Choose Resume Style:",
    prev_tip_download: "Tip: High-definition vector A4 PDF will download directly without opening print dialog.",
    prev_print_pdf_hint: "Direct download: Vector PDF is generated on the server and saved directly to your device.",
    // Templates Ribbon
    tmpl_modern_badge: "Tech & Innovation",
    tmpl_modern_desc: "Clean, focused design with zero visual clutter. Standard for tech and modern businesses.",
    tmpl_executive_badge: "Leadership & Finance",
    tmpl_executive_desc: "Refined layout with serif typography and executive presence.",
    tmpl_ats_badge: "Online ATS & Screening",
    tmpl_ats_desc: "100% linear single-column layout, optimized for recruiter bots and HR portals.",
    tmpl_impact_badge: "Sales & Product",
    tmpl_impact_desc: "Structured high-contrast sidebar panel creating a memorable visual impression.",
    tmpl_corporate_badge: "Corporate & Finance",
    tmpl_corporate_desc: "Minimalist mathematical grid tailored for corporate enterprises and global institutions.",
    tmpl_minimalist_badge: "Entry Level & Internship",
    tmpl_minimalist_desc: "Light neutral sidebar layout, ideal for early-career professionals.",
    tmpl_creative_badge: "Design & Fashion",
    tmpl_creative_desc: "Colorful header band with expressive typography for creative profiles.",
    tmpl_elegant_badge: "Executive & Legal",
    tmpl_elegant_desc: "Serif layout with gold hairlines and discreet classic sophistication.",
    tmpl_tech_badge: "Engineering & Data",
    tmpl_tech_desc: "Vertical timeline that tells your career story chronologically.",
    tmpl_intl_badge: "Abroad & Multinationals",
    tmpl_intl_desc: "Clean international format, photo-free and 100% compatible with global ATS.",
    // Job Analysis panel
    job_analysis_badge: "Smart Feature \u2022 Job Analysis",
    job_analysis_title: "Compatibility with this job",
    job_analysis_match: "Profile match",
    job_analysis_skills_found: "Matching Skills Found",
    job_analysis_exp_relevant: "Relevant Experience",
    job_analysis_improvements: "Areas for Improvement",
    job_analysis_disclaimer: "* Compatibility analysis is an informational assessment and does not guarantee job hiring or interview calls.",
    tmpl_achievements: "Key Achievements & Impact",
    tmpl_skills_tools: "Skills & Technologies",
    // ATS Audit Bar
    ats_audit_title: "ATS Parsing Audit:",
    ats_audit_sections: "structured sections \u2022 Deterministic order \u2022 100% indexable text",
    ats_score_label: "Structural Score:",
    ats_verification_note: "(Technical parsing verification)",
    // Mobile bar
    prev_mobile_creating: "Creating PDF...",
    prev_mobile_download: "Download PDF",
    prev_mobile_edit: "Edit",
    // Landing Hero Simulation
    sim_header_brand: "CURR\xCA \u2022 Real-time Transformation",
    sim_header_ai_active: "Active AI",
    sim_detail_1: "John Doe \u2022 Operations Analyst",
    sim_detail_2: '"Handled department invoices and spreadsheets..."',
    sim_detail_3: '\u2192 "Managed tax routines and billing operations via Excel"',
    sim_detail_4: "Matching requirements: 92% match",
    sim_default_role: "Professional",
    // Landing Hero Saved Resume
    hero_saved_resume_title: "Saved Resume",
    hero_saved_cloud_tooltip: "Want to save to cloud? Optional free sign-in",
    // Navbar Tooltips
    nav_cloud_connected_title: "Account connected to cloud",
    nav_cloud_active_title: "Cloud active",
    nav_login_tooltip: "Sign in (Optional - to save to cloud)",
    nav_menu_aria: "Open menu",
    // Adapt Job Modal
    adapt_modal_title: "Tailor to Another Job",
    adapt_current_role: "Current resume role:",
    adapt_modal_desc: "Paste the description or requirements of the new job. CURR\xCA will re-analyze your real experiences and highlight the strongest matches for this opportunity.",
    adapt_job_label: "New job description",
    adapt_job_placeholder: "Paste the new job text here (requirements, responsibilities, desired skills)...",
    adapt_truth_guarantee: "Your real experiences and recorded data remain 100% truthful.",
    adapt_cancel: "Cancel",
    adapt_submitting: "Tailoring with AI...",
    adapt_submit: "Tailor Resume",
    // Loading Overlay
    loading_phase_1: "Analyzing your profile...",
    loading_phase_2: "Organizing your experiences...",
    loading_phase_3: "Tailoring your resume...",
    loading_phase_4: "Finalizing...",
    loading_brand_badge: "CURR\xCA \u2022 AI in Action",
    loading_description: "Refining your words, structuring chronology, and applying professional recruitment standards.",
    loading_moment: "Just a few moments..."
  },
  es: {
    "step_1_ph_linkedin": "ej: linkedin.com/in/tunombre",
    "step_1_ph_portfolio": "ej: mitrabajo.com / portafolio",
    "step_3_err_company": "Ingrese el nombre de la empresa.",
    "step_3_err_role": "Ingrese el cargo ocupado.",
    "step_3_pattern_hint": "Formato: mm/aaaa",
    "step_3_err_start_incomplete": "Fecha incompleta. Formato mm/aaaa (ej: 03/2020).",
    "step_3_err_start_empty": "Ingrese la fecha de inicio (mm/aaaa).",
    "step_3_err_end_incomplete": "Fecha incompleta. Formato mm/aaaa (ej: 11/2023).",
    "step_3_err_end_empty": 'Ingrese la fecha de t\xE9rmino (o marque abajo "Trabajo actualmente aqu\xED").',
    "step_3_err_end_before_start": "La fecha de fin no puede ser anterior a la fecha de inicio.",
    "step_3_err_activities": "Describa brevemente las actividades que realizaba.",
    "step_3_err_add_one": "Agregue al menos 1 experiencia profesional o marque la opci\xF3n de primer empleo arriba.",
    "step_4_err_add_one": "Agregue al menos 1 formaci\xF3n acad\xE9mica o nivel educativo.",
    "step_4_formation_prefix": "Formaci\xF3n #",
    "step_4_err_course": "Ingrese la carrera o nivel educativo (ej: Bachillerato).",
    "step_4_err_institution": "Ingrese el nombre de la instituci\xF3n educativa.",
    "step_4_err_start_year": "Ingrese un a\xF1o v\xE1lido de 4 d\xEDgitos (ej: 2018).",
    "step_4_err_end_year": "Ingrese un a\xF1o v\xE1lido de 4 d\xEDgitos (ej: 2022).",
    "step_4_err_end_before_start": "El a\xF1o de graduaci\xF3n no puede ser anterior al de inicio.",
    "step_5_err_select_one": "Seleccione al menos una competencia profesional o herramienta para su curr\xEDculum.",
    "step_6_err_fill_all": "Complete Nombre e Instituci\xF3n de cada curso o elimine los campos en blanco.",
    "step_6_course_prefix": "Curso #",
    "step_6_err_course_name": "Ingrese el nombre del curso.",
    "step_6_err_institution": "Ingrese la instituci\xF3n.",
    "step_6_err_year": "Ingrese un a\xF1o de 4 d\xEDgitos (ej: 2023).",
    "step_7_matched_skills": "\u2713 Competencias encontradas en su perfil:",
    "step_7_essential_keywords": "Palabras clave esenciales de la vacante:",
    "step_7_ai_tips": "\u{1F4A1} Consejos de la IA para este proceso de selecci\xF3n:",
    "step_8_warning_incomplete_title": "Atenci\xF3n: Campos obligatorios incompletos",
    "step_8_warning_incomplete_desc": "Para asegurar que su curr\xEDculum pase los filtros de selecci\xF3n y mantenga calidad profesional, complete los elementos marcados como Pendiente haciendo clic en Editar.",
    step_2_missing_error: "Indica el puesto que buscas (etapa 2).",
    step_3_no_exp_title: "En busca de mi primer empleo / Sin experiencia formal previa",
    step_3_no_exp_sub: "Marca esta opci\xF3n si eres estudiante, reci\xE9n graduado o est\xE1s iniciando en el mercado.",
    step_3_no_exp_alert_title: "Perfil Sin Experiencia Formal Seleccionado",
    step_3_no_exp_alert_desc: "\xA1Perfecto! CURR\xCA estructurar\xE1 tu curr\xEDculum enfoc\xE1ndose en tu Formaci\xF3n Acad\xE9mica, Habilidades y Cursos para resaltar tu potencial.",
    step_3_no_exp_revert: "Prefiero completar mis experiencias laborales",
    step_3_ai_tip: "No te preocupes por usar palabras rebuscadas. Escribe de forma sencilla lo que hac\xEDas a diario y nuestra IA lo transformar\xE1 en logros de alto impacto.",
    step_3_company_number: "Experiencia #",
    label_remove: "Eliminar",
    label_present: "Presente",
    btn_add: "A\xF1adir",
    step_3_company_label: "Nombre de la Empresa",
    step_3_company_placeholder: "ej: Distribuidora Central, Tienda Modelo, Despacho Jur\xEDdico",
    step_3_role_label: "Puesto / Cargo",
    step_3_role_placeholder: "ej: Asistente Administrativo, Auxiliar de Tienda",
    step_3_start_label: "Fecha de Inicio",
    step_3_end_label: "Fecha de Fin",
    step_3_pattern_mmyyyy: "Formato: mm/aaaa",
    step_3_current_job: "Trabajo actualmente en este puesto",
    step_3_activities_label: "Tareas y responsabilidades del d\xEDa a d\xEDa",
    step_3_activities_placeholder: "ej: Atenci\xF3n al cliente, control de inventarios, facturaci\xF3n y archivo de documentos...",
    step_3_results_label: "Logros, metas cumplidas o mejoras (Opcional)",
    step_3_results_placeholder: "ej: Reduje el tiempo de revisi\xF3n de facturas en un 30% estandarizando planillas...",
    step_3_error_company: "Indica el nombre de la empresa.",
    step_3_error_role: "Indica el puesto ocupado.",
    step_3_error_start_date: "Indica la fecha de inicio (mm/aaaa).",
    step_3_error_end_date: "Indica la fecha de fin (o marca puesto actual).",
    step_3_error_chronology: "La fecha de fin no puede ser anterior a la de inicio.",
    step_3_error_activities: "Describe brevemente las tareas desempe\xF1adas.",
    step_3_missing_error: "Completa tus experiencias o marca primer empleo.",
    step_4_course_label: "Estudios / Carrera / Titulaci\xF3n",
    step_4_course_ph: "ej: Bachillerato, Grado en Administraci\xF3n, T\xE9cnico en Log\xEDstica...",
    step_4_inst_label: "Instituci\xF3n Educativa / Escuela",
    step_4_inst_ph: "ej: Instituto Cervantes, Universidad Complutense...",
    step_4_start_year: "A\xF1o de Inicio",
    step_4_end_year: "A\xF1o de Graduaci\xF3n / Previsto",
    step_4_status_label: "Estado",
    step_4_formation_num: "Educaci\xF3n",
    step_4_error_min_detail: "A\xF1ade al menos un nivel educativo o formaci\xF3n acad\xE9mica.",
    step_4_error_course: "Indica el curso o titulaci\xF3n.",
    step_4_error_inst: "Indica el nombre del centro educativo.",
    step_4_error_start_year: "Indica un a\xF1o v\xE1lido de 4 d\xEDgitos (ej: 2018).",
    step_4_error_end_year: "Indica un a\xF1o v\xE1lido de 4 d\xEDgitos (ej: 2022).",
    step_4_error_chronology: "El a\xF1o de fin no puede ser anterior al de inicio.",
    step_4_missing_error: "Completa al menos 1 formaci\xF3n acad\xE9mica.",
    step_5_skills_title: "Habilidades profesionales (haz clic para marcar):",
    step_5_skills_custom_ph: "Escribir otra habilidad (ej: Redacci\xF3n, Negociaci\xF3n...)",
    step_5_tools_title: "Sistemas, software y herramientas:",
    step_5_tools_custom_ph: "Escribir otro software (ej: Canva, Trello, SAP...)",
    step_5_error_detail: "Selecciona al menos una habilidad profesional o herramienta para tu curr\xEDculum.",
    step_5_missing_error: "Selecciona al menos una habilidad o herramienta.",
    step_6_empty: "No has a\xF1adido cursos todav\xEDa.",
    step_6_add_first: "+ A\xF1adir mi primer curso",
    step_6_course_num: "Curso",
    step_6_name_label: "Nombre del Curso",
    step_6_name_ph: "ej: Excel Avanzado, Atenci\xF3n al Cliente y Ventas...",
    step_6_inst_label: "Instituci\xF3n",
    step_6_inst_ph: "ej: C\xE1mara de Comercio, Udemy, Coursera...",
    step_6_year_label: "A\xF1o",
    step_6_hours_label: "Horas lectivas (opcional)",
    step_6_hours_ph: "ej: 40 horas",
    step_6_error_detail: "Completa el nombre y la instituci\xF3n de cada curso a\xF1adido.",
    step_6_error_name: "Indica el nombre del curso.",
    step_6_error_inst: "Indica la instituci\xF3n educativa.",
    step_6_error_year: "Indica un a\xF1o con 4 d\xEDgitos (ej: 2023).",
    step_6_missing_error: "Revisa los cursos a\xF1adidos.",
    step_7_tag: "Diferencial Inteligente CURR\xCA",
    step_7_desc_label: "Descripci\xF3n o requisitos de la vacante (Copia y pega de LinkedIn, InfoJobs...)",
    step_7_desc_ph: "Pega aqu\xED el texto del anuncio de empleo (requisitos, funciones, competencias)...",
    step_7_ethics_text: "Compromiso \xC9tico: La IA NO inventa empleos ni aptitudes falsas. Solo reorganiza y resalta tu experiencia real con t\xE9rminos que valoran los reclutadores.",
    step_7_analyzing_btn: "Analizando requisitos con IA...",
    step_7_analyze_btn: "ANALIZAR VACANTE CON IA",
    step_7_analysis_completed: "An\xE1lisis de Vacante Completado",
    step_7_mapped_role: "Puesto Identificado",
    step_7_estimated_match: "Compatibilidad estimada",
    step_7_skills_found: "\u2713 Habilidades encontradas en tu perfil:",
    step_7_keywords_essential: "Palabras clave esenciales de la vacante:",
    step_7_ai_tips_title: "\u{1F4A1} Consejos de la IA para esta postulaci\xF3n:",
    step_8_tag: "\xA1Todo listo para la magia!",
    step_8_edit_btn: "Editar",
    step_8_btn_sub: "Generaci\xF3n inteligente y profesional con IA \u2022 100% gratis sin registro obligatorio.",
    step_8_btn_sub_disabled: "Completa todos los campos obligatorios arriba para habilitar la generaci\xF3n.",
    step_8_items_count: "elemento(s)",
    step_8_optional_provided: "Completado",
    field_linkedin_ph: "ej: linkedin.com/in/tuperfil",
    field_portfolio_ph: "ej: miweb.es / portafolio",
    // Slogan & Brand
    brand_slogan: "Consigue el empleo ideal.",
    footer_developed_by: "Sitio desarrollado por",
    footer_tagline: "Plataforma inteligente de curr\xEDculums con IA optimizada para reclutadores y sistemas ATS.",
    footer_terms: "T\xE9rminos y Privacidad",
    nav_create: "Crear curr\xEDculum",
    nav_how_it_works: "C\xF3mo funciona",
    nav_features: "Funciones",
    nav_saved_resume: "Ver Curr\xEDculum Guardado",
    nav_login_cloud: "Ingresar / Nube",
    nav_cta_create: "Crear Ahora",
    nav_mobile_create: "Crear",
    nav_header: "Navegaci\xF3n",
    nav_smart_features: "Recursos inteligentes",
    nav_cloud_active: "Nube Activa",
    nav_login_cloud_full: "Ingresar / Guardar en la Nube",
    nav_optional: "Opcional",
    // Modals Info
    how_title: "\xBFC\xF3mo funciona CURR\xCA?",
    how_subtitle: "Persigue el puesto adecuado en solo 3 sencillos pasos",
    how_step_1_title: "Completa tu informaci\xF3n",
    how_step_1_desc: "Introduce tus datos de contacto, educaci\xF3n y experiencias. No te preocupes por usar palabras dif\xEDciles: escribe con tus propias palabras c\xF3mo era tu rutina.",
    how_step_2_title: "Pega la vacante deseada (opcional)",
    how_step_2_desc: "La IA analiza los requisitos y las palabras clave de la oferta para destacar tus experiencias y cualificaciones reales m\xE1s compatibles.",
    how_step_3_title: "Recibe tu curr\xEDculum en PDF",
    how_step_3_desc: "\xA1Listo para enviar! En formato profesional aprobado por reclutadores y listo para imprimir o enviar por correo electr\xF3nico y WhatsApp.",
    how_info_box: "La IA de CURR\xCA nunca inventa experiencias falsas. Solo pone en valor tu historia real.",
    how_btn_start: "CREAR MI CURR\xCDCULUM AHORA",
    feat_modal_title: "Funcionalidades de CURR\xCA",
    feat_modal_subtitle: "Tecnolog\xEDa dise\xF1ada para tu crecimiento profesional",
    feat_item_1_title: "Refinamiento de Redacci\xF3n",
    feat_item_1_desc: "Convierte frases simples en vi\xF1etas de acci\xF3n de alto impacto reconocidas en los procesos de selecci\xF3n.",
    feat_item_2_title: "Lector de Vacantes Inteligente",
    feat_item_2_desc: "Extrae las competencias clave de la oferta y posiciona tu perfil con la m\xE1xima relevancia.",
    feat_item_3_title: "Formato ATS Limpio",
    feat_item_3_desc: "Formateado para superar sin errores los filtros de los sistemas de selecci\xF3n autom\xE1ticos (Gupy, Kenoby, LinkedIn).",
    feat_item_4_title: "Privacidad Total",
    feat_item_4_desc: "No solicitamos documentos confidenciales como CPF o DNI. Tus datos son exclusivamente tuyos.",
    feat_modal_btn_close: "Cerrar",
    // Hero
    hero_badge: "Inteligencia Artificial Hecha para Quienes Buscan Resultados",
    hero_title_p1: "Tu pr\xF3ximo empleo puede empezar con un ",
    hero_title_highlight: "curr\xEDculum mejor.",
    hero_subtitle: "Crea un curr\xEDculum profesional con inteligencia artificial y adapta tu perfil al puesto que deseas.",
    hero_cta_start: "CREAR MI CURR\xCDCULUM",
    hero_cta_how: "C\xD3MO FUNCIONA",
    hero_trust_free: "100% gratuito",
    hero_trust_no_signup: "Sin registro obligatorio",
    hero_trust_cloud: "Guardar en la Nube (Opcional)",
    hero_saved_session: "SESI\xD3N GUARDADA",
    hero_saved_ready: "Listo para descargar o editar",
    hero_saved_open: "Abrir Guardado",
    hero_saved_new: "Nuevo",
    // Simulation
    sim_title_1: "1. Informaci\xF3n b\xE1sica",
    sim_badge_1: "Llenado simple",
    sim_title_2: "2. Experiencia informal",
    sim_badge_2: "Tus propias palabras",
    sim_title_3: "3. Optimizaci\xF3n IA CURR\xCA",
    sim_badge_3: "Est\xE1ndar de reclutamiento",
    sim_title_4: "4. Alineaci\xF3n con la vacante",
    sim_badge_4: "\xA1Curr\xEDculum listo en PDF!",
    sim_no_fake: "Sin inventar experiencias",
    sim_try_now: "Probar ahora \u2192",
    // Features
    feat_1_title: "F\xE1cil como una charla",
    feat_1_desc: "Escribe tus tareas diarias con tus palabras. CURR\xCA las transforma en logros de alto impacto.",
    feat_2_title: "Alineado a la Oferta de Empleo",
    feat_2_desc: "Pega la descripci\xF3n del puesto y CURR\xCA resalta las habilidades y palabras clave que buscan los reclutadores.",
    feat_3_title: "\xC9tico y 100% Confiable",
    feat_3_desc: "Garant\xEDa estricta de integridad: la IA jam\xE1s inventa empresas ni cargos falsos. Solo potencia lo que realmente hiciste.",
    // Wizard Steps & Labels
    wiz_back_home: "Volver al inicio",
    wiz_prev_step: "Etapa anterior",
    wiz_fill_sample: "Llenar ejemplo",
    wiz_step_label: "Etapa",
    wiz_of_label: "de",
    step_1_title: "Datos Personales",
    step_2_title: "Objetivo Profesional",
    step_3_title: "Experiencia Laboral",
    step_4_title: "Educaci\xF3n",
    step_5_title: "Competencias y Herramientas",
    step_6_title: "Cursos y Certificaciones",
    step_7_title: "Alineaci\xF3n con la Oferta",
    step_8_title: "Revisi\xF3n y Generaci\xF3n",
    // Wizard Step 1
    step_1_heading: "Tus Datos de Contacto",
    step_1_sub: "Informaci\xF3n que el reclutador usar\xE1 para llamarte a la entrevista. No pedimos documentos confidenciales.",
    field_full_name: "Nombre Completo",
    field_name_placeholder: "ej: Mar\xEDa G\xF3mez Fern\xE1ndez",
    field_name_error: "Ingresa tu nombre y apellido (m\xEDnimo 3 caracteres).",
    label_required: "Obligatorio",
    label_optional: "Opcional",
    field_city_state: "Ciudad / Estado / Pa\xEDs",
    field_city_placeholder: "ej: Madrid, Espa\xF1a / Buenos Aires, Argentina",
    field_city_error: "Ingresa tu ciudad y pa\xEDs.",
    field_phone: "Tel\xE9fono / WhatsApp",
    field_phone_format: "Formato: 612 345 678 o +34 612 345 678",
    field_phone_placeholder: "612 345 678",
    field_phone_error: "Introduce un n\xFAmero v\xE1lido (ej: 612 345 678 o +34 612 345 678).",
    field_email: "Correo electr\xF3nico profesional",
    field_email_placeholder: "ej: tucorreo@gmail.com",
    field_email_error: "Ingresa un correo electr\xF3nico v\xE1lido.",
    field_linkedin: "LinkedIn (opcional)",
    field_portfolio: "Portafolio / Web (opcional)",
    field_photo_toggle: "Incluir foto en el curr\xEDculum",
    field_photo_change: "Cambiar foto",
    field_photo_upload: "Subir imagen",
    // Wizard Step 2
    step_2_heading: "\xBFQu\xE9 puesto est\xE1s buscando?",
    step_2_sub: "El objetivo profesional ayuda al reclutador a identificar de inmediato d\xF3nde deseas trabajar.",
    step_2_role_label: "Puesto Deseado",
    step_2_role_placeholder: "Ejemplo: Analista Administrativo",
    step_2_role_error: "Ingresa el puesto deseado para orientar tu curr\xEDculum (o elige una sugerencia abajo).",
    step_2_suggestions_label: "Sugerencias populares (clic para aplicar):",
    step_2_goal_label: "Objetivo profesional / Resumen personal (opcional)",
    step_2_goal_placeholder: "Ej: Busco una oportunidad como Asistente Administrativo para optimizar procesos, facturaci\xF3n y soporte al equipo con m\xE9todo y compromiso.",
    step_2_ai_tip: "Consejo de la IA: Si lo dejas en blanco o escribes con palabras sencillas, nuestra IA redactar\xE1 autom\xE1ticamente un resumen ejecutivo profesional y persuasivo.",
    // Wizard Step 3
    step_3_heading: "Vamos a detallar tu experiencia laboral",
    step_3_sub: "A\xF1ade tus empleos anteriores o actual. La IA los organizar\xE1 cronol\xF3gicamente.",
    step_3_add_btn: "+ A\xD1ADIR EXPERIENCIA",
    step_3_no_exp_btn: "No tengo experiencia formal (Primer Empleo)",
    step_3_no_exp_checkbox: "En busca de primer empleo / Sin experiencia laboral formal",
    step_3_no_exp_desc: "Marca esta opci\xF3n si eres estudiante, aprendiz o est\xE1s ingresando al mercado laboral ahora.",
    step_3_no_exp_active_title: "Perfil Sin Experiencia Formal Seleccionado",
    step_3_no_exp_active_desc: "\xA1Perfecto! CURR\xCA estructurar\xE1 tu curr\xEDculum destacando tu Educaci\xF3n, Cursos y Habilidades para resaltar tu potencial ante los reclutadores.",
    step_3_no_exp_switch_back: "Prefiero ingresar mis experiencias laborales",
    step_3_exp_num: "Experiencia",
    step_3_remove_exp: "Eliminar",
    step_3_field_company: "Empresa",
    step_3_field_company_placeholder: "ej: Distribuidora Central, Comercio Local, Oficina Central",
    step_3_field_role: "Cargo o Puesto",
    step_3_field_role_placeholder: "ej: Asistente Administrativo, Auxiliar de Tienda",
    step_3_field_start: "Inicio (Mes/A\xF1o)",
    step_3_field_end: "Fin (Mes/A\xF1o)",
    step_3_field_current: "Trabajo actualmente en este puesto",
    step_3_field_activities: "Actividades y responsabilidades diarias",
    step_3_field_activities_tip: "Consejo: Escribe con tus propias palabras lo que hac\xEDas. La IA lo pulir\xE1 con verbos de acci\xF3n y lenguaje ejecutivo.",
    step_3_field_results: "Logros, resultados o mejoras alcanzadas (Opcional)",
    step_3_field_results_tip: "Consejo: Menciona cifras o mejoras (ej: redujo el tiempo de tr\xE1mite en un 30%).",
    // Wizard Step 4
    step_4_heading: "Tu Formaci\xF3n Acad\xE9mica",
    step_4_sub: "Indica tu nivel de estudios: secundaria, t\xE9cnico, universitario o posgrado.",
    step_4_add_btn: "+ A\xD1ADIR FORMACI\xD3N",
    step_4_error_min: "A\xF1ade al menos 1 nivel educativo o titulaci\xF3n.",
    step_4_field_course: "Carrera / Nivel educativo",
    step_4_field_institution: "Instituci\xF3n Educativa",
    step_4_field_start_year: "A\xF1o de Inicio",
    step_4_field_end_year: "A\xF1o de Graduaci\xF3n / Previsto",
    step_4_field_status: "Estado",
    step_4_status_completed: "Completado",
    step_4_status_in_progress: "En curso",
    step_4_status_interrupted: "Interrumpido",
    // Wizard Step 5
    step_5_heading: "Competencias y Herramientas",
    step_5_sub: "Selecciona o escribe las habilidades y software que dominas para destacarlos. Al menos una es requerida.",
    step_5_error: "Selecciona al menos una habilidad profesional o herramienta para tu curr\xEDculum.",
    step_5_label: "Habilidades profesionales (clic para seleccionar):",
    step_5_tools_label: "Sistemas, software y herramientas:",
    step_5_custom_placeholder: "Escribir otra habilidad (ej: Negociaci\xF3n, Redacci\xF3n...)",
    step_5_tools_custom_placeholder: "Escribir otra herramienta (ej: Canva, Trello...)",
    step_5_add_btn: "A\xF1adir",
    // Wizard Step 6
    step_6_heading: "Cursos y Certificaciones Extras",
    step_6_sub: "Talleres, idiomas, cursos online o certificados t\xE9cnicos que fortalecen tu perfil.",
    step_6_add_btn: "+ A\xD1ADIR CURSO",
    step_6_empty_title: "Ning\xFAn curso a\xF1adido a\xFAn.",
    step_6_empty_sub: "Esta secci\xF3n es opcional, \xA1pero destaca tus ganas de superaci\xF3n y aprendizaje!",
    step_6_empty_btn: "+ A\xF1adir mi primer curso",
    step_6_field_name: "Nombre del Curso",
    step_6_field_institution: "Instituci\xF3n",
    step_6_field_year: "A\xF1o",
    step_6_field_hours: "Carga Horaria (opcional)",
    // Wizard Step 7
    step_7_heading: "\xBFQuieres alinear tu curr\xEDculum con la vacante?",
    step_7_sub: "Pega la descripci\xF3n de la vacante. Nuestra IA adaptar\xE1 las palabras clave para superar los filtros ATS.",
    step_7_badge: "Ventaja Inteligente CURR\xCA",
    step_7_textarea_label: "Descripci\xF3n o requisitos de la vacante (Copia y pega de LinkedIn, portales...)",
    step_7_ethics_title: "Compromiso \xC9tico y de Verdad:",
    step_7_ethics_desc: "La IA NO inventa datos ni competencias que no poseas. Solo reorganiza tu informaci\xF3n real con los t\xE9rminos que los reclutadores buscan.",
    step_7_btn_analyze: "ANALIZAR OFERTA CON IA",
    step_7_btn_analyzing: "Analizando requisitos con IA...",
    step_7_skip_hint: "(Si lo prefieres, puedes omitir este paso haciendo clic en Siguiente)",
    // Wizard Step 8
    step_8_badge: "\xA1Todo listo para la magia!",
    step_8_heading: "Revisa tu informaci\xF3n",
    step_8_sub: "Revisa cada secci\xF3n antes de generar tu curr\xEDculum optimizado con IA.",
    step_8_warning_title: "Atenci\xF3n: Campos obligatorios incompletos",
    step_8_warning_desc: "Para garantizar que tu curr\xEDculum supere los filtros de selecci\xF3n, completa las secciones marcadas como Pendiente abajo haciendo clic en Editar.",
    step_8_status_completed: "Completado",
    step_8_status_pending: "Pendiente (*)",
    step_8_btn_edit: "Editar",
    step_8_btn_generate: "\u2728 GENERAR MI CURR\xCDCULUM",
    step_8_guarantee: "Generaci\xF3n r\xE1pida, profesional e inteligente \u2022 100% gratis sin registro obligatorio.",
    step_8_pending_notice: "Completa todos los campos obligatorios arriba para habilitar la generaci\xF3n.",
    // Wizard Bottom Nav
    wiz_back: "Volver",
    wiz_next: "Siguiente",
    wiz_req_warning: "Completa los campos obligatorios (*) para continuar",
    wiz_generate_btn: "GENERAR MI CURR\xCDCULUM",
    wiz_jump_review: "Ir a Revisi\xF3n (Etapa 8)",
    // Resume sections
    sec_summary: "Resumen Profesional",
    sec_experience: "Experiencia Laboral",
    sec_education: "Educaci\xF3n",
    sec_skills: "Competencias y Habilidades",
    sec_courses: "Cursos y Certificaciones",
    sec_contact: "Contacto",
    // Template Labels
    tmpl_summary: "Perfil Profesional",
    tmpl_experience: "Experiencia Laboral",
    tmpl_skills: "Competencias & Tecnolog\xEDas",
    tmpl_skills_core: "Competencias Principales",
    tmpl_skills_main: "Competencias Principales",
    tmpl_tools: "Sistemas, Software & Herramientas",
    tmpl_tools_soft: "Herramientas & Software",
    tmpl_education: "Educaci\xF3n y Formaci\xF3n",
    tmpl_education_short: "Educaci\xF3n",
    tmpl_courses: "Cursos & Certificaciones",
    tmpl_courses_short: "Cursos",
    tmpl_certifications: "Certificaciones",
    tmpl_contact: "Contacto",
    tmpl_contact_location: "Ubicaci\xF3n:",
    tmpl_present: "Actual",
    tmpl_status_completed: "Completado",
    tmpl_status_in_progress: "En curso",
    tmpl_status_interrupted: "Interrumpido",
    tmpl_qualifications: "Resumen de Cualificaciones",
    tmpl_qualifications_synthesis: "S\xEDntesis de Cualificaciones",
    tmpl_profile: "Perfil Profesional",
    tmpl_trajectory: "Trayectoria Profesional",
    tmpl_exec_skills: "Competencias Directivas & Herramientas",
    tmpl_exec_mgmt: "Gesti\xF3n & Liderazgo",
    tmpl_exec_systems: "Sistemas & Tecnolog\xEDas",
    tmpl_exec_cert: "Certificaciones & Perfeccionamiento Profesional",
    tmpl_skills_tech_alt: "Competencias & Habilidades T\xE9cnicas",
    tmpl_skills_label: "Competencias:",
    tmpl_tools_label: "Herramientas & Tecnolog\xEDas:",
    tmpl_default_bullet: "Gesti\xF3n y ejecuci\xF3n de las responsabilidades operativas del cargo.",
    tmpl_default_bullet_modern: "Actuaci\xF3n orientada al cumplimiento de objetivos operativos y estrat\xE9gicos.",
    tmpl_default_bullet_exec: "Liderazgo de iniciativas estrat\xE9gicas y gesti\xF3n continua de procesos organizacionales.",
    tmpl_default_bullet_ats: "Ejecuci\xF3n de rutinas operativas y proyectos corporativos del \xE1rea.",
    tmpl_default_bullet_corp: "Responsable de la conducci\xF3n de procesos t\xE9cnicos y cumplimiento de metas corporativas.",
    step_7_err_paste_job: "Pegue la descripci\xF3n de la vacante en el campo de arriba para analizar.",
    step_7_err_fail: "No fue posible analizar la vacante ahora. Puede continuar de todos modos.",
    field_photo_tip: "Consejo: Utilice una foto clara y con buena iluminaci\xF3n.",
    // Preview
    prev_download_pdf: "Descargar Curr\xEDculum PDF",
    prev_edit_info: "Editar Informaci\xF3n",
    prev_choose_template: "Elegir Modelo Visual",
    prev_model_modern: "Moderno Limpio",
    prev_model_classic: "Ejecutivo Cl\xE1sico",
    prev_model_sidebar: "Lateral Estructurado",
    prev_btn_adapt: "Adaptar a la vacante",
    prev_btn_edit: "Editar",
    prev_btn_regenerate: "Regenerar",
    prev_btn_save: "Guardar",
    prev_btn_saved: "\xA1Guardado!",
    prev_btn_download: "DESCARGAR CURR\xCDCULUM EN PDF",
    prev_btn_downloading: "GENERANDO PDF VECTORIAL EN SERVIDOR...",
    prev_cloud_connected: "Conectado como",
    prev_cloud_prompt_title: "\xBFDeseas acceder a este curr\xEDculum en otros dispositivos?",
    prev_cloud_prompt_desc: "Tu curr\xEDculum ya est\xE1 guardado en este navegador. Para asegurarlo en la nube y no perderlo, inicia sesi\xF3n gratis con 1 clic.",
    prev_cloud_btn: "Guardar en la Nube (Acceder)",
    prev_match_title: "Compatibilidad con esta vacante",
    prev_match_badge: "Funci\xF3n Inteligente \u2022 An\xE1lisis de Vacante",
    prev_match_score_sub: "Afinidad con el perfil",
    prev_match_found_skills: "Competencias Encontradas",
    prev_match_relevant_exp: "Experiencias Relevantes",
    prev_match_improvements: "Puntos de Mejora",
    prev_match_disclaimer: "* El an\xE1lisis de compatibilidad es una orientaci\xF3n t\xE9cnica y no garantiza contrataci\xF3n.",
    // Preview extra & badges
    prev_ready_badge: "Curr\xEDculum Listo",
    prev_ai_optimized: "\u2022 Optimizado con IA",
    prev_default_title: "Tu Curr\xEDculum",
    prev_cloud_synced_badge: "Nube Sincronizada",
    prev_cloud_synced_desc: "Este curr\xEDculum est\xE1 guardado en tu nube y protegido para acceder desde cualquier dispositivo.",
    prev_cloud_synced_tag: "Guardado en la Nube",
    prev_cloud_opt_badge: "Opcional \u2022 Guardar en la Nube",
    prev_tmpl_style_title: "Elige el Estilo del Curr\xEDculum:",
    prev_tip_download: "Consejo: La descarga del PDF A4 en alta definici\xF3n comenzar\xE1 directamente sin abrir ventana de impresi\xF3n.",
    prev_print_pdf_hint: "Descarga directa: El PDF vectorial en alta definici\xF3n se generar\xE1 en el servidor y se guardar\xE1 directamente.",
    // Templates Ribbon
    tmpl_modern_badge: "Tecnolog\xEDa & Innovaci\xF3n",
    tmpl_modern_desc: "Dise\xF1o limpio y enfocado, sin saturaci\xF3n visual. Est\xE1ndar para startups y tecnol\xF3gicas.",
    tmpl_executive_badge: "Liderazgo & Finanzas",
    tmpl_executive_desc: "Diagramaci\xF3n noble con tipograf\xEDa serif y fuerte presencia ejecutiva.",
    tmpl_ats_badge: "Filtro Online & ATS",
    tmpl_ats_desc: "Columna \xFAnica 100% lineal, optimizada para robots de reclutamiento y portales.",
    tmpl_impact_badge: "Ventas & Producto",
    tmpl_impact_desc: "Panel lateral estructurado con alto contraste y presencia visual memorable.",
    tmpl_corporate_badge: "Bancos & Corporaciones",
    tmpl_corporate_desc: "Cuadr\xEDcula matem\xE1tica minimalista para grandes industrias y gobernanza global.",
    tmpl_minimalist_badge: "Primer Empleo & Pr\xE1cticas",
    tmpl_minimalist_desc: "Columna lateral ligera en tonos neutros, ideal para poca experiencia.",
    tmpl_creative_badge: "Dise\xF1o & Moda",
    tmpl_creative_desc: "Encabezado con franja de color y tipograf\xEDa expresiva para perfiles creativos.",
    tmpl_elegant_badge: "Direcci\xF3n & Jur\xEDdico",
    tmpl_elegant_desc: "Serif con filetes dorados, sofisticaci\xF3n cl\xE1sica discreta.",
    tmpl_tech_badge: "Ingenier\xEDa & Datos",
    tmpl_tech_desc: "L\xEDnea de tiempo vertical que cuenta tu carrera cronol\xF3gicamente.",
    tmpl_intl_badge: "Extranjero & Multinacionales",
    tmpl_intl_desc: "Formato internacional limpio, sin foto y 100% compatible con ATS globales.",
    // Job Analysis panel
    job_analysis_badge: "Funci\xF3n Inteligente \u2022 An\xE1lisis de Puesto",
    job_analysis_title: "Compatibilidad con este puesto",
    job_analysis_match: "Ajuste al perfil",
    job_analysis_skills_found: "Competencias Encontradas",
    job_analysis_exp_relevant: "Experiencias Relevantes",
    job_analysis_improvements: "Puntos de Mejora",
    job_analysis_disclaimer: "* El an\xE1lisis de compatibilidad es un diagn\xF3stico t\xE9cnico comparativo y no garantiza la contrataci\xF3n ni la aprobaci\xF3n en procesos de selecci\xF3n.",
    tmpl_achievements: "Logros Principales & Resultados",
    tmpl_skills_tools: "Competencias & Tecnolog\xEDas",
    // ATS Audit Bar
    ats_audit_title: "Auditor\xEDa de Lectura ATS:",
    ats_audit_sections: "secciones estructuradas \u2022 Orden determinista \u2022 100% texto indexable",
    ats_score_label: "Score Estructural:",
    ats_verification_note: "(Verificaci\xF3n t\xE9cnica de parsing)",
    // Mobile bar
    prev_mobile_creating: "Creando PDF...",
    prev_mobile_download: "Descargar PDF",
    prev_mobile_edit: "Editar",
    // Landing Hero Simulation
    sim_header_brand: "CURR\xCA \u2022 Transformaci\xF3n en Tiempo Real",
    sim_header_ai_active: "IA Activa",
    sim_detail_1: "Carlos L\xF3pez \u2022 Analista Administrativo",
    sim_detail_2: '"Cuidaba de las facturas y planillas en el sector..."',
    sim_detail_3: '\u2192 "Gestion\xF3 rutinas fiscales y control de facturaci\xF3n en Excel"',
    sim_detail_4: "Requisitos correspondientes: 92% de compatibilidad",
    sim_default_role: "Profesional",
    // Landing Hero Saved Resume
    hero_saved_resume_title: "Curr\xEDculum Guardado",
    hero_saved_cloud_tooltip: "\xBFDeseas guardarlo en la nube? Acceso gratis opcional",
    // Navbar Tooltips
    nav_cloud_connected_title: "Cuenta conectada en la nube",
    nav_cloud_active_title: "Nube activa",
    nav_login_tooltip: "Iniciar sesi\xF3n (Opcional - guardar en nube)",
    nav_menu_aria: "Abrir men\xFA",
    // Adapt Job Modal
    adapt_modal_title: "Adaptar para Otra Vacante",
    adapt_current_role: "Cargo actual del curr\xEDculum:",
    adapt_modal_desc: "Pega la descripci\xF3n o requisitos de la nueva vacante. CURR\xCA volver\xE1 a analizar tus experiencias reales y destacar\xE1 los puntos m\xE1s compatibles para esta oportunidad.",
    adapt_job_label: "Descripci\xF3n de la nueva vacante",
    adapt_job_placeholder: "Pega aqu\xED el texto de la nueva vacante (requisitos, responsabilidades, conocimientos)...",
    adapt_truth_guarantee: "Tus experiencias y datos registrados se mantendr\xE1n 100% ver\xEDdicos.",
    adapt_cancel: "Cancelar",
    adapt_submitting: "Adaptando con IA...",
    adapt_submit: "Adaptar Curr\xEDculum",
    // Loading Overlay
    loading_phase_1: "Analizando tu perfil...",
    loading_phase_2: "Organizando tus experiencias...",
    loading_phase_3: "Adaptando tu curr\xEDculum...",
    loading_phase_4: "Finalizando...",
    loading_brand_badge: "CURR\xCA \u2022 IA en Acci\xF3n",
    loading_description: "Refinando tus palabras, estructurando cronolog\xEDa y aplicando est\xE1ndares profesionales.",
    loading_moment: "Solo unos instantes..."
  },
  fr: {
    "step_1_ph_linkedin": "ex : linkedin.com/in/votrenom",
    "step_1_ph_portfolio": "ex : montravail.fr / portfolio",
    "step_3_err_company": "Indiquez le nom de l'entreprise.",
    "step_3_err_role": "Indiquez le poste occup\xE9.",
    "step_3_pattern_hint": "Format : mm/aaaa",
    "step_3_err_start_incomplete": "Date incompl\xE8te. Format mm/aaaa (ex : 03/2020).",
    "step_3_err_start_empty": "Indiquez la date de d\xE9but (mm/aaaa).",
    "step_3_err_end_incomplete": "Date incompl\xE8te. Format mm/aaaa (ex : 11/2023).",
    "step_3_err_end_empty": "Indiquez la date de fin (ou cochez \xAB J'occupe actuellement ce poste \xBB ci-dessous).",
    "step_3_err_end_before_start": "La date de fin ne peut pas \xEAtre ant\xE9rieure \xE0 la date de d\xE9but.",
    "step_3_err_activities": "D\xE9crivez bri\xE8vement les missions r\xE9alis\xE9es.",
    "step_3_err_add_one": "Ajoutez au moins 1 exp\xE9rience professionnelle ou cochez l'option premier emploi ci-dessus.",
    "step_4_err_add_one": "Ajoutez au moins 1 formation ou niveau d'\xE9tudes.",
    "step_4_formation_prefix": "Formation #",
    "step_4_err_course": "Indiquez le dipl\xF4me ou fili\xE8re (ex : Baccalaur\xE9at, Licence).",
    "step_4_err_institution": "Indiquez l'\xE9tablissement ou l'universit\xE9.",
    "step_4_err_start_year": "Indiquez une ann\xE9e valide \xE0 4 chiffres (ex : 2018).",
    "step_4_err_end_year": "Indiquez une ann\xE9e valide \xE0 4 chiffres (ex : 2022).",
    "step_4_err_end_before_start": "L'ann\xE9e d'obtention ne peut pas \xEAtre ant\xE9rieure \xE0 l'ann\xE9e de d\xE9but.",
    "step_5_err_select_one": "S\xE9lectionnez au moins une comp\xE9tence professionnelle ou un outil pour votre CV.",
    "step_6_err_fill_all": "Renseignez le nom et l'organisme pour chaque cours ou supprimez les entr\xE9es vides.",
    "step_6_course_prefix": "Formation compl\xE9mentaire #",
    "step_6_err_course_name": "Indiquez l'intitul\xE9 de la formation.",
    "step_6_err_institution": "Indiquez l'organisme formateur.",
    "step_6_err_year": "Indiquez une ann\xE9e \xE0 4 chiffres (ex : 2023).",
    "step_7_matched_skills": "\u2713 Comp\xE9tences d\xE9tect\xE9es dans votre profil :",
    "step_7_essential_keywords": "Mots-cl\xE9s essentiels de l'offre :",
    "step_7_ai_tips": "\u{1F4A1} Conseils de l'IA pour cette candidature :",
    "step_8_warning_incomplete_title": "Attention : Champs obligatoires incomplets",
    "step_8_warning_incomplete_desc": "Pour garantir que votre CV franchisse les filtres de recrutement ATS avec succ\xE8s, compl\xE9tez les sections marqu\xE9es En attente ci-dessous en cliquant sur Modifier.",
    step_2_missing_error: "Indiquez le poste recherch\xE9 (\xE9tape 2).",
    step_3_no_exp_title: "En recherche d\u2019un premier emploi / Sans exp\xE9rience professionnelle formelle",
    step_3_no_exp_sub: "Cochez cette option si vous \xEAtes \xE9tudiant, jeune dipl\xF4m\xE9 ou d\xE9marrez votre carri\xE8re.",
    step_3_no_exp_alert_title: "Profil Sans Exp\xE9rience Formelle S\xE9lectionn\xE9",
    step_3_no_exp_alert_desc: "Parfait ! CURR\xCA va structurer votre CV en mettant en valeur votre formation, vos comp\xE9tences pratiques et vos certifications.",
    step_3_no_exp_revert: "Je pr\xE9f\xE8re renseigner mes exp\xE9riences professionnelles",
    step_3_ai_tip: "R\xE9digez simplement vos t\xE2ches du quotidien avec vos propres mots. Notre IA les transformera en r\xE9alisations professionnelles percutantes.",
    step_3_company_number: "Exp\xE9rience #",
    label_remove: "Supprimer",
    label_present: "Pr\xE9sent",
    btn_add: "Ajouter",
    step_3_company_label: "Nom de l\u2019entreprise",
    step_3_company_placeholder: "ex : Logistique IDF, Boulangerie Centrale, Cabinet Martin",
    step_3_role_label: "Poste / Fonction",
    step_3_role_placeholder: "ex : Assistant Administratif, Vendeur Polyvalent",
    step_3_start_label: "Date de d\xE9but",
    step_3_end_label: "Date de fin",
    step_3_pattern_mmyyyy: "Format : mm/aaaa",
    step_3_current_job: "J\u2019occupe actuellement ce poste",
    step_3_activities_label: "Missions et responsabilit\xE9s quotidiennes",
    step_3_activities_placeholder: "ex : Accueil des clients, gestion des commandes, classement et suivi des factures...",
    step_3_results_label: "R\xE9sultats, r\xE9ussites ou am\xE9liorations (Optionnel)",
    step_3_results_placeholder: "ex : R\xE9duction de 30% du temps de traitement des dossiers gr\xE2ce \xE0 de nouveaux mod\xE8les...",
    step_3_error_company: "Indiquez le nom de l\u2019entreprise.",
    step_3_error_role: "Indiquez le poste occup\xE9.",
    step_3_error_start_date: "Indiquez la date de d\xE9but (mm/aaaa).",
    step_3_error_end_date: "Indiquez la date de fin (ou cochez poste actuel).",
    step_3_error_chronology: "La date de fin ne peut pas \xEAtre ant\xE9rieure \xE0 la date de d\xE9but.",
    step_3_error_activities: "D\xE9crivez bri\xE8vement les missions accomplies.",
    step_3_missing_error: "Renseignez vos exp\xE9riences ou s\xE9lectionnez premier emploi.",
    step_4_course_label: "Dipl\xF4me / Formation",
    step_4_course_ph: "ex : Baccalaur\xE9at, BTS Gestion PME, Licence \xC9conomie...",
    step_4_inst_label: "\xC9tablissement / \xC9cole / Universit\xE9",
    step_4_inst_ph: "ex : Lyc\xE9e Montaigne, Universit\xE9 Paris 1, AFPA...",
    step_4_start_year: "Ann\xE9e de d\xE9but",
    step_4_end_year: "Ann\xE9e d\u2019obtention / Pr\xE9vue",
    step_4_status_label: "Statut",
    step_4_formation_num: "Formation",
    step_4_error_min_detail: "Ajoutez au moins un niveau d\u2019\xE9tudes ou une formation.",
    step_4_error_course: "Indiquez le dipl\xF4me ou la formation.",
    step_4_error_inst: "Indiquez le nom de l\u2019\xE9tablissement.",
    step_4_error_start_year: "Indiquez une ann\xE9e valide \xE0 4 chiffres (ex : 2018).",
    step_4_error_end_year: "Indiquez une ann\xE9e valide \xE0 4 chiffres (ex : 2022).",
    step_4_error_chronology: "L\u2019ann\xE9e de fin ne peut pas pr\xE9c\xE9der l\u2019ann\xE9e de d\xE9but.",
    step_4_missing_error: "Renseignez au moins une formation.",
    step_5_skills_title: "Comp\xE9tences professionnelles (cliquez pour s\xE9lectionner) :",
    step_5_skills_custom_ph: "Ajouter une autre comp\xE9tence (ex : R\xE9daction, N\xE9gociation...)",
    step_5_tools_title: "Logiciels, syst\xE8mes et outils :",
    step_5_tools_custom_ph: "Ajouter un autre logiciel (ex : Canva, Trello, SAP...)",
    step_5_error_detail: "S\xE9lectionnez au moins une comp\xE9tence ou un outil pour votre CV.",
    step_5_missing_error: "S\xE9lectionnez au moins une comp\xE9tence ou un outil.",
    step_6_empty: "Aucune formation suppl\xE9mentaire ajout\xE9e.",
    step_6_add_first: "+ Ajouter ma premi\xE8re formation certifiante",
    step_6_course_num: "Formation",
    step_6_name_label: "Nom de la formation",
    step_6_name_ph: "ex : Perfectionnement Excel, Service Client & Vente...",
    step_6_inst_label: "Organisme",
    step_6_inst_ph: "ex : CCI Paris, Udemy, Coursera, AFPA...",
    step_6_year_label: "Ann\xE9e",
    step_6_hours_label: "Volume horaire (optionnel)",
    step_6_hours_ph: "ex : 35 heures",
    step_6_error_detail: "Renseignez l\u2019intitul\xE9 et l\u2019organisme pour chaque formation.",
    step_6_error_name: "Indiquez le nom de la formation.",
    step_6_error_inst: "Indiquez l\u2019organisme de formation.",
    step_6_error_year: "Indiquez une ann\xE9e \xE0 4 chiffres (ex : 2023).",
    step_6_missing_error: "V\xE9rifiez les formations ajout\xE9es.",
    step_7_tag: "Diff\xE9renciateur Intelligent CURR\xCA",
    step_7_desc_label: "Description ou crit\xE8res de l\u2019offre d\u2019emploi (LinkedIn, France Travail, Indeed...)",
    step_7_desc_ph: "Collez ici le texte de l\u2019offre (missions, comp\xE9tences recherch\xE9es, profil)...",
    step_7_ethics_text: "Engagement \xE9thique : L\u2019IA N\u2019INVENTE PAS de fausses comp\xE9tences ni d\u2019emplois fictifs. Elle optimise et valorise votre profil authentique.",
    step_7_analyzing_btn: "Analyse de l\u2019offre avec l\u2019IA...",
    step_7_analyze_btn: "ANALYSER L\u2019OFFRE AVEC L\u2019IA",
    step_7_analysis_completed: "Analyse de l\u2019offre termin\xE9e",
    step_7_mapped_role: "Poste cibl\xE9 identifi\xE9",
    step_7_estimated_match: "Compatibilit\xE9 estim\xE9e",
    step_7_skills_found: "\u2713 Comp\xE9tences d\xE9tect\xE9es dans votre profil :",
    step_7_keywords_essential: "Mots-cl\xE9s cl\xE9s de l\u2019offre :",
    step_7_ai_tips_title: "\u{1F4A1} Conseils de l\u2019IA pour cette candidature :",
    step_8_tag: "Tout est pr\xEAt pour la g\xE9n\xE9ration !",
    step_8_edit_btn: "Modifier",
    step_8_btn_sub: "G\xE9n\xE9ration rapide et professionnelle par IA \u2022 100% gratuit sans inscription obligatoire.",
    step_8_btn_sub_disabled: "Remplissez tous les champs obligatoires ci-dessus pour d\xE9bloquer la g\xE9n\xE9ration.",
    step_8_items_count: "\xE9l\xE9ment(s)",
    step_8_optional_provided: "Renseign\xE9",
    field_linkedin_ph: "ex: linkedin.com/in/votreprofil",
    field_portfolio_ph: "ex: monsite.fr / portfolio",
    // Slogan & Brand
    brand_slogan: "D\xE9crochez le bon poste.",
    footer_developed_by: "Site d\xE9velopp\xE9 par",
    footer_tagline: "Plateforme intelligente de CV avec IA optimis\xE9e pour les recruteurs et les syst\xE8mes ATS.",
    footer_terms: "Conditions et Confidentialit\xE9",
    nav_create: "Cr\xE9er un CV",
    nav_how_it_works: "Comment \xE7a marche",
    nav_features: "Fonctionnalit\xE9s",
    nav_saved_resume: "Voir CV Enregistr\xE9",
    nav_login_cloud: "Connexion / Cloud",
    nav_cta_create: "Cr\xE9er Maintenant",
    nav_mobile_create: "Cr\xE9er",
    nav_header: "Navigation",
    nav_smart_features: "Fonctionnalit\xE9s intelligentes",
    nav_cloud_active: "Cloud Actif",
    nav_login_cloud_full: "Connexion / Sauvegarder dans le Cloud",
    nav_optional: "Optionnel",
    // Modals Info
    how_title: "Comment fonctionne CURR\xCA ?",
    how_subtitle: "D\xE9crochez le bon poste en seulement 3 \xE9tapes simples",
    how_step_1_title: "Remplissez vos informations",
    how_step_1_desc: "Saisissez vos coordonn\xE9es, vos formations et vos exp\xE9riences. Ne vous souciez pas d'utiliser des mots compliqu\xE9s \u2014 d\xE9crivez simplement votre quotidien avec vos propres mots.",
    how_step_2_title: "Collez l'offre d'emploi souhait\xE9e (facultatif)",
    how_step_2_desc: "L'IA analyse les exigences et les mots-cl\xE9s de l'offre pour mettre en valeur vos exp\xE9riences et qualifications r\xE9elles les plus adapt\xE9es.",
    how_step_3_title: "Recevez votre CV en PDF",
    how_step_3_desc: "Pr\xEAt \xE0 \xEAtre envoy\xE9 ! Dans un format professionnel approuv\xE9 par les recruteurs et pr\xEAt \xE0 \xEAtre imprim\xE9 ou envoy\xE9 par e-mail et WhatsApp.",
    how_info_box: "L'IA de CURR\xCA n'invente jamais de fausses exp\xE9riences. Elle valorise uniquement votre parcours r\xE9el.",
    how_btn_start: "CR\xC9ER MON CV MAINTENANT",
    feat_modal_title: "Fonctionnalit\xE9s de CURR\xCA",
    feat_modal_subtitle: "La technologie con\xE7ue pour votre \xE9volution professionnelle",
    feat_item_1_title: "Optimisation de la R\xE9daction",
    feat_item_1_desc: "Transforme des phrases simples en formules d'action \xE0 fort impact reconnues lors des s\xE9lections.",
    feat_item_2_title: "Lecteur d'Offre Intelligent",
    feat_item_2_desc: "Extrait les comp\xE9tences cl\xE9s de l'offre pour positionner votre profil avec un maximum de pertinence.",
    feat_item_3_title: "Format ATS \xC9pur\xE9",
    feat_item_3_desc: "Format\xE9 pour franchir sans encombre les syst\xE8mes de tri automatique des candidatures (Gupy, Kenoby, LinkedIn).",
    feat_item_4_title: "Confidentialit\xE9 Totale",
    feat_item_4_desc: "Nous ne demandons aucun document confidentiel (num\xE9ro de s\xE9curit\xE9 sociale, carte d'identit\xE9). Vos donn\xE9es vous appartiennent.",
    feat_modal_btn_close: "Fermer",
    // Hero
    hero_badge: "Intelligence Artificielle Con\xE7ue pour Ceux Qui Veulent des R\xE9sultats",
    hero_title_p1: "Votre prochain emploi commence par un ",
    hero_title_highlight: "meilleur CV.",
    hero_subtitle: "Cr\xE9ez un CV professionnel avec l\u2019intelligence artificielle et adaptez votre profil au poste vis\xE9.",
    hero_cta_start: "CR\xC9ER MON CV",
    hero_cta_how: "COMMENT \xC7A MARCHE",
    hero_trust_free: "100% gratuit",
    hero_trust_no_signup: "Sans inscription obligatoire",
    hero_trust_cloud: "Sauvegarde Cloud (Optionnel)",
    hero_saved_session: "SESSION ENREGISTR\xC9E",
    hero_saved_ready: "Pr\xEAt pour t\xE9l\xE9chargement ou \xE9dition",
    hero_saved_open: "Ouvrir Enregistr\xE9",
    hero_saved_new: "Nouveau",
    // Simulation
    sim_title_1: "1. Informations de base",
    sim_badge_1: "Saisie simple",
    sim_title_2: "2. Exp\xE9rience informelle",
    sim_badge_2: "Vos propres mots",
    sim_title_3: "3. Optimisation IA CURR\xCA",
    sim_badge_3: "Standard des recruteurs",
    sim_title_4: "4. Alignement avec le poste",
    sim_badge_4: "CV pr\xEAt en PDF !",
    sim_no_fake: "Aucune exp\xE9rience invent\xE9e",
    sim_try_now: "Essayer maintenant \u2192",
    // Features
    feat_1_title: "Simple comme un \xE9change",
    feat_1_desc: "D\xE9crivez vos t\xE2ches avec vos propres mots. CURR\xCA les convertit en r\xE9alisations professionnelles \xE0 fort impact.",
    feat_2_title: "Align\xE9 sur l\u2019Offre d\u2019Emploi",
    feat_2_desc: "Collez la fiche de poste et CURR\xCA met en avant les comp\xE9tences cl\xE9s recherch\xE9es par les recruteurs.",
    feat_3_title: "\xC9thique et 100% Fiable",
    feat_3_desc: "Garantie absolue d\u2019int\xE9grit\xE9 : l\u2019IA n\u2019invente jamais d\u2019entreprises ou de postes. Elle valorise votre parcours r\xE9el.",
    // Wizard Steps & Labels
    wiz_back_home: "Retour \xE0 l\u2019accueil",
    wiz_prev_step: "\xC9tape pr\xE9c\xE9dente",
    wiz_fill_sample: "Remplir avec un exemple",
    wiz_step_label: "\xC9tape",
    wiz_of_label: "sur",
    step_1_title: "Coordonn\xE9es",
    step_2_title: "Objectif Professionnel",
    step_3_title: "Exp\xE9rience Professionnelle",
    step_4_title: "Formation Acad\xE9mique",
    step_5_title: "Comp\xE9tences & Outils",
    step_6_title: "Formations & Certifications",
    step_7_title: "Alignement avec l\u2019Offre",
    step_8_title: "R\xE9vision et G\xE9n\xE9ration",
    // Wizard Step 1
    step_1_heading: "Vos Coordonn\xE9es",
    step_1_sub: "Informations que le recruteur utilisera pour vous contacter en entretien. Nous ne demandons aucun document confidentiel.",
    field_full_name: "Nom Complet",
    field_name_placeholder: "ex: Marie Dupont",
    field_name_error: "Indiquez votre nom et pr\xE9nom (minimum 3 caract\xE8res).",
    label_required: "Obligatoire",
    label_optional: "Facultatif",
    field_city_state: "Ville / R\xE9gion / Pays",
    field_city_placeholder: "ex: Paris, France / Lyon",
    field_city_error: "Indiquez votre ville et r\xE9gion/pays.",
    field_phone: "T\xE9l\xE9phone / WhatsApp",
    field_phone_format: "Format : 06 12 34 56 78 ou +33 6 12 34 56 78",
    field_phone_placeholder: "06 12 34 56 78",
    field_phone_error: "Indiquez un num\xE9ro valide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78).",
    field_email: "E-mail professionnel",
    field_email_placeholder: "ex: votreemail@gmail.com",
    field_email_error: "Indiquez une adresse e-mail valide.",
    field_linkedin: "LinkedIn (facultatif)",
    field_portfolio: "Portfolio / Site (facultatif)",
    field_photo_toggle: "Ajouter une photo sur le CV",
    field_photo_change: "Changer la photo",
    field_photo_upload: "T\xE9l\xE9charger une photo",
    // Wizard Step 2
    step_2_heading: "Quel poste recherchez-vous ?",
    step_2_sub: "Votre objectif professionnel permet au recruteur de comprendre imm\xE9diatement o\xF9 vous souhaitez \xE9voluer.",
    step_2_role_label: "Poste Vis\xE9",
    step_2_role_placeholder: "Exemple : Assistant Administratif",
    step_2_role_error: "Indiquez le poste vis\xE9 pour cibler votre CV (ou choisissez une suggestion ci-dessous).",
    step_2_suggestions_label: "Suggestions populaires (cliquez pour appliquer) :",
    step_2_goal_label: "Objectif professionnel / R\xE9sum\xE9 personnel (optionnel)",
    step_2_goal_placeholder: "Ex : Recherche un poste d'Assistant Administratif pour organiser la gestion documentaire, la facturation et soutenir les \xE9quipes avec rigueur et dynamisme.",
    step_2_ai_tip: "Conseil IA : Si vous laissez vide ou \xE9crivez avec des mots simples, notre IA r\xE9digera automatiquement un r\xE9sum\xE9 professionnel percutant et \xE9l\xE9gant pour vous.",
    // Wizard Step 3
    step_3_heading: "D\xE9taillons votre exp\xE9rience professionnelle",
    step_3_sub: "Ajoutez vos pr\xE9c\xE9dents postes ou votre emploi actuel. L'IA les organisera chronologiquement.",
    step_3_add_btn: "+ AJOUTER UNE EXP\xC9RIENCE",
    step_3_no_exp_btn: "Je n\u2019ai pas d\u2019exp\xE9rience formelle (Premier Emploi)",
    step_3_no_exp_checkbox: "En recherche d\u2019un premier emploi / Sans exp\xE9rience formelle",
    step_3_no_exp_desc: "Cochez cette option si vous \xEAtes \xE9tudiant, jeune dipl\xF4m\xE9 ou d\xE9marrez sur le march\xE9 du travail.",
    step_3_no_exp_active_title: "Profil Sans Exp\xE9rience Formelle S\xE9lectionn\xE9",
    step_3_no_exp_active_desc: "Parfait ! CURR\xCA mettra en valeur votre Formation, vos Certifications et vos Comp\xE9tences Pratiques pour valoriser votre potentiel aupr\xE8s des recruteurs.",
    step_3_no_exp_switch_back: "Je pr\xE9f\xE8re renseigner mes exp\xE9riences professionnelles",
    step_3_exp_num: "Exp\xE9rience",
    step_3_remove_exp: "Supprimer",
    step_3_field_company: "Entreprise",
    step_3_field_company_placeholder: "ex : Logistique Express, Soci\xE9t\xE9 Martin, Cabinet Conseil",
    step_3_field_role: "Poste occup\xE9",
    step_3_field_role_placeholder: "ex : Assistant Administratif, Agent d'accueil",
    step_3_field_start: "D\xE9but (Mois/Ann\xE9e)",
    step_3_field_end: "Fin (Mois/Ann\xE9e)",
    step_3_field_current: "J'occupe actuellement ce poste",
    step_3_field_activities: "Missions et responsabilit\xE9s quotidiennes",
    step_3_field_activities_tip: "Astuce : D\xE9crivez vos t\xE2ches avec vos propres mots. L'IA les formulera avec des verbes d'action \xE0 fort impact.",
    step_3_field_results: "R\xE9sultats cl\xE9s, r\xE9ussites ou am\xE9liorations (Optionnel)",
    step_3_field_results_tip: "Astuce : Mentionnez des chiffres ou objectifs atteints (ex : gain de temps de 30% sur le traitement des dossiers).",
    // Wizard Step 4
    step_4_heading: "Votre Formation Acad\xE9mique",
    step_4_sub: "Indiquez votre niveau d\u2019\xE9tudes : bac, bts, licence, master ou dipl\xF4me professionnel.",
    step_4_add_btn: "+ AJOUTER UNE FORMATION",
    step_4_error_min: "Veuillez ajouter au moins 1 niveau d'\xE9tudes ou dipl\xF4me.",
    step_4_field_course: "Dipl\xF4me / Fili\xE8re",
    step_4_field_institution: "\xC9tablissement d'enseignement",
    step_4_field_start_year: "Ann\xE9e de D\xE9but",
    step_4_field_end_year: "Ann\xE9e d'Obtention / Pr\xE9vue",
    step_4_field_status: "Statut",
    step_4_status_completed: "Termin\xE9",
    step_4_status_in_progress: "En cours",
    step_4_status_interrupted: "Interrompu",
    // Wizard Step 5
    step_5_heading: "Comp\xE9tences et Outils",
    step_5_sub: "S\xE9lectionnez ou \xE9crivez les comp\xE9tences et logiciels que vous ma\xEEtrisez pour les mettre en valeur. Au moins une est requise.",
    step_5_error: "S\xE9lectionnez au moins une comp\xE9tence professionnelle ou un outil pour votre CV.",
    step_5_label: "Comp\xE9tences professionnelles (cliquez pour s\xE9lectionner) :",
    step_5_tools_label: "Logiciels, progiciels et outils :",
    step_5_custom_placeholder: "Saisir une autre comp\xE9tence (ex : N\xE9gociation, Analyse...)",
    step_5_tools_custom_placeholder: "Saisir un autre outil (ex : Canva, Trello...)",
    step_5_add_btn: "Ajouter",
    // Wizard Step 6
    step_6_heading: "Formations & Certifications Compl\xE9mentaires",
    step_6_sub: "Ateliers, langues, cours en ligne ou certifications techniques qui enrichissent votre profil.",
    step_6_add_btn: "+ AJOUTER UNE FORMATION",
    step_6_empty_title: "Aucune formation ajout\xE9e pour l\u2019instant.",
    step_6_empty_sub: "Cette section est facultative, mais t\xE9moigne de votre curiosit\xE9 et soif d\u2019apprendre !",
    step_6_empty_btn: "+ Ajouter ma premi\xE8re formation",
    step_6_field_name: "Intitul\xE9 de la Formation",
    step_6_field_institution: "Organisme / \xC9cole",
    step_6_field_year: "Ann\xE9e",
    step_6_field_hours: "Dur\xE9e / Heures (optionnel)",
    // Wizard Step 7
    step_7_heading: "Alignez votre CV directement avec l\u2019offre d\u2019emploi",
    step_7_sub: "Collez la description du poste. Notre IA analysera les exigences pour mettre en avant vos atouts et mots-cl\xE9s les plus pertinents.",
    step_7_badge: "Atout Intelligent CURR\xCA",
    step_7_textarea_label: "Description ou exigences du poste (Copiez et collez depuis LinkedIn, Indeed, France Travail...)",
    step_7_ethics_title: "Engagement \xC9thique et Transparence :",
    step_7_ethics_desc: "L'IA n'invente AUCUNE exp\xE9rience ni comp\xE9tence. Elle valorise fid\xE8lement votre parcours r\xE9el avec les termes recherch\xE9s par les recruteurs.",
    step_7_btn_analyze: "ANALYSER L'OFFRE AVEC L'IA",
    step_7_btn_analyzing: "Analyse des exigences par l'IA...",
    step_7_skip_hint: "(Vous pouvez \xE9galement passer cette \xE9tape en cliquant sur Suivant)",
    // Wizard Step 8
    step_8_badge: "Tout est pr\xEAt pour la g\xE9n\xE9ration !",
    step_8_heading: "V\xE9rifiez vos informations",
    step_8_sub: "Passez en revue chaque section ci-dessous avant de g\xE9n\xE9rer votre CV optimis\xE9 par l\u2019IA.",
    step_8_warning_title: "Attention : Champs obligatoires incomplets",
    step_8_warning_desc: "Pour garantir la r\xE9ussite de votre candidature aupr\xE8s des recruteurs, compl\xE9tez les sections marqu\xE9es En attente ci-dessous en cliquant sur Modifier.",
    step_8_status_completed: "Renseign\xE9",
    step_8_status_pending: "En attente (*)",
    step_8_btn_edit: "Modifier",
    step_8_btn_generate: "\u2728 G\xC9N\xC9RER MON CV",
    step_8_guarantee: "G\xE9n\xE9ration rapide, professionnelle et intelligente \u2022 100% gratuite sans inscription obligatoire.",
    step_8_pending_notice: "Compl\xE9tez tous les champs obligatoires ci-dessus pour activer la g\xE9n\xE9ration.",
    // Wizard Bottom Nav
    wiz_back: "Retour",
    wiz_next: "Suivant",
    wiz_req_warning: "Remplissez les champs obligatoires (*) pour continuer",
    wiz_generate_btn: "G\xC9N\xC9RER MON CV",
    wiz_jump_review: "Aller \xE0 la R\xE9vision (\xC9tape 8)",
    // Resume sections
    sec_summary: "R\xE9sum\xE9 Professionnel",
    sec_experience: "Exp\xE9rience Professionnelle",
    sec_education: "Formation Acad\xE9mique",
    sec_skills: "Comp\xE9tences",
    sec_courses: "Formations & Certifications",
    sec_contact: "Contact",
    // Template Labels
    tmpl_summary: "R\xE9sum\xE9 Professionnel",
    tmpl_experience: "Exp\xE9rience Professionnelle",
    tmpl_skills: "Comp\xE9tences & Outils",
    tmpl_skills_core: "Comp\xE9tences Cl\xE9s",
    tmpl_skills_main: "Comp\xE9tences Principales",
    tmpl_tools: "Logiciels & Outils Ma\xEEtris\xE9s",
    tmpl_tools_soft: "Outils & Logiciels",
    tmpl_education: "Formation & Dipl\xF4mes",
    tmpl_education_short: "Formation",
    tmpl_courses: "Formations & Certifications",
    tmpl_courses_short: "Formations",
    tmpl_certifications: "Certifications",
    tmpl_contact: "Contact",
    tmpl_contact_location: "Localisation :",
    tmpl_present: "Pr\xE9sent",
    tmpl_status_completed: "Termin\xE9",
    tmpl_status_in_progress: "En cours",
    tmpl_status_interrupted: "Interrompu",
    tmpl_qualifications: "R\xE9sum\xE9 de Qualifications",
    tmpl_qualifications_synthesis: "Synth\xE8se de Qualifications",
    tmpl_profile: "Profil Professionnel",
    tmpl_trajectory: "Parcours Professionnel",
    tmpl_exec_skills: "Comp\xE9tences Dirigeantes & Outils",
    tmpl_exec_mgmt: "Management & Leadership",
    tmpl_exec_systems: "Syst\xE8mes & Technologies",
    tmpl_exec_cert: "Certifications & Perfectionnement Professionnel",
    tmpl_skills_tech_alt: "Comp\xE9tences & Aptitudes Techniques",
    tmpl_skills_label: "Comp\xE9tences :",
    tmpl_tools_label: "Outils & Technologies :",
    tmpl_default_bullet: "Prise en charge des missions op\xE9rationnelles et contribution aux objectifs du service.",
    tmpl_default_bullet_modern: "Action orient\xE9e vers l'atteinte des objectifs op\xE9rationnels et strat\xE9giques.",
    tmpl_default_bullet_exec: "Pilotage d'initiatives strat\xE9giques et gestion continue des processus d'organisation.",
    tmpl_default_bullet_ats: "Ex\xE9cution des op\xE9rations quotidiennes et conduite des projets d'entreprise du secteur.",
    tmpl_default_bullet_corp: "Responsable de la conduite des processus techniques et du respect des exigences de l'entreprise.",
    step_7_err_paste_job: "Collez la description de l'offre dans le champ ci-dessus pour analyser.",
    step_7_err_fail: "Impossible d'analyser l'offre pour l'instant. Vous pouvez continuer quand m\xEAme.",
    field_photo_tip: "Conseil : Utilisez une photo nette avec un bon \xE9clairage.",
    // Preview
    prev_download_pdf: "T\xE9l\xE9charger le CV en PDF",
    prev_edit_info: "Modifier les Informations",
    prev_choose_template: "Choisir le Mod\xE8le",
    prev_model_modern: "Moderne \xC9pur\xE9",
    prev_model_classic: "Ex\xE9cutif Classique",
    prev_model_sidebar: "Lat\xE9ral Structur\xE9",
    prev_btn_adapt: "Adapter \xE0 l'offre",
    prev_btn_edit: "Modifier",
    prev_btn_regenerate: "R\xE9g\xE9n\xE9rer",
    prev_btn_save: "Enregistrer",
    prev_btn_saved: "Enregistr\xE9 !",
    prev_btn_download: "T\xC9L\xC9CHARGER LE CV EN PDF",
    prev_btn_downloading: "G\xC9N\xC9RATION DU PDF VECTORIEL SUR LE SERVEUR...",
    prev_cloud_connected: "Connect\xE9 en tant que",
    prev_cloud_prompt_title: "Souhaitez-vous acc\xE9der \xE0 ce CV sur d'autres appareils ?",
    prev_cloud_prompt_desc: "Votre CV est pr\xEAt et sauvegard\xE9 dans ce navigateur. Pour le conserver en toute s\xE9curit\xE9 dans le cloud, connectez-vous gratuitement en 1 clic.",
    prev_cloud_btn: "Sauvegarder dans le Cloud (Connexion)",
    prev_match_title: "Ad\xE9quation avec ce poste",
    prev_match_badge: "Fonction Intelligente \u2022 Analyse de l'Offre",
    prev_match_score_sub: "Ad\xE9quation au profil",
    prev_match_found_skills: "Comp\xE9tences Identifi\xE9es",
    prev_match_relevant_exp: "Exp\xE9riences Pertinentes",
    prev_match_improvements: "Pistes d'Am\xE9lioration",
    prev_match_disclaimer: "* L'analyse d'ad\xE9quation est une \xE9valuation technique et ne garantit pas l'embauche.",
    // Preview extra & badges
    prev_ready_badge: "CV Pr\xEAt",
    prev_ai_optimized: "\u2022 Optimis\xE9 par IA",
    prev_default_title: "Votre CV",
    prev_cloud_synced_badge: "Cloud Synchronis\xE9",
    prev_cloud_synced_desc: "Ce CV est sauvegard\xE9 dans votre cloud et prot\xE9g\xE9 pour un acc\xE8s sur tout appareil.",
    prev_cloud_synced_tag: "Sauvegard\xE9 dans le Cloud",
    prev_cloud_opt_badge: "Optionnel \u2022 Sauvegarder dans le Cloud",
    prev_tmpl_style_title: "Choisissez le Style du CV :",
    prev_tip_download: "Conseil : Le t\xE9l\xE9chargement du PDF A4 d\xE9butera directement sans ouvrir de fen\xEAtre d'impression.",
    prev_print_pdf_hint: "T\xE9l\xE9chargement direct : Le PDF vectoriel haute d\xE9finition sera g\xE9n\xE9r\xE9 sur le serveur et t\xE9l\xE9charg\xE9 directement.",
    // Templates Ribbon
    tmpl_modern_badge: "Tech & Innovation",
    tmpl_modern_desc: "Design \xE9pur\xE9 et percutant, sans surcharge visuelle. Id\xE9al pour tech et startups.",
    tmpl_executive_badge: "Direction & Finance",
    tmpl_executive_desc: "Mise en page noble avec typographie avec empattements et autorit\xE9 ex\xE9cutive.",
    tmpl_ats_badge: "Filtrage ATS en Ligne",
    tmpl_ats_desc: "Colonne unique 100% lin\xE9aire, optimis\xE9e pour les robots de recrutement et portails.",
    tmpl_impact_badge: "Vente & Produit",
    tmpl_impact_desc: "Panneau lat\xE9ral structur\xE9 \xE0 fort contraste pour une pr\xE9sence m\xE9morable.",
    tmpl_corporate_badge: "Grandes Entreprises & Banques",
    tmpl_corporate_desc: "Grille math\xE9matique minimaliste pour grands groupes et gouvernance internationale.",
    tmpl_minimalist_badge: "Premier Emploi & Stage",
    tmpl_minimalist_desc: "Colonne lat\xE9rale l\xE9g\xE8re en tons neutres, id\xE9ale pour un profil junior.",
    tmpl_creative_badge: "Design & Mode",
    tmpl_creative_desc: "En-t\xEAte avec bande color\xE9e et typographie expressive pour profils cr\xE9atifs.",
    tmpl_elegant_badge: "Direction & Juridique",
    tmpl_elegant_desc: "Serif avec filets dor\xE9s, sophistication classique discr\xE8te.",
    tmpl_tech_badge: "Ing\xE9nierie & Donn\xE9es",
    tmpl_tech_desc: "Frise chronologique verticale qui raconte votre carri\xE8re.",
    tmpl_intl_badge: "International & Multinationales",
    tmpl_intl_desc: "Format international \xE9pur\xE9, sans photo et 100% compatible avec les ATS mondiaux.",
    // Job Analysis panel
    job_analysis_badge: "Fonction Intelligente \u2022 Analyse de Poste",
    job_analysis_title: "Compatibilit\xE9 avec ce poste",
    job_analysis_match: "Ad\xE9quation au profil",
    job_analysis_skills_found: "Comp\xE9tences Trouv\xE9es",
    job_analysis_exp_relevant: "Exp\xE9riences Pertinentes",
    job_analysis_improvements: "Axes d'Am\xE9lioration",
    job_analysis_disclaimer: "* L'analyse de compatibilit\xE9 est un diagnostic technique comparatif et ne garantit ni l'embauche ni la s\xE9lection.",
    tmpl_achievements: "R\xE9alisations Cl\xE9s & R\xE9sultats",
    tmpl_skills_tools: "Comp\xE9tences & Technologies",
    // ATS Audit Bar
    ats_audit_title: "Audit de Lecture ATS :",
    ats_audit_sections: "sections structur\xE9es \u2022 Ordre d\xE9terministe \u2022 100% texte indexable",
    ats_score_label: "Score Structurel :",
    ats_verification_note: "(V\xE9rification technique de parsing)",
    // Mobile bar
    prev_mobile_creating: "Cr\xE9ation du PDF...",
    prev_mobile_download: "T\xE9l\xE9charger le PDF",
    prev_mobile_edit: "Modifier",
    // Landing Hero Simulation
    sim_header_brand: "CURR\xCA \u2022 Transformation en Temps R\xE9el",
    sim_header_ai_active: "IA Active",
    sim_detail_1: "Thomas Martin \u2022 Analyste Op\xE9rationnel",
    sim_detail_2: '"G\xE9rait les factures et tableaux du service..."',
    sim_detail_3: '\u2192 "A pilot\xE9 les op\xE9rations fiscales et le suivi de facturation sous Excel"',
    sim_detail_4: "Crit\xE8res correspondants : 92% d'ad\xE9quation",
    sim_default_role: "Professionnel",
    // Landing Hero Saved Resume
    hero_saved_resume_title: "CV Sauvegard\xE9",
    hero_saved_cloud_tooltip: "Sauvegarder dans le cloud ? Connexion gratuite optionnelle",
    // Navbar Tooltips
    nav_cloud_connected_title: "Compte connect\xE9 au cloud",
    nav_cloud_active_title: "Cloud actif",
    nav_login_tooltip: "Connexion (Optionnel - sauvegarde cloud)",
    nav_menu_aria: "Ouvrir le menu",
    // Adapt Job Modal
    adapt_modal_title: "Adapter \xE0 une Autre Offre",
    adapt_current_role: "Poste actuel sur le CV :",
    adapt_modal_desc: "Collez la description ou les exigences du nouveau poste. CURR\xCA va r\xE9analyser vos exp\xE9riences r\xE9elles pour valoriser les points les plus pertinents pour cette opportunit\xE9.",
    adapt_job_label: "Description du nouveau poste",
    adapt_job_placeholder: "Collez ici l'annonce (missions, profil recherch\xE9, comp\xE9tences souhait\xE9es)...",
    adapt_truth_guarantee: "Vos exp\xE9riences et informations renseign\xE9es demeurent 100% v\xE9ridiques.",
    adapt_cancel: "Annuler",
    adapt_submitting: "Adaptation par IA...",
    adapt_submit: "Adapter le CV",
    // Loading Overlay
    loading_phase_1: "Analyse de votre profil...",
    loading_phase_2: "Organisation de vos exp\xE9riences...",
    loading_phase_3: "Adaptation de votre CV...",
    loading_phase_4: "Finalisation...",
    loading_brand_badge: "CURR\xCA \u2022 IA en Action",
    loading_description: "Optimisation de vos formulations, structuration chronologique et application des crit\xE8res de recrutement.",
    loading_moment: "Encore quelques instants..."
  }
};
var MANUAL_LANG_STORAGE_KEY = "curre_language";
var LANGUAGE_METADATA = {
  pt: {
    htmlLang: "pt-BR",
    title: "CURR\xCA - Gerador de Curr\xEDculo com IA",
    description: "Corra atr\xE1s da vaga certa. Crie curr\xEDculos profissionais modernos adaptados para vagas de emprego utilizando intelig\xEAncia artificial.",
    canonicalUrl: "https://www.curreai.com/pt/"
  },
  en: {
    htmlLang: "en",
    title: "CURR\xCA - AI Resume Builder",
    description: "Run after the right job. Create modern, professional resumes tailored to job postings using artificial intelligence.",
    canonicalUrl: "https://www.curreai.com/en/"
  },
  es: {
    htmlLang: "es",
    title: "CURR\xCA - Creador de Curr\xEDculum con IA",
    description: "Ve tras el empleo adecuado. Crea curr\xEDculums profesionales modernos adaptados a ofertas laborales con inteligencia artificial.",
    canonicalUrl: "https://www.curreai.com/es/"
  },
  fr: {
    htmlLang: "fr",
    title: "CURR\xCA - Cr\xE9ateur de CV avec IA",
    description: "D\xE9crochez le bon poste. Cr\xE9ez des CV professionnels modernes adapt\xE9s aux offres d'emploi gr\xE2ce \xE0 l'intelligence artificielle.",
    canonicalUrl: "https://www.curreai.com/fr/"
  }
};
function matchSupportedLanguage(localeTag) {
  if (!localeTag || typeof localeTag !== "string") return null;
  const normalized = localeTag.trim().toLowerCase();
  const primary = normalized.split(/[-_]/)[0];
  if (primary === "pt") return "pt";
  if (primary === "es") return "es";
  if (primary === "fr") return "fr";
  if (primary === "en") return "en";
  return null;
}
function getLanguageFromPath(pathname) {
  if (typeof window === "undefined" && pathname === void 0) return null;
  const path3 = pathname !== void 0 ? pathname : typeof window !== "undefined" ? window.location.pathname : "";
  const match = path3.match(/^\/(pt|en|es|fr)(?:\/|$)/i);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }
  return null;
}
function applyDocumentMetadata(lang) {
  if (typeof document === "undefined") return;
  const meta = LANGUAGE_METADATA[lang] || LANGUAGE_METADATA.pt;
  document.documentElement.lang = meta.htmlLang;
  document.title = meta.title;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", meta.title);
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", meta.description);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", meta.description);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", meta.canonicalUrl);
  const hreflangConfigs = [
    { lang: "pt", url: "https://www.curreai.com/pt/" },
    { lang: "en", url: "https://www.curreai.com/en/" },
    { lang: "es", url: "https://www.curreai.com/es/" },
    { lang: "fr", url: "https://www.curreai.com/fr/" },
    { lang: "x-default", url: "https://www.curreai.com/en/" }
  ];
  for (const config of hreflangConfigs) {
    let link = document.querySelector(`link[rel="alternate"][hreflang="${config.lang}"]`);
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", config.lang);
      document.head.appendChild(link);
    }
    link.setAttribute("href", config.url);
  }
}
function detectBrowserLanguage() {
  if (typeof navigator === "undefined") return "en";
  const candidates = [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      if (typeof lang === "string" && lang.trim()) {
        candidates.push(lang.trim());
      }
    }
  }
  if (typeof navigator.language === "string" && navigator.language.trim()) {
    candidates.push(navigator.language.trim());
  }
  for (const candidate of candidates) {
    const matched = matchSupportedLanguage(candidate);
    if (matched) {
      return matched;
    }
  }
  return "en";
}
function getInitialLanguage(defaultLanguage) {
  if (defaultLanguage && (defaultLanguage === "pt" || defaultLanguage === "en" || defaultLanguage === "es" || defaultLanguage === "fr")) {
    return defaultLanguage;
  }
  const urlLang = getLanguageFromPath();
  if (urlLang) {
    if (typeof document !== "undefined") {
      applyDocumentMetadata(urlLang);
    }
    return urlLang;
  }
  let manualChoice = null;
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(MANUAL_LANG_STORAGE_KEY);
      if (saved === "pt" || saved === "en" || saved === "es" || saved === "fr") {
        manualChoice = saved;
      }
    }
  } catch {
  }
  if (manualChoice) {
    if (typeof document !== "undefined") {
      applyDocumentMetadata(manualChoice);
    }
    return manualChoice;
  }
  const detected = detectBrowserLanguage();
  if (typeof document !== "undefined") {
    applyDocumentMetadata(detected);
  }
  return detected;
}
var LanguageContext = (0, import_react.createContext)({
  language: "pt",
  setLanguage: () => {
  },
  t: (key) => key
});
var LanguageProvider = ({
  children,
  defaultLanguage
}) => {
  const [language, setLanguageState] = (0, import_react.useState)(() => getInitialLanguage(defaultLanguage));
  (0, import_react.useEffect)(() => {
    if (typeof window !== "undefined") {
      const path3 = window.location.pathname;
      if (/^\/(pt|en|es|fr)$/i.test(path3)) {
        window.history.replaceState(null, "", `${path3}/${window.location.search}${window.location.hash}`);
      }
    }
    applyDocumentMetadata(language);
  }, [language]);
  (0, import_react.useEffect)(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const langFromUrl = getLanguageFromPath();
      if (langFromUrl) {
        setLanguageState(langFromUrl);
        applyDocumentMetadata(langFromUrl);
      } else if (window.location.pathname === "/" || window.location.pathname === "") {
        let manualChoice = null;
        try {
          const saved = localStorage.getItem(MANUAL_LANG_STORAGE_KEY);
          if (saved === "pt" || saved === "en" || saved === "es" || saved === "fr") {
            manualChoice = saved;
          }
        } catch {
        }
        const targetLang = manualChoice || detectBrowserLanguage();
        setLanguageState(targetLang);
        applyDocumentMetadata(targetLang);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(MANUAL_LANG_STORAGE_KEY, lang);
      }
    } catch {
    }
    if (typeof window !== "undefined") {
      applyDocumentMetadata(lang);
      const targetUrl = `/${lang}/${window.location.search}${window.location.hash}`;
      if (window.location.pathname !== `/${lang}/`) {
        window.history.pushState(null, "", targetUrl);
      }
    }
  };
  const t = (key) => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const aliases = {
      step_3_no_exp_checkbox: "step_3_no_exp_title",
      step_3_no_exp_desc: "step_3_no_exp_sub",
      step_3_no_exp_active_title: "step_3_no_exp_alert_title",
      step_3_no_exp_active_desc: "step_3_no_exp_alert_desc",
      step_3_no_exp_switch_back: "step_3_no_exp_revert",
      step_3_exp_num: "step_3_company_number",
      step_3_field_company: "step_3_company_label",
      step_3_field_role: "step_3_role_label",
      step_3_field_start: "step_3_start_label",
      step_3_field_end: "step_3_end_label",
      step_3_field_current: "step_3_current_job",
      step_3_field_activities: "step_3_activities_label",
      step_3_field_results: "step_3_results_label",
      step_4_field_course: "step_4_course_label",
      step_4_field_institution: "step_4_inst_label",
      step_4_field_start_year: "step_4_start_year",
      step_4_field_end_year: "step_4_end_year",
      step_4_field_status: "step_4_status_label",
      step_5_label: "step_5_skills_title",
      step_5_tools_label: "step_5_tools_title",
      step_5_custom_placeholder: "step_5_skills_custom_ph",
      step_5_tools_custom_placeholder: "step_5_tools_custom_ph",
      step_5_add_btn: "btn_add",
      step_6_empty_title: "step_6_empty",
      step_6_empty_btn: "step_6_add_first",
      step_6_field_name: "step_6_name_label",
      step_6_field_institution: "step_6_inst_label",
      step_6_field_year: "step_6_year_label",
      step_6_field_hours: "step_6_hours_label",
      step_7_badge: "step_7_tag",
      step_7_textarea_label: "step_7_desc_label",
      step_7_ethics_desc: "step_7_ethics_text",
      step_7_btn_analyze: "step_7_analyze_btn",
      step_7_btn_analyzing: "step_7_analyzing_btn",
      step_8_badge: "step_8_tag",
      step_8_btn_edit: "step_8_edit_btn",
      step_8_pending_notice: "step_8_btn_sub_disabled",
      step_8_guarantee: "step_8_btn_sub"
    };
    const targetKey = aliases[key] || key;
    if (langDict && langDict[targetKey]) {
      return langDict[targetKey];
    }
    if (TRANSLATIONS.pt[targetKey]) {
      return TRANSLATIONS.pt[targetKey];
    }
    if (TRANSLATIONS.pt[key]) {
      return TRANSLATIONS.pt[key];
    }
    return key.replace(/^step_\d+_/, "").replace(/_label$|_title$|_ph$/, "").replace(/_/g, " ");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LanguageContext.Provider, { value: { language, setLanguage, t }, children });
};
var useLanguage = () => (0, import_react.useContext)(LanguageContext);
function translateEduStatus(status, t) {
  if (!status) return "";
  const s = status.toLowerCase().trim();
  if (s.includes("conclu") || s.includes("complete") || s.includes("termin")) {
    return t("tmpl_status_completed");
  }
  if (s.includes("anda") || s.includes("prog") || s.includes("cours") || s.includes("curs")) {
    return t("tmpl_status_in_progress");
  }
  if (s.includes("interr") || s.includes("incomp") || s.includes("pause")) {
    return t("tmpl_status_interrupted");
  }
  return status;
}

// src/components/templates/LiquidModernTemplate.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var LiquidModernTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "w-full text-slate-800 font-sans leading-normal p-4 sm:p-6 select-text", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("header", { className: "pb-4 mb-5 border-b border-slate-200/90", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-row items-start justify-between gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1.5 flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { className: "text-2xl sm:text-[30px] font-extrabold tracking-tight text-slate-950 leading-none", children: personal.fullName }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-xs sm:text-[13px] font-bold uppercase tracking-wider text-sky-700", children: targetRole }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-slate-700 pt-1 font-medium", children: [
          personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MapPin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-500 shrink-0" }),
              text: personal.cityState
            }
          ),
          personal.cityState && personal.phone && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-300 font-normal leading-none select-none", children: "\u2022" }),
          personal.phone && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Phone, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-500 shrink-0" }),
              text: personal.phone
            }
          ),
          personal.phone && personal.email && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-300 font-normal leading-none select-none", children: "\u2022" }),
          personal.email && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Mail, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-500 shrink-0" }),
              text: personal.email,
              href: `mailto:${personal.email}`
            }
          ),
          personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-300 font-normal leading-none select-none", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              ContactItem,
              {
                icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Linkedin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-500 shrink-0" }),
                text: personal.linkedin
              }
            )
          ] }),
          personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-300 font-normal leading-none select-none", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              ContactItem,
              {
                icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Globe, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-500 shrink-0" }),
                text: personal.portfolio
              }
            )
          ] })
        ] })
      ] }),
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm"
        }
      ) })
    ] }) }),
    professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2", children: t("tmpl_summary") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify", children: professionalSummary })
    ] }),
    experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-3", children: t("tmpl_experience") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "space-y-4", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs sm:text-sm font-bold text-slate-950 break-words", children: exp.role }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs font-semibold text-slate-700 ml-1.5 break-words", children: [
              "\xB7 ",
              exp.company
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0", children: exp.period })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "space-y-1 text-xs text-slate-700 leading-relaxed pl-1", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-400 font-bold shrink-0 mt-0.5", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-justify", children: bullet })
        ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-400 font-bold shrink-0 mt-0.5", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("tmpl_default_bullet_modern") })
        ] }) })
      ] }, exp.id || idx)) })
    ] }),
    (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2.5", children: t("tmpl_skills") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs", children: [
        skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "bg-slate-50/70 p-3 rounded-lg border border-slate-100", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 block mb-1.5 text-[11px] uppercase tracking-wide", children: t("tmpl_skills_main") }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-slate-700 leading-relaxed", children: skills.join(" \xB7 ") })
        ] }),
        tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "bg-slate-50/70 p-3 rounded-lg border border-slate-100", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 block mb-1.5 text-[11px] uppercase tracking-wide", children: t("tmpl_tools_soft") }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-slate-700 leading-relaxed", children: tools.join(" \xB7 ") })
        ] })
      ] })
    ] }),
    education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2.5", children: t("tmpl_education") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "space-y-2", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-2 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900", children: edu.course }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-slate-700 ml-1.5", children: [
            "\xB7 ",
            edu.institution
          ] }),
          edu.status && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-slate-500 text-[11px] ml-1.5 font-medium", children: [
            "(",
            translateEduStatus(edu.status, t),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-slate-500 font-medium whitespace-nowrap", children: [
          edu.startYear,
          " \u2014 ",
          edu.endYear
        ] })
      ] }, edu.id || idx)) })
    ] }),
    courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2.5", children: t("tmpl_courses") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "space-y-1.5 text-xs", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex justify-between items-baseline gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900", children: course.name }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-slate-700 ml-1", children: [
            "\xB7 ",
            course.institution,
            " ",
            course.hours ? `(${course.hours})` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 font-medium whitespace-nowrap", children: course.year })
      ] }, course.id || idx)) })
    ] })
  ] });
};

// src/components/templates/ExecutiveClassicTemplate.tsx
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var ExecutiveClassicTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "w-full text-slate-950 font-serif leading-normal p-4 sm:p-6 select-text", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("header", { className: "text-center pb-3", children: [
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex justify-center mb-3", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-20 h-20 rounded-full object-cover border-2 border-slate-900 shadow-sm"
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h1", { className: "text-3xl sm:text-4xl font-serif font-black uppercase tracking-[0.16em] text-slate-950", children: personal.fullName }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-xs sm:text-sm font-serif italic text-slate-800 font-semibold tracking-wider mt-1.5 uppercase", children: targetRole }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-xs text-slate-800 font-sans mt-3 font-medium", children: [
        personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          ContactItem,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.MapPin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
            text: personal.cityState
          }
        ),
        personal.cityState && personal.phone && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "\u25C6" }),
        personal.phone && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          ContactItem,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Phone, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
            text: personal.phone
          }
        ),
        personal.phone && personal.email && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "\u25C6" }),
        personal.email && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          ContactItem,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Mail, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
            text: personal.email,
            href: `mailto:${personal.email}`
          }
        ),
        personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "\u25C6" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Linkedin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.linkedin
            }
          )
        ] }),
        personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "\u25C6" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Globe, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.portfolio
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "border-t-2 border-b border-slate-950 py-[1.5px] mt-4 mb-5" })
    ] }),
    professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5", children: t("tmpl_qualifications") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-xs sm:text-[13px] font-serif text-slate-900 leading-relaxed text-justify", children: professionalSummary })
    ] }),
    experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-3", children: t("tmpl_trajectory") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-4", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-xs sm:text-sm font-serif font-bold text-slate-950 break-words", children: exp.role }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-xs font-serif italic text-slate-800 ml-1.5 break-words", children: [
              "\u2014 ",
              exp.company
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-xs font-sans font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap shrink-0", children: exp.period })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", { className: "space-y-1 text-xs font-serif text-slate-900 leading-relaxed pl-1", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-slate-800 font-bold shrink-0 mt-0.5", children: "\u25AA" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-justify", children: bullet })
        ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-slate-800 font-bold shrink-0 mt-0.5", children: "\u25AA" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("tmpl_default_bullet_exec") })
        ] }) })
      ] }, exp.id || idx)) })
    ] }),
    education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5", children: t("tmpl_education") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-2", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex justify-between items-baseline gap-2 text-xs font-serif", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "font-bold text-slate-950", children: edu.course }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-slate-800 italic ml-1.5", children: [
            "\u2014 ",
            edu.institution
          ] }),
          edu.status && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-slate-600 text-[11px] ml-1.5 font-sans", children: [
            "(",
            translateEduStatus(edu.status, t),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-slate-700 font-sans font-medium whitespace-nowrap", children: [
          edu.startYear,
          " \u2014 ",
          edu.endYear
        ] })
      ] }, edu.id || idx)) })
    ] }),
    (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "mb-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5", children: t("tmpl_exec_skills") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif", children: [
        skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "border-l-2 border-slate-900 pl-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "font-sans font-bold text-[10px] uppercase tracking-wider text-slate-950 block mb-1", children: t("tmpl_exec_mgmt") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-slate-900 leading-relaxed", children: skills.join(" \xB7 ") })
        ] }),
        tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "border-l-2 border-slate-900 pl-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "font-sans font-bold text-[10px] uppercase tracking-wider text-slate-950 block mb-1", children: t("tmpl_exec_systems") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-slate-900 leading-relaxed", children: tools.join(" \xB7 ") })
        ] })
      ] })
    ] }),
    courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5", children: t("tmpl_exec_cert") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-1 text-xs font-serif", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex justify-between items-baseline gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "font-bold text-slate-950", children: course.name }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-slate-800 italic ml-1", children: [
            "\u2014 ",
            course.institution,
            " ",
            course.hours ? `(${course.hours})` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-slate-700 font-sans font-medium whitespace-nowrap", children: course.year })
      ] }, course.id || idx)) })
    ] })
  ] });
};

// src/components/templates/AtsProfessionalTemplate.tsx
var import_lucide_react3 = require("lucide-react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var AtsProfessionalTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "w-full text-slate-900 font-sans leading-normal p-4 sm:p-6 select-text bg-white", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { className: "pb-3 mb-4 border-b-2 border-slate-900", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h1", { className: "text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-950", children: personal.fullName }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mt-1", children: targetRole }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-800 mt-2 font-medium", children: [
        personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          ContactItem,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react3.MapPin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-700 shrink-0" }),
            text: personal.cityState
          }
        ),
        personal.cityState && personal.phone && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "|" }),
        personal.phone && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          ContactItem,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react3.Phone, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-700 shrink-0" }),
            text: personal.phone
          }
        ),
        personal.phone && personal.email && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "|" }),
        personal.email && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          ContactItem,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react3.Mail, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-700 shrink-0" }),
            text: personal.email,
            href: `mailto:${personal.email}`
          }
        ),
        personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "|" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react3.Linkedin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-700 shrink-0" }),
              text: personal.linkedin
            }
          )
        ] }),
        personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-400 font-normal select-none", children: "|" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react3.Globe, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-700 shrink-0" }),
              text: personal.portfolio
            }
          )
        ] })
      ] })
    ] }),
    professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5", children: t("tmpl_summary") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-xs sm:text-[13px] text-slate-800 leading-relaxed text-justify", children: professionalSummary })
    ] }),
    experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2.5", children: t("tmpl_experience") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "space-y-3.5", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: "text-xs sm:text-sm font-bold text-slate-950 inline break-words", children: exp.role }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "text-xs font-semibold text-slate-800 ml-1.5 break-words", children: [
              "\xB7 ",
              exp.company
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0", children: exp.period })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ul", { className: "space-y-0.5 text-xs text-slate-800 leading-relaxed pl-1", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-600 font-bold shrink-0 mt-0.5", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-justify", children: bullet })
        ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-600 font-bold shrink-0 mt-0.5", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: t("tmpl_default_bullet_ats") })
        ] }) })
      ] }, exp.id || idx)) })
    ] }),
    education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2", children: t("tmpl_education") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "space-y-1.5", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex justify-between items-baseline gap-2 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-bold text-slate-950", children: edu.course }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "text-slate-800 ml-1.5", children: [
            "\xB7 ",
            edu.institution
          ] }),
          edu.status && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "text-slate-600 text-[11px] ml-1.5 font-medium", children: [
            "(",
            translateEduStatus(edu.status, t),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "text-slate-700 font-medium whitespace-nowrap", children: [
          edu.startYear,
          " \u2014 ",
          edu.endYear
        ] })
      ] }, edu.id || idx)) })
    ] }),
    (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2", children: t("tmpl_skills_tech_alt") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-1.5 text-xs", children: [
        skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "font-bold text-slate-950", children: [
            t("tmpl_skills_label"),
            " "
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-800", children: skills.join(" \xB7 ") })
        ] }),
        tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "font-bold text-slate-950", children: [
            t("tmpl_tools_label"),
            " "
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-800", children: tools.join(" \xB7 ") })
        ] })
      ] })
    ] }),
    courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2", children: t("tmpl_courses") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "space-y-1 text-xs", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex justify-between items-baseline gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-bold text-slate-950", children: course.name }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "text-slate-800 ml-1", children: [
            "\xB7 ",
            course.institution,
            " ",
            course.hours ? `(${course.hours})` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-slate-700 font-medium whitespace-nowrap", children: course.year })
      ] }, course.id || idx)) })
    ] })
  ] });
};

// src/components/templates/ImpactTemplate.tsx
var import_lucide_react4 = require("lucide-react");
var import_jsx_runtime6 = require("react/jsx-runtime");
var ImpactTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "impact-resume-layout w-full text-slate-800 font-sans leading-normal flex flex-row min-h-full select-text bg-transparent template-impact", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("aside", { className: "impact-resume-sidebar w-[32%] bg-slate-900 text-slate-100 p-4 sm:p-5 flex flex-col gap-4 shrink-0 box-border", children: [
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex justify-center mb-1", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-24 h-24 rounded-2xl object-cover border-2 border-sky-400/40 shadow-lg"
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.User, { size: 13, strokeWidth: 2.5, className: "block shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("tmpl_contact") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-2 text-xs font-medium text-slate-200", children: [
          personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.MapPin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-sky-400 shrink-0" }),
              text: personal.cityState,
              textClassName: "text-slate-200"
            }
          ) }),
          personal.phone && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Phone, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-sky-400 shrink-0" }),
              text: personal.phone,
              textClassName: "text-slate-200"
            }
          ) }),
          personal.email && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Mail, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-sky-400 shrink-0" }),
              text: personal.email,
              href: `mailto:${personal.email}`,
              textClassName: "text-slate-200 text-[11px] break-all"
            }
          ) }),
          personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Linkedin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-sky-400 shrink-0" }),
              text: personal.linkedin,
              textClassName: "text-slate-200 text-[11px] break-all"
            }
          ) }),
          personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Globe, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-sky-400 shrink-0" }),
              text: personal.portfolio,
              textClassName: "text-slate-200 text-[11px] break-all"
            }
          ) })
        ] })
      ] }),
      skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Sparkles, { size: 13, strokeWidth: 2.5, className: "block shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("tmpl_skills_main") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { className: "space-y-1 text-xs text-slate-300 font-medium", children: skills.map((skill, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("li", { className: "flex items-start gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-sky-400 font-bold shrink-0 mt-0.5", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: skill })
        ] }, idx)) })
      ] }),
      tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Wrench, { size: 13, strokeWidth: 2.5, className: "block shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("tmpl_tools_soft") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex flex-wrap gap-1", children: tools.map((tool, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "span",
          {
            className: "px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700 font-medium",
            children: tool
          },
          idx
        )) })
      ] }),
      education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.GraduationCap, { size: 13, strokeWidth: 2.5, className: "block shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("tmpl_education_short") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "space-y-2 text-xs", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "font-bold text-white text-xs", children: edu.course }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-slate-400 text-[11px]", children: edu.institution }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "text-slate-500 text-[10px]", children: [
            edu.startYear,
            " \u2014 ",
            edu.endYear,
            " ",
            edu.status ? `(${translateEduStatus(edu.status, t)})` : ""
          ] })
        ] }, edu.id || idx)) })
      ] }),
      courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Award, { size: 13, strokeWidth: 2.5, className: "block shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("tmpl_certifications") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "space-y-1.5 text-xs text-slate-300", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "text-[11px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "font-semibold text-slate-200", children: course.name }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "text-slate-400 text-[10px]", children: [
            course.institution,
            " \u2022 ",
            course.year
          ] })
        ] }, course.id || idx)) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("main", { className: "impact-resume-content w-[68%] flex-1 min-w-0 p-5 sm:p-6 flex flex-col gap-5 box-border", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("header", { className: "border-b border-slate-200 pb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h1", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 leading-none", children: personal.fullName }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "inline-block px-2.5 py-1 rounded bg-sky-100 text-sky-900 font-extrabold text-xs tracking-wider uppercase", children: targetRole }) })
      ] }),
      professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { className: "text-xs font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2", children: t("tmpl_profile") }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify font-medium break-words", children: professionalSummary })
      ] }),
      experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h2", { className: "text-xs font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.Briefcase, { size: 13, strokeWidth: 2.5, className: "text-sky-700 shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("tmpl_achievements") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "space-y-4", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-xs sm:text-sm font-bold text-slate-950 break-words", children: exp.role }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "text-xs font-semibold text-sky-800 ml-1.5 break-words", children: [
                "\xB7 ",
                exp.company
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0", children: exp.period })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { className: "space-y-1 text-xs text-slate-700 leading-relaxed pl-1 font-normal", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-sky-600 font-bold shrink-0 mt-0.5", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-justify", children: bullet })
          ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-sky-600 font-bold shrink-0 mt-0.5", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("tmpl_default_bullet") })
          ] }) })
        ] }, exp.id || idx)) })
      ] })
    ] })
  ] });
};

// src/components/templates/CorporatePremiumTemplate.tsx
var import_lucide_react5 = require("lucide-react");
var import_jsx_runtime7 = require("react/jsx-runtime");
var CorporatePremiumTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "w-full text-slate-900 font-sans leading-normal p-4 sm:p-6 select-text bg-white", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("header", { className: "pb-3.5 mb-5 border-b-2 border-slate-900", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex justify-between items-start gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h1", { className: "text-2xl sm:text-[32px] font-bold tracking-tight text-slate-950 uppercase leading-none", children: personal.fullName }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-xs sm:text-sm font-semibold tracking-wider text-slate-700 uppercase mt-1.5", children: targetRole }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2 font-medium", children: [
          personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react5.MapPin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.cityState
            }
          ),
          personal.cityState && personal.phone && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-300 font-normal select-none", children: "/" }),
          personal.phone && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react5.Phone, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.phone
            }
          ),
          personal.phone && personal.email && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-300 font-normal select-none", children: "/" }),
          personal.email && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react5.Mail, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.email,
              href: `mailto:${personal.email}`
            }
          ),
          personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-300 font-normal select-none", children: "/" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              ContactItem,
              {
                icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react5.Linkedin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
                text: personal.linkedin
              }
            )
          ] }),
          personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-300 font-normal select-none", children: "/" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              ContactItem,
              {
                icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react5.Globe, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
                text: personal.portfolio
              }
            )
          ] })
        ] })
      ] }),
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-20 h-20 rounded-lg object-cover border border-slate-300 shadow-sm"
        }
      ) })
    ] }) }),
    professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "mb-4.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5", children: t("tmpl_qualifications_synthesis") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-xs sm:text-[13px] text-slate-800 leading-relaxed text-justify", children: professionalSummary })
    ] }),
    experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "mb-4.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2.5", children: t("tmpl_experience") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "space-y-3.5", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-xs sm:text-sm font-bold text-slate-950 break-words", children: exp.role }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "text-xs font-semibold text-slate-700 ml-1.5 break-words", children: [
              "| ",
              exp.company
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap shrink-0", children: exp.period })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ul", { className: "space-y-0.5 text-xs text-slate-800 leading-relaxed pl-1", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-500 font-bold shrink-0 mt-0.5", children: "\u2013" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-justify", children: bullet })
        ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-500 font-bold shrink-0 mt-0.5", children: "\u2013" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: t("tmpl_default_bullet_corp") })
        ] }) })
      ] }, exp.id || idx)) })
    ] }),
    education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "mb-4.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2", children: t("tmpl_education") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "space-y-1.5", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex justify-between items-baseline gap-2 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "font-bold text-slate-950", children: edu.course }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "text-slate-700 ml-1.5", children: [
            "\u2014 ",
            edu.institution
          ] }),
          edu.status && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "text-slate-500 text-[11px] ml-1.5", children: [
            "(",
            translateEduStatus(edu.status, t),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "text-slate-600 font-medium whitespace-nowrap", children: [
          edu.startYear,
          " \u2014 ",
          edu.endYear
        ] })
      ] }, edu.id || idx)) })
    ] }),
    (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "mb-4.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2", children: t("tmpl_skills_tech_alt") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-1.5 text-xs", children: [
        skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "font-bold text-slate-950", children: [
            t("tmpl_skills_label"),
            " "
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-800", children: skills.join(" \xB7 ") })
        ] }),
        tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "font-bold text-slate-950", children: [
            t("tmpl_tools_label"),
            " "
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-800", children: tools.join(" \xB7 ") })
        ] })
      ] })
    ] }),
    courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2", children: t("tmpl_exec_cert") }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "space-y-1 text-xs", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex justify-between items-baseline gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "font-bold text-slate-950", children: course.name }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "text-slate-700 ml-1", children: [
            "\u2014 ",
            course.institution,
            " ",
            course.hours ? `(${course.hours})` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-slate-600 font-medium whitespace-nowrap", children: course.year })
      ] }, course.id || idx)) })
    ] })
  ] });
};

// src/components/templates/MinimalistAtsTemplate.tsx
var import_lucide_react6 = require("lucide-react");
var import_jsx_runtime8 = require("react/jsx-runtime");
var MinimalistAtsTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "w-full text-slate-800 font-sans leading-normal flex flex-row min-h-full select-text bg-white box-border", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("aside", { className: "w-[34%] max-w-[250px] bg-slate-50/90 border-r border-slate-200/80 p-5 sm:p-6 flex flex-col gap-6 shrink-0 box-border", children: [
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex justify-center mb-1", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md"
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.User, { className: "w-3.5 h-3.5 text-slate-500" }),
          t("tmpl_contact")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-2 text-xs text-slate-800 font-semibold break-words", children: [
          personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.MapPin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.cityState
            }
          ) }),
          personal.phone && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Phone, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.phone
            }
          ) }),
          personal.email && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Mail, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.email,
              href: `mailto:${personal.email}`,
              textClassName: "text-[11px] break-all"
            }
          ) }),
          personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Linkedin, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.linkedin,
              textClassName: "text-[11px] break-all"
            }
          ) }),
          personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "block", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Globe, { size: 13, strokeWidth: 2, className: "block w-3.5 h-3.5 text-slate-600 shrink-0" }),
              text: personal.portfolio,
              textClassName: "text-[11px] break-all"
            }
          ) })
        ] })
      ] }),
      skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Sparkles, { className: "w-3.5 h-3.5 text-slate-500" }),
          t("tmpl_skills_main")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex flex-wrap gap-1.5", children: skills.map((skill, idx) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "span",
          {
            className: "bg-white text-slate-800 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs",
            children: skill
          },
          idx
        )) })
      ] }),
      tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Wrench, { className: "w-3.5 h-3.5 text-slate-500" }),
          t("tmpl_tools_soft")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex flex-wrap gap-1.5", children: tools.map((tool, idx) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "span",
          {
            className: "bg-white text-slate-800 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs",
            children: tool
          },
          idx
        )) })
      ] }),
      education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.GraduationCap, { className: "w-3.5 h-3.5 text-slate-500" }),
          t("tmpl_education_short")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "space-y-2.5 text-xs", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "font-bold text-slate-900 text-xs", children: edu.course }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-slate-600 text-[11px]", children: edu.institution }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-slate-500 text-[10px] font-medium", children: [
            edu.startYear,
            " \u2014 ",
            edu.endYear,
            edu.status ? ` \u2022 ${translateEduStatus(edu.status, t)}` : ""
          ] })
        ] }, idx)) })
      ] }),
      courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h3", { className: "text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Award, { className: "w-3.5 h-3.5 text-slate-500" }),
          t("tmpl_courses_short")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "space-y-2 text-xs", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "font-bold text-slate-900 text-[11px]", children: course.name }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-slate-600 text-[10px]", children: [
            course.institution,
            " ",
            course.hours ? `(${course.hours})` : "",
            " \u2022 ",
            course.year
          ] })
        ] }, idx)) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("main", { className: "w-[66%] flex-1 min-w-0 p-5 sm:p-7 flex flex-col justify-start box-border", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("header", { className: "pb-4 mb-5 border-b border-slate-200", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h1", { className: "text-3xl font-extrabold tracking-tight text-slate-950", children: personal.fullName }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-sm font-bold uppercase tracking-wider text-slate-700 mt-1", children: targetRole })
      ] }),
      professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { className: "mb-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.User, { className: "w-3.5 h-3.5 text-slate-500" }),
          t("tmpl_profile")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-[13px] text-slate-700 leading-relaxed text-justify", children: professionalSummary })
      ] }),
      experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { className: "mb-4 flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h2", { className: "text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react6.Briefcase, { className: "w-3.5 h-3.5 text-slate-500" }),
          t("tmpl_experience")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "space-y-4", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-sm font-bold text-slate-900 break-words", children: exp.role }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "text-xs font-semibold text-slate-600 ml-1.5 break-words", children: [
                "\u2014 ",
                exp.company
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-xs font-medium text-slate-500 whitespace-nowrap shrink-0", children: exp.period })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("ul", { className: "space-y-1 text-xs text-slate-700 leading-relaxed pl-1", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-slate-400 font-bold shrink-0 mt-0.5", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-justify", children: bullet })
          ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-slate-400 font-bold shrink-0 mt-0.5", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: t("tmpl_default_bullet_ats") })
          ] }) })
        ] }, idx)) })
      ] })
    ] })
  ] });
};

// src/components/templates/CreativeColorTemplate.tsx
var import_lucide_react7 = require("lucide-react");
var import_jsx_runtime9 = require("react/jsx-runtime");
var CreativeColorTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  const SectionTitle = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("h2", { className: "flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.14em] text-violet-950 mb-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "inline-block w-3 h-3 rotate-45 bg-gradient-to-tr from-fuchsia-500 to-violet-600 shrink-0" }),
    children
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "w-full text-slate-800 font-sans leading-normal select-text bg-white", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("header", { className: "bg-gradient-to-r from-violet-700 via-fuchsia-600 to-rose-500 px-8 py-8 text-white", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-row items-center justify-between gap-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h1", { className: "text-[32px] leading-tight font-black tracking-tight break-words", children: personal.fullName }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "text-sm font-bold uppercase tracking-[0.22em] text-white/90 mt-1", children: targetRole }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/95 pt-2.5 font-medium", children: [
          personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react7.MapPin, { size: 13, strokeWidth: 2.2, className: "block w-3.5 h-3.5 text-white shrink-0" }),
              text: personal.cityState
            }
          ),
          personal.phone && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react7.Phone, { size: 13, strokeWidth: 2.2, className: "block w-3.5 h-3.5 text-white shrink-0" }),
              text: personal.phone
            }
          ),
          personal.email && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react7.Mail, { size: 13, strokeWidth: 2.2, className: "block w-3.5 h-3.5 text-white shrink-0" }),
              text: personal.email,
              href: `mailto:${personal.email}`
            }
          ),
          personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react7.Linkedin, { size: 13, strokeWidth: 2.2, className: "block w-3.5 h-3.5 text-white shrink-0" }),
              text: personal.linkedin
            }
          ),
          personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react7.Globe, { size: 13, strokeWidth: 2.2, className: "block w-3.5 h-3.5 text-white shrink-0" }),
              text: personal.portfolio
            }
          )
        ] })
      ] }),
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "shrink-0 rounded-full p-1.5 bg-white/25 ring-2 ring-white/60", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-24 h-24 rounded-full object-cover border-2 border-white"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "px-8 py-6 space-y-6", children: [
      professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SectionTitle, { children: t("tmpl_profile") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "text-[13px] text-slate-700 leading-relaxed text-justify border-l-[3px] border-fuchsia-400 pl-3.5 italic", children: professionalSummary })
      ] }),
      experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SectionTitle, { children: t("tmpl_experience") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "space-y-5", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative pl-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "absolute left-0 top-1 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-violet-500 via-fuchsia-400 to-transparent" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-row items-baseline justify-between gap-2 flex-wrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-sm font-black text-violet-950", children: exp.role }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-[11px] font-bold text-white bg-fuchsia-600 rounded-full px-2.5 py-0.5 whitespace-nowrap", children: exp.period })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-xs font-bold text-fuchsia-700 uppercase tracking-wide", children: exp.company }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "mt-1.5 space-y-1 text-xs text-slate-700 leading-relaxed", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-fuchsia-500 font-black shrink-0 mt-0.5", children: "\u25B8" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-justify", children: bullet })
          ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-fuchsia-500 font-black shrink-0 mt-0.5", children: "\u25B8" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: t("tmpl_default_bullet_modern") })
          ] }) })
        ] }, exp.id || idx)) })
      ] }),
      (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SectionTitle, { children: t("tmpl_skills_tools") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-wrap gap-1.5", children: [
          (skills || []).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "span",
            {
              className: "text-[11px] font-bold text-violet-900 bg-violet-100 border border-violet-300 rounded-full px-2.5 py-1",
              children: s
            },
            `sk-${i}`
          )),
          (tools || []).map((toolName, i) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "span",
            {
              className: "text-[11px] font-bold text-rose-900 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-1",
              children: toolName
            },
            `tl-${i}`
          ))
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "grid grid-cols-2 gap-6", children: [
        education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SectionTitle, { children: t("tmpl_education_short") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "space-y-2.5", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-black text-violet-950 block leading-snug", children: edu.course }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-slate-600", children: edu.institution }),
            edu.status && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-slate-500 block text-[10px]", children: translateEduStatus(edu.status, t) }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-fuchsia-700 font-bold text-[10px]", children: [
              edu.startYear,
              " \u2014 ",
              edu.endYear
            ] })
          ] }, edu.id || idx)) })
        ] }),
        courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SectionTitle, { children: t("tmpl_courses_short") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "space-y-2.5", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-black text-violet-950 block leading-snug", children: course.name }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-slate-600", children: [
              course.institution,
              course.hours ? ` (${course.hours})` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-fuchsia-700 font-bold text-[10px] block", children: course.year })
          ] }, course.id || idx)) })
        ] })
      ] })
    ] })
  ] });
};

// src/components/templates/ElegantSerifTemplate.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
var ElegantSerifTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  const contactLine = [
    personal.cityState,
    personal.phone,
    personal.email,
    personal.linkedin,
    personal.portfolio
  ].filter(Boolean).join("   \u25C6   ");
  const SectionTitle = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "mb-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { className: "text-center text-[12px] font-bold uppercase tracking-[0.3em] text-stone-800", children }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center justify-center gap-1 mt-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "h-px w-16 bg-gradient-to-r from-transparent to-amber-600/70" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "w-1.5 h-1.5 rotate-45 bg-amber-600 shrink-0" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "h-px w-16 bg-gradient-to-l from-transparent to-amber-600/70" })
    ] })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "w-full text-stone-800 font-serif leading-relaxed select-text bg-white px-10 py-9 border-[3px] border-double border-amber-700/40", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("header", { className: "text-center pb-5 mb-6 border-b border-stone-300", children: [
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-amber-700/50 shadow-sm"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h1", { className: "text-[30px] font-bold uppercase tracking-[0.28em] text-stone-900 leading-tight break-words", children: personal.fullName }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-[13px] italic text-amber-800 mt-2 tracking-wide", children: targetRole }),
      contactLine && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-[11px] text-stone-600 mt-3 tracking-wide leading-snug break-words", children: contactLine })
    ] }),
    professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SectionTitle, { children: t("tmpl_qualifications") }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-[13px] text-stone-700 leading-relaxed text-justify indent-6", children: professionalSummary })
    ] }),
    experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SectionTitle, { children: t("tmpl_experience") }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-5", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-[14px] font-bold text-stone-900 uppercase tracking-wider", children: exp.role }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "block text-[12px] italic text-stone-700 mt-0.5", children: [
            exp.company,
            " \xB7 ",
            exp.period
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("ul", { className: "mt-2 space-y-1.5 text-[12.5px] text-stone-700 leading-relaxed px-4", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("li", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-amber-700 shrink-0 mt-0.5", children: "\u25C6" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-justify", children: bullet })
        ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("li", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-amber-700 shrink-0 mt-0.5", children: "\u25C6" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: t("tmpl_default_bullet_exec") })
        ] }) })
      ] }, exp.id || idx)) })
    ] }),
    (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SectionTitle, { children: t("tmpl_skills") }),
      skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "text-[12.5px] text-stone-700 text-center leading-loose", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "font-bold uppercase tracking-widest text-[11px] text-stone-900", children: [
          t("tmpl_skills_main"),
          " \u2014",
          " "
        ] }),
        skills.join("  \xB7  ")
      ] }),
      tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "text-[12.5px] text-stone-700 text-center leading-loose mt-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "font-bold uppercase tracking-widest text-[11px] text-stone-900", children: [
          t("tmpl_tools_soft"),
          " \u2014",
          " "
        ] }),
        tools.join("  \xB7  ")
      ] })
    ] }),
    education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SectionTitle, { children: t("tmpl_education") }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-2.5", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "text-center text-[12.5px]", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "font-bold text-stone-900", children: edu.course }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "block italic text-stone-600", children: [
          edu.institution,
          edu.status ? ` \u2014 ${translateEduStatus(edu.status, t)}` : "",
          " (",
          edu.startYear,
          " \u2014 ",
          edu.endYear,
          ")"
        ] })
      ] }, edu.id || idx)) })
    ] }),
    courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SectionTitle, { children: t("tmpl_courses") }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-1.5 text-center text-[12px] text-stone-700", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "font-bold text-stone-900", children: course.name }),
        course.institution ? ` \xB7 ${course.institution}` : "",
        course.hours ? ` (${course.hours})` : "",
        course.year ? ` \u2014 ${course.year}` : ""
      ] }, course.id || idx)) })
    ] })
  ] });
};

// src/components/templates/TimelineTechTemplate.tsx
var import_lucide_react8 = require("lucide-react");
var import_jsx_runtime11 = require("react/jsx-runtime");
var TimelineTechTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  const SectionTitle = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("h2", { className: "flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 mb-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "inline-block w-2 h-2 rounded-full bg-teal-500 ring-2 ring-teal-200 shrink-0" }),
    children
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "w-full text-slate-800 font-sans leading-normal select-text bg-white", children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("header", { className: "bg-slate-900 px-8 py-6 text-slate-100", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex flex-row items-center justify-between gap-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h1", { className: "text-[26px] font-black tracking-tight text-white break-words", children: personal.fullName }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-[13px] font-bold uppercase tracking-[0.18em] text-teal-400 mt-0.5", children: targetRole }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300 pt-2 font-medium", children: [
          personal.cityState && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react8.MapPin, { size: 12, strokeWidth: 2, className: "block w-3 h-3 text-teal-400 shrink-0" }),
              text: personal.cityState
            }
          ),
          personal.phone && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react8.Phone, { size: 12, strokeWidth: 2, className: "block w-3 h-3 text-teal-400 shrink-0" }),
              text: personal.phone
            }
          ),
          personal.email && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react8.Mail, { size: 12, strokeWidth: 2, className: "block w-3 h-3 text-teal-400 shrink-0" }),
              text: personal.email,
              href: `mailto:${personal.email}`
            }
          ),
          personal.linkedin && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react8.Linkedin, { size: 12, strokeWidth: 2, className: "block w-3 h-3 text-teal-400 shrink-0" }),
              text: personal.linkedin
            }
          ),
          personal.portfolio && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            ContactItem,
            {
              icon: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react8.Globe, { size: 12, strokeWidth: 2, className: "block w-3 h-3 text-teal-400 shrink-0" }),
              text: personal.portfolio
            }
          )
        ] })
      ] }),
      personal.hasPhoto && personal.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "img",
        {
          src: personal.photoUrl,
          alt: personal.fullName,
          crossOrigin: "anonymous",
          className: "w-20 h-20 rounded-lg object-cover border-2 border-teal-500/60 shrink-0"
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "px-8 py-6 space-y-6", children: [
      professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SectionTitle, { children: t("tmpl_summary") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-[13px] text-slate-700 leading-relaxed text-justify", children: professionalSummary })
      ] }),
      experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SectionTitle, { children: t("tmpl_trajectory") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("ol", { className: "relative border-l-2 border-teal-200 ml-[7px] space-y-6", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("li", { className: "pl-6 relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            "span",
            {
              className: `absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${exp.isCurrent ? "border-teal-500" : "border-slate-300"}`,
              children: exp.isCurrent && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "block w-full h-full rounded-full bg-teal-500/70 scale-[0.55]" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "inline-block font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 mb-1", children: exp.period }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h3", { className: "text-sm font-extrabold text-slate-900 leading-snug", children: exp.role }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-xs font-semibold text-teal-700 mb-1.5", children: exp.company }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("ul", { className: "space-y-1 text-xs text-slate-700 leading-relaxed", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-teal-500 font-mono font-bold shrink-0 mt-0.5", children: "\u203A" }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-justify", children: bullet })
          ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-teal-500 font-mono font-bold shrink-0 mt-0.5", children: "\u203A" }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("tmpl_default_bullet_ats") })
          ] }) })
        ] }, exp.id || idx)) })
      ] }),
      (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SectionTitle, { children: t("tmpl_skills_tools") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "grid grid-cols-2 gap-3 text-xs", children: [
          skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "rounded-lg border border-slate-200 bg-slate-50 p-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "font-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold block mb-1", children: [
              "// ",
              t("tmpl_skills_main")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-slate-700 leading-relaxed", children: skills.join(", ") })
          ] }),
          tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "rounded-lg border border-slate-200 bg-slate-50 p-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "font-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold block mb-1", children: [
              "// ",
              t("tmpl_tools_soft")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-slate-700 leading-relaxed", children: tools.join(", ") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "grid grid-cols-2 gap-6", children: [
        education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SectionTitle, { children: t("tmpl_education_short") }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "space-y-2.5 text-xs", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "font-bold text-slate-900 block", children: edu.course }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-slate-600", children: edu.institution }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "font-mono text-[10px] text-teal-700 block", children: [
              edu.startYear,
              "\u2014",
              edu.endYear,
              edu.status ? ` \xB7 ${translateEduStatus(edu.status, t)}` : ""
            ] })
          ] }, edu.id || idx)) })
        ] }),
        courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SectionTitle, { children: t("tmpl_courses_short") }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "space-y-2.5 text-xs", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "font-bold text-slate-900 block", children: course.name }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "text-slate-600", children: [
              course.institution,
              course.hours ? ` (${course.hours})` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "font-mono text-[10px] text-teal-700 block", children: course.year })
          ] }, course.id || idx)) })
        ] })
      ] })
    ] })
  ] });
};

// src/components/templates/InternationalTemplate.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var InternationalTemplate = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses
}) => {
  const { t } = useLanguage();
  const SectionTitle = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("h2", { className: "text-[12px] font-black uppercase tracking-[0.16em] text-[#1e3a5f] border-b-[3px] border-[#1e3a5f] pb-1 mb-3", children });
  const contactRows = [
    [t("tmpl_contact_location"), personal.cityState],
    ["Email:", personal.email],
    ["Phone:", personal.phone],
    ["LinkedIn:", personal.linkedin],
    ["Portfolio:", personal.portfolio]
  ].filter((row) => !!row[1]);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "w-full text-slate-800 font-sans leading-normal select-text bg-white px-9 py-8", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("header", { className: "flex items-stretch gap-4 pb-5 mb-6 border-b border-slate-200", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "w-1.5 rounded-full bg-[#1e3a5f] shrink-0" }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("h1", { className: "text-[30px] font-black tracking-tight text-[#1e3a5f] leading-none break-words", children: personal.fullName }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "text-sm font-semibold text-slate-600 mt-1.5", children: targetRole }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "grid grid-cols-2 gap-x-6 gap-y-0.5 mt-3 text-[11px] text-slate-700", children: contactRows.map(([label, value], i) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "truncate", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "font-bold text-[#1e3a5f]", children: [
            label,
            " "
          ] }),
          value
        ] }, i)) })
      ] })
    ] }),
    professionalSummary && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SectionTitle, { children: t("tmpl_summary") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "text-xs text-slate-700 leading-relaxed text-justify", children: professionalSummary })
    ] }),
    experiences && experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SectionTitle, { children: t("tmpl_experience") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "space-y-4", children: experiences.map((exp, idx) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "border-l-2 border-slate-200 pl-3.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-baseline justify-between gap-2 flex-wrap", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-[13px] font-extrabold text-[#1e3a5f]", children: exp.role }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-[11px] font-bold text-slate-500 whitespace-nowrap", children: exp.period })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-xs font-semibold italic text-slate-600", children: exp.company }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("ul", { className: "mt-1 space-y-1 text-xs text-slate-700 leading-relaxed", children: exp.bullets && exp.bullets.length > 0 ? exp.bullets.map((bullet, bIdx) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-[#1e3a5f] font-bold shrink-0 mt-0.5", children: "-" }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-justify", children: bullet })
        ] }, bIdx)) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-[#1e3a5f] font-bold shrink-0 mt-0.5", children: "-" }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: t("tmpl_default_bullet_corp") })
        ] }) })
      ] }, exp.id || idx)) })
    ] }),
    (skills && skills.length > 0 || tools && tools.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SectionTitle, { children: t("tmpl_skills") }),
      skills && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("p", { className: "text-xs text-slate-700 leading-relaxed mb-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "font-bold text-[#1e3a5f]", children: [
          t("tmpl_skills_label"),
          " "
        ] }),
        skills.join(", ")
      ] }),
      tools && tools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("p", { className: "text-xs text-slate-700 leading-relaxed", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "font-bold text-[#1e3a5f]", children: [
          t("tmpl_tools_label"),
          " "
        ] }),
        tools.join(", ")
      ] })
    ] }),
    education && education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("section", { className: "mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SectionTitle, { children: t("tmpl_education") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "space-y-2", children: education.map((edu, idx) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-baseline justify-between gap-2 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "min-w-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "font-bold text-[#1e3a5f]", children: edu.course }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "text-slate-600", children: [
            " ",
            "\u2014 ",
            edu.institution,
            edu.status ? ` (${translateEduStatus(edu.status, t)})` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "text-slate-500 font-semibold whitespace-nowrap", children: [
          edu.startYear,
          " \u2013 ",
          edu.endYear
        ] })
      ] }, edu.id || idx)) })
    ] }),
    courses && courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SectionTitle, { children: t("tmpl_courses") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "space-y-1 text-xs text-slate-700", children: courses.map((course, idx) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-baseline justify-between gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "font-bold text-[#1e3a5f]", children: course.name }),
          course.institution ? ` \u2014 ${course.institution}` : "",
          course.hours ? ` (${course.hours})` : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "text-slate-500 font-semibold whitespace-nowrap", children: course.year })
      ] }, course.id || idx)) })
    ] })
  ] });
};

// api/generate-pdf.ts
var cachedBaseStyles = null;
function getBaseStyles() {
  if (cachedBaseStyles) return cachedBaseStyles;
  const styleChunks = [];
  try {
    const assetsDir = import_path.default.join(process.cwd(), "dist", "assets");
    if (import_fs.default.existsSync(assetsDir)) {
      const files = import_fs.default.readdirSync(assetsDir);
      for (const file of files) {
        if (file.endsWith(".css")) {
          styleChunks.push(import_fs.default.readFileSync(import_path.default.join(assetsDir, file), "utf-8"));
        }
      }
    }
  } catch (err) {
  }
  try {
    const indexCssPath = import_path.default.join(process.cwd(), "src", "index.css");
    if (import_fs.default.existsSync(indexCssPath)) {
      styleChunks.push(import_fs.default.readFileSync(indexCssPath, "utf-8"));
    }
  } catch (err) {
  }
  cachedBaseStyles = styleChunks.join("\n");
  return cachedBaseStyles;
}
function getStyles(template = "liquid-modern") {
  const baseCss = getBaseStyles();
  const isImpact = template === "impact";
  const a4PrintFixes = `
    @page {
      size: A4 portrait;
      margin: ${isImpact ? "0" : "12mm"};
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
      overflow-wrap: anywhere !important;
      word-break: normal;
    }
    p, span, a, h1, h2, h3, h4, li, div {
      overflow-wrap: anywhere !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background: ${isImpact ? "linear-gradient(to right, #0f172a 0mm, #0f172a 67.2mm, #ffffff 67.2mm, #ffffff 210mm) !important" : "#ffffff !important"};
      color: #0f172a !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    #resume-document, .resume-paper {
      position: relative !important;
      z-index: 1 !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      transform: none !important;
      overflow: visible !important;
      background: transparent !important;
      color: #0f172a !important;
      box-sizing: border-box !important;
      height: auto !important;
      min-height: 0 !important;
    }
    /* Regras can\xF4nicas para a tabela de impress\xE3o do template Impact */
    table.impact-print-table {
      width: 210mm !important;
      max-width: 210mm !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
    }

    colgroup col.impact-col-sidebar {
      width: 67.2mm !important;
    }
    colgroup col.impact-col-main {
      width: 142.8mm !important;
    }

    /* Spacers de margem de 12mm no topo (thead) e base (tfoot) de cada p\xE1gina */
    thead.impact-print-spacer,
    tfoot.impact-print-spacer {
      height: 12mm !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }

    thead.impact-print-spacer th,
    tfoot.impact-print-spacer td {
      height: 12mm !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      font-size: 0 !important;
      line-height: 0 !important;
    }

    thead.impact-print-spacer th.impact-sidebar-spacer,
    tfoot.impact-print-spacer td.impact-sidebar-spacer {
      width: 67.2mm !important;
      min-width: 67.2mm !important;
      max-width: 67.2mm !important;
      background: transparent !important;
      border: none !important;
    }

    thead.impact-print-spacer th.impact-main-spacer,
    tfoot.impact-print-spacer td.impact-main-spacer {
      width: 142.8mm !important;
      min-width: 142.8mm !important;
      max-width: 142.8mm !important;
      background: transparent !important;
      border: none !important;
    }

    /* C\xE9lulas do conte\xFAdo no tbody */
    tbody td.impact-sidebar-cell {
      width: 67.2mm !important;
      min-width: 67.2mm !important;
      max-width: 67.2mm !important;
      padding: 0 5mm 0 12mm !important;
      vertical-align: top !important;
      border: none !important;
      background: transparent !important;
      color: #f1f5f9 !important;
      box-sizing: border-box !important;
    }

    tbody td.impact-main-cell {
      width: 142.8mm !important;
      min-width: 142.8mm !important;
      max-width: 142.8mm !important;
      padding: 0 12mm 0 8mm !important;
      vertical-align: top !important;
      border: none !important;
      background: transparent !important;
      color: #0f172a !important;
      box-sizing: border-box !important;
    }

    tbody td.impact-main-cell * {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    section {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }
    h1, h2, h3, h4, .section-header {
      break-after: avoid !important;
      page-break-after: avoid !important;
      break-inside: avoid !important;
    }
    .space-y-4 > div,
    .experience-item,
    .experience-card,
    .break-inside-avoid {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 0.85rem !important;
    }
    li,
    ul > li,
    .contact-item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  `;
  return `${baseCss}
${a4PrintFixes}`;
}
function sanitizeFilename(fullName) {
  if (!fullName || typeof fullName !== "string") return "Curriculo";
  const clean = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").trim();
  return clean ? `Curriculo_${clean}` : "Curriculo";
}
async function generatePdfHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9todo n\xE3o permitido. Use POST." });
  }
  const startTime = Date.now();
  const { resume, template = "liquid-modern", language = "pt" } = req.body || {};
  if (!resume || typeof resume !== "object") {
    return res.status(400).json({
      error: "Dados do curr\xEDculo inv\xE1lidos ou n\xE3o fornecidos."
    });
  }
  const safeFilename = sanitizeFilename(resume.personal?.fullName);
  const selectedLang = ["pt", "en", "es", "fr"].includes(language) ? language : "pt";
  let TemplateComponent = LiquidModernTemplate;
  let templateClass = "p-0 font-sans";
  switch (template) {
    case "executive-clean":
      TemplateComponent = ExecutiveClassicTemplate;
      templateClass = "p-0 font-serif";
      break;
    case "ats-professional":
      TemplateComponent = AtsProfessionalTemplate;
      templateClass = "p-0 font-sans";
      break;
    case "impact":
      TemplateComponent = ImpactTemplate;
      templateClass = "p-0 font-sans";
      break;
    case "corporate-premium":
      TemplateComponent = CorporatePremiumTemplate;
      templateClass = "p-0 font-sans";
      break;
    case "minimalist":
      TemplateComponent = MinimalistAtsTemplate;
      templateClass = "p-0 font-sans";
      break;
    case "creative-color":
      TemplateComponent = CreativeColorTemplate;
      templateClass = "p-0 font-sans";
      break;
    case "elegant-serif":
      TemplateComponent = ElegantSerifTemplate;
      templateClass = "p-0 font-serif";
      break;
    case "timeline-tech":
      TemplateComponent = TimelineTechTemplate;
      templateClass = "p-0 font-sans";
      break;
    case "international":
      TemplateComponent = InternationalTemplate;
      templateClass = "p-0 font-sans";
      break;
    case "liquid-modern":
    default:
      TemplateComponent = LiquidModernTemplate;
      templateClass = "p-0 font-sans";
      break;
  }
  let resumeMarkup = "";
  try {
    resumeMarkup = (0, import_server.renderToStaticMarkup)(
      import_react2.default.createElement(
        LanguageProvider,
        { defaultLanguage: selectedLang },
        import_react2.default.createElement(
          "div",
          {
            id: "resume-document",
            className: `resume-paper select-none bg-white text-slate-900 ${templateClass}`
          },
          import_react2.default.createElement(TemplateComponent, {
            personal: resume.personal || {},
            targetRole: resume.targetRole || "",
            professionalSummary: resume.professionalSummary || "",
            experiences: resume.experiences || [],
            education: resume.education || [],
            skills: resume.skills || [],
            tools: resume.tools || [],
            courses: resume.courses || []
          })
        )
      )
    );
  } catch (renderErr) {
    console.error("[PDF Generation] Erro na renderiza\xE7\xE3o do template React:", renderErr?.message);
    return res.status(500).json({
      error: "Erro interno ao renderizar a estrutura do curr\xEDculo.",
      details: renderErr?.message
    });
  }
  const css = getStyles(template);
  const fullHtml = `<!DOCTYPE html>
<html lang="${selectedLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeFilename}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
  <style>
    ${css}
  </style>
</head>
<body class="bg-white text-slate-900 m-0 p-0">
  ${resumeMarkup}
</body>
</html>`;
  let browser = null;
  let context = null;
  let page = null;
  try {
    try {
      browser = await import_playwright.chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--font-render-hinting=none"
        ]
      });
    } catch (launchErr) {
      if (launchErr?.message?.includes("Executable doesn't exist")) {
        console.warn("[PDF Generation] Chromium n\xE3o encontrado. Tentando instalar automaticamente via Playwright...");
        try {
          const { execSync } = await import("child_process");
          execSync("npx playwright install chromium", { stdio: "inherit" });
          browser = await import_playwright.chromium.launch({
            headless: true,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--font-render-hinting=none"
            ]
          });
        } catch (installErr) {
          console.error("[PDF Generation] Falha ao instalar Chromium sob demanda:", installErr?.message);
          throw launchErr;
        }
      } else {
        throw launchErr;
      }
    }
    context = await browser.newContext({
      viewport: { width: 794, height: 1123 },
      // 96 DPI A4 (794x1123 px)
      deviceScaleFactor: 2
    });
    page = await context.newPage();
    await page.setContent(fullHtml, { waitUntil: "load", timeout: 2e4 });
    await page.evaluate(async () => {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }
    });
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return img.decode ? img.decode().catch(() => {
            }) : Promise.resolve();
          }
          return new Promise((resolve) => {
            img.onload = () => img.decode ? img.decode().then(resolve).catch(resolve) : resolve();
            img.onerror = () => resolve();
          });
        })
      );
    });
    if (template === "impact") {
      await page.evaluate(() => {
        const layout = document.querySelector(".impact-resume-layout");
        const sidebar = document.querySelector(".impact-resume-sidebar");
        const content = document.querySelector(".impact-resume-content");
        if (!layout || !sidebar || !content) return;
        const table = document.createElement("table");
        table.className = "impact-print-table";
        table.innerHTML = `
          <colgroup>
            <col class="impact-col-sidebar" />
            <col class="impact-col-main" />
          </colgroup>
          <thead class="impact-print-spacer">
            <tr>
              <th class="impact-sidebar-spacer"></th>
              <th class="impact-main-spacer"></th>
            </tr>
          </thead>
          <tfoot class="impact-print-spacer">
            <tr>
              <td class="impact-sidebar-spacer"></td>
              <td class="impact-main-spacer"></td>
            </tr>
          </tfoot>
          <tbody>
            <tr>
              <td class="impact-sidebar-cell"></td>
              <td class="impact-main-cell"></td>
            </tr>
          </tbody>
        `;
        const sidebarCell = table.querySelector(".impact-sidebar-cell");
        const mainCell = table.querySelector(".impact-main-cell");
        while (sidebar.firstChild) {
          sidebarCell.appendChild(sidebar.firstChild);
        }
        while (content.firstChild) {
          mainCell.appendChild(content.firstChild);
        }
        layout.parentNode?.replaceChild(table, layout);
      });
      await page.evaluate(() => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }));
    }
    const isImpact = template === "impact";
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: isImpact ? {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm"
      } : {
        top: "12mm",
        bottom: "12mm",
        left: "12mm",
        right: "12mm"
      }
    });
    const duration = Date.now() - startTime;
    console.log(`[PDF Generation] Sucesso: ${safeFilename}.pdf gerado (${pdfBuffer.length} bytes em ${duration}ms)`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (playwrightErr) {
    console.error("[PDF Generation] Erro no Chromium headless/Playwright:", playwrightErr?.message);
    const isMissingDeps = playwrightErr?.message?.includes("Host system is missing dependencies") || playwrightErr?.message?.includes("error while loading shared libraries") || playwrightErr?.message?.includes("Executable doesn't exist");
    return res.status(500).json({
      error: "Falha na inicializa\xE7\xE3o do Chromium headless no servidor.",
      details: playwrightErr?.message,
      environmentHelp: isMissingDeps ? 'O Chromium n\xE3o foi encontrado ou est\xE1 sem depend\xEAncias. Execute "npx playwright install chromium" para baixar o navegador no ambiente.' : void 0
    });
  } finally {
    if (page) await page.close().catch(() => {
    });
    if (context) await context.close().catch(() => {
    });
    if (browser) await browser.close().catch(() => {
    });
  }
}

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = process.env.NODE_ENV === "production" ? Number(process.env.PORT) || 3e3 : 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
app.use(import_express.default.static(import_path2.default.join(process.cwd(), "public")));
app.get("/api/health", (req, res) => {
  const isConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "" && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    app: "CURR\xCA - Corra atr\xE1s da vaga certa",
    geminiConfigured: isConfigured
  });
});
var RATE_WINDOW_MS = 15 * 60 * 1e3;
var RATE_MAX_PER_IP = 8;
var ipHits = /* @__PURE__ */ new Map();
function rateLimitByIp(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  if (entry.count >= RATE_MAX_PER_IP) {
    const waitMin = Math.ceil((entry.resetAt - now) / 6e4);
    return res.status(429).json({
      error: `Muitas requisi\xE7\xF5es. Tente novamente em ${waitMin} minuto(s).`
    });
  }
  entry.count++;
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipHits.entries()) {
    if (now > entry.resetAt) ipHits.delete(ip);
  }
}, RATE_WINDOW_MS);
var DAILY_BUDGET = 500;
var dailyCalls = 0;
var dailyResetAt = (/* @__PURE__ */ new Date()).setHours(24, 0, 0, 0);
function dailyBudgetGuard(req, res, next) {
  const now = Date.now();
  if (now > dailyResetAt) {
    dailyCalls = 0;
    dailyResetAt = (/* @__PURE__ */ new Date()).setHours(24, 0, 0, 0);
  }
  if (dailyCalls >= DAILY_BUDGET) {
    return res.status(429).json({
      error: "Limite di\xE1rio de gera\xE7\xE3o de curr\xEDculos atingido. Tente novamente amanh\xE3."
    });
  }
  dailyCalls++;
  next();
}
var aiGuards = [rateLimitByIp, dailyBudgetGuard];
app.all("/api/ai/analyze-job", ...aiGuards, handler2);
app.all("/api/analyze-job", ...aiGuards, handler2);
app.all("/api/ai/optimize-resume", ...aiGuards, handler);
app.all("/api/optimize-resume", ...aiGuards, handler);
app.post("/api/generate-pdf", generatePdfHandler);
app.get(/^\/(pt|en|es|fr)$/, (req, res) => {
  const search = req.url.slice(req.path.length);
  res.redirect(301, `${req.path}/${search}`);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      const isStaticFile = req.path.match(/\.(png|ico|jpg|jpeg|svg|xml|txt|json)$/) || req.path.includes("favicon");
      if (isStaticFile) {
        return res.status(404).type("text/plain").send("Not Found");
      }
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CURR\xCA server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
