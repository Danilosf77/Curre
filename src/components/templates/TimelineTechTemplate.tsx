import React from 'react';
import { PersonalData, EducationItem, CourseItem } from '../../types';
import { MapPin, Phone, Mail, Linkedin, Globe } from 'lucide-react';
import { ContactItem } from './ContactItem';
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
 * TEMPLATE — TIMELINE TECH (Linha do Tempo Vertical)
 *
 * Perfil: Engenharia, Dados, TI, Pesquisa e carreiras longas com progressão clara.
 * Características únicas:
 * - Toda a experiência narrada como linha do tempo vertical contínua com nós circulares
 * - Cabeçalho escuro compacto estilo terminal/dashboard com acentos teal
 * - Períodos exibidos em chips monoespaçados à esquerda da linha
 */
export const TimelineTechTemplate: React.FC<TemplateProps> = ({
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

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 mb-3">
      <span className="inline-block w-2 h-2 rounded-full bg-teal-500 ring-2 ring-teal-200 shrink-0" />
      {children}
    </h2>
  );

  return (
    <div className="w-full text-slate-800 font-sans leading-normal select-text bg-white">
      {/* =========================================================================
          CABEÇALHO ESCURO COMPACTO
      ========================================================================= */}
      <header className="bg-slate-900 px-8 py-6 text-slate-100">
        <div className="flex flex-row items-center justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] font-black tracking-tight text-white break-words">{personal.fullName}</h1>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-teal-400 mt-0.5">{targetRole}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300 pt-2 font-medium">
              {personal.cityState && (
                <ContactItem
                  icon={<MapPin size={12} strokeWidth={2} className="block w-3 h-3 text-teal-400 shrink-0" />}
                  text={personal.cityState}
                />
              )}
              {personal.phone && (
                <ContactItem
                  icon={<Phone size={12} strokeWidth={2} className="block w-3 h-3 text-teal-400 shrink-0" />}
                  text={personal.phone}
                />
              )}
              {personal.email && (
                <ContactItem
                  icon={<Mail size={12} strokeWidth={2} className="block w-3 h-3 text-teal-400 shrink-0" />}
                  text={personal.email}
                  href={`mailto:${personal.email}`}
                />
              )}
              {personal.linkedin && (
                <ContactItem
                  icon={<Linkedin size={12} strokeWidth={2} className="block w-3 h-3 text-teal-400 shrink-0" />}
                  text={personal.linkedin}
                />
              )}
              {personal.portfolio && (
                <ContactItem
                  icon={<Globe size={12} strokeWidth={2} className="block w-3 h-3 text-teal-400 shrink-0" />}
                  text={personal.portfolio}
                />
              )}
            </div>
          </div>
          {personal.hasPhoto && personal.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              crossOrigin="anonymous"
              className="w-20 h-20 rounded-lg object-cover border-2 border-teal-500/60 shrink-0"
            />
          )}
        </div>
      </header>

      <div className="px-8 py-6 space-y-6">
        {professionalSummary && (
          <section>
            <SectionTitle>{t('tmpl_summary')}</SectionTitle>
            <p className="text-[13px] text-slate-700 leading-relaxed text-justify">{professionalSummary}</p>
          </section>
        )}

        {/* =========================================================================
            LINHA DO TEMPO VERTICAL DE EXPERIÊNCIAS
        ========================================================================= */}
        {experiences && experiences.length > 0 && (
          <section>
            <SectionTitle>{t('tmpl_trajectory')}</SectionTitle>
            <ol className="relative border-l-2 border-teal-200 ml-[7px] space-y-6">
              {experiences.map((exp, idx) => (
                <li key={exp.id || idx} className="pl-6 relative">
                  <span
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                      exp.isCurrent ? 'border-teal-500' : 'border-slate-300'
                    }`}
                  >
                    {exp.isCurrent && <span className="block w-full h-full rounded-full bg-teal-500/70 scale-[0.55]" />}
                  </span>

                  <span className="inline-block font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 mb-1">
                    {exp.period}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{exp.role}</h3>
                  <p className="text-xs font-semibold text-teal-700 mb-1.5">{exp.company}</p>
                  <ul className="space-y-1 text-xs text-slate-700 leading-relaxed">
                    {exp.bullets && exp.bullets.length > 0 ? (
                      exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-teal-500 font-mono font-bold shrink-0 mt-0.5">›</span>
                          <span className="text-justify">{bullet}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="text-teal-500 font-mono font-bold shrink-0 mt-0.5">›</span>
                        <span>{t('tmpl_default_bullet_ats')}</span>
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* STACK TÉCNICA */}
        {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
          <section>
            <SectionTitle>{t('tmpl_skills_tools')}</SectionTitle>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {skills && skills.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold block mb-1">
                    // {t('tmpl_skills_main')}
                  </span>
                  <p className="text-slate-700 leading-relaxed">{skills.join(', ')}</p>
                </div>
              )}
              {tools && tools.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold block mb-1">
                    // {t('tmpl_tools_soft')}
                  </span>
                  <p className="text-slate-700 leading-relaxed">{tools.join(', ')}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FORMAÇÃO & CURSOS NA MESMA LINHA DO TEMTO REDUZIDA */}
        <div className="grid grid-cols-2 gap-6">
          {education && education.length > 0 && (
            <section>
              <SectionTitle>{t('tmpl_education_short')}</SectionTitle>
              <div className="space-y-2.5 text-xs">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <span className="font-bold text-slate-900 block">{edu.course}</span>
                    <span className="text-slate-600">{edu.institution}</span>
                    <span className="font-mono text-[10px] text-teal-700 block">
                      {edu.startYear}—{edu.endYear}
                      {edu.status ? ` · ${translateEduStatus(edu.status, t)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {courses && courses.length > 0 && (
            <section>
              <SectionTitle>{t('tmpl_courses_short')}</SectionTitle>
              <div className="space-y-2.5 text-xs">
                {courses.map((course, idx) => (
                  <div key={course.id || idx}>
                    <span className="font-bold text-slate-900 block">{course.name}</span>
                    <span className="text-slate-600">
                      {course.institution}
                      {course.hours ? ` (${course.hours})` : ''}
                    </span>
                    <span className="font-mono text-[10px] text-teal-700 block">{course.year}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
