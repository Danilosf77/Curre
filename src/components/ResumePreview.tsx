import { trackEvent } from '../utils/analytics';
import React, { useState, useRef } from 'react';
import {
  Download,
  Edit,
  RotateCcw,
  BookmarkCheck,
  Share2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Palette,
  Loader2,
  LayoutGrid,
  FileText,
  ScanText,
  Cloud,
  ShieldCheck,
  Zap,
  Building2,
  Award,
  Shapes,
  Feather,
  GitCommitHorizontal,
  Earth,
} from 'lucide-react';
import { OptimizedResume, TemplateStyle, UserProfile } from '../types';
import { exportResumeToPDF } from '../utils/pdfExport';
import { LiquidModernTemplate } from './templates/LiquidModernTemplate';
import { ExecutiveClassicTemplate } from './templates/ExecutiveClassicTemplate';
import { MinimalistAtsTemplate } from './templates/MinimalistAtsTemplate';
import { AtsProfessionalTemplate } from './templates/AtsProfessionalTemplate';
import { ImpactTemplate } from './templates/ImpactTemplate';
import { CorporatePremiumTemplate } from './templates/CorporatePremiumTemplate';
import { CreativeColorTemplate } from './templates/CreativeColorTemplate';
import { ElegantSerifTemplate } from './templates/ElegantSerifTemplate';
import { TimelineTechTemplate } from './templates/TimelineTechTemplate';
import { InternationalTemplate } from './templates/InternationalTemplate';
import { ResumeReview } from './ResumeReview';
import { useLanguage } from '../i18n/LanguageContext';
import { saveResumeToCloud } from '../lib/firebase';
import { keywordOverlapLabel, basicResumeLabel } from '../utils/resultLabels';
import { TemplateGallery } from './TemplateGallery';
import { RESUME_TEMPLATES, galleryLabels } from '../data/resumeTemplates';

interface ResumePreviewProps {
  resume: OptimizedResume;
  onEdit: () => void;
  onRegenerate: () => void;
  onAdaptOtherJob: () => void;
  onBackToHome: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onResumeChange?: (updater: (prev: OptimizedResume) => OptimizedResume) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  onEdit,
  onRegenerate,
  onAdaptOtherJob,
  onBackToHome,
  currentUser,
  onOpenLogin,
  onResumeChange,
}) => {
  const { t, language } = useLanguage();
  const [template, setTemplate] = useState<TemplateStyle>(resume.templateStyle || 'liquid-modern');

  // Wrapper: mantém o estado local do seletor e propaga a escolha para o App
  // (persistência em localStorage/Firestore junto com o currículo salvo)
  const handleTemplateChange = (newTemplate: TemplateStyle) => {
    if (newTemplate !== template) trackEvent('modelo_selecionado', { modelo: newTemplate, idioma: language });
    setTemplate(newTemplate);
    if (onResumeChange) {
      onResumeChange((prev) => ({ ...prev, templateStyle: newTemplate }));
    }
  };
  const trackedPreview = useRef<string | null>(null);
  React.useEffect(() => {
    const key = resume.generatedAt || 'saved';
    if (trackedPreview.current === key) return;
    trackedPreview.current = key;
    trackEvent('preview_visualizado', { idioma: language, modelo: resume.templateStyle || 'liquid-modern', metodo: resume.isAiGenerated === false ? 'basico' : 'ia' });
  }, [resume.generatedAt, language]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const selectedTemplate = RESUME_TEMPLATES.find(item => item.id === template)!;
  const galleryCopy = galleryLabels(language);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showCompatibility, setShowCompatibility] = useState(true);


  const resumeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [resumeHeight, setResumeHeight] = useState(1050);

  // Dynamic scaling for Mobile Viewport (A4 document preview scaling)
  const updateScale = React.useCallback(() => {
    if (containerRef.current) {
      const parentWidth = containerRef.current.getBoundingClientRect().width;
      if (parentWidth < 820) {
        setScale(parentWidth / 820);
      } else {
        setScale(1);
      }
    }
    if (resumeRef.current) {
      setResumeHeight(resumeRef.current.scrollHeight);
    }
  }, []);

  React.useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateScale);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateScale]);

  // Force scale recalculation and run ATS diagnostic when template or resume changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateScale();

    }, 150);
    return () => clearTimeout(timer);
  }, [template, resume, updateScale]);

  // Auto-salva no navegador e na nuvem Firestore se o usuário estiver autenticado e não anônimo
  React.useEffect(() => {
    if (resume && resume.personal?.fullName) {
      if (currentUser && !currentUser.isAnonymous) {
        try {
          localStorage.setItem('curre_saved_resume', JSON.stringify(resume));
        } catch (e) {
          console.error(e);
        }

        saveResumeToCloud(currentUser.id, resume).catch((err) => {
          console.warn('Erro ao sincronizar currículo com Firestore:', err);
        });
      }
    }
  }, [resume, currentUser]);

  // Handle Direct Server-side PDF Download with client-side fallback
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setPdfError(null);
    try {
      await exportResumeToPDF({
        resume,
        template,
        language: language || 'pt',
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Infelizmente, ocorreu um erro ao gerar o seu PDF. Por favor, tente novamente.';
      console.error('[CURRÊ PDF] Falha na exportação de PDF:', err);
      setPdfError(errorMsg);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle Local Save
  const handleSaveLocally = () => {
    if (!currentUser || currentUser.isAnonymous) {
      if (onOpenLogin) {
        onOpenLogin();
      }
      return;
    }
    try {
      localStorage.setItem('curre_saved_resume', JSON.stringify(resume));
      saveResumeToCloud(currentUser.id, resume)
        .then(() => {
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        })
        .catch((err) => {
          console.error('Erro ao salvar currículo no Firestore:', err);
        });
    } catch (e) {
      console.error(e);
    }
  };

  const { personal, targetRole, professionalSummary, experiences, education, skills, tools, courses, jobAnalysis } =
    resume;

  return (
    <div className="resume-preview-root max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-24 print:p-0 print:m-0 print:max-w-none print:w-full">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200 shadow-sm cursor-pointer"
              title={t('nav_home')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('prev_ready_badge')}
                </span>
                {resume.isAiGenerated !== false && <span className="text-xs text-slate-500 dark:text-slate-400">{t('prev_ai_optimized')}</span>}
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {personal.fullName || t('prev_default_title')}
              </h1>
            </div>
          </div>

          {/* Quick Actions (Fileira Superior) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAdaptOtherJob}
              id="btn-adapt-other-job"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              title={t('prev_btn_adapt')}
            >
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{t('prev_btn_adapt')}</span>
            </button>

            <button
              onClick={onEdit}
              id="btn-edit-resume"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              title={t('prev_btn_edit')}
            >
              <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{t('prev_btn_edit')}</span>
            </button>

            <details className="relative"><summary className="cursor-pointer list-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">{language === 'pt' ? 'Mais opções ⋯' : language === 'es' ? 'Más opciones ⋯' : language === 'fr' ? 'Plus d’options ⋯' : 'More options ⋯'}</summary><div className="absolute right-0 top-full z-20 mt-2 grid min-w-48 gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={onRegenerate}
              id="btn-regenerate"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
              title={t('prev_btn_regenerate')}
            >
              <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{t('prev_btn_regenerate')}</span>
            </button>

            <button
              onClick={handleSaveLocally}
              id="btn-save-resume"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{savedSuccess ? t('prev_btn_saved') : t('prev_btn_save')}</span>
            </button>
</div></details>
          </div>
        </div>

        {/* Fileira Inferior: Botão BAIXAR PDF em Máximo Destaque, Mais Comprido e Centralizado */}
        <div className="hidden sm:flex pb-4 flex-col items-center justify-center w-full">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            id="btn-download-pdf"
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('prev_btn_downloading')}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-sky-100" />
                <span>{t('prev_btn_download')}</span>
              </>
            )}
          </button>

          {/* Notificação visual caso ocorra erro no download do PDF */}
          {pdfError && (
            <div className="mt-3.5 w-full max-w-lg p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs shadow-sm flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-rose-900 mb-0.5">Falha no download do PDF</span>
                  <p className="text-rose-700 leading-relaxed break-words">{pdfError}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-200/60">
                <button
                  type="button"
                  onClick={() => setPdfError(null)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}


        </div>

        {/* Only the applied style is shown here; the collection lives in a dialog. */}
        <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/80" id="template-selector-ribbon">
          <div className="flex min-w-0 items-center gap-3">
            <img src={`/template-previews/${template}.jpg`} alt="" width={47} height={60} className="h-12 w-9 shrink-0 rounded border border-slate-200 bg-white object-cover object-top" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{galleryCopy.style}</p>
              <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{selectedTemplate.name}</p>
              <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{t(`tmpl_${selectedTemplate.key}_badge`)}</p>
            </div>
          </div>
          <button type="button" id="btn-change-template" onClick={() => setGalleryOpen(true)} aria-haspopup="dialog" aria-expanded={galleryOpen} className="flex shrink-0 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs font-bold text-sky-800 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60">
            <LayoutGrid className="h-4 w-4" /><span className="sm:hidden">{language === 'pt' || language === 'es' ? 'Modelos' : language === 'fr' ? 'Modèles' : 'Templates'}</span><span className="hidden sm:inline">{galleryCopy.change}</span>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <button type="button" onClick={() => handleTemplateChange(RESUME_TEMPLATES[(RESUME_TEMPLATES.findIndex(x => x.id === template) + RESUME_TEMPLATES.length - 1) % RESUME_TEMPLATES.length].id)} className="rounded-lg px-3 py-2 font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-800">← {language === 'pt' ? 'Modelo anterior' : language === 'es' ? 'Modelo anterior' : language === 'fr' ? 'Modèle précédent' : 'Previous template'}</button>
          <span className="text-slate-600 dark:text-slate-300">{RESUME_TEMPLATES.findIndex(x => x.id === template) + 1} / {RESUME_TEMPLATES.length}</span>
          <button type="button" onClick={() => handleTemplateChange(RESUME_TEMPLATES[(RESUME_TEMPLATES.findIndex(x => x.id === template) + 1) % RESUME_TEMPLATES.length].id)} className="rounded-lg px-3 py-2 font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-800">{language === 'pt' ? 'Próximo modelo' : language === 'es' ? 'Modelo siguiente' : language === 'fr' ? 'Modèle suivant' : 'Next template'} →</button>
        </div>
        {galleryOpen && <TemplateGallery current={template} onApply={handleTemplateChange} onClose={() => setGalleryOpen(false)} />}
      </div>

      {/* =========================================================================
          RECURSO PREMIUM / ANÁLISE DE COMPATIBILIDADE COM A VAGA
      ========================================================================= */}
      {resume.isAiGenerated === false && <div role="status" className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p className="min-w-0 flex-1">{language === 'pt' ? (resume.apiError ? 'Seu currículo está disponível para visualizar e baixar. ' + resume.apiError + ' Esta versão foi organizada com os dados que você preencheu.' : 'Seu currículo está disponível para visualizar e baixar. A IA ficou indisponível; esta versão foi organizada com os dados que você preencheu.') : language === 'es' ? 'Puedes ver y descargar tu currículum. La IA no está disponible; esta versión utiliza los datos que ingresaste.' : language === 'fr' ? 'Votre CV est disponible pour consultation et téléchargement. L’IA est indisponible ; cette version utilise vos informations.' : 'Your resume is available to preview and download. AI is unavailable; this version uses the information you provided.'}</p>
        <button type="button" onClick={onRegenerate} className="shrink-0 rounded-lg border border-sky-300 px-3 py-2 font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-slate-700">{language === 'pt' ? 'Tentar novamente com IA' : language === 'es' ? 'Reintentar con IA' : language === 'fr' ? 'Réessayer avec l’IA' : 'Retry with AI'}</button>
      </div>}

      {/* =========================================================================
          AUDITORIA ESTRUTURAL DE COMPATIBILIDADE ATS
      ========================================================================= */}


      {/* =========================================================================
          REALISTIC RESUME PAPER (A4 Document Preview)
      ========================================================================= */}
      <div
        ref={containerRef}
        className="resume-paper-container w-full flex justify-center select-none overflow-hidden print:overflow-visible print:h-auto print:block print:p-0 print:m-0"
        style={{
          height: scale < 1 ? `${resumeHeight * scale}px` : 'auto'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          ref={resumeRef}
          id="resume-document"
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          className={`resume-paper select-none bg-white text-slate-900 shadow-2xl rounded-xl sm:rounded-2xl border border-slate-200/80 overflow-hidden print:shadow-none print:border-none print:rounded-none print:transform-none print:overflow-visible print:h-auto print:w-full print:max-w-none print:m-0 print:select-text ${
            template === 'impact' || template === 'minimalist' || template === 'creative-color' || template === 'timeline-tech'
              ? 'p-0 font-sans'
              : template === 'executive-clean' || template === 'elegant-serif'
              ? 'p-6 sm:p-10 font-serif'
              : 'p-6 sm:p-10 font-sans'
          }`}
          style={{
            width: '820px',
            minHeight: '1050px',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transform: scale < 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'top center',
            flexShrink: 0,
          }}
        >
          {template === 'liquid-modern' && (
            <LiquidModernTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'executive-clean' && (
            <ExecutiveClassicTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'ats-professional' && (
            <AtsProfessionalTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'impact' && (
            <ImpactTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'corporate-premium' && (
            <CorporatePremiumTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'minimalist' && (
            <MinimalistAtsTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'creative-color' && (
            <CreativeColorTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'elegant-serif' && (
            <ElegantSerifTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'timeline-tech' && (
            <TimelineTechTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}

          {template === 'international' && (
            <InternationalTemplate
              personal={personal}
              targetRole={targetRole}
              professionalSummary={professionalSummary}
              experiences={experiences}
              education={education}
              skills={skills}
              tools={tools}
              courses={courses}
            />
          )}
        </div>
      </div>

      <div className="no-print mt-6 space-y-4">
      <ResumeReview resume={resume} template={template} language={language} />
      {jobAnalysis && showCompatibility && (
        <details className="no-print mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"><summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-100">{t('job_analysis_title')}</summary><div className="pt-4">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  {t('job_analysis_badge')}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {t('job_analysis_title')}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-700">
                {jobAnalysis.matchPercentage}%
              </span>
              <span className="text-[11px] text-slate-500 block -mt-1 font-medium">
                {jobAnalysis.analysisSource === 'keyword-overlap' ? keywordOverlapLabel(language) : t('job_analysis_match')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Found Skills */}
            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {t('job_analysis_skills_found')}
              </span>
              <ul className="space-y-1">
                {jobAnalysis.foundSkills.slice(0, 4).map((s, i) => (
                  <li key={i} className="text-slate-700 flex items-center gap-1">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Relevant Experiences */}
            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100">
              <span className="font-bold text-sky-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                {t('job_analysis_exp_relevant')}
              </span>
              <ul className="space-y-1">
                {jobAnalysis.relevantExperiences.slice(0, 2).map((exp, i) => (
                  <li key={i} className="text-slate-700 flex items-center gap-1">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements / Attention Points */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                {t('job_analysis_improvements')}
              </span>
              <ul className="space-y-1 text-slate-700">
                {jobAnalysis.improvements.slice(0, 2).map((imp, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ethical Disclaimer mandated by rules */}
          <p className="text-[11px] text-slate-400 mt-4 text-center">
            {t('job_analysis_disclaimer')}
          </p>
        </div></details>
      )}

        {/* Compact cloud invitation; document generation is unchanged. */}
        <div className="my-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
            <Cloud className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <span>{currentUser ? t('prev_cloud_synced_badge') : galleryCopy.cloud}</span>
          </div>
          {!currentUser && onOpenLogin && (
            <button type="button" onClick={onOpenLogin} id="preview-btn-cloud-login" className="shrink-0 rounded-lg px-2 py-1 font-bold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-700">
              {galleryCopy.save}
            </button>
          )}
        </div>


      </div>

      {/* Bottom Floating Bar on Mobile (no-print) */}
      <div className="no-print sm:hidden fixed bottom-3 left-4 right-4 z-30">
        <div className="rounded-2xl bg-white p-3 shadow-lg border border-slate-200 flex flex-col gap-1.5 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('prev_btn_downloading')}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t('prev_btn_download')}</span>
                </>
              )}
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-3 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              {t('prev_btn_edit')}
            </button>
          </div>
          {pdfError && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between gap-1.5">
              <span className="truncate">{pdfError}</span>
              <button
                type="button"
                onClick={() => setPdfError(null)}
                className="text-rose-900 font-bold px-1.5 py-0.5 text-[10px]"
              >
                ✕
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
