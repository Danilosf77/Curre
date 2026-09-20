import { Language } from '../i18n/LanguageContext';
import { PersonalData, TargetJob, ExperienceItem, EducationItem, CourseItem } from '../types';

export interface SampleResumeData {
  personal: PersonalData;
  targetJob: TargetJob;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  tools: string[];
  courses: CourseItem[];
}

export const COMMON_ROLE_SUGGESTIONS_BY_LANG: Record<Language, string[]> = {
  pt: [
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
  ],
  fr: [
    'Assistant Administratif',
    'Assistant Financier',
    'Réceptionniste / Standardiste',
    'Vendeur en Magasin',
    'Agent Logistique / Magasinier',
    'Technicien Support Informatique',
    'Assistant Ressources Humaines',
    'Développeur Web',
    'Graphiste Designer',
    'Hôte / Hôtesse de Caisse',
  ],
  en: [
    'Administrative Assistant',
    'Financial Assistant',
    'Receptionist / Front Desk',
    'Retail Sales Associate',
    'Logistics Coordinator',
    'IT Support Specialist',
    'Human Resources Assistant',
    'Web Developer',
    'Graphic Designer',
    'Cashier / Customer Service',
  ],
  es: [
    'Asistente Administrativo',
    'Asistente Financiero',
    'Recepcionista / Atención',
    'Vendedor de Tienda',
    'Auxiliar de Logística',
    'Técnico de Soporte TI',
    'Asistente de Recursos Humanos',
    'Desarrollador Web',
    'Diseñador Gráfico',
    'Cajero / Atención al Cliente',
  ],
};

export const COMMON_COMPETENCIES_BY_LANG: Record<Language, string[]> = {
  pt: [
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
  ],
  fr: [
    'Communication claire',
    'Travail en équipe',
    'Sens de l\'organisation',
    'Relation client',
    'Leadership',
    'Gestion documentaire',
    'Analyse de données',
    'Résolution de problèmes',
    'Gestion du temps',
    'Proactivité & Autonomie',
    'Négociation',
    'Rigueur & Ponctualité',
  ],
  en: [
    'Effective Communication',
    'Teamwork & Collaboration',
    'Organizational Skills',
    'Customer Service',
    'Leadership',
    'Document Management',
    'Data Analysis',
    'Problem Solving',
    'Time Management',
    'Proactivity & Initiative',
    'Negotiation',
    'Punctuality & Reliability',
  ],
  es: [
    'Comunicación asertiva',
    'Trabajo en equipo',
    'Organización y método',
    'Atención al cliente',
    'Liderazgo',
    'Gestión documental',
    'Análisis de datos',
    'Resolución de problemas',
    'Gestión del tiempo',
    'Proactividad',
    'Negociación',
    'Puntualidad y compromiso',
  ],
};

export const COMMON_TOOLS_BY_LANG: Record<Language, string[]> = {
  pt: [
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
  ],
  fr: [
    'Excel / Tableurs',
    'Pack Office (Word, PPT)',
    'Power BI',
    'SAP / ERP',
    'Canva',
    'Google Workspace',
    'Trello / Jira',
    'Logiciels de Facturation',
    'CRM / Service Client',
    'WhatsApp Business',
  ],
  en: [
    'Excel / Spreadsheets',
    'Microsoft Office 365',
    'Power BI',
    'SAP / ERP Systems',
    'Canva',
    'Google Workspace',
    'Trello / Jira',
    'Slack / Teams',
    'CRM Software',
    'QuickBooks / Invoicing',
  ],
  es: [
    'Excel / Hojas de cálculo',
    'Paquete Office',
    'Power BI',
    'SAP / Sistemas ERP',
    'Canva',
    'Google Workspace',
    'Trello / Jira',
    'Sistemas de Facturación',
    'CRM / Atención',
    'WhatsApp Business',
  ],
};

export const SAMPLE_RESUME_BY_LANG: Record<Language, SampleResumeData> = {
  pt: {
    personal: {
      fullName: 'Carlos Eduardo Mendes',
      cityState: 'São Paulo, SP',
      phone: '(11) 9 8765-4321',
      email: 'carlos.mendes@email.com',
      linkedin: 'linkedin.com/in/carloseduardo',
      portfolio: '',
      photoUrl: '',
      hasPhoto: false,
    },
    targetJob: {
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
    },
    experiences: [
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
    ],
    education: [
      {
        id: 'edu-sample-1',
        course: 'Administração de Empresas',
        institution: 'Universidade Paulista',
        startYear: '2019',
        endYear: '2023',
        status: 'Concluído',
      },
    ],
    skills: [
      'Comunicação assertiva',
      'Organização',
      'Trabalho em equipe',
      'Gestão de documentos',
      'Atendimento ao cliente',
    ],
    tools: ['Excel / Planilhas', 'Pacote Office', 'TOTVS', 'Google Workspace'],
    courses: [
      {
        id: 'course-sample-1',
        name: 'Excel Intermediário e Fórmulas de Gestão',
        institution: 'SENAC',
        year: '2022',
        hours: '40h',
      },
    ],
  },

  fr: {
    personal: {
      fullName: 'Pierre Dupont',
      cityState: 'Paris, France',
      phone: '06 12 34 56 78',
      email: 'pierre.dupont@email.com',
      linkedin: 'linkedin.com/in/pierredupont',
      portfolio: '',
      photoUrl: '',
      hasPhoto: false,
    },
    targetJob: {
      roleTitle: 'Assistant Administratif',
      briefGoal:
        'À la recherche d\'un poste d\'Assistant Administratif pour optimiser la gestion documentaire, la facturation et le support aux opérations, apportant rigueur et dynamisme.',
      jobDescription: `Poste : Assistant Administratif Polyvalent
Missions :
- Suivi et contrôle de la facturation et des notes de frais
- Gestion des relations avec les fournisseurs et support clients
- Tenue et archivage des dossiers administratifs
- Utilisation quotidienne de tableurs Excel et outils bureautiques

Profil recherché :
- Formation Bac+2 en Gestion administrative, Comptabilité ou équivalent
- Bonne maîtrise d'Excel (formules, tableaux de bord)
- Sens aigu de l'organisation et aisance relationnelle`,
    },
    experiences: [
      {
        id: 'exp-sample-1',
        company: 'Logistique & Distribution Île-de-France',
        role: 'Assistant Administratif',
        startDate: '03/2022',
        endDate: '',
        isCurrent: true,
        activitiesRaw:
          'Gestion de la facturation clients et fournisseurs, suivi des bons de commande, mise à jour des tableaux de bord et accueil téléphonique.',
        resultsRaw:
          'Réduction de 30% du délai de validation des factures grâce à la standardisation des modèles Excel.',
      },
      {
        id: 'exp-sample-2',
        company: 'SARL Martin & Associés',
        role: 'Employé Administratif',
        startDate: '02/2019',
        endDate: '11/2021',
        isCurrent: false,
        activitiesRaw:
          'Accueil physique et téléphonique, saisie de données, classement d\'archives et préparation des déclarations courantes.',
        resultsRaw:
          'Maintien d\'un taux de conformité des dossiers de 100% sans aucun retard d\'archivage.',
      },
    ],
    education: [
      {
        id: 'edu-sample-1',
        course: 'BTS Gestion de la PME',
        institution: 'Lycée Montaigne, Paris',
        startYear: '2019',
        endYear: '2021',
        status: 'Terminé',
      },
    ],
    skills: [
      'Sens de l\'organisation',
      'Travail en équipe',
      'Rigueur & Ponctualité',
      'Relation client',
      'Gestion documentaire',
    ],
    tools: ['Excel / Tableurs', 'Pack Office (Word, PPT)', 'Google Workspace', 'SAP / ERP'],
    courses: [
      {
        id: 'course-sample-1',
        name: 'Perfectionnement Excel & Tableaux Croisés Dynamiques',
        institution: 'Chambre de Commerce Paris',
        year: '2022',
        hours: '35h',
      },
    ],
  },

  en: {
    personal: {
      fullName: 'Alex Johnson',
      cityState: 'New York, NY',
      phone: '(555) 123-4567',
      email: 'alex.johnson@email.com',
      linkedin: 'linkedin.com/in/alexjohnson',
      portfolio: '',
      photoUrl: '',
      hasPhoto: false,
    },
    targetJob: {
      roleTitle: 'Administrative Assistant',
      briefGoal:
        'Seeking an Administrative Assistant role to coordinate office workflows, vendor communications, and billing processes, driving measurable efficiency and team support.',
      jobDescription: `Position: Administrative Assistant
Responsibilities:
- Manage invoice processing, expense tracking, and office documentation
- Coordinate communications between suppliers, clients, and team members
- Maintain spreadsheets and update internal ERP/database systems

Requirements:
- Associate or Bachelor's degree in Business Administration or related field
- Strong proficiency in MS Excel (formulas, pivot tables)
- Excellent communication, reliability, and organizational skills`,
    },
    experiences: [
      {
        id: 'exp-sample-1',
        company: 'Apex Logistics Corp',
        role: 'Administrative Assistant',
        startDate: '03/2022',
        endDate: '',
        isCurrent: true,
        activitiesRaw:
          'Processed accounts payable and receivable, organized digital archives, audited vendor invoices, and managed incoming client inquiries.',
        resultsRaw:
          'Reduced monthly invoice audit turnaround time by 30% through standardized Excel tracking sheets.',
      },
      {
        id: 'exp-sample-2',
        company: 'Metro Retail Partners',
        role: 'Office Clerk',
        startDate: '02/2019',
        endDate: '11/2021',
        isCurrent: false,
        activitiesRaw:
          'Managed reception desk, answered phone inquiries, tracked office supplies inventory, and supported bookkeeping operations.',
        resultsRaw:
          'Maintained 100% office supply availability with zero stockouts over a 2-year period.',
      },
    ],
    education: [
      {
        id: 'edu-sample-1',
        course: 'Associate in Business Administration',
        institution: 'City College of New York',
        startYear: '2019',
        endYear: '2021',
        status: 'Completed',
      },
    ],
    skills: [
      'Organizational Skills',
      'Effective Communication',
      'Teamwork & Collaboration',
      'Document Management',
      'Customer Service',
    ],
    tools: ['Excel / Spreadsheets', 'Microsoft Office 365', 'Google Workspace', 'SAP / ERP Systems'],
    courses: [
      {
        id: 'course-sample-1',
        name: 'Advanced Excel & Business Analytics',
        institution: 'Coursera / NYC Tech',
        year: '2022',
        hours: '40h',
      },
    ],
  },

  es: {
    personal: {
      fullName: 'Carlos Eduardo Méndez',
      cityState: 'Madrid, España',
      phone: '612 345 678',
      email: 'carlos.mendez@email.com',
      linkedin: 'linkedin.com/in/carlosmendez',
      portfolio: '',
      photoUrl: '',
      hasPhoto: false,
    },
    targetJob: {
      roleTitle: 'Asistente Administrativo',
      briefGoal:
        'Busco una oportunidad como Asistente Administrativo para optimizar procesos internos, gestión de facturación y soporte a proveedores, aportando organización y compromiso al equipo.',
      jobDescription: `Puesto: Asistente Administrativo
Responsabilidades:
- Control y registro de facturación y reportes de gestión
- Atención y seguimiento con proveedores y clientes por correo y teléfono
- Archivo documental y actualización de bases de datos internas

Requisitos:
- Grado Superior o Formación Profesional en Administración o afines
- Manejo fluido de Excel (tablas dinámicas y fórmulas)
- Capacidad organizativa y excelente trato interpersonal`,
    },
    experiences: [
      {
        id: 'exp-sample-1',
        company: 'Distribuciones Logísticas Ibérica',
        role: 'Asistente Administrativo',
        startDate: '03/2022',
        endDate: '',
        isCurrent: true,
        activitiesRaw:
          'Emisión y verificación de facturas, control de albaranes, conciliación de cuentas y atención diaria a proveedores.',
        resultsRaw:
          'Reduje el tiempo de procesamiento de facturas en un 30% mediante la creación de plantillas estandarizadas.',
      },
      {
        id: 'exp-sample-2',
        company: 'Soluciones Comerciales Madrid',
        role: 'Auxiliar de Oficina',
        startDate: '02/2019',
        endDate: '11/2021',
        isCurrent: false,
        activitiesRaw:
          'Atención telefónica y presencial, archivo documental, soporte en gestión de compras y control de suministros.',
        resultsRaw:
          'Mantuve el inventario de suministros al 100% sin roturas de stock durante todo el período.',
      },
    ],
    education: [
      {
        id: 'edu-sample-1',
        course: 'Grado Superior en Administración y Finanzas',
        institution: 'IES Madrid Centro',
        startYear: '2019',
        endYear: '2021',
        status: 'Completado',
      },
    ],
    skills: [
      'Organización y método',
      'Comunicación asertiva',
      'Trabajo en equipo',
      'Gestión documental',
      'Atención al cliente',
    ],
    tools: ['Excel / Hojas de cálculo', 'Paquete Office', 'Google Workspace', 'SAP / Sistemas ERP'],
    courses: [
      {
        id: 'course-sample-1',
        name: 'Excel Avanzado para Gestión y Finanzas',
        institution: 'Cámara de Comercio Madrid',
        year: '2022',
        hours: '40h',
      },
    ],
  },
};
