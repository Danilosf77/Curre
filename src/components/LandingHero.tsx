import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Award, Zap, FileText, ChevronRight, UserCheck, Search, Clock, Cloud } from 'lucide-react';
import { OptimizedResume, UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface LandingHeroProps {
  onStartResume: () => void;
  onOpenHowItWorks: () => void;
  savedResume?: OptimizedResume | null;
  onOpenSavedResume?: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartResume,
  onOpenHowItWorks,
  savedResume,
  onOpenSavedResume,
  currentUser,
  onOpenLogin,
}) => {
  const { t } = useLanguage();
  // Animated simulation state for the liquid glass resume preview
  const [activeStepAnim, setActiveStepAnim] = useState(0);

  const simulationSteps = [
    {
      title: t('sim_title_1'),
      detail: t('sim_detail_1'),
      badge: t('sim_badge_1'),
    },
    {
      title: t('sim_title_2'),
      detail: t('sim_detail_2'),
      badge: t('sim_badge_2'),
    },
    {
      title: t('sim_title_3'),
      detail: t('sim_detail_3'),
      badge: t('sim_badge_3'),
    },
    {
      title: t('sim_title_4'),
      detail: t('sim_detail_4'),
      badge: t('sim_badge_4'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepAnim((prev) => (prev + 1) % simulationSteps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden pt-4 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-gradient-to-tr from-sky-400/20 via-cyan-300/20 to-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-10 right-4 w-72 h-72 bg-blue-300/15 rounded-full blur-2xl -z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-4">
        {/* Left Column: Headlines & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-xs font-semibold text-sky-800 dark:text-sky-300 shadow-sm border border-sky-200/60 dark:border-sky-800/60">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{t('hero_badge')}</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-[44px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]">
            {t('hero_title_p1')}
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 dark:from-sky-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
              {t('hero_title_highlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
            {t('hero_subtitle')}
          </p>

          {/* Banner de Currículo Salvo no Navegador */}
          {savedResume && onOpenSavedResume && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 dark:from-slate-800/90 dark:via-slate-850 dark:to-sky-950/40 border border-sky-200 dark:border-sky-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-700">
                      {t('hero_saved_session')}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                      {savedResume.personal?.fullName || t('hero_saved_resume_title')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {t('step_3_field_role')}: <strong>{savedResume.targetRole || t('sim_default_role')}</strong> • {t('hero_saved_ready')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={onOpenSavedResume}
                  id="hero-btn-open-saved"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('hero_saved_open')}</span>
                </button>
                <button
                  onClick={onStartResume}
                  id="hero-btn-create-new-alt"
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all text-center"
                >
                  {t('hero_saved_new')}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <button
              onClick={onStartResume}
              id="hero-btn-create-resume"
              className="w-full sm:w-auto liquid-glass-button text-white font-bold px-7 py-3.5 rounded-xl text-base flex items-center justify-center gap-3 group cursor-pointer shadow-lg shadow-sky-500/30"
            >
              <span>{t('hero_cta_start')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenHowItWorks}
              id="hero-btn-how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white liquid-glass hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{t('hero_cta_how')}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-400" />
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('hero_trust_free')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('hero_trust_no_signup')}</span>
            </div>
            {currentUser ? (
              <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-semibold bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>{t('nav_cloud_active_title')} ({currentUser.name})</span>
              </div>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white font-bold bg-sky-50/80 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                  title={t('hero_saved_cloud_tooltip')}
                >
                  <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{t('hero_trust_cloud')}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Column: Interactive Animated Liquid Glass Simulation */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md">
            {/* Ambient card background glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-400/40 via-cyan-400/30 to-blue-500/40 rounded-3xl blur-xl opacity-70" />

            <div className="relative liquid-glass-card rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/90 dark:border-slate-700">
              {/* Header inside simulation */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 ml-1">
                    {t('sim_header_brand')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-800">
                  <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                  {t('sim_header_ai_active')}
                </span>
              </div>

              {/* Dynamic steps tracker */}
              <div className="space-y-3">
                {simulationSteps.map((step, idx) => {
                  const isActive = activeStepAnim === idx;
                  const isPast = activeStepAnim > idx;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl transition-all duration-300 border ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-50/90 to-white/90 dark:from-slate-800/90 dark:to-slate-800 border-sky-300 dark:border-sky-600 shadow-sm scale-[1.01]'
                          : isPast
                          ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-80'
                          : 'bg-white/40 dark:bg-slate-800/20 border-transparent opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isActive
                                ? 'bg-sky-600 text-white'
                                : isPast
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isPast ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              isActive ? 'text-sky-900 dark:text-sky-200' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-white/70 dark:bg-slate-750">
                          {step.badge}
                        </span>
                      </div>
                      <p
                        className={`text-xs pl-7 font-mono ${
                          isActive
                            ? 'text-sky-800 dark:text-sky-300 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {step.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Interactive bottom micro-banner */}
              <div className="mt-4 pt-3 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="font-medium">{t('sim_no_fake')}</span>
                </div>
                <button
                  onClick={onStartResume}
                  className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  {t('sim_try_now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key value cards below hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
        <div className="liquid-glass-card rounded-2xl p-5 hover:border-sky-300 dark:hover:border-sky-500 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            {t('feat_1_title')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('feat_1_desc')}
          </p>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 hover:border-sky-300 dark:hover:border-sky-500 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            {t('feat_2_title')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('feat_2_desc')}
          </p>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 hover:border-sky-300 dark:hover:border-sky-500 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            {t('feat_3_title')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('feat_3_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};
