import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';

export const LanguageSelector: React.FC<{ compact?: boolean }> = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Botão fechado: Bandeira Google Noto Color Emoji + Sigla (ex: 🇫🇷 FR) */}
      <button
        id="btn-language-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 shadow-xs hover:shadow hover:border-sky-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        title={`Idioma: ${currentOption.shortLabel} - ${currentOption.label}`}
        aria-label="Selecionar Idioma"
      >
        <img
          src={currentOption.googleFlagSvg}
          alt={`Bandeira ${currentOption.shortLabel}`}
          className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-xs border border-slate-200/70 shrink-0"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <span className="text-xs font-bold text-slate-800 tracking-wider leading-none">
          {currentOption.shortLabel}
        </span>
      </button>

      {/* Dropdown ao clicar: Bandeira Google + Sigla do Idioma + Nome */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Idioma / Language
          </div>
          {LANGUAGES.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                id={`btn-lang-${opt.code}`}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-50 text-sky-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={opt.googleFlagSvg}
                    alt={opt.shortLabel}
                    className="w-5 h-3.5 object-cover rounded-[2px] shadow-xs border border-slate-200/70 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-bold tracking-wide text-slate-900">{opt.shortLabel}</span>
                  <span className="text-slate-400 font-normal text-[11px] truncate">
                    {opt.label}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 ml-1.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
