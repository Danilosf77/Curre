import React, { useState } from 'react';
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

const COMMON_ROLE_SUGGESTIONS = [
  'Analista Administrativo',
  'Assistente Financeiro',
  'Recepcionista / Atendente',
  'Vendedor de Loja',
  'Auxiliar de Logística',
  'Analista de Suporte Técnico',
  'Assistente de Recursos Humanos',
  'Desenvolvedor Web',
  'Designer Gráfico',
  'Operador de Caixa',
];

const COMMON_COMPETENCIES = [
  'Comunicação assertiva',
  'Trabalho em equipe',
  'Organização',
  'Atendimento ao cliente',
  'Liderança',
  'Gestão de documentos',
  'Análise de dados',
  'Resolução de problemas',
  'Gestão de tempo',
  'Proatividade',
  'Negociação',
  'Pontualidade',
];

const COMMON_TOOLS = [
  'Excel / Planilhas',
  'Pacote Office',
  'Power BI',
  'TOTVS',
  'SAP',
  'Canva',
  'Google Workspace',
  'Trello / Jira',
  'Sistemas ERP',
  'WhatsApp Business',
];

// Formata o telefone no padrão estrito: (xx) 9 xxxx-xxxx
const formatPhoneBR = (value: string): string => {
  let clean = value.replace(/\D/g, '');
  if (clean.startsWith('55') && clean.length > 11) {
    clean = clean.slice(2);
  }
  const digits = clean.slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 3) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

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
    setPersonal({
      fullName: 'Carlos Eduardo Mendes',
      cityState: 'São Paulo, SP',
      phone: '(11) 9 8765-4321',
      email: 'carlos.mendes@email.com',
      linkedin: 'linkedin.com/in/carloseduardo',
      portfolio: '',
      photoUrl: '',
      hasPhoto: false,
    });
    setTargetJob({
      roleTitle: 'Analista Administrativo',
      briefGoal:
        'Busco uma vaga como Analista Administrativo para organizar fluxos de rotinas, faturamento e atendimento a fornecedores, trazendo eficiência e processos organizados para a equipe.',
      jobDescription: `Vaga: Analista Administrativo Pleno
Responsabilidades:
- Gestão e conferência de notas fiscais e relatórios gerenciais
- Controle de contas a pagar e suporte a auditorias internas
- Relacionamento com fornecedores e clientes
- Uso constante de planilhas de Excel avançado e sistemas ERP

Requisitos:
- Ensino superior completo ou cursando em Administração, Contabilidade ou áreas afins
- Domínio de Excel (fórmulas, tabelas dinâmicas)
- Boa comunicação interpessoal e organização`,
    });
    setExperiences([
      {
        id: 'exp-sample-1',
        company: 'Distribuidora Nova Era',
        role: 'Assistente Administrativo',
        startDate: '03/2022',
        endDate: '',
        isCurrent: true,
        activitiesRaw:
          'Emitia notas fiscais, conferia relatórios diários de vendas, organizava arquivos e planilhas e atendia fornecedores por e-mail e telefone.',
        resultsRaw:
          'Diminuiu o tempo de conferência de notas em 30% após padronizar as planilhas do setor.',
      },
      {
        id: 'exp-sample-2',
        company: 'Comércio Silva & Santos',
        role: 'Auxiliar de Escritório',
        startDate: '02/2019',
        endDate: '11/2021',
        isCurrent: false,
        activitiesRaw:
          'Atendimento presencial e telefônico, controle de estoque básico, preenchimento de recibos e suporte geral ao financeiro.',
        resultsRaw:
          'Mantive o controle de insumos 100% em dia sem faltas de material durante o período.',
      },
    ]);
    setEducation([
      {
        id: 'edu-sample-1',
        course: 'Administração de Empresas',
        institution: 'Universidade Paulista',
        startYear: '2019',
        endYear: '2023',
        status: 'Concluído',
      },
    ]);
    setSelectedSkills([
      'Comunicação assertiva',
      'Organização',
      'Trabalho em equipe',
      'Gestão de documentos',
      'Atendimento ao cliente',
    ]);
    setSelectedTools(['Excel / Planilhas', 'Pacote Office', 'TOTVS', 'Google Workspace']);
    setCourses([
      {
        id: 'course-sample-1',
        name: 'Excel Intermediário e Fórmulas de Gestão',
        institution: 'SENAC',
        year: '2022',
        hours: '40h',
      },
    ]);
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
      setJobAnalysisError('Cole a descrição da vaga no campo acima para analisar.');
      return;
    }

    setIsAnalyzingJob(true);
    setJobAnalysisError(null);

    try {
      const response = await fetch('/api/ai/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: targetJob.jobDescription,
          candidateRole: targetJob.roleTitle,
          candidateSkills: selectedSkills,
          candidateTools: selectedTools,
          candidateExperiences: experiences,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const result: JobAnalysisResult = await response.json();
      setJobAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setJobAnalysisError('Não foi possível analisar a vaga agora. Você pode continuar mesmo assim.');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Step Titles
  const stepTitles = [
    'Dados Pessoais',
    'Objetivo Profissional',
    'Experiência Profissional',
    'Formação Acadêmica',
    'Competências & Ferramentas',
    'Cursos & Certificações',
    'Alinhamento com a Vaga',
    'Revisão e Geração',
  ];

  // =========================================================================
  // VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS
  // =========================================================================
  const isNameValid = (name: string) => name.trim().length >= 3;
  const isCityValid = (city: string) => city.trim().length >= 2;
  const isPhoneValid = (phone: string) => phone.replace(/\D/g, '').length >= 10;
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
        if (!isNameValid(personal.fullName)) missing.push('Nome Completo');
        if (!isCityValid(personal.cityState)) missing.push('Cidade/Estado');
        if (!isPhoneValid(personal.phone)) missing.push('Telefone/WhatsApp');
        if (!isEmailValid(personal.email)) missing.push('E-mail válido');
        return missing.length > 0 ? `Preencha: ${missing.join(', ')}` : '';
      }
      case 2:
        return !isStep2Valid() ? 'Preencha o Cargo Almejado' : '';
      case 3:
        return !isStep3Valid()
          ? 'Preencha Empresa, Cargo e Atividades, ou marque "Em busca do primeiro emprego"'
          : '';
      case 4:
        return !isStep4Valid()
          ? 'Preencha Curso e Instituição de ensino'
          : '';
      case 5:
        return !isStep5Valid()
          ? 'Selecione pelo menos 1 competência ou ferramenta'
          : '';
      case 6:
        return !isStep6Valid()
          ? 'Preencha os cursos adicionados ou remova itens em branco'
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-20">
      {/* Top Bar with Step Count & Pre-fill Shortcut */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <button
          onClick={handlePrev}
          id="wizard-btn-back-top"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/80 cursor-pointer transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Voltar ao início' : 'Etapa anterior'}</span>
        </button>

        <div className="flex items-center gap-2">
          {hasReachedReview && currentStep < 8 && (
            <button
              onClick={handleJumpToReview}
              id="wizard-btn-skip-to-review-top"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-lg border border-sky-300 transition-all cursor-pointer shadow-sm"
              title="Salvar alterações e voltar diretamente à Etapa 8 de Revisão e Geração"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Ir para Revisão (Etapa 8)</span>
            </button>
          )}

          <button
            onClick={handleLoadSample}
            id="wizard-btn-fill-sample"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50/90 hover:bg-sky-100/80 px-3 py-1.5 rounded-lg border border-sky-200/70 transition-all"
            title="Preenche dados de exemplo para testar rapidamente"
          >
            <Wand2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Preencher exemplo</span>
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
              Etapa {currentStep} de 8
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {stepTitles[currentStep - 1]}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {Math.round((currentStep / 8) * 100)}%
          </span>
        </div>

        {/* Visual progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
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
              <h3 className="text-xl font-bold text-slate-900 mb-1">Seus Dados de Contato</h3>
              <p className="text-xs text-slate-500">
                Informações que o recrutador usará para te chamar para a entrevista. Não pedimos CPF ou documentos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Nome Completo <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Maria Eduarda Ferreira"
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
                    <span>Informe seu nome e sobrenome (mínimo 3 caracteres).</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Cidade / Estado <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: São Paulo, SP"
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
                    <span>Informe sua cidade e estado (ex: São Paulo, SP).</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Telefone / WhatsApp <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Padrão: (xx) 9 xxxx-xxxx</span>
                </label>
                <input
                  type="tel"
                  placeholder="(xx) 9 xxxx-xxxx"
                  maxLength={17}
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: formatPhoneBR(e.target.value) })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/90 text-sm focus:outline-none focus:ring-2 transition-all ${
                    showErrors && !isPhoneValid(personal.phone)
                      ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-sky-500'
                  }`}
                />
                {showErrors && !isPhoneValid(personal.phone) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>Informe um telefone ou WhatsApp completo no formato (xx) 9 xxxx-xxxx.</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    E-mail profissional <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                </label>
                <input
                  type="email"
                  placeholder="ex: seuemail@gmail.com"
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
                    <span>Informe um endereço de e-mail válido.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  LinkedIn (opcional)
                </label>
                <input
                  type="text"
                  placeholder="ex: linkedin.com/in/seunome"
                  value={personal.linkedin}
                  onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Portfólio / Site (opcional)
                </label>
                <input
                  type="text"
                  placeholder="ex: meutrabalho.com ou github.com/user"
                  value={personal.portfolio}
                  onChange={(e) => setPersonal({ ...personal, portfolio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Optional Photo Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={personal.hasPhoto}
                  onChange={(e) => setPersonal({ ...personal, hasPhoto: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Quero adicionar uma foto no currículo
                </span>
                <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
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
                      <span>{personal.photoUrl ? 'Alterar foto' : 'Carregar imagem'}</span>
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dica: Use uma foto nítida e com boa iluminação.
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
              <h3 className="text-xl font-bold text-slate-900 mb-1">Qual cargo você está buscando?</h3>
              <p className="text-xs text-slate-500">
                O objetivo profissional ajuda o recrutador a identificar imediatamente onde você quer atuar.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>
                  Cargo Almejado <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
              </label>
              <input
                type="text"
                placeholder="Exemplo: Analista Administrativo"
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
                  <span>Informe o cargo almejado para direcionar seu currículo (ou escolha uma das sugestões abaixo).</span>
                </p>
              )}

              {/* Suggestions chips */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Sugestões populares (clique para aplicar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ROLE_SUGGESTIONS.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetJob({ ...targetJob, roleTitle: role })}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        targetJob.roleTitle === role
                          ? 'bg-sky-600 text-white border-sky-600 font-bold'
                          : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-sky-50 hover:text-sky-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Conte brevemente qual tipo de oportunidade você procura
              </label>
              <textarea
                rows={3}
                placeholder="Exemplo: Gostaria de trabalhar com rotinas administrativas, controle de notas ou atendimento ao cliente em uma empresa onde possa aprender e crescer."
                value={targetJob.briefGoal}
                onChange={(e) => setTargetJob({ ...targetJob, briefGoal: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {/* Friendly reassurance prompt */}
              <div className="mt-2.5 p-3 rounded-xl bg-sky-50/80 border border-sky-100 flex items-start gap-2.5 text-xs text-sky-900">
                <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Não sabe o que escrever?</strong> Não se preocupe. Escreva como você pensa com suas próprias palavras e a IA do CURRÊ transformará em um objetivo profissional formal e assertivo!
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
                  Vamos contar sua experiência profissional
                </h3>
                <p className="text-xs text-slate-500">
                  Adicione seus trabalhos anteriores ou atual. A IA organizará cronologicamente.
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
                  <span>+ ADICIONAR EXPERIÊNCIA</span>
                </button>
              )}
            </div>

            {/* First Job / No Experience Toggle */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-start sm:items-center justify-between gap-3">
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
                  <span className="text-xs font-bold text-slate-900 block">
                    Em busca do primeiro emprego / Sem experiência formal anterior
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Marque esta opção se você for estudante, jovem aprendiz ou estiver ingressando no mercado agora.
                  </span>
                </div>
              </label>
            </div>

            {noExperience ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50/40 border border-sky-200 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-sky-600 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-900">
                  Perfil Sem Experiência Formal Selecionado
                </h4>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Perfeito! O CURRÊ irá estruturar seu currículo com foco estratégico na sua <strong>Formação Acadêmica</strong>, <strong>Cursos & Certificações</strong> e <strong>Habilidades Práticas</strong>, destacando o seu potencial para os recrutadores.
                </p>
                <button
                  type="button"
                  onClick={() => setNoExperience(false)}
                  className="text-xs font-bold text-sky-700 underline hover:text-sky-900 pt-1 cursor-pointer"
                >
                  Prefiro preencher minhas experiências profissionais
                </button>
              </div>
            ) : (
              <>
                {/* Helper reassurance text */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Dica valiosa:</strong> Se você descrever suas atividades de maneira simples ou informal, nossa IA converterá para linguagem profissional corporativa, mantendo estritamente a verdade do que você fazia.
                  </p>
                </div>

                {showErrors && !isStep3Valid() && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      {experiences.length === 0
                        ? 'Adicione pelo menos 1 experiência profissional ou marque a opção de primeiro emprego acima.'
                        : 'Preencha o Nome da Empresa, Cargo e Atividades obrigatórias (*) de cada experiência listada.'}
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
                          Empresa #{index + 1}
                        </span>
                        {experiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remover
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>
                              Nome da Empresa <span className="text-rose-500">*</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                          </label>
                          <input
                            type="text"
                            placeholder="ex: Magazine Luiza, Padaria Central..."
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                            className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                              showErrors && !exp.company.trim()
                                ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                                : 'border-slate-200 focus:ring-sky-500'
                            }`}
                          />
                          {showErrors && !exp.company.trim() && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">Informe o nome da empresa.</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>
                              Cargo ocupado <span className="text-rose-500">*</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                          </label>
                          <input
                            type="text"
                            placeholder="ex: Assistente Administrativo, Vendedor..."
                            value={exp.role}
                            onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                            className={`w-full px-3.5 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                              showErrors && !exp.role.trim()
                                ? 'border-rose-400 ring-1 ring-rose-400 focus:ring-rose-500 bg-rose-50/20'
                                : 'border-slate-200 focus:ring-sky-500'
                            }`}
                          />
                          {showErrors && !exp.role.trim() && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">Informe o cargo ocupado.</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700">
                              Data de Início <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] text-slate-400 font-normal">Padrão: mm/aaaa (mês 01 a 12)</span>
                          </div>
                          <input
                            type="text"
                            placeholder="mm/aaaa (ex: 03/2020)"
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
                              {exp.startDate ? 'Data incompleta. Preencha mm/aaaa (ex: 03/2020).' : 'Informe a data de início (mm/aaaa).'}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700">
                              Data de Término {!exp.isCurrent && <span className="text-rose-500">*</span>}
                            </label>
                            <span className="text-[10px] text-slate-400 font-normal">Padrão: mm/aaaa (mês 01 a 12)</span>
                          </div>
                          <input
                            type="text"
                            placeholder={exp.isCurrent ? 'Atual' : 'mm/aaaa (ex: 11/2023)'}
                            maxLength={7}
                            disabled={exp.isCurrent}
                            value={exp.isCurrent ? 'Atual' : exp.endDate}
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
                              {exp.endDate ? 'Data incompleta. Preencha mm/aaaa (ex: 11/2023).' : 'Informe a data de término (ou marque abaixo "Trabalho atualmente").'}
                            </p>
                          )}
                          {showErrors && !exp.isCurrent && isValidMonthYear(exp.startDate) && isValidMonthYear(exp.endDate) && !isChronologicallyValid(exp.startDate, exp.endDate, false) && (
                            <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                              A data de término não pode ser anterior à data de início.
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
                            Trabalho atualmente nesta empresa
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>
                            Quais eram suas principais atividades? <span className="text-rose-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Conte com suas palavras. Ex: Cuidava de planilhas de gastos, atendia clientes no balcão e organizava estoque."
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
                            Descreva brevemente as atividades que você desempenhava.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Quais resultados ou responsabilidades você teve? (opcional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ex: Treinei dois novos funcionários, ajudei a bater a meta da loja, recebi elogios de clientes..."
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
                <h3 className="text-xl font-bold text-slate-900 mb-1">Formação Acadêmica</h3>
                <p className="text-xs text-slate-500">
                  Ensino médio, técnico, graduação ou pós-graduação.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                id="btn-add-education"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 cursor-pointer self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADICIONAR FORMAÇÃO</span>
              </button>
            </div>

            {showErrors && !isStep4Valid() && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {education.length === 0
                    ? 'Adicione pelo menos 1 formação acadêmica ou nível de escolaridade.'
                    : 'Preencha o Curso e a Instituição de ensino de cada formação listada.'}
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
                      Formação #{idx + 1}
                    </span>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>
                          Curso / Escolaridade <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Ensino Médio, Administração, Logística..."
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
                          Informe o curso ou escolaridade (ex: Ensino Médio).
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>
                          Instituição de Ensino <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Escola Estadual, ETEC, Estácio, USP..."
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
                          Informe o nome da escola ou faculdade.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ano de Início
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="ex: 2018"
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
                          Informe um ano válido com 4 dígitos (ex: 2018).
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ano de Conclusão (ou previsão)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="ex: 2022"
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
                          Informe um ano válido com 4 dígitos (ex: 2022).
                        </p>
                      )}
                      {showErrors &&
                        isValidYear(edu.startYear) &&
                        isValidYear(edu.endYear) &&
                        edu.startYear?.trim().length === 4 &&
                        edu.endYear?.trim().length === 4 &&
                        parseInt(edu.endYear, 10) < parseInt(edu.startYear, 10) && (
                          <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                            O ano de conclusão não pode ser anterior ao ano de início.
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Status da Formação
                    </label>
                    <div className="flex gap-2">
                      {(['Concluído', 'Em andamento', 'Trancado'] as const).map((status) => (
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
                          {status}
                        </button>
                      ))}
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
              <h3 className="text-xl font-bold text-slate-900 mb-1">Competências e Habilidades</h3>
              <p className="text-xs text-slate-500">
                Selecione as habilidades e ferramentas que você possui ou digite outras. Pelo menos uma é necessária.
              </p>
            </div>

            {showErrors && !isStep5Valid() && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Selecione pelo menos uma competência profissional ou ferramenta para o seu currículo.
                </span>
              </div>
            )}

            {/* General Competencies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Habilidades profissionais (clique para marcar):
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_COMPETENCIES.map((comp) => {
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
                  placeholder="Digitar outra competência (ex: Redação, Negociação...)"
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
                  Adicionar
                </button>
              </div>
            </div>

            {/* Tools / Software */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Quais ferramentas ou sistemas você domina?
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_TOOLS.map((tool) => {
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
                  placeholder="Digitar outro sistema ou software (ex: ERP Protheus, Figma, SQL...)"
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
                  Adicionar
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
                <h3 className="text-xl font-bold text-slate-900 mb-1">Cursos e Certificações</h3>
                <p className="text-xs text-slate-500">
                  Cursos livres, workshops, cursos online ou certificados técnicos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCourse}
                id="btn-add-course"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 cursor-pointer self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADICIONAR CURSO</span>
              </button>
            </div>

            {showErrors && !isStep6Valid() && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Preencha o Nome e a Instituição de cada curso adicionado ou remova o item em branco.
                </span>
              </div>
            )}

            {courses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Nenhum curso adicionado ainda.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Esta seção é opcional, mas ajuda a destacar seu interesse em aprender!
                </p>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="mt-3 text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  + Adicionar meu primeiro curso
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
                        Curso #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>
                            Nome do Curso <span className="text-rose-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ex: Excel do Básico ao Avançado, Atendimento ao Cliente..."
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
                            Informe o nome do curso.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>
                            Instituição <span className="text-rose-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ex: SENAC, Udemy, SEBRAE..."
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
                            Informe a instituição.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ano
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="ex: 2023"
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
                            Informe um ano com 4 dígitos (ex: 2023).
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Carga Horária (opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="ex: 40 horas"
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
                Diferencial Inteligente CURRÊ
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Quer deixar seu currículo ainda mais alinhado à vaga?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cole aqui a descrição da vaga. A IA vai analisar os requisitos e ajudar a destacar as experiências e competências mais relevantes do seu perfil.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Descrição ou requisitos da vaga (Copie e cole do LinkedIn, Gupy, WhatsApp...)
              </label>
              <textarea
                rows={6}
                placeholder="Exemplo:
Vaga: Analista Administrativo
Estamos em busca de profissional com experiência em faturamento, conferência de notas fiscais e relatórios no Excel. Desejável conhecimento em sistemas integrados (TOTVS ou SAP) e boa comunicação interpessoal."
                value={targetJob.jobDescription || ''}
                onChange={(e) => setTargetJob({ ...targetJob, jobDescription: e.target.value })}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-normal leading-relaxed"
              />
            </div>

            {/* Guarantee Callout */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Compromisso de Ética e Verdade:</strong> A IA NÃO inventa competências, experiências ou qualificações que você não possui. Ela apenas reorganiza e destaca suas informações reais com os termos que os recrutadores valorizam.
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
                <span>{isAnalyzingJob ? 'Analisando requisitos com IA...' : 'ANALISAR VAGA COM IA'}</span>
              </button>

              <span className="text-xs text-slate-400">
                (Se preferir, você pode pular esta etapa clicando em Próximo)
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
                      Análise de Vaga Concluída
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {jobAnalysis.roleIdentified || 'Cargo Mapeado'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Compatibilidade estimada</span>
                    <span className="text-xl font-extrabold text-sky-700">
                      {jobAnalysis.matchPercentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">
                      ✓ Competências encontradas no seu perfil:
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
                      Palavras-chave essenciais da vaga:
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
                      💡 Dicas da IA para este processo seletivo:
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
                Tudo pronto para a mágica!
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 mb-1">
                Confira suas informações
              </h3>
              <p className="text-xs text-slate-500">
                Você pode revisar cada seção abaixo antes de gerar seu currículo profissional com IA.
              </p>
            </div>

            {/* Section summaries with status badges */}
            {!isAllValid() && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-amber-900">
                    Atenção: Campos obrigatórios incompletos
                  </h5>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Para garantir que seu currículo passe nos filtros das empresas e tenha qualidade profissional, preencha os itens marcados como <strong>Pendente</strong> abaixo clicando em <strong>Editar</strong>.
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
                      Dados Pessoais
                    </h4>
                    {isStep1Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Preenchido
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pendente (*)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {personal.fullName || 'Nome pendente'} • {personal.cityState || 'Local pendente'} • {personal.phone || 'Telefone pendente'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
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
                      Cargo Almejado
                    </h4>
                    {isStep2Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Preenchido
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pendente (*)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {targetJob.roleTitle || 'Cargo não especificado'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
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
                      Experiências Profissionais
                    </h4>
                    {isStep3Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Preenchido
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pendente (*)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {noExperience
                      ? 'Opção "Em busca do primeiro emprego / sem experiência formal" ativada'
                      : `${experiences.filter((e) => e.company.trim() && e.role.trim()).length} empresa(s) informada(s)`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
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
                      Formação Acadêmica
                    </h4>
                    {isStep4Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Preenchido
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pendente (*)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {education.filter((e) => e.course.trim()).length} formação(ões) informada(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
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
                      Competências & Ferramentas
                    </h4>
                    {isStep5Valid() ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Preenchido
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pendente (*)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedSkills.length} competência(s) e {selectedTools.length} ferramenta(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
              </div>

              {/* Section 7 - Vaga */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileSearch className="w-4 h-4 text-sky-600" />
                      Alinhamento com Vaga
                    </h4>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      Opcional
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {targetJob.jobDescription?.trim()
                      ? 'Descrição da vaga fornecida (Alinhamento IA ativado)'
                      : 'Nenhuma vaga específica (Será gerado formato versátil)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(7)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
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
                <span>✨ GERAR MEU CURRÍCULO</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                {isAllValid()
                  ? 'Geração inteligente rápida e profissional • 100% gratuita sem cadastro obrigatório.'
                  : 'Preencha todos os campos obrigatórios acima para habilitar a geração.'}
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
            <span>Voltar</span>
          </button>

          {/* Helper hint for pending items */}
          <div className="order-1 sm:order-2 text-center">
            {!canProceed() && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                Preencha os campos obrigatórios (*) para avançar
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
                title="Salvar alterações e voltar diretamente à Etapa 8 de Revisão e Geração"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Ir para Revisão (Etapa 8)</span>
              </button>
            )}

            {currentStep < 8 ? (
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
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                id="wizard-btn-final-bottom"
                disabled={!isAllValid()}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  isAllValid()
                    ? 'liquid-glass-button text-white shadow-lg shadow-sky-500/30 cursor-pointer transform hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>GERAR MEU CURRÍCULO</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
