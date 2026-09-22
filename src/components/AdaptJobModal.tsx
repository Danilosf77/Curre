import React, { useState } from 'react';
import { X, Sparkles, FileSearch, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AdaptJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onConfirmAdapt: (newJobDescription: string) => void;
  isLoading: boolean;
}

export const AdaptJobModal: React.FC<AdaptJobModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onConfirmAdapt,
  isLoading,
}) => {
  const { t } = useLanguage();
  const [jobDescription, setJobDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    onConfirmAdapt(jobDescription);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t('adapt_modal_title')}</h3>
            <p className="text-xs text-slate-500">
              {t('adapt_current_role')} <strong>{currentRole}</strong>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {t('adapt_modal_desc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('adapt_job_label')}
            </label>
            <textarea
              rows={5}
              placeholder={t('adapt_job_placeholder')}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('adapt_truth_guarantee')}</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {t('adapt_cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !jobDescription.trim()}
              className="liquid-glass-button text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-500/25 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? t('adapt_submitting') : t('adapt_submit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
