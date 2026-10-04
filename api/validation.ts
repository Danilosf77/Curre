type Rule = (value: unknown) => boolean;
const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const text: Rule = v => typeof v === 'string' && v.length <= 12000;
const boolean: Rule = v => typeof v === 'boolean';
const list = (rule: Rule): Rule => v => Array.isArray(v) && v.length <= 100 && v.every(rule);
const shape = (rules: Record<string, Rule>): Rule => v => object(v) && Object.entries(rules).every(([k, rule]) => v[k] === undefined || rule(v[k]));
const strings = list(text);
const language: Rule = v => typeof v === 'string' && ['pt', 'en', 'es', 'fr'].includes(v);
const personal = shape({ fullName: text, cityState: text, phone: text, email: text, linkedin: text, portfolio: text, photoUrl: v => typeof v === 'string' && v.length <= 2_000_000, hasPhoto: boolean });
const experience = shape({ id: text, company: text, role: text, startDate: text, endDate: text, isCurrent: boolean, activitiesRaw: text, resultsRaw: text, period: text, bullets: strings });
const education = list(shape({ id: text, course: text, institution: text, startYear: text, endYear: text, status: text }));
const courses = list(shape({ id: text, name: text, institution: text, year: text, hours: text }));
const jobAnalysis = shape({ roleIdentified: text, mainRequirements: strings, desiredSkills: strings, toolsAndTech: strings, experienceRequired: text, keywords: strings, matchPercentage: v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100, foundSkills: strings, relevantExperiences: strings, compatibleEducation: strings, improvements: strings });
const resume = shape({ personal, targetRole: text, professionalSummary: text, experiences: list(experience), education, skills: strings, tools: strings, courses, jobAnalysis });

export function validatePayload(kind: 'analysis' | 'optimization' | 'pdf', body: unknown): boolean {
  if (!object(body)) return false;
  if (kind === 'analysis') return typeof body.jobDescription === 'string' && !!body.jobDescription.trim() && shape({ jobDescription: text, candidateRole: text, candidateSkills: strings, candidateTools: strings, candidateExperiences: list(experience), language })(body);
  if (kind === 'optimization') return shape({ personal, targetJob: shape({ roleTitle: text, briefGoal: text, jobDescription: text }), experiences: list(experience), education, skills: strings, tools: strings, courses, jobAnalysis, language })(body);
  return object(body.resume) && resume(body.resume) && shape({ language, template: v => typeof v === 'string' && ['liquid-modern', 'executive-clean', 'ats-professional', 'impact', 'corporate-premium', 'minimalist', 'creative-color', 'elegant-serif', 'timeline-tech', 'international'].includes(v) })(body) && (!body.resume.personal?.photoUrl || isSafePhoto(body.resume.personal.photoUrl));
}

export function isSafePhoto(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 2_000_000) return false;
  // Uploaded photos only: never let Chromium fetch a caller-supplied URL.
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) return false;
  const bytes = Buffer.from(match[2], 'base64');
  if (match[1] === 'png') return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (match[1] === 'jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
}

export function validateAiAnalysis(value: unknown): boolean {
  return object(value) && jobAnalysis(value) && ['roleIdentified', 'experienceRequired'].every(k => typeof value[k] === 'string') && ['mainRequirements','desiredSkills','toolsAndTech','keywords','foundSkills','relevantExperiences','compatibleEducation','improvements'].every(k => strings(value[k])) && typeof value.matchPercentage === 'number';
}

export function validateAiResume(value: unknown): boolean {
  return object(value) && typeof value.targetRole === 'string' && typeof value.professionalSummary === 'string' && resume(value) && Array.isArray(value.experiences) && value.experiences.every((e: any) => typeof e.id === 'string' && typeof e.company === 'string' && typeof e.role === 'string' && strings(e.bullets)) && strings(value.skills) && strings(value.tools);
}

export const payloadGuard = (kind: 'analysis' | 'optimization' | 'pdf') => (req: any, res: any, next: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  if (!validatePayload(kind, req.body)) return res.status(400).json({ error: 'Dados inválidos. Verifique os campos enviados.' });
  next();
};
