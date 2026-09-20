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

export interface OptimizedResume {
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
  templateStyle: 'liquid-modern' | 'executive-clean' | 'minimalist';
  language?: string;
  generatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  createdAt: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
