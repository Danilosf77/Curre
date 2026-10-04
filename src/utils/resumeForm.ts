import type { OptimizedResume, ResumeFormData } from '../types';

export function retainResumeForm(data: ResumeFormData): ResumeFormData {
  // Photo already lives in the optimized resume; do not duplicate its base64 in Firestore.
  return { ...data, personal: { ...data.personal, photoUrl: undefined } };
}

export function restoreResumeForm(resume: OptimizedResume): ResumeFormData {
  if (resume.sourceForm) return { ...resume.sourceForm, personal: resume.personal };
  // Older saved resumes do not contain raw form data. Preserve their content.
  return {
    personal: resume.personal,
    targetJob: { roleTitle: resume.targetRole, briefGoal: resume.professionalSummary },
    experiences: resume.experiences.map(exp => {
      const [startDate = '', endDate = ''] = exp.period.split(/\s+[—–]\s+/);
      return { id: exp.id, company: exp.company, role: exp.role, startDate, endDate: exp.isCurrent ? '' : endDate, isCurrent: exp.isCurrent, activitiesRaw: exp.bullets.join('\n'), resultsRaw: '' };
    }),
    education: resume.education,
    skills: resume.skills,
    tools: resume.tools,
    courses: resume.courses,
    jobAnalysis: resume.jobAnalysis,
  };
}
