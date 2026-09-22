import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LoadingOverlayProps {
  onComplete?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = () => {
  const { t } = useLanguage();
  const [phaseIndex, setPhaseIndex] = useState(0);

  const PHASES = [
    { label: t('loading_phase_1'), icon: BrainCircuit },
    { label: t('loading_phase_2'), icon: FileText },
    { label: t('loading_phase_3'), icon: Sparkles },
    { label: t('loading_phase_4'), icon: CheckCircle2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev < PHASES.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [PHASES.length]);

  const CurrentIcon = PHASES[phaseIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md liquid-glass-card rounded-3xl p-8 text-center shadow-2xl border border-white/80 overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-400/30 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* Central pulsing orb with icon */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 opacity-20 animate-ping" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-sky-500/40">
            <CurrentIcon className="w-10 h-10 animate-pulse text-white" />
          </div>
        </div>

        {/* Brand */}
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-full">
          {t('loading_brand_badge')}
        </span>

        {/* Current phase text with smooth transition */}
        <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2 transition-all duration-300">
          {PHASES[phaseIndex].label}
        </h3>

        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
          {t('loading_description')}
        </p>

        {/* Step progress pills */}
        <div className="flex justify-center items-center gap-2 mb-2">
          {PHASES.map((p, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === phaseIndex
                  ? 'w-8 bg-sky-600'
                  : idx < phaseIndex
                  ? 'w-4 bg-emerald-500'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-4">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
          <span>{t('loading_moment')}</span>
        </div>
      </div>
    </div>
  );
};
