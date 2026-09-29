import React from 'react';
import { PersonalData, EducationItem, CourseItem } from '../../types';
import { useLanguage, translateEduStatus } from '../../i18n/LanguageContext';

interface TemplateProps {
  personal: PersonalData;
  targetRole: string;
  professionalSummary: string;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    period: string;
    isCurrent: boolean;
    bullets: string[];
  }>;
  education: EducationItem[];
  skills: string[];
  tools: string[];
  courses: CourseItem[];
}

/**
 * TEMPLATE — ELEGANT SERIF (Bicolor Clássico)
 *
 * Perfil: Diretoria, Conselhos, Jurídico, Medicina, Hotelaria e Luxury.
 * Características únicas:
 * - Tipografia serifada em toda a peça com entrelinha ampla
 * - Cabeçalho centralizado com nome em versalete espaçado e ornamento em losango
 * - Filetes duplos dourados separando seções, sem uso de cor saturada
 * - Contatos em linha única centralizada separados por losangos (sem ícones)
 */
export const ElegantSerifTemplate: React.FC<TemplateProps> = ({
  personal,
  targetRole,
  professionalSummary,
  experiences,
  education,
  skills,
  tools,
  courses,
}) => {
  const { t } = useLanguage();

  const contactLine = [
    personal.cityState,
    personal.phone,
    personal.email,
    personal.linkedin,
    personal.portfolio,
  ]
    .filter(Boolean)
    .join('   ◆   ');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mb-3">
      <h2 className="text-center text-[12px] font-bold uppercase tracking-[0.3em] text-stone-800">
        {children}
      </h2>
      <div className="flex items-center justify-center gap-1 mt-1.5">
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600/70" />
        <span className="w-1.5 h-1.5 rotate-45 bg-amber-600 shrink-0" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600/70" />
      </div>
    </div>
  );

  return (
    <div className="w-full text-stone-800 font-serif leading-relaxed select-text bg-white px-10 py-9 border-[3px] border-double border-amber-700/40">
      {/* =========================================================================
          CABEÇALHO CENTRALIZADO COM ORNAMENTOS
      ========================================================================= */}
      <header className="text-center pb-5 mb-6 border-b border-stone-300">
        {personal.hasPhoto && personal.photoUrl && (
          <img
            src={personal.photoUrl}
            alt={personal.fullName}
            crossOrigin="anonymous"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-amber-700/50 shadow-sm"
          />
        )}
        <h1 className="text-[30px] font-bold uppercase tracking-[0.28em] text-stone-900 leading-tight break-words">
          {personal.fullName}
        </h1>
        <p className="text-[13px] italic text-amber-800 mt-2 tracking-wide">{targetRole}</p>
        {contactLine && (
          <p className="text-[11px] text-stone-600 mt-3 tracking-wide leading-snug break-words">{contactLine}</p>
        )}
      </header>

      {/* RESUMO */}
      {professionalSummary && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_qualifications')}</SectionTitle>
          <p className="text-[13px] text-stone-700 leading-relaxed text-justify indent-6">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* EXPERIÊNCIA */}
      {experiences && experiences.length > 0 && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_experience')}</SectionTitle>
          <div className="space-y-5">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx}>
                <div className="text-center">
                  <span className="text-[14px] font-bold text-stone-900 uppercase tracking-wider">{exp.role}</span>
                  <span className="block text-[12px] italic text-stone-700 mt-0.5">
                    {exp.company} · {exp.period}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-stone-700 leading-relaxed px-4">
                  {exp.bullets && exp.bullets.length > 0 ? (
                    exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span className="text-amber-700 shrink-0 mt-0.5">◆</span>
                        <span className="text-justify">{bullet}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2.5">
                      <span className="text-amber-700 shrink-0 mt-0.5">◆</span>
                      <span>{t('tmpl_default_bullet_exec')}</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPETÊNCIAS */}
      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_skills')}</SectionTitle>
          {skills && skills.length > 0 && (
            <p className="text-[12.5px] text-stone-700 text-center leading-loose">
              <span className="font-bold uppercase tracking-widest text-[11px] text-stone-900">
                {t('tmpl_skills_main')} —{' '}
              </span>
              {skills.join('  ·  ')}
            </p>
          )}
          {tools && tools.length > 0 && (
            <p className="text-[12.5px] text-stone-700 text-center leading-loose mt-1.5">
              <span className="font-bold uppercase tracking-widest text-[11px] text-stone-900">
                {t('tmpl_tools_soft')} —{' '}
              </span>
              {tools.join('  ·  ')}
            </p>
          )}
        </section>
      )}

      {/* FORMAÇÃO */}
      {education && education.length > 0 && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_education')}</SectionTitle>
          <div className="space-y-2.5">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="text-center text-[12.5px]">
                <span className="font-bold text-stone-900">{edu.course}</span>
                <span className="block italic text-stone-600">
                  {edu.institution}
                  {edu.status ? ` — ${translateEduStatus(edu.status, t)}` : ''} ({edu.startYear} — {edu.endYear})
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CURSOS */}
      {courses && courses.length > 0 && (
        <section>
          <SectionTitle>{t('tmpl_courses')}</SectionTitle>
          <div className="space-y-1.5 text-center text-[12px] text-stone-700">
            {courses.map((course, idx) => (
              <p key={course.id || idx}>
                <span className="font-bold text-stone-900">{course.name}</span>
                {course.institution ? ` · ${course.institution}` : ''}
                {course.hours ? ` (${course.hours})` : ''}
                {course.year ? ` — ${course.year}` : ''}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
