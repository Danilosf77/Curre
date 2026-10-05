export interface PersonalData {
  fullName: string;
  cityState: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio?: string;
  photoUrl?: string;
  hasPhoto: boolean;
}

export interface TargetJob {
  roleTitle: string;
  briefGoal: string;
  jobDescription?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string; // e.g., '03/2021' or '2021'
  endDate: string;
  isCurrent: boolean;
  activitiesRaw: string;
  resultsRaw: string;
  optimizedBullets?: string[];
}

export interface EducationItem {
  id: string;
  course: string;
  institution: string;
  startYear: string;
  endYear: string;
  status: 'Concluído' | 'Em andamento' | 'Trancado' | 'Terminé' | 'En cours' | 'Interrompu' | 'Completed' | 'In Progress' | 'Completado' | 'En curso' | string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'competencia' | 'ferramenta';
}

export interface CourseItem {
  id: string;
  name: string;
  institution: string;
  year: string;
  hours?: string;
}

export interface JobAnalysisResult {
  analysisSource?: 'ai' | 'keyword-overlap';
  roleIdentified: string;
  mainRequirements: string[];
  desiredSkills: string[];
  toolsAndTech: string[];
  experienceRequired: string;
  keywords: string[];
  matchPercentage: number;
  foundSkills: string[];
  relevantExperiences: string[];
  compatibleEducation: string[];
  improvements: string[];
}

export type TemplateStyle =
  | 'liquid-modern'
  | 'executive-clean'
  | 'ats-professional'
  | 'impact'
  | 'corporate-premium'
  | 'minimalist'
  | 'creative-color'
  | 'elegant-serif'
  | 'timeline-tech'
  | 'international'
  | 'global-classic'
  | 'executive-signature'
  | 'nordic'
  | 'editorial';

export interface OptimizedResume {
  sourceForm?: ResumeFormData;
  personal: PersonalData;
  targetRole: string;
  professionalSummary: string;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    period: string;
    isCurrent: boolean;
    bullets: string[];
  }>;
  education: EducationItem[];
  skills: string[];
  tools: string[];
  courses: CourseItem[];
  jobAnalysis?: JobAnalysisResult;
  templateStyle: TemplateStyle;
  language?: string;
  generatedAt: string;
  isAiGenerated?: boolean;
  apiError?: string;
}

export interface ResumeFormData {
  personal: PersonalData;
  targetJob: TargetJob;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  tools: string[];
  courses: CourseItem[];
  jobAnalysis?: JobAnalysisResult;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  createdAt: string;
  isAnonymous?: boolean;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
