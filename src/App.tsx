import { trackEvent, generationErrorCategory } from './utils/analytics';
import { requestAi } from './utils/aiRequests';
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ContactPage } from './components/ContactPage';
import { InstagramLink } from './components/InstagramLink';
import { LandingHero } from './components/LandingHero';
import { ResumeWizard } from './components/ResumeWizard';
import { ResumePreview } from './components/ResumePreview';
import { LoadingOverlay } from './components/LoadingOverlay';
import { HowItWorksModal, FeaturesModal, LoginModal, PrivacyTermsModal } from './components/InfoModals';
import { AdaptJobModal } from './components/AdaptJobModal';
import {
  OptimizedResume,
  PersonalData,
  TargetJob,
  ExperienceItem,
  EducationItem,
  CourseItem,
  JobAnalysisResult,
  WizardStep,
  UserProfile,
} from './types';
import { formatExperienceBullets } from './utils/textBeautifier';
import { Sparkles, Heart } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import {
  auth,
  loadResumeFromCloud,
  saveResumeToCloud,
  logoutFirebase,
  isEmailSignInLink,
  getStoredEmailForSignIn,
  completeEmailLinkSignIn,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { restoreResumeForm, retainResumeForm } from './utils/resumeForm';

function AppContent() {
  const { language, t } = useLanguage();
  const [currentView, setCurrentView] = useState<'landing' | 'wizard' | 'result' | 'contact'>(() => window.location.pathname === '/contact' ? 'contact' : 'landing');
  const contactLabel = { pt: 'Contato', en: 'Contact', es: 'Contacto', fr: 'Contact' }[language];
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<OptimizedResume | null>(null);
  const [savedResumeData, setSavedResumeData] = useState<OptimizedResume | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Cached form data to allow seamless editing back and forth
  const [formDataCache, setFormDataCache] = useState<{
    personal: PersonalData;
    targetJob: TargetJob;
    experiences: ExperienceItem[];
    education: EducationItem[];
    skills: string[];
    tools: string[];
    courses: CourseItem[];
    jobAnalysis?: JobAnalysisResult;
  } | null>(null);

  // Modals
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [confirmEmailLinkOpen, setConfirmEmailLinkOpen] = useState(false);
  const [adaptJobOpen, setAdaptJobOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Listen to Firebase auth changes & handle email link sign-in
  useEffect(() => {
    // 1. If URL has an Email Link sign-in code, complete it
    if (typeof window !== 'undefined' && isEmailSignInLink(window.location.href)) {
      const savedEmail = getStoredEmailForSignIn();
      if (savedEmail) {
        completeEmailLinkSignIn(savedEmail).catch((err) => {
          console.error('Error completing email link sign-in with stored email:', err);
          // If stored email was invalid or mismatched, show the confirm email modal
          setConfirmEmailLinkOpen(true);
          setLoginOpen(true);
        });
      } else {
        // Link opened in another browser/device: prompt for email via modal
        setConfirmEmailLinkOpen(true);
        setLoginOpen(true);
      }
    }

    // 2. Firebase onAuthStateChanged is the authoritative source of truth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && !fbUser.isAnonymous) {
        const profile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário',
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || undefined,
          provider: fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        };
        setCurrentUser(profile);
        try {
          localStorage.setItem('curre_user_profile', JSON.stringify(profile));
        } catch (e) {
          console.error(e);
        }

        // Fetch user's saved resume from cloud if available
        try {
          const cloudResume = await loadResumeFromCloud(fbUser.uid);
          if (cloudResume && cloudResume.personal?.fullName) {
            setSavedResumeData(cloudResume);
            localStorage.setItem('curre_saved_resume', JSON.stringify(cloudResume));
          } else {
            setSavedResumeData(null);
          }
        } catch (err) {
          console.error('Error loading cloud resume on auth state change:', err);
        }
      } else {
        // Visitor (no user, or anonymous)
        setCurrentUser(null);
        setSavedResumeData(null);
        try {
          localStorage.removeItem('curre_user_profile');
          localStorage.removeItem('curre_saved_resume');
        } catch (e) {
          console.error(e);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = async (user: UserProfile) => {
    if (user && !user.isAnonymous) {
      setCurrentUser(user);
      try {
        localStorage.setItem('curre_user_profile', JSON.stringify(user));
        // Load saved cloud resume if available
        const cloudResume = await loadResumeFromCloud(user.id);
        if (cloudResume && cloudResume.personal?.fullName) {
          setSavedResumeData(cloudResume);
          localStorage.setItem('curre_saved_resume', JSON.stringify(cloudResume));
        } else if (generatedResume) {
          // Sync existing local/temporary resume to the new cloud account
          await saveResumeToCloud(user.id, generatedResume);
          setSavedResumeData(generatedResume);
          localStorage.setItem('curre_saved_resume', JSON.stringify(generatedResume));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (err) {
      console.warn('Firebase logout warning:', err);
    }
    setCurrentUser(null);
    setSavedResumeData(null);
    setGeneratedResume(null);
    setFormDataCache(null);
    try {
      localStorage.removeItem('curre_user_profile');
      localStorage.removeItem('curre_saved_resume');
    } catch (e) {
      console.error(e);
    }
  };

  // Open saved resume directly from landing page or navbar
  const handleOpenSavedResume = () => {
    if (savedResumeData && currentUser && !currentUser.isAnonymous) {
      setGeneratedResume(savedResumeData);
      setFormDataCache(restoreResumeForm(savedResumeData));
      setCurrentView('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function to build a resilient professional resume client-side if network/server is slow or fails
  const buildClientFallbackResume = (data: {
    personal: PersonalData;
    targetJob: TargetJob;
    experiences: ExperienceItem[];
    education: EducationItem[];
    skills: string[];
    tools: string[];
    courses: CourseItem[];
    jobAnalysis?: JobAnalysisResult;
  }): OptimizedResume => {
    const { personal, targetJob, experiences, education, skills, tools, courses, jobAnalysis } = data;
    const isFr = language === 'fr';
    const isEn = language === 'en';
    const isEs = language === 'es';

    const defaultName = isFr ? 'Professionnel' : isEn ? 'Professional' : isEs ? 'Profesional' : 'Profissional';
    const fullName = personal?.fullName?.trim() || defaultName;
    const role = targetJob?.roleTitle?.trim() || defaultName;

    const presentText = isFr ? 'Présent' : isEn ? 'Present' : isEs ? 'Presente' : 'Atual';
    const startDefault = isFr ? 'Début' : isEn ? 'Start' : isEs ? 'Inicio' : 'Início';
    const endDefault = isFr ? 'Fin' : isEn ? 'End' : isEs ? 'Fin' : 'Término';
    const companyDefault = isFr ? 'Entreprise' : isEn ? 'Company' : isEs ? 'Empresa' : 'Empresa';
    const roleDefault = isFr ? 'Poste' : isEn ? 'Position' : isEs ? 'Cargo' : 'Cargo';

    const optimizedExp = (experiences || []).map((exp) => {
      const bullets = formatExperienceBullets(exp.activitiesRaw || '', exp.resultsRaw || '', exp.role);

      const period = exp.isCurrent
        ? `${exp.startDate || startDefault} — ${presentText}`
        : `${exp.startDate || startDefault} — ${exp.endDate || endDefault}`;

      return {
        id: exp.id || Math.random().toString(),
        company: exp.company || companyDefault,
        role: exp.role || roleDefault,
        period,
        isCurrent: !!exp.isCurrent,
        bullets,
      };
    });

    let summary = '';
    if (targetJob?.briefGoal?.trim()) {
      if (isFr) {
        summary = `Professionnel orienté résultats visant le poste de ${role}. ${targetJob.briefGoal}`;
      } else if (isEn) {
        summary = `Results-oriented professional seeking an opportunity as ${role}. ${targetJob.briefGoal}`;
      } else if (isEs) {
        summary = `Profesional orientado a resultados con el objetivo de desempeñarse como ${role}. ${targetJob.briefGoal}`;
      } else {
        summary = `Profissional orientado a resultados com objetivo de atuar como ${role}. ${targetJob.briefGoal}`;
      }
    } else {
      if (isFr) {
        summary = `Professionnel motivé et rigoureux visant le poste de ${role}. Profil proactif et engagé, mobilisant des compétences solides pour apporter efficacité, rigueur et valeur ajoutée au sein de l'équipe et de l'organisation.`;
      } else if (isEn) {
        summary = `Dedicated and proactive professional aiming to contribute as ${role}. Proven ability to deliver reliable results, maintain high standards, and support key organizational initiatives.`;
      } else if (isEs) {
        summary = `Profesional dedicado(a) con el objetivo de desempeñarse como ${role}. Perfil proactivo y comprometido con resultados de calidad, aplicando conocimientos sólidos para contribuir al desarrollo del equipo y la organización.`;
      } else {
        summary = `Profissional dedicado(a) com objetivo de atuação como ${role}. Perfil proativo e comprometido com resultados de qualidade, aplicando conhecimentos em ${(skills || []).slice(0, 3).join(', ') || 'atividades da área'} para contribuir com o desenvolvimento da equipe e organização.`;
      }
    }

    const safePersonal: PersonalData = {
      fullName,
      cityState: personal?.cityState || '',
      phone: personal?.phone || '',
      email: personal?.email || '',
      linkedin: personal?.linkedin || '',
      portfolio: personal?.portfolio || '',
      photoUrl: personal?.photoUrl,
      hasPhoto: !!personal?.hasPhoto,
    };

    return {
      personal: safePersonal,
      targetRole: role,
      professionalSummary: summary,
      experiences: optimizedExp,
      education: education || [],
      skills: skills || [],
      tools: tools || [],
      courses: courses || [],
      jobAnalysis,
      templateStyle: 'liquid-modern',
      generatedAt: new Date().toISOString(),
      language,
      isAiGenerated: false,
      sourceForm: retainResumeForm(data),
    };
  };

  // Main resume generator API call
  const handleGenerateResume = async (data: {
    personal: PersonalData;
    targetJob: TargetJob;
    experiences: ExperienceItem[];
    education: EducationItem[];
    skills: string[];
    tools: string[];
    courses: CourseItem[];
    jobAnalysis?: JobAnalysisResult;
  }) => {
    if (isLoading) return;
    trackEvent('geracao_iniciada', { idioma: language, origem: currentView === 'wizard' ? 'novo' : 'nova_tentativa' });
    setFormDataCache(data);
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // 1. Prepare sanitized data without large base64 strings in the payload
      const sanitizedData = {
        ...data,
        language,
        personal: {
          ...data.personal,
          photoUrl: data.personal.photoUrl ? 'user-uploaded-photo' : undefined,
        },
      };

      // 2. Fetch main resume optimization
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      let receivedResume: OptimizedResume;
      try {
        receivedResume = await requestAi<OptimizedResume>('/api/ai/optimize-resume', sanitizedData, controller.signal, data => data.isAiGenerated === true);
      } finally { clearTimeout(timeout); }

      const resultResume = receivedResume;
      if (resultResume.isAiGenerated === false) trackEvent('geracao_falhou', { idioma: language, categoria_erro: 'ia_indisponivel' });
      // Restore actual photoUrl for client-side display.
      if (data.personal.photoUrl) {
        resultResume.personal.photoUrl = data.personal.photoUrl;
        resultResume.personal.hasPhoto = true;
      }

      // Attach any existing jobAnalysis
      if (data.jobAnalysis) {
        resultResume.jobAnalysis = data.jobAnalysis;
      }
      resultResume.sourceForm = retainResumeForm(data);

      // Ensure user experiences the 4-phase liquid loading transition (minimum 1.8s)
      const elapsed = Date.now() - startTime;
      const waitTime = Math.max(0, 1800 - elapsed);

      setTimeout(() => {
        trackEvent('geracao_concluida', { idioma: language, metodo: resultResume.isAiGenerated === false ? 'basico' : 'ia', duracao_ms: Date.now() - startTime });
        setGeneratedResume(resultResume);
        if (currentUser && !currentUser.isAnonymous) {
          setSavedResumeData(resultResume);
          try {
            localStorage.setItem('curre_saved_resume', JSON.stringify(resultResume));
            saveResumeToCloud(currentUser.id, resultResume).catch((err) => {
              console.warn('Erro ao salvar currículo gerado no Firestore:', err);
            });
          } catch (e) {
            console.error(e);
          }
        }
        setIsLoading(false);
        setCurrentView('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, waitTime);
    } catch (error) {
      trackEvent('geracao_falhou', { idioma: language, categoria_erro: generationErrorCategory(error) });
      console.warn('Backend API unavailable or slow, generating with local smart heuristics:', error);
      const fallbackResume = buildClientFallbackResume(data);

      const elapsed = Date.now() - startTime;
      const waitTime = Math.max(0, 1800 - elapsed);

      setTimeout(() => {
        trackEvent('geracao_concluida', { idioma: language, metodo: 'basico', duracao_ms: Date.now() - startTime });
        setGeneratedResume(fallbackResume);
        if (currentUser && !currentUser.isAnonymous) {
          setSavedResumeData(fallbackResume);
          try {
            localStorage.setItem('curre_saved_resume', JSON.stringify(fallbackResume));
            saveResumeToCloud(currentUser.id, fallbackResume).catch((err) => {
              console.warn('Erro ao salvar currículo de fallback no Firestore:', err);
            });
          } catch (e) {
            console.error(e);
          }
        }
        setIsLoading(false);
        setCurrentView('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, waitTime);
    }
  };

  // Re-generate current resume
  const handleRegenerate = () => {
    if (formDataCache) {
      handleGenerateResume(formDataCache);
    }
  };

  // Adapt to a new job description
  const handleAdaptToNewJob = async (newJobDesc: string) => {
    if (!formDataCache) return;

    const updatedFormData = {
      ...formDataCache,
      targetJob: {
        ...formDataCache.targetJob,
        jobDescription: newJobDesc,
      },
      jobAnalysis: undefined, // trigger fresh analysis
    };

    setAdaptJobOpen(false);
    handleGenerateResume(updatedFormData);
  };

  // Navigation helpers
  const handleStartWizard = (step: WizardStep = 1) => {
    if (currentView === 'contact') { window.location.assign(`/${language}/`); return; }
    trackEvent('inicio_curriculo', { idioma: language });
    if (!currentUser || currentUser.isAnonymous) {
      setFormDataCache(null);
      setGeneratedResume(null);
    }
    setWizardStep(step);
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditFromPreview = () => {
    setWizardStep(8);
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-sky-200 selection:text-sky-900">
      {/* Top Navbar */}
      <Navbar
        onStartResume={() => handleStartWizard(1)}
        onOpenHowItWorks={() => setHowItWorksOpen(true)}
        onOpenFeatures={() => setFeaturesOpen(true)}
        onOpenAuth={() => setLoginOpen(true)}
        isWizardActive={currentView === 'wizard'}
        onGoHome={() => currentView === 'contact' ? window.location.assign(`/${language}/`) : setCurrentView('landing')}
        hasSavedResume={!authLoading && !!savedResumeData && !!currentUser && !currentUser.isAnonymous}
        onOpenSavedResume={handleOpenSavedResume}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'landing' && (
          <LandingHero
            onStartResume={() => handleStartWizard(1)}
            onOpenHowItWorks={() => setHowItWorksOpen(true)}
            savedResume={(!authLoading && currentUser && !currentUser.isAnonymous) ? savedResumeData : null}
            onOpenSavedResume={handleOpenSavedResume}
            currentUser={currentUser}
            onOpenLogin={() => setLoginOpen(true)}
          />
        )}

        {currentView === 'wizard' && (
          <ResumeWizard
            initialStep={wizardStep}
            initialData={formDataCache}
            onGenerateResume={handleGenerateResume}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'result' && generatedResume && (
          <ResumePreview
            resume={generatedResume}
            onEdit={handleEditFromPreview}
            onRegenerate={handleRegenerate}
            onAdaptOtherJob={() => setAdaptJobOpen(true)}
            onBackToHome={() => setCurrentView('landing')}
            currentUser={currentUser}
            onOpenLogin={() => setLoginOpen(true)}
            onResumeChange={(updater) => setGeneratedResume((prev) => (prev ? updater(prev) : prev))}
          />
        )}
      </main>

      {/* Loading Overlay with 4-phase transition */}
      {isLoading && <LoadingOverlay />}

      {/* Information & Feature Modals */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        onStart={() => handleStartWizard(1)}
      />

      <FeaturesModal
        isOpen={featuresOpen}
        onClose={() => setFeaturesOpen(false)}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setConfirmEmailLinkOpen(false);
        }}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        confirmEmailLink={confirmEmailLinkOpen}
      />

      {/* Adapt for other job modal */}
      <AdaptJobModal
        isOpen={adaptJobOpen}
        onClose={() => setAdaptJobOpen(false)}
        currentRole={generatedResume?.targetRole || formDataCache?.targetJob.roleTitle || (language === 'en' ? 'Professional' : language === 'fr' ? 'Professionnel' : language === 'es' ? 'Profesional' : 'Profissional')}
        onConfirmAdapt={handleAdaptToNewJob}
        isLoading={isLoading}
      />

      {/* Privacy & LGPD Terms Modal */}
      <PrivacyTermsModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />

      {/* Clean Footer (hidden on print) */}
      <footer id="app-footer" className="no-print mt-auto py-8 px-6 sm:px-8 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Row: Brand & Description vs. Links */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm">
                  CURRÊ
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('brand_slogan')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-relaxed text-left">
                {t('footer_tagline')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <a href="/contact" className="inline-flex min-h-11 items-center rounded-lg hover:text-sky-600 dark:hover:text-sky-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500">{contactLabel}</a>
              <button
                onClick={() => setHowItWorksOpen(true)}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                {t('nav_how_it_works')}
              </button>
              <button
                onClick={() => setFeaturesOpen(true)}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                {t('nav_features')}
              </button>
              <button
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                {t('footer_terms')}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Bottom Row: Attribution & Copyright */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-4 text-[11px]">
            <div className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5 sm:justify-self-start">
              <span>{t('footer_developed_by')}</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap">
                Danilo Freitas
              </span>
            </div>
            <InstagramLink placement="footer" />
            <div className="text-slate-400 dark:text-slate-500 sm:justify-self-end sm:text-right">
              &copy; {new Date().getFullYear()} CURRÊ. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
