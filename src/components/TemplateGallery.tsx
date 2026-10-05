import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import type { TemplateStyle } from '../types';
import { RESUME_TEMPLATES, galleryLabels, type TemplateCategory } from '../data/resumeTemplates';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  current: TemplateStyle;
  onApply: (template: TemplateStyle) => void;
  onClose: () => void;
}

export function TemplateGallery({ current, onApply, onClose }: Props) {
  const { t, language } = useLanguage();
  const copy = galleryLabels(language);
  const pending = current;
  const [category, setCategory] = useState<'all' | 'signature' | TemplateCategory>('all');
  const dialog = useRef<HTMLDialogElement>(null);

  const visible = RESUME_TEMPLATES.filter(item => category === 'all' || (category === 'signature' ? item.collection === 'signature' : item.category === category));

  useEffect(() => {
    const element = dialog.current!;
    const originalOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = originalOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby="template-gallery-title"
      aria-describedby="template-gallery-description"
      className="no-print fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none max-h-none h-[92dvh] rounded-t-3xl border-0 p-0 bg-slate-50 text-slate-900 backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm open:flex open:flex-col sm:inset-0 sm:m-auto sm:h-[min(84dvh,840px)] sm:w-[min(960px,calc(100%-48px))] sm:rounded-3xl dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 pt-5 pb-4 sm:px-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="template-gallery-title" className="text-lg font-extrabold sm:text-xl">{copy.title}</h2>
            <p id="template-gallery-description" className="mt-1 text-xs text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
          </div>
          <button type="button" autoFocus onClick={onClose} aria-label={copy.close} className="shrink-0 rounded-xl p-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-500 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div aria-label={copy.title} style={{ scrollbarWidth: 'none' }} className="mt-4 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {(['all', 'signature', 'modern', 'classic', 'ats', 'creative'] as const).map(value => (
            <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-sky-500 ${category === value ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
              {copy[value]}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{visible.length} {copy.models}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {visible.map(item => (
            <button
              key={item.id}
              type="button"
              id={`gallery-template-${item.id}`}
              aria-label={item.name}
              aria-pressed={pending === item.id}
              onClick={() => { onApply(item.id); onClose(); }}
              className={`relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${pending === item.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50' : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800'}`}
            >
              <div className="w-full bg-slate-100 px-3 pt-3 pb-2 dark:bg-slate-950/50">
                <img src={`/template-previews/${item.id}.jpg`} alt="" loading="lazy" width={328} height={420} className="block aspect-[820/1050] w-full rounded-sm border border-slate-200 object-cover object-top bg-white" />
              </div>
              {pending === item.id && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white" aria-hidden="true"><Check className="h-4 w-4" /></span>}
              <div className="flex-1 p-3">
                {item.collection === 'signature' && <span className="mb-1.5 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">SIGNATURE</span>}
                <span className="block text-xs font-extrabold sm:text-sm">{item.name}</span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">{item.badge?.[language] || t(`tmpl_${item.key}_badge`)}</span>
                {item.description && <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{item.description[language] || item.description.pt}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>


    </dialog>, document.body
  );
}
