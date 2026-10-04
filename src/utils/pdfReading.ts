import type { OptimizedResume } from '../types';
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function checkPdfText(text: string, resume: OptimizedResume) {
  const extracted = normalize(text);
  const groups: Array<[string,string[]]> = [
    ['Nome', [resume.personal.fullName]], ['E-mail', [resume.personal.email]], ['Telefone', [resume.personal.phone]],
    ['Resumo', [resume.professionalSummary]],
    ['Experiências', resume.experiences.flatMap(e => [e.company,e.role,...e.bullets])],
    ['Formação', resume.education.flatMap(e => [e.course,e.institution])],
    ['Competências e ferramentas', [...resume.skills,...resume.tools]],
    ['Cursos', resume.courses.map(c => c.name)],
  ];
  return groups.map(([label, values]) => {
    const expected = values.filter(v => normalize(v || '').length > 0);
    return {label, status: expected.length === 0 ? 'empty' : expected.every(v => extracted.includes(normalize(v))) ? 'found' : 'missing'};
  });
}
