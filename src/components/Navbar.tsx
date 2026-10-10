import React, { useState } from 'react';
import { Sparkles, FileText, HelpCircle, Layers, LogIn, Menu, X, CheckCircle2, Cloud, User, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  onStartResume: () => void;
  onOpenHowItWorks: () => void;
  onOpenFeatures: () => void;
  onOpenAuth: () => void;
  isWizardActive: boolean;
  onGoHome: () => void;
  hasSavedResume?: boolean;
  onOpenSavedResume?: () => void;
  currentUser?: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onStartResume,
  onOpenHowItWorks,
  onOpenFeatures,
  onOpenAuth,
  isWizardActive,
  onGoHome,
  hasSavedResume,
  onOpenSavedResume,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();
  const contactLabel = { pt: 'Contato', en: 'Contact', es: 'Contacto', fr: 'Contact' }[language];

  return (
    <header className="sticky top-0 z-40 w-full no-print px-3 sm:px-6 lg:px-8 pt-1.5 pb-2">
      {/* Canto superior direito: fora da barra, perfeitamente alinhado com Seletor de Tema e Idioma */}
      <div className="max-w-6xl mx-auto flex items-center justify-end gap-2 pr-1 sm:pr-2 pb-1.5">
        <ThemeToggle />
        <LanguageSelector />
      </div>
      {/* Barra de Navegação Principal Unificada */}
      <div className="max-w-6xl mx-auto liquid-glass rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 transition-all duration-300 shadow-sm">
        {/* Brand / Logo */}
        <button
          onClick={onGoHome}
          id="navbar-brand-button"
          className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                CURRÊ
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                IA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-normal -mt-0.5 hidden sm:block whitespace-nowrap">
              {t('brand_slogan')}
            </p>
          </div>
        </button>

        {/* Desktop Navigation - Visível em telas md e maiores no modo claro e escuro */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3">
          <a href="/contact" className="px-2 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 focus-visible:outline-2 focus-visible:outline-sky-500">{contactLabel}</a>
          <button
            onClick={onStartResume}
            id="nav-link-create"
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isWizardActive
                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
            }`}
          >
            {t('nav_create')}
          </button>
          <button
            onClick={onOpenHowItWorks}
            id="nav-link-how-it-works"
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('nav_how_it_works')}</span>
          </button>
          <button
            onClick={onOpenFeatures}
            id="nav-link-features"
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('nav_features')}</span>
          </button>
        </nav>

        {/* Right Actions: User/Saved + CTA (100% contido dentro da barra) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">

          {hasSavedResume && onOpenSavedResume && (
            <button
              onClick={onOpenSavedResume}
              id="nav-btn-saved-resume"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900/60 border border-sky-300 dark:border-sky-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs whitespace-nowrap shrink-0"
              title={t('nav_saved_resume')}
            >
              <FileText className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              <span className="hidden lg:inline">{t('nav_saved_resume')}</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={onOpenAuth}
              id="nav-btn-user-profile"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
              title="Conta conectada na nuvem"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-[11px] sm:text-xs font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[80px] sm:max-w-[100px] truncate">{currentUser.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" title="Nuvem ativa" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              id="nav-btn-login"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title="Entrar (Opcional - para salvar na nuvem)"
            >
              <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">{t('nav_login_cloud')}</span>
            </button>
          )}

          <button
            onClick={onStartResume}
            id="nav-btn-cta"
            className="liquid-glass-button text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shadow-md shadow-sky-500/20 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>{t('nav_cta_create')}</span>
          </button>
        </div>

        {/* Mobile menu & quick action */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            onClick={onStartResume}
            id="nav-mobile-quick-cta"
            className="liquid-glass-button text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
          >
            {t('nav_mobile_create')}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="nav-mobile-toggle"
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer shrink-0"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto liquid-glass-card rounded-2xl p-4 shadow-xl border border-white/80 dark:border-slate-700 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <a href="/contact" className="flex min-h-11 items-center px-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus-visible:outline-2 focus-visible:outline-sky-500">{contactLabel}</a>
          <div className="px-2 py-1 text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
            {t('nav_header')}
          </div>
          {hasSavedResume && onOpenSavedResume && (
            <button
              onClick={() => {
                onOpenSavedResume();
                setMobileMenuOpen(false);
              }}
              id="nav-mobile-saved-resume"
              className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sky-800 dark:text-sky-300 bg-sky-100/90 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center gap-2.5 text-sm"
            >
              <FileText className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              {t('nav_saved_resume')}
            </button>
          )}
          <button
            onClick={() => {
              onStartResume();
              setMobileMenuOpen(false);
            }}
            id="nav-mobile-create"
            className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-100 hover:bg-sky-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 text-sm"
          >
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            {t('nav_create')}
          </button>
          <button
            onClick={() => {
              onOpenHowItWorks();
              setMobileMenuOpen(false);
            }}
            id="nav-mobile-how"
            className="w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 text-sm"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            {t('nav_how_it_works')}
          </button>
          <button
            onClick={() => {
              onOpenFeatures();
              setMobileMenuOpen(false);
            }}
            id="nav-mobile-features"
            className="w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 text-sm"
          >
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            {t('nav_smart_features')}
          </button>
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
            {currentUser ? (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                id="nav-mobile-user"
                className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{currentUser.name}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {t('nav_cloud_active')}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                id="nav-mobile-login"
                className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{t('nav_login_cloud_full')}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{t('nav_optional')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
