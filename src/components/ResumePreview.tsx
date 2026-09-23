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
} from 'lucide-react';
import { OptimizedResume, UserProfile } from '../types';
import { exportResumeToPDF } from '../utils/pdfExport';
import { LiquidModernTemplate } from './templates/LiquidModernTemplate';
import { ExecutiveClassicTemplate } from './templates/ExecutiveClassicTemplate';
import { MinimalistAtsTemplate } from './templates/MinimalistAtsTemplate';
import { AtsProfessionalTemplate } from './templates/AtsProfessionalTemplate';
import { ImpactTemplate } from './templates/ImpactTemplate';
import { CorporatePremiumTemplate } from './templates/CorporatePremiumTemplate';
import { runAtsDiagnostic, AtsDiagnosticResult } from '../utils/atsDiagnostic';
import { useLanguage } from '../i18n/LanguageContext';
import { saveResumeToCloud } from '../lib/firebase';

interface ResumePreviewProps {
  resume: OptimizedResume;
  onEdit: () => void;
  onRegenerate: () => void;
  onAdaptOtherJob: () => void;
  onBackToHome: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  onEdit,
  onRegenerate,
  onAdaptOtherJob,
  onBackToHome,
  currentUser,
  onOpenLogin,
}) => {
  const { t, language } = useLanguage();
  const [template, setTemplate] = useState<
    'liquid-modern' | 'executive-clean' | 'ats-professional' | 'impact' | 'corporate-premium' | 'minimalist'
  >(resume.templateStyle || 'liquid-modern');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showCompatibility, setShowCompatibility] = useState(true);
  const [atsDiagnostic, setAtsDiagnostic] = useState<AtsDiagnosticResult | null>(null);

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
      if (resumeRef.current) {
        const diag = runAtsDiagnostic(resumeRef.current, template);
        setAtsDiagnostic(diag);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [template, resume, updateScale]);

  // Auto-salva no navegador e na nuvem Firestore se o usuário estiver autenticado
  React.useEffect(() => {
    if (resume && resume.personal?.fullName) {
      try {
        localStorage.setItem('curre_saved_resume', JSON.stringify(resume));
      } catch (e) {
        console.error(e);
      }

      if (currentUser?.id) {
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
    try {
      localStorage.setItem('curre_saved_resume', JSON.stringify(resume));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const { personal, targetRole, professionalSummary, experiences, education, skills, tools, courses, jobAnalysis } =
    resume;

  return (
    <div className="resume-preview-root max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-24 print:p-0 print:m-0 print:max-w-none print:w-full">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
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
                <span className="text-xs text-slate-400 dark:text-sky-300 font-medium">{t('prev_ai_optimized')}</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
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
          </div>
        </div>

        {/* Fileira Inferior: Botão BAIXAR PDF em Máximo Destaque, Mais Comprido e Centralizado */}
        <div className="pt-3 pb-1 flex flex-col items-center justify-center w-full">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            id="btn-download-pdf"
            className="w-full sm:w-auto min-w-[280px] sm:min-w-[420px] md:min-w-[500px] py-3.5 px-8 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none border border-sky-400/30"
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

          <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 font-medium max-w-lg">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>{t('prev_print_pdf_hint')}</span>
          </p>
        </div>

        {/* Sugestão Opcional de Salvar na Nuvem */}
        {currentUser ? (
          <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-sm flex items-center justify-between gap-3 text-left animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <Cloud className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    {t('prev_cloud_synced_badge')}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {t('prev_cloud_connected')} {currentUser.name} ({currentUser.email})
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 mt-0.5">
                  {t('prev_cloud_synced_desc')}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
              {t('prev_cloud_synced_tag')}
            </span>
          </div>
        ) : (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 via-cyan-50/70 to-blue-50/80 border border-sky-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                    {t('prev_cloud_opt_badge')}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {t('prev_cloud_prompt_title')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t('prev_cloud_prompt_desc')}
                </p>
              </div>
            </div>
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                id="preview-btn-cloud-login"
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{t('prev_cloud_btn')}</span>
              </button>
            )}
          </div>
        )}

        {/* Template Selector Ribbon with clear value differentiation */}
        <div className="pt-3 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Palette className="w-4 h-4 text-sky-600" />
              <span>{t('prev_tmpl_style_title')}</span>
            </div>

            <div className="text-[11px] text-slate-400">
              {t('prev_tip_download')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-3">
            {/* Template 1: Moderno Clean */}
            <button
              onClick={() => setTemplate('liquid-modern')}
              id="template-btn-modern"
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                template === 'liquid-modern'
                  ? 'bg-sky-50/90 border-sky-500 shadow-md ring-2 ring-sky-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    Modern Clean
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 inline-block mb-1.5">
                  {t('tmpl_modern_badge')}
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t('tmpl_modern_desc')}
                </p>
              </div>
            </button>

            {/* Template 2: Executivo */}
            <button
              onClick={() => setTemplate('executive-clean')}
              id="template-btn-executive"
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                template === 'executive-clean'
                  ? 'bg-slate-100/90 border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                    Executive
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 inline-block mb-1.5">
                  {t('tmpl_executive_badge')}
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t('tmpl_executive_desc')}
                </p>
              </div>
            </button>

            {/* Template 3: ATS Professional */}
            <button
              onClick={() => setTemplate('ats-professional')}
              id="template-btn-ats"
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                template === 'ats-professional'
                  ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ATS Professional
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-block mb-1.5">
                  {t('tmpl_ats_badge')}
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t('tmpl_ats_desc')}
                </p>
              </div>
            </button>

            {/* Template 4: Impact */}
            <button
              onClick={() => setTemplate('impact')}
              id="template-btn-impact"
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                template === 'impact'
                  ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-600 dark:border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`impact-title font-extrabold text-xs flex items-center gap-1.5 ${
                    template === 'impact'
                      ? 'text-slate-900 dark:text-amber-100'
                      : 'text-slate-900'
                  }`}>
                    <Zap className={`w-3.5 h-3.5 shrink-0 ${
                      template === 'impact'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-amber-600'
                    }`} />
                    Impact
                  </span>
                </div>
                <span className={`impact-badge text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block mb-1.5 ${
                  template === 'impact'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:font-black'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {t('tmpl_impact_badge')}
                </span>
                <p className={`text-[11px] leading-tight ${
                  template === 'impact'
                    ? 'text-slate-500 dark:text-amber-200/90'
                    : 'text-slate-500'
                }`}>
                  {t('tmpl_impact_desc')}
                </p>
              </div>
            </button>

            {/* Template 5: Corporate Premium */}
            <button
              onClick={() => setTemplate('corporate-premium')}
              id="template-btn-corporate"
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                template === 'corporate-premium'
                  ? 'bg-blue-50/90 border-blue-700 shadow-md ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    Corporate Premium
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 inline-block mb-1.5">
                  {t('tmpl_corporate_badge')}
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t('tmpl_corporate_desc')}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RECURSO PREMIUM / ANÁLISE DE COMPATIBILIDADE COM A VAGA
      ========================================================================= */}
      {jobAnalysis && showCompatibility && (
        <div className="no-print mb-8 p-5 sm:p-6 rounded-3xl liquid-glass-card border border-sky-200 shadow-md animate-in fade-in">
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
                {t('job_analysis_match')}
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
        </div>
      )}

      {/* =========================================================================
          AUDITORIA ESTRUTURAL DE COMPATIBILIDADE ATS
      ========================================================================= */}
      {atsDiagnostic && (
        <div className="no-print max-w-4xl mx-auto mb-4 px-4 py-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <div>
              <span className="font-extrabold text-slate-900 mr-2">
                {t('ats_audit_title')}:
              </span>
              <span className="text-slate-600">
                {atsDiagnostic.sectionsFound} {t('ats_audit_sections')} • {t('ats_audit_order')} • {t('ats_audit_indexable')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 text-[11px]">
              {t('ats_audit_score')}: {atsDiagnostic.score}/100
            </span>
            <span className="text-[10px] text-slate-400">
              ({t('ats_audit_verification')})
            </span>
          </div>
        </div>
      )}

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
            template === 'impact' || template === 'minimalist'
              ? 'p-0 font-sans'
              : template === 'executive-clean'
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
        </div>
      </div>

      {/* Bottom Floating Bar on Mobile (no-print) */}
      <div className="no-print sm:hidden fixed bottom-3 left-4 right-4 z-30">
        <div className="liquid-glass rounded-2xl p-3 shadow-xl border border-white flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1 liquid-glass-button text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/30 disabled:opacity-75 cursor-pointer"
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700"
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
          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight">
            {t('prev_print_pdf_hint')}
          </p>
        </div>
      </div>
    </div>
  );
};
