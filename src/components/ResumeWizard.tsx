import { trackEvent } from '../utils/analytics';
import { requestAi } from '../utils/aiRequests';
import React, { useState } from 'react';
import { keywordOverlapLabel } from '../utils/resultLabels';
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  Target,
  FileSearch,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertCircle,
  HelpCircle,
  Wand2,
  Check,
  Edit3,
} from 'lucide-react';
import {
  PersonalData,
  TargetJob,
  ExperienceItem,
  EducationItem,
  CourseItem,
  JobAnalysisResult,
  WizardStep,
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { getPhoneConfig } from '../utils/phoneFormatters';
import {
  COMMON_ROLE_SUGGESTIONS_BY_LANG,
  COMMON_COMPETENCIES_BY_LANG,
  COMMON_TOOLS_BY_LANG,
  SAMPLE_RESUME_BY_LANG,
} from '../data/suggestions';

interface ResumeWizardProps {
  initialStep?: WizardStep;
  initialData?: {
    personal: PersonalData;
    targetJob: TargetJob;
    experiences: ExperienceItem[];
    education: EducationItem[];
    skills: string[];
    tools: string[];
    courses: CourseItem[];
    jobAnalysis?: JobAnalysisResult;
  } | null;
  onGenerateResume: (data: {
    personal: PersonalData;
    targetJob: TargetJob;
    experiences: ExperienceItem[];
    education: EducationItem[];
    skills: string[];
    tools: string[];
    courses: CourseItem[];
    jobAnalysis?: JobAnalysisResult;
  }) => void;
  onCancel: () => void;
}

// Formata data no padrão estrito: mm/aaaa (Mês estritamente entre 01 e 12)
const formatMonthYear = (value: string, prevValue?: string): string => {
  if (!value) return '';

  // Se o usuário digitou barra após 1 dígito (ex: '3/' ou '1/'), normaliza com zero à esquerda
  if (/^[0-9]\//.test(value)) {
    const single = value[0];
    if (single === '0') {
      value = '01/' + value.slice(2);
    } else {
      value = '0' + single + '/' + value.slice(2);
    }
  }

  // Extrai apenas os dígitos
  const clean = value.replace(/\D/g, '');
  if (!clean) return '';

  // Caso 1: Usuário digitou apenas 1 dígito
  if (clean.length === 1) {
    const d1 = clean[0];
    // Se digitou '0' ou '1', pode ser o início de 01-09 ou 10-12
    if (d1 === '0' || d1 === '1') {
      return d1;
    }
    // De '2' a '9', não existe mês 20 a 99. Converte automaticamente em '02/' até '09/'
    return `0${d1}/`;
  }

  // Caso 2: 2 ou mais dígitos
  let monthStr = '';
  let yearDigits = '';

  const firstDigit = clean[0];
  if (firstDigit >= '2' && firstDigit <= '9') {
    // Começou com 2..9 (ex: digitou 5 e depois o ano, ou colou "52023")
    monthStr = `0${firstDigit}`;
    yearDigits = clean.slice(1, 5);
  } else {
    // Começou com '0' ou '1'
    const m1 = clean[0];
    let m2 = clean[1];

    if (m1 === '0') {
      // Mês '00' é estritamente proibido (apenas 01 até 12)
      if (m2 === '0') {
        if (clean.length === 2 && (!prevValue || prevValue === '0')) {
          return '0';
        }
        m2 = '1';
      }
      monthStr = `0${m2}`;
    } else {
      // m1 === '1': meses permitidos são apenas 10, 11 e 12
      // Se m2 for maior que 2 (ex: 13, 14, 15, ..., 19), limita estritamente ao teto de 12
      if (parseInt(m2, 10) > 2) {
        m2 = '2';
      }
      monthStr = `1${m2}`;
    }

    yearDigits = clean.slice(2, 6);
  }

  // Se ainda não foram informados dígitos do ano
  if (!yearDigits) {
    // Se o usuário estava em 'MM/' e pressionou Backspace para apagar a barra
    if (prevValue && prevValue.endsWith('/') && !value.endsWith('/') && clean.length === 2) {
      return monthStr;
    }
    return `${monthStr}/`;
  }

  return `${monthStr}/${yearDigits}`;
};

// Formata ano estritamente com até 4 dígitos numéricos (ex: 2024)
export const formatYear = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 4);
};

// Valida se a data no formato mm/aaaa está 100% completa, com mês válido (01 a 12) e ano plausível
export const isValidMonthYear = (val: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  const match = trimmed.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
  if (!match) return false;
  const year = parseInt(match[2], 10);
  const currentYear = new Date().getFullYear();
  return year >= 1960 && year <= currentYear + 1;
};

// Valida se a data de término é igual ou posterior à data de início
export const isChronologicallyValid = (startDate: string, endDate: string, isCurrent?: boolean): boolean => {
  if (isCurrent) {
    return isValidMonthYear(startDate);
  }
  if (!isValidMonthYear(startDate) || !isValidMonthYear(endDate)) {
    return false;
  }
  const [startM, startY] = startDate.split('/').map(Number);
  const [endM, endY] = endDate.split('/').map(Number);
  const startTotal = startY * 12 + startM;
  const endTotal = endY * 12 + endM;
  return endTotal >= startTotal;
};

// Valida ano com 4 dígitos (opcional, mas se digitado deve ser válido)
export const isValidYear = (val: string): boolean => {
  if (!val || !val.trim()) return true;
  const match = val.trim().match(/^\d{4}$/);
  if (!match) return false;
  const year = parseInt(match[0], 10);
  const currentYear = new Date().getFullYear();
  return year >= 1950 && year <= currentYear + 10;
};

export const ResumeWizard: React.FC<ResumeWizardProps> = ({
  initialStep = 1,
  initialData,
  onGenerateResume,
  onCancel,
}) => {
  const { language, t } = useLanguage();
  const roleSuggestions = COMMON_ROLE_SUGGESTIONS_BY_LANG[language] || COMMON_ROLE_SUGGESTIONS_BY_LANG.pt;
  const competencySuggestions = COMMON_COMPETENCIES_BY_LANG[language] || COMMON_COMPETENCIES_BY_LANG.pt;
  const toolSuggestions = COMMON_TOOLS_BY_LANG[language] || COMMON_TOOLS_BY_LANG.pt;
  const phoneConfig = getPhoneConfig(language);
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [hasReachedReview, setHasReachedReview] = useState<boolean>(initialStep === 8);

  // Step 1: Personal Data
  const [personal, setPersonal] = useState<PersonalData>(() => initialData?.personal || {
    fullName: '',
    cityState: '',
    phone: '',
    email: '',
    linkedin: '',
    portfolio: '',
    photoUrl: '',
    hasPhoto: false,
  });

  // Step 2: Target Job
  const [targetJob, setTargetJob] = useState<TargetJob>(() => initialData?.targetJob || {
    roleTitle: '',
    briefGoal: '',
    jobDescription: '',
  });

  // Step 3: Experience
  const [experiences, setExperiences] = useState<ExperienceItem[]>(() =>
    initialData?.experiences && initialData.experiences.length > 0
      ? initialData.experiences
      : [
          {
            id: 'exp-1',
            company: '',
            role: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            activitiesRaw: '',
            resultsRaw: '',
          },
        ]
  );

  // Step 4: Education
  const [education, setEducation] = useState<EducationItem[]>(() =>
    initialData?.education && initialData.education.length > 0
      ? initialData.education
      : [
          {
            id: 'edu-1',
            course: '',
            institution: '',
            startYear: '',
            endYear: '',
            status: 'Concluído',
          },
        ]
  );

  // Step 5: Skills & Tools
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() =>
    initialData?.skills && initialData.skills.length > 0
      ? initialData.skills
      : [
          'Comunicação assertiva',
          'Organização',
          'Trabalho em equipe',
        ]
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [selectedTools, setSelectedTools] = useState<string[]>(() =>
    initialData?.tools && initialData.tools.length > 0
      ? initialData.tools
      : [
          'Excel / Planilhas',
          'Pacote Office',
        ]
  );
  const [customToolInput, setCustomToolInput] = useState('');

  // Step 3: Experience option for first job or no formal experience
  const [noExperience, setNoExperience] = useState(false);

  // Validation feedback trigger
  const [showErrors, setShowErrors] = useState(false);

  // Step 6: Courses
  const [courses, setCourses] = useState<CourseItem[]>(() => initialData?.courses || []);

  // Step 7: Job Description & Live Analysis
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResult | undefined>(() => initialData?.jobAnalysis);
  const [jobAnalysisError, setJobAnalysisError] = useState<string | null>(null);

  // Sync when initialStep changes (e.g. clicking Edit in ResumePreview)
  React.useEffect(() => {
    if (initialStep) {
      setCurrentStep(initialStep);
      if (initialStep === 8) {
        setHasReachedReview(true);
      }
    }
  }, [initialStep]);

  // Sync when initialData changes
  React.useEffect(() => {
    if (initialData) {
      if (initialData.personal) setPersonal(initialData.personal);
      if (initialData.targetJob) setTargetJob(initialData.targetJob);
      if (initialData.experiences && initialData.experiences.length > 0) setExperiences(initialData.experiences);
      if (initialData.education && initialData.education.length > 0) setEducation(initialData.education);
      if (initialData.skills && initialData.skills.length > 0) setSelectedSkills(initialData.skills);
      if (initialData.tools && initialData.tools.length > 0) setSelectedTools(initialData.tools);
      if (initialData.courses) setCourses(initialData.courses);
      if (initialData.jobAnalysis) setJobAnalysis(initialData.jobAnalysis);
    }
  }, [initialData]);

  // Track review step visit
  React.useEffect(() => {
    if (currentStep === 8) {
      setHasReachedReview(true);
    }
  }, [currentStep]);

  // Helper to load sample data for rapid testing
  const handleLoadSample = () => {
    setShowErrors(false);
    setNoExperience(false);

    const currentSample = SAMPLE_RESUME_BY_LANG[language] || SAMPLE_RESUME_BY_LANG.pt;

    setPersonal({
      fullName: currentSample.personal.fullName,
      cityState: currentSample.personal.cityState,
      phone: currentSample.personal.phone,
      email: currentSample.personal.email,
      linkedin: currentSample.personal.linkedin || '',
      portfolio: currentSample.personal.portfolio || '',
      photoUrl: currentSample.personal.photoUrl || '',
      hasPhoto: !!currentSample.personal.hasPhoto,
    });
    setTargetJob({
      roleTitle: currentSample.targetJob.roleTitle,
      briefGoal: currentSample.targetJob.briefGoal,
      jobDescription: currentSample.targetJob.jobDescription,
    });
    setExperiences(currentSample.experiences.map((exp) => ({ ...exp })));
    setEducation(currentSample.education.map((edu) => ({ ...edu })));
    setSelectedSkills([...currentSample.skills]);
    setSelectedTools([...currentSample.tools]);
    setCourses(currentSample.courses.map((c) => ({ ...c })));
  };

  // Step 1 Photo Upload helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonal((prev) => ({
          ...prev,
          photoUrl: reader.result as string,
          hasPhoto: true,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        activitiesRaw: '',
        resultsRaw: '',
      },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    if (experiences.length === 1) return;
    setExperiences((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setExperiences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}`,
        course: '',
        institution: '',
        startYear: '',
        endYear: '',
        status: 'Concluído',
      },
    ]);
  };

  const handleRemoveEducation = (id: string) => {
    if (education.length === 1) return;
    setEducation((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setEducation((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Course handlers
  const handleAddCourse = () => {
    setCourses((prev) => [
      ...prev,
      {
        id: `course-${Date.now()}`,
        name: '',
        institution: '',
        year: '',
        hours: '',
      },
    ]);
  };

  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCourse = (id: string, field: keyof CourseItem, value: any) => {
    setCourses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Skills toggle
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills((prev) => [...prev, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  // Tools toggle
  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const addCustomTool = () => {
    if (customToolInput.trim() && !selectedTools.includes(customToolInput.trim())) {
      setSelectedTools((prev) => [...prev, customToolInput.trim()]);
      setCustomToolInput('');
    }
  };

  // AI Job analyzer handler
  const handleAnalyzeJobWithAI = async () => {
    if (!targetJob.jobDescription?.trim()) {
      setJobAnalysisError(t('step_7_err_paste_job'));
      return;
    }

    setIsAnalyzingJob(true);
    setJobAnalysisError(null);

    try {
      const result = await requestAi<JobAnalysisResult>('/api/ai/analyze-job', {
          jobDescription: targetJob.jobDescription,
          candidateRole: targetJob.roleTitle,
          candidateSkills: selectedSkills,
          candidateTools: selectedTools,
          candidateExperiences: experiences,
          language: language,
      }, undefined, data => data.analysisSource !== 'keyword-overlap');
      setJobAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setJobAnalysisError(t('step_7_err_fail'));
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Step Titles
  const stepTitles = [
    t('step_1_title'),
    t('step_2_title'),
    t('step_3_title'),
    t('step_4_title'),
    t('step_5_title'),
    t('step_6_title'),
    t('step_7_title'),
    t('step_8_title'),
  ];

  // =========================================================================
  // VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS
  // =========================================================================
  const isNameValid = (name: string) => name.trim().length >= 3;
  const isCityValid = (city: string) => city.trim().length >= 2;
  const isPhoneValid = (phone: string) => phoneConfig.isValid(phone);
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Step 1: Contato e dados pessoais essenciais
  const isStep1Valid = () =>
    isNameValid(personal.fullName) &&
    isCityValid(personal.cityState) &&
    isPhoneValid(personal.phone) &&
    isEmailValid(personal.email);

  // Step 2: Cargo almejado
  const isRoleValid = (role: string) => role.trim().length >= 2;
  const isStep2Valid = () => isRoleValid(targetJob.roleTitle);

  // Step 3: Experiência profissional (empresa, cargo, atividades, data início e data término/atual válidas)
  const isExpItemValid = (exp: ExperienceItem) => {
    const hasBasic =
      exp.company.trim().length > 0 &&
      exp.role.trim().length > 0 &&
      exp.activitiesRaw.trim().length > 0;
    if (!hasBasic) return false;

    // Data de início obrigatória no formato mm/aaaa
    if (!isValidMonthYear(exp.startDate)) return false;

    // Se é o emprego atual, término não é exigido
    if (exp.isCurrent) return true;

    // Se não é atual, término obrigatório no formato mm/aaaa e posterior ao início
    if (!isValidMonthYear(exp.endDate)) return false;

    return isChronologicallyValid(exp.startDate, exp.endDate, false);
  };

  const isStep3Valid = () => {
    if (noExperience) return true;
    if (experiences.length === 0) return false;
    return experiences.every(isExpItemValid);
  };

  // Step 4: Formação acadêmica (mínimo 1 formação com curso e instituição, e anos consistentes se informados)
  const isEduItemValid = (edu: EducationItem) => {
    const hasBasic = edu.course.trim().length > 0 && edu.institution.trim().length > 0;
    if (!hasBasic) return false;
    if (!isValidYear(edu.startYear) || !isValidYear(edu.endYear)) return false;
    if (edu.startYear?.trim().length === 4 && edu.endYear?.trim().length === 4) {
      if (parseInt(edu.endYear, 10) < parseInt(edu.startYear, 10)) return false;
    }
    return true;
  };

  const isStep4Valid = () => {
    if (education.length === 0) return false;
    return education.every(isEduItemValid);
  };

  // Step 5: Competências & Ferramentas (mínimo 1)
  const isStep5Valid = () => selectedSkills.length > 0 || selectedTools.length > 0;

  // Step 6: Cursos & Certificações (opcional, mas itens adicionados devem estar completos e com ano válido se informado)
  const isCourseItemValid = (course: CourseItem) => {
    const hasBasic = course.name.trim().length > 0 && course.institution.trim().length > 0;
    if (!hasBasic) return false;
    if (!isValidYear(course.year)) return false;
    return true;
  };

  const isStep6Valid = () => {
    if (courses.length === 0) return true;
    return courses.every(isCourseItemValid);
  };

  // Step 7: Alinhamento com a vaga (opcional)
  const isStep7Valid = () => true;

  // Validação global completa antes da geração do currículo
  const isAllValid = () =>
    isStep1Valid() &&
    isStep2Valid() &&
    isStep3Valid() &&
    isStep4Valid() &&
    isStep5Valid() &&
    isStep6Valid();

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      case 4:
        return isStep4Valid();
      case 5:
        return isStep5Valid();
      case 6:
        return isStep6Valid();
      case 7:
        return isStep7Valid();
      case 8:
        return isAllValid();
      default:
        return true;
    }
  };

  const getMissingFieldsSummary = () => {
    switch (currentStep) {
      case 1: {
        const missing: string[] = [];
        if (!isNameValid(personal.fullName)) missing.push(t('step_1_name_label'));
        if (!isCityValid(personal.cityState)) missing.push(t('step_1_city_label'));
        if (!isPhoneValid(personal.phone)) missing.push(t('step_1_phone_label'));
        if (!isEmailValid(personal.email)) missing.push(t('step_1_email_label'));
        return missing.length > 0 ? `${t('step_2_missing_error').split(' ')[0]}: ${missing.join(', ')}` : '';
      }
      case 2:
        return !isStep2Valid() ? t('step_2_missing_error') : '';
      case 3:
        return !isStep3Valid()
          ? t('step_3_missing_error')
          : '';
      case 4:
        return !isStep4Valid()
          ? t('step_4_missing_error')
          : '';
      case 5:
        return !isStep5Valid()
          ? t('step_5_missing_error')
          : '';
      case 6:
        return !isStep6Valid()
          ? t('step_6_missing_error')
          : '';
      default:
        return '';
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (currentStep < 8) {
      trackEvent('etapa_concluida', { etapa: currentStep, idioma: language });
      setCurrentStep((prev) => (prev + 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToReview = () => {
    if (!canProceed()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    trackEvent('etapa_concluida', { etapa: currentStep, idioma: language });
    setCurrentStep(8);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setShowErrors(false);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const handleFinalSubmit = () => {
    if (!isAllValid()) {
      setShowErrors(true);
      return;
    }
    const finalPersonal = {
      ...personal,
      fullName: personal.fullName.trim(),
      cityState: personal.cityState.trim(),
      phone: personal.phone.trim(),
      email: personal.email.trim(),
    };
    const finalTargetJob = {
      ...targetJob,
      roleTitle: targetJob.roleTitle.trim(),
    };
    const validExperiences = noExperience ? [] : experiences.filter(isExpItemValid);
    const validEducation = education.filter(isEduItemValid);
    const validCourses = courses.filter(isCourseItemValid);

    trackEvent('etapa_concluida', { etapa: 8, idioma: language });
    trackEvent('formulario_concluido', { idioma: language });
    onGenerateResume({
      personal: finalPersonal,
      targetJob: finalTargetJob,
      experiences: validExperiences,
      education: validEducation,
      skills: selectedSkills,
      tools: selectedTools,
      courses: validCourses,
      jobAnalysis,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-20">
      {/* Top Bar with Step Count & Pre-fill Shortcut */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <button
          onClick={handlePrev}
          id="wizard-btn-back-top"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 cursor-pointer transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? t('wiz_back_home') : t('wiz_prev_step')}</span>
        </button>

        <div className="flex items-center gap-2">
          {hasReachedReview && currentStep < 8 && (
            <button
              onClick={handleJumpToReview}
              id="wizard-btn-skip-to-review-top"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-200 bg-sky-100 dark:bg-sky-950/70 hover:bg-sky-200 dark:hover:bg-sky-900/70 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 transition-all cursor-pointer shadow-sm"
              title={t('wiz_jump_review')}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{t('wiz_jump_review')}</span>
            </button>
          )}

          <button
            onClick={handleLoadSample}
            id="wizard-btn-fill-sample"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50/90 dark:bg-sky-950/60 hover:bg-sky-100/80 dark:hover:bg-sky-900/60 px-3 py-1.5 rounded-lg border border-sky-200/70 dark:border-sky-800 transition-all cursor-pointer shadow-sm"
            title={t('wiz_fill_sample')}
          >
            <Wand2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{t('wiz_fill_sample')}</span>
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/70 px-2 py-0.5 rounded-md">
              {t('wiz_step_label')} {currentStep} {t('wiz_of_label')} 8
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {stepTitles[currentStep - 1]}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            {Math.round((currentStep / 8) * 100)}%
          </span>
        </div>

        {/* Visual progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-sky-500 to-cyan-500 h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Container */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/90">
        {/* =========================================================================
            ETAPA 1 — DADOS PESSOAIS
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('step_1_heading')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {t('step_1_sub')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                  <span>
                    {t('field_full_name')} <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">{t('label_required')}</span>
                </label>
                <input
                  type="text"
                  placeholder={t('field_name_placeholder')}
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/90 text-sm focus:outline-none focus:ring-2 transition-all ${
                    showErrors && !isNameValid(personal.fullName)
                      ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-sky-500'
                  }`}
                />
                {showErrors && !isNameValid(personal.fullName) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{t('field_name_error')}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                  <span>
                    {t('field_city_state')} <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">{t('label_required')}</span>
                </label>
                <input
                  type="text"
                  placeholder={t('field_city_placeholder')}
                  value={personal.cityState}
                  onChange={(e) => setPersonal({ ...personal, cityState: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/90 text-sm focus:outline-none focus:ring-2 transition-all ${
                    showErrors && !isCityValid(personal.cityState)
                      ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-sky-500'
                  }`}
                />
                {showErrors && !isCityValid(personal.cityState) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{t('field_city_error')}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                  <span>
                    {t('field_phone')} <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">{phoneConfig.formatLabel}</span>
                </label>
                <input
                  type="tel"
                  placeholder={phoneConfig.placeholder}
                  maxLength={phoneConfig.maxLength}
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: phoneConfig.format(e.target.value) })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/90 text-sm focus:outline-none focus:ring-2 transition-all ${
                    showErrors && !isPhoneValid(personal.phone)
                      ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-sky-500'
                  }`}
                />
                {showErrors && !isPhoneValid(personal.phone) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{phoneConfig.errorMessage}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                  <span>
                    {t('field_email')} <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">{t('label_required')}</span>
                </label>
                <input
                  type="email"
                  placeholder={t('field_email_placeholder')}
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/90 text-sm focus:outline-none focus:ring-2 transition-all ${
                    showErrors && !isEmailValid(personal.email)
                      ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-sky-500'
                  }`}
                />
                {showErrors && !isEmailValid(personal.email) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{t('field_email_error')}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  {t('field_linkedin')}
                </label>
                <input
                  type="text"
                  placeholder={t('field_linkedin_ph')}
                  value={personal.linkedin}
                  onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  {t('field_portfolio')}
                </label>
                <input
                  type="text"
                  placeholder={t('step_1_ph_portfolio')}
                  value={personal.portfolio}
                  onChange={(e) => setPersonal({ ...personal, portfolio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Optional Photo Toggle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={personal.hasPhoto}
                  onChange={(e) => setPersonal({ ...personal, hasPhoto: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {t('field_photo_toggle')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">({t('label_optional')})</span>
              </label>

              {personal.hasPhoto && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  {personal.photoUrl ? (
                    <img
                      src={personal.photoUrl}
                      alt="Foto do currículo"
                      className="w-20 h-20 rounded-full object-cover border-2 border-sky-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div className="text-center sm:text-left">
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{personal.photoUrl ? t('field_photo_change') : t('field_photo_upload')}</span>
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('field_photo_tip')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 2 — OBJETIVO PROFISSIONAL
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('step_2_heading')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {t('step_2_sub')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                <span>
                  {t('step_2_role_label')} <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">{t('label_required')}</span>
              </label>
              <input
                type="text"
                placeholder={t('step_2_role_placeholder')}
                value={targetJob.roleTitle}
                onChange={(e) => setTargetJob({ ...targetJob, roleTitle: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border bg-white/90 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                  showErrors && !isStep2Valid()
                    ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              />
              {showErrors && !isStep2Valid() && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                  <span>{t('step_2_role_error')}</span>
                </p>
              )}

              {/* Suggestions chips */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300 block mb-1.5">
                  {t('step_2_suggestions_label')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roleSuggestions.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetJob({ ...targetJob, roleTitle: role })}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        targetJob.roleTitle === role
                          ? 'bg-sky-600 text-white border-sky-600 font-bold'
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-700 dark:hover:text-sky-300'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                {t('step_2_goal_label')}
              </label>
              <textarea
                rows={3}
                placeholder={t('step_2_goal_placeholder')}
                value={targetJob.briefGoal}
                onChange={(e) => setTargetJob({ ...targetJob, briefGoal: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {/* Friendly reassurance prompt */}
              <div className="mt-2.5 p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 flex items-start gap-2.5 text-xs text-sky-900 dark:text-sky-200">
                <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t('step_2_ai_tip')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 3 — EXPERIÊNCIA PROFISSIONAL
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {t('step_3_heading')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('step_3_sub')}
                </p>
              </div>
              {!noExperience && (
                <button
                  type="button"
                  onClick={handleAddExperience}
                  id="btn-add-experience"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 cursor-pointer self-start sm:self-auto transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('step_3_add_btn')}</span>
                </button>
              )}
            </div>

            {/* First Job / No Experience Toggle */}
            <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-800/60 flex items-start sm:items-center justify-between gap-3">
              <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={noExperience}
                  onChange={(e) => {
                    setNoExperience(e.target.checked);
                    if (e.target.checked) setShowErrors(false);
                  }}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-0.5 sm:mt-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {t('step_3_no_exp_title')}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                    {t('step_3_no_exp_sub')}
                  </span>
                </div>
              </label>
            </div>

            {noExperience ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50/40 dark:from-sky-950/40 dark:to-slate-900 border border-sky-200 dark:border-sky-800 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-sky-600 dark:text-sky-400 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('step_3_no_exp_alert_title')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {t('step_3_no_exp_alert_desc')}
                </p>
                <button
                  type="button"
                  onClick={() => setNoExperience(false)}
                  className="text-xs font-bold text-sky-700 dark:text-sky-300 underline hover:text-sky-900 dark:hover:text-white pt-1 cursor-pointer"
                >
                  {t('step_3_no_exp_revert')}
                </button>
              </div>
            ) : (
              <>
                {/* Helper reassurance text */}
                <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-700/60 flex items-start gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-amber-950 dark:text-amber-200 leading-relaxed">
                    {t('step_3_ai_tip')}
                  </p>
                </div>

                {showErrors && !isStep3Valid() && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      {experiences.length === 0
                        ? t('step_3_err_add_one')
                        : t('step_3_missing_error')}
                    </span>
                  </div>
                )}

                {/* List of experiences */}
                <div className="space-y-5">
                  {experiences.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-4 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded">
                          {t('step_3_company_number')}{index + 1}
                        </span>
                        {experiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('label_remove')}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>
                              {t('step_3_company_label')} <span className="text-rose-500">*</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">{t('label_required')}</span>
                          </label>
                          <input
                            type="text"
                            placeholder={t('step_3_company_placeholder')}
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                            className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                              showErrors && !exp.company.trim()
                                ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                                : 'border-slate-200 focus:ring-sky-500'
                            }`}
                          />
                          {showErrors && !exp.company.trim() && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">{t('step_3_err_company')}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>
                              {t('step_3_role_label')} <span className="text-rose-500">*</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">{t('label_required')}</span>
                          </label>
                          <input
                            type="text"
                            placeholder={t('step_3_role_placeholder')}
                            value={exp.role}
                            onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                            className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                              showErrors && !exp.role.trim()
                                ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                                : 'border-slate-200 focus:ring-sky-500'
                            }`}
                          />
                          {showErrors && !exp.role.trim() && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">{t('step_3_err_role')}</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700">
                              {t('step_3_start_label')} <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] text-slate-400 font-normal">{t('step_3_pattern_hint')}</span>
                          </div>
                          <input
                            type="text"
                            placeholder={language === 'en' ? 'mm/yyyy (e.g. 03/2020)' : language === 'fr' ? 'mm/aaaa (ex : 03/2020)' : language === 'es' ? 'mm/aaaa (ej: 03/2020)' : 'mm/aaaa (ex: 03/2020)'}
                            maxLength={7}
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(exp.id, 'startDate', formatMonthYear(e.target.value, exp.startDate))}
                            className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                              showErrors && !isValidMonthYear(exp.startDate)
                                ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                                : 'border-slate-200 focus:ring-sky-500'
                            }`}
                          />
                          {showErrors && !isValidMonthYear(exp.startDate) && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                              {exp.startDate ? t('step_3_err_start_incomplete') : t('step_3_err_start_empty')}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700">
                              {t('step_3_end_label')} {!exp.isCurrent && <span className="text-rose-500">*</span>}
                            </label>
                            <span className="text-[10px] text-slate-400 font-normal">{t('step_3_pattern_hint')}</span>
                          </div>
                          <input
                            type="text"
                            placeholder={exp.isCurrent ? t('label_present') : (language === 'en' ? 'mm/yyyy (e.g. 11/2023)' : language === 'fr' ? 'mm/aaaa (ex : 11/2023)' : language === 'es' ? 'mm/aaaa (ej: 11/2023)' : 'mm/aaaa (ex: 11/2023)')}
                            maxLength={7}
                            disabled={exp.isCurrent}
                            value={exp.isCurrent ? t('label_present') : exp.endDate}
                            onChange={(e) => handleUpdateExperience(exp.id, 'endDate', formatMonthYear(e.target.value, exp.endDate))}
                            className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                              exp.isCurrent
                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
                                : showErrors && (!isValidMonthYear(exp.endDate) || !isChronologicallyValid(exp.startDate, exp.endDate, false))
                                ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                                : 'border-slate-200 focus:ring-sky-500'
                            }`}
                          />
                          {showErrors && !exp.isCurrent && !isValidMonthYear(exp.endDate) && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                              {exp.endDate ? t('step_3_err_end_incomplete') : t('step_3_err_end_empty')}
                            </p>
                          )}
                          {showErrors && !exp.isCurrent && isValidMonthYear(exp.startDate) && isValidMonthYear(exp.endDate) && !isChronologicallyValid(exp.startDate, exp.endDate, false) && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                              {t('step_3_err_end_before_start')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) => handleUpdateExperience(exp.id, 'isCurrent', e.target.checked)}
                            className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                          />
                          <span className="text-xs font-semibold text-slate-700">
                            {t('step_3_current_job')}
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>
                            {t('step_3_activities_label')} <span className="text-rose-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">{t('label_required')}</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder={t('step_3_activities_placeholder')}
                          value={exp.activitiesRaw}
                          onChange={(e) => handleUpdateExperience(exp.id, 'activitiesRaw', e.target.value)}
                          className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            showErrors && !exp.activitiesRaw.trim()
                              ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                              : 'border-slate-200 focus:ring-sky-500'
                          }`}
                        />
                        {showErrors && !exp.activitiesRaw.trim() && (
                          <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                            {t('step_3_err_activities')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t('step_3_results_label')}
                        </label>
                        <textarea
                          rows={2}
                          placeholder={t('step_3_results_placeholder')}
                          value={exp.resultsRaw}
                          onChange={(e) => handleUpdateExperience(exp.id, 'resultsRaw', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            ETAPA 4 — FORMAÇÃO ACADÊMICA
        ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{t('step_4_heading')}</h3>
                <p className="text-xs text-slate-500">
                  {t('step_4_sub')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                id="btn-add-education"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 cursor-pointer self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('step_4_add_btn')}</span>
              </button>
            </div>

            {showErrors && !isStep4Valid() && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {education.length === 0
                    ? t('step_4_err_add_one')
                    : t('step_4_missing_error')}
                </span>
              </div>
            )}

            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {t('step_4_formation_prefix')}{idx + 1}
                    </span>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('label_remove')}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>
                          {t('step_4_course_label')} <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">{t('label_required')}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={t('step_4_course_ph')}
                        value={edu.course}
                        onChange={(e) => handleUpdateEducation(edu.id, 'course', e.target.value)}
                        className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                          showErrors && !edu.course.trim()
                            ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-sky-500'
                        }`}
                      />
                      {showErrors && !edu.course.trim() && (
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                          {t('step_4_err_course')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>
                          {t('step_4_inst_label')} <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">{t('label_required')}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={t('step_4_inst_ph')}
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                        className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                          showErrors && !edu.institution.trim()
                            ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-sky-500'
                        }`}
                      />
                      {showErrors && !edu.institution.trim() && (
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                          {t('step_4_err_institution')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('step_4_start_year')}
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder={language === 'en' ? 'e.g. 2018' : language === 'fr' ? 'ex : 2018' : language === 'es' ? 'ej: 2018' : 'ex: 2018'}
                        value={edu.startYear}
                        onChange={(e) => handleUpdateEducation(edu.id, 'startYear', formatYear(e.target.value))}
                        className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                          showErrors && !isValidYear(edu.startYear)
                                ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-sky-500'
                        }`}
                      />
                      {showErrors && !isValidYear(edu.startYear) && (
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                          {t('step_4_err_start_year')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('step_4_end_year')}
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder={language === 'en' ? 'e.g. 2022' : language === 'fr' ? 'ex : 2022' : language === 'es' ? 'ej: 2022' : 'ex: 2022'}
                        value={edu.endYear}
                        onChange={(e) => handleUpdateEducation(edu.id, 'endYear', formatYear(e.target.value))}
                        className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                          showErrors &&
                          (!isValidYear(edu.endYear) ||
                            (edu.startYear?.trim().length === 4 &&
                              edu.endYear?.trim().length === 4 &&
                              parseInt(edu.endYear, 10) < parseInt(edu.startYear, 10)))
                            ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-slate-200 focus:ring-sky-500'
                        }`}
                      />
                      {showErrors && !isValidYear(edu.endYear) && (
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                          {t('step_4_err_end_year')}
                        </p>
                      )}
                      {showErrors &&
                        isValidYear(edu.startYear) &&
                        isValidYear(edu.endYear) &&
                        edu.startYear?.trim().length === 4 &&
                        edu.endYear?.trim().length === 4 &&
                        parseInt(edu.endYear, 10) < parseInt(edu.startYear, 10) && (
                          <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                            {t('step_4_err_end_before_start')}
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('step_4_status_label')}
                    </label>
                    <div className="flex gap-2">
                      {(['Concluído', 'Em andamento', 'Trancado'] as const).map((status) => {
                        const statusLabel =
                          status === 'Concluído'
                            ? t('step_4_status_completed')
                            : status === 'Em andamento'
                            ? t('step_4_status_in_progress')
                            : t('step_4_status_interrupted');
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleUpdateEducation(edu.id, 'status', status)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                              edu.status === status
                                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {statusLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 5 — COMPETÊNCIAS E FERRAMENTAS
        ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{t('step_5_heading')}</h3>
              <p className="text-xs text-slate-500">
                {t('step_5_sub')}
              </p>
            </div>

            {showErrors && !isStep5Valid() && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {t('step_5_err_select_one')}
                </span>
              </div>
            )}

            {/* General Competencies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('step_5_skills_title')}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {competencySuggestions.map((comp) => {
                  const isSelected = selectedSkills.includes(comp);
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => toggleSkill(comp)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-bold'
                          : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{comp}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add custom skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('step_5_skills_custom_ph')}
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
                >
                  {t('btn_add')}
                </button>
              </div>
            </div>

            {/* Tools / Software */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('step_5_tools_title')}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {toolSuggestions.map((tool) => {
                  const isSelected = selectedTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm font-bold'
                          : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-cyan-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{tool}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add custom tool */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('step_5_tools_custom_ph')}
                  value={customToolInput}
                  onChange={(e) => setCustomToolInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTool())}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={addCustomTool}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
                >
                  {t('btn_add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 6 — CURSOS E CERTIFICAÇÕES
        ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{t('step_6_heading')}</h3>
                <p className="text-xs text-slate-500">
                  {t('step_6_sub')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCourse}
                id="btn-add-course"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 cursor-pointer self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('step_6_add_btn')}</span>
              </button>
            </div>

            {showErrors && !isStep6Valid() && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {t('step_6_err_fill_all')}
                </span>
              </div>
            )}

            {courses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">{t('step_6_empty')}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t('step_6_empty_sub')}
                </p>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="mt-3 text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  {t('step_6_add_first')}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {courses.map((course, idx) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {t('step_6_course_prefix')}{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('label_remove')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>
                            {t('step_6_name_label')} <span className="text-rose-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">{t('label_required')}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'ex : Maîtrise avancée d\'Excel, Service client...' : language === 'en' ? 'e.g. Advanced Excel, Customer Service...' : language === 'es' ? 'ej: Excel Avanzado, Atención al Cliente...' : 'ex: Excel do Básico ao Avançado, Atendimento ao Cliente...'}
                          value={course.name}
                          onChange={(e) => handleUpdateCourse(course.id, 'name', e.target.value)}
                          className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            showErrors && !course.name.trim()
                              ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                              : 'border-slate-200 focus:ring-sky-500'
                          }`}
                        />
                        {showErrors && !course.name.trim() && (
                          <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                            {t('step_6_err_course_name')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>
                            {t('step_6_inst_label')} <span className="text-rose-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">{t('label_required')}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'ex : Coursera, Udemy, CNAM...' : language === 'en' ? 'e.g. Coursera, Udemy, edX...' : language === 'es' ? 'ej: Platzi, Coursera, Udemy...' : 'ex: SENAC, Udemy, SEBRAE...'}
                          value={course.institution}
                          onChange={(e) => handleUpdateCourse(course.id, 'institution', e.target.value)}
                          className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            showErrors && !course.institution.trim()
                              ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                              : 'border-slate-200 focus:ring-sky-500'
                          }`}
                        />
                        {showErrors && !course.institution.trim() && (
                          <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                            {t('step_6_err_institution')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t('step_6_year_label')}
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder={language === 'en' ? 'e.g. 2023' : language === 'fr' ? 'ex : 2023' : language === 'es' ? 'ej: 2023' : 'ex: 2023'}
                          value={course.year}
                          onChange={(e) => handleUpdateCourse(course.id, 'year', formatYear(e.target.value))}
                          className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            showErrors && !isValidYear(course.year)
                              ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                              : 'border-slate-200 focus:ring-sky-500'
                          }`}
                        />
                        {showErrors && !isValidYear(course.year) && (
                          <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                            {t('step_6_err_year')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t('step_6_hours_label')}
                        </label>
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'ex : 40 heures' : language === 'en' ? 'e.g. 40 hours' : language === 'es' ? 'ej: 40 horas' : 'ex: 40 horas'}
                          value={course.hours || ''}
                          onChange={(e) => handleUpdateCourse(course.id, 'hours', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ETAPA 7 — A VAGA (FUNÇÃO PRINCIPAL DE ALINHAMENTO)
        ========================================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                {t('step_7_tag')}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {t('step_7_heading')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('step_7_sub')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('step_7_desc_label')}
              </label>
              <textarea
                rows={6}
                placeholder={t('step_7_desc_ph')}
                value={targetJob.jobDescription || ''}
                onChange={(e) => setTargetJob({ ...targetJob, jobDescription: e.target.value })}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-normal leading-relaxed"
              />
            </div>

            {/* Guarantee Callout */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                {t('step_7_ethics_text')}
              </p>
            </div>

            {/* Analysis Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyzeJobWithAI}
                disabled={isAnalyzingJob || !targetJob.jobDescription?.trim()}
                id="btn-analyze-job-ai"
                className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isAnalyzingJob || !targetJob.jobDescription?.trim()
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'liquid-glass-button text-white shadow-md shadow-sky-500/30'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzingJob ? t('step_7_analyzing_btn') : t('step_7_analyze_btn')}</span>
              </button>

              <span className="text-xs text-slate-400">
                {t('step_7_skip_hint')}
              </span>
            </div>

            {jobAnalysisError && (
              <p className="text-xs text-rose-600 font-medium">{jobAnalysisError}</p>
            )}

            {/* Live AI Analysis Feedback card */}
            {jobAnalysis && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 via-cyan-50/50 to-white border border-sky-200 shadow-sm space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700">
                      {t('step_7_analysis_completed')}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {jobAnalysis.roleIdentified || t('step_7_mapped_role')}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">{jobAnalysis.analysisSource === 'keyword-overlap' ? keywordOverlapLabel(language) : t('step_7_estimated_match')}</span>
                    <span className="text-xl font-extrabold text-sky-700">
                      {jobAnalysis.matchPercentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">
                      {t('step_7_matched_skills')}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {jobAnalysis.foundSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block mb-1">
                      {t('step_7_essential_keywords')}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {jobAnalysis.keywords.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {jobAnalysis.improvements?.length > 0 && (
                  <div className="pt-2 border-t border-sky-100 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">
                      {t('step_7_ai_tips')}
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                      {jobAnalysis.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ETAPA 8 — GERAR CURRÍCULO (RESUMO & CONFIRMAÇÃO)
        ========================================================================= */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md">
                {t('step_8_tag')}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 mb-1">
                {t('step_8_heading')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('step_8_sub')}
              </p>
            </div>

            {/* Section summaries with status badges */}
            {!isAllValid() && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-amber-900">
                    {t('step_8_warning_title')}
                  </h5>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {t('step_8_warning_desc')}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Section 1 */}
              <div className={`p-4 rounded-2xl bg-white/90 border transition-all flex items-center justify-between gap-3 ${
                isStep1Valid() ? 'border-slate-200' : 'border-rose-300 bg-rose-50/30'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-sky-600" />
                      {t('step_1_title')}
                    </h4>
                    {isStep1Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t('step_8_status_completed')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {t('step_8_status_pending')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {personal.fullName || '—'} • {personal.cityState || '—'} • {personal.phone || '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('step_8_edit_btn')}
                </button>
              </div>

              {/* Section 2 */}
              <div className={`p-4 rounded-2xl bg-white/90 border transition-all flex items-center justify-between gap-3 ${
                isStep2Valid() ? 'border-slate-200' : 'border-rose-300 bg-rose-50/30'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-sky-600" />
                      {t('step_2_title')}
                    </h4>
                    {isStep2Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t('step_8_status_completed')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {t('step_8_status_pending')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {targetJob.roleTitle || '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('step_8_edit_btn')}
                </button>
              </div>

              {/* Section 3 */}
              <div className={`p-4 rounded-2xl bg-white/90 border transition-all flex items-center justify-between gap-3 ${
                isStep3Valid() ? 'border-slate-200' : 'border-rose-300 bg-rose-50/30'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-sky-600" />
                      {t('step_3_title')}
                    </h4>
                    {isStep3Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t('step_8_status_completed')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {t('step_8_status_pending')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {noExperience
                      ? t('step_3_no_exp_title')
                      : `${experiences.filter((e) => e.company.trim() && e.role.trim()).length} ${t('step_8_items_count')}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('step_8_edit_btn')}
                </button>
              </div>

              {/* Section 4 */}
              <div className={`p-4 rounded-2xl bg-white/90 border transition-all flex items-center justify-between gap-3 ${
                isStep4Valid() ? 'border-slate-200' : 'border-rose-300 bg-rose-50/30'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-sky-600" />
                      {t('step_4_title')}
                    </h4>
                    {isStep4Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t('step_8_status_completed')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {t('step_8_status_pending')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {education.filter((e) => e.course.trim()).length} {t('step_8_items_count')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('step_8_edit_btn')}
                </button>
              </div>

              {/* Section 5 */}
              <div className={`p-4 rounded-2xl bg-white/90 border transition-all flex items-center justify-between gap-3 ${
                isStep5Valid() ? 'border-slate-200' : 'border-rose-300 bg-rose-50/30'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      {t('step_5_title')}
                    </h4>
                    {isStep5Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t('step_8_status_completed')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {t('step_8_status_pending')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedSkills.length} + {selectedTools.length} {t('step_8_items_count')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('step_8_edit_btn')}
                </button>
              </div>

              {/* Section 7 - Vaga */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileSearch className="w-4 h-4 text-sky-600" />
                      {t('step_7_title')}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {t('label_optional')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {targetJob.jobDescription?.trim()
                      ? '✓'
                      : '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(7)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('step_8_edit_btn')}
                </button>
              </div>
            </div>

            {/* Big Action Submit Button */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleFinalSubmit}
                id="btn-generate-resume-final"
                disabled={!isAllValid()}
                className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-base font-extrabold transition-all flex items-center justify-center gap-3 mx-auto ${
                  isAllValid()
                    ? 'text-white liquid-glass-button shadow-xl shadow-sky-500/35 cursor-pointer transform hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${isAllValid() ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
                <span>{t('step_8_btn_generate')}</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                {isAllValid()
                  ? t('step_8_btn_sub')
                  : t('step_8_btn_sub_disabled')}
              </p>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            id="wizard-btn-prev"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 order-2 sm:order-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('wiz_back')}</span>
          </button>

          {/* Helper hint for pending items */}
          <div className="order-1 sm:order-2 text-center">
            {!canProceed() && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                {t('wiz_req_warning')}
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto order-3 flex flex-col sm:flex-row items-center gap-2">
            {hasReachedReview && currentStep < 8 && (
              <button
                type="button"
                onClick={handleJumpToReview}
                id="wizard-btn-skip-to-review-bottom"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 border border-sky-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                title={t('wiz_jump_review')}
              >
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>{t('wiz_jump_review')}</span>
              </button>
            )}

            {currentStep < 8 && (
              <button
                type="button"
                onClick={handleNext}
                id="wizard-btn-next"
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  canProceed()
                    ? 'liquid-glass-button text-white shadow-md shadow-sky-500/25'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300/80'
                }`}
              >
                <span>{t('wiz_next')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
