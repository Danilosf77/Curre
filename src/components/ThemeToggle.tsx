import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';

  const tooltips: Record<string, string> = {
    pt: isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro',
    en: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
    es: isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro',
    fr: isDark ? 'Passer au Mode Clair' : 'Passer au Mode Sombre',
  };

  const currentTooltip = tooltips[language] || tooltips.pt;

  return (
    <div
      className="flex items-center justify-between h-7 w-[84px] px-2 rounded-full bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow hover:border-sky-300 dark:hover:border-sky-500 transition-all duration-200 select-none shrink-0"
      title={currentTooltip}
      aria-label={currentTooltip}
    >
      {/* Sol (Modo Claro) à esquerda */}
      <button
        id="btn-theme-light"
        type="button"
        onClick={() => setTheme('light')}
        className={`p-0 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          !isDark
            ? 'text-amber-500 scale-110 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]'
            : 'text-slate-400 hover:text-amber-400 hover:scale-105'
        }`}
        title="Modo Claro"
        aria-label="Ativar Modo Claro"
      >
        <Sun className="w-3.5 h-3.5 stroke-[2.25]" />
      </button>

      {/* Switch deslizante verde inspirado no exemplo do usuário */}
      <button
        id="btn-theme-toggle"
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        className={`relative inline-flex h-3.5 w-6 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isDark
            ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.35)]'
            : 'bg-emerald-500/85 hover:bg-emerald-500'
        }`}
        title={currentTooltip}
        aria-label={currentTooltip}
      >
        <span className="sr-only">{currentTooltip}</span>
        {/* Thumb circular branco deslizante */}
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
            isDark ? 'translate-x-2.5' : 'translate-x-0'
          }`}
        />
      </button>

      {/* Lua (Modo Escuro) à direita */}
      <button
        id="btn-theme-dark"
        type="button"
        onClick={() => setTheme('dark')}
        className={`p-0 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isDark
            ? 'text-sky-300 scale-110 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-105'
        }`}
        title="Modo Escuro"
        aria-label="Ativar Modo Escuro"
      >
        <Moon className="w-3.5 h-3.5 stroke-[2.25]" />
      </button>
    </div>
  );
};

