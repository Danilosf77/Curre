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
 * TEMPLATE — CREATIVE COLOR BAND
 *
 * Perfil: Design, Moda, Publicidade, Audiovisual, Arquitetura e perfis criativos.
 * Características únicas:
 * - Faixa de gradiente full-bleed no topo com nome em destaque reverso (branco)
 * - Tags de competências em pílulas arredondadas coloridas
 * - Títulos de seção com marcador geométrico quadrado rotacionado
 */
export const CreativeColorTemplate: React.FC<TemplateProps> = ({
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
    <h2 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.14em] text-violet-950 mb-3">
      <span className="inline-block w-3 h-3 rotate-45 bg-gradient-to-tr from-fuchsia-500 to-violet-600 shrink-0" />
      {children}
    </h2>
  );

  return (
    <div className="w-full text-slate-800 font-sans leading-normal select-text bg-white">
      {/* =========================================================================
          CABEÇALHO COM FAIXA DE GRADIENTE FULL-BLEED
      ========================================================================= */}
      <header className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-rose-500 px-8 py-8 text-white">
        <div className="flex flex-row items-center justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-[32px] leading-tight font-black tracking-tight break-words">
              {personal.fullName}
            </h1>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/90 mt-1">
              {targetRole}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/95 pt-2.5 font-medium">
              {personal.cityState && (
                <ContactItem
                  icon={<MapPin size={13} strokeWidth={2.2} className="block w-3.5 h-3.5 text-white shrink-0" />}
                  text={personal.cityState}
                />
              )}
              {personal.phone && (
                <ContactItem
                  icon={<Phone size={13} strokeWidth={2.2} className="block w-3.5 h-3.5 text-white shrink-0" />}
                  text={personal.phone}
                />
              )}
              {personal.email && (
                <ContactItem
                  icon={<Mail size={13} strokeWidth={2.2} className="block w-3.5 h-3.5 text-white shrink-0" />}
                  text={personal.email}
                  href={`mailto:${personal.email}`}
                />
              )}
              {personal.linkedin && (
                <ContactItem
                  icon={<Linkedin size={13} strokeWidth={2.2} className="block w-3.5 h-3.5 text-white shrink-0" />}
                  text={personal.linkedin}
                />
              )}
              {personal.portfolio && (
                <ContactItem
                  icon={<Globe size={13} strokeWidth={2.2} className="block w-3.5 h-3.5 text-white shrink-0" />}
                  text={personal.portfolio}
                />
              )}
            </div>
          </div>

          {personal.hasPhoto && personal.photoUrl && (
            <div className="shrink-0 rounded-full p-1.5 bg-white/25 ring-2 ring-white/60">
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                crossOrigin="anonymous"
                className="w-24 h-24 rounded-full object-cover border-2 border-white"
              />
            </div>
          )}
        </div>
      </header>

      <div className="px-8 py-6 space-y-6">
        {/* RESUMO */}
        {professionalSummary && (
          <section>
            <SectionTitle>{t('tmpl_profile')}</SectionTitle>
            <p className="text-[13px] text-slate-700 leading-relaxed text-justify border-l-[3px] border-fuchsia-400 pl-3.5 italic">
              {professionalSummary}
            </p>
          </section>
        )}

        {/* EXPERIÊNCIA */}
        {experiences && experiences.length > 0 && (
          <section>
            <SectionTitle>{t('tmpl_experience')}</SectionTitle>
            <div className="space-y-5">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="relative pl-5">
                  <span className="absolute left-0 top-1 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-violet-500 via-fuchsia-400 to-transparent" />
                  <div className="flex flex-row items-baseline justify-between gap-2 flex-wrap">
                    <span className="text-sm font-black text-violet-950">{exp.role}</span>
                    <span className="text-[11px] font-bold text-white bg-fuchsia-600 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-fuchsia-700 uppercase tracking-wide">{exp.company}</span>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 leading-relaxed">
                    {exp.bullets && exp.bullets.length > 0 ? (
                      exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-fuchsia-500 font-black shrink-0 mt-0.5">▸</span>
                          <span className="text-justify">{bullet}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="text-fuchsia-500 font-black shrink-0 mt-0.5">▸</span>
                        <span>{t('tmpl_default_bullet_modern')}</span>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COMPETÊNCIAS EM PÍLULAS */}
        {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
          <section>
            <SectionTitle>{t('tmpl_skills_tools')}</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {(skills || []).map((s, i) => (
                <span
                  key={`sk-${i}`}
                  className="text-[11px] font-bold text-violet-900 bg-violet-100 border border-violet-300 rounded-full px-2.5 py-1"
                >
                  {s}
                </span>
              ))}
              {(tools || []).map((toolName, i) => (
                <span
                  key={`tl-${i}`}
                  className="text-[11px] font-bold text-rose-900 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-1"
                >
                  {toolName}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* FORMAÇÃO + CURSOS EM GRID DE 2 COLUNAS */}
        <div className="grid grid-cols-2 gap-6">
          {education && education.length > 0 && (
            <section>
              <SectionTitle>{t('tmpl_education_short')}</SectionTitle>
              <div className="space-y-2.5">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-xs">
                    <span className="font-black text-violet-950 block leading-snug">{edu.course}</span>
                    <span className="text-slate-600">{edu.institution}</span>
                    {edu.status && (
                      <span className="text-slate-500 block text-[10px]">{translateEduStatus(edu.status, t)}</span>
                    )}
                    <span className="text-fuchsia-700 font-bold text-[10px]">
                      {edu.startYear} — {edu.endYear}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {courses && courses.length > 0 && (
            <section>
              <SectionTitle>{t('tmpl_courses_short')}</SectionTitle>
              <div className="space-y-2.5">
                {courses.map((course, idx) => (
                  <div key={course.id || idx} className="text-xs">
                    <span className="font-black text-violet-950 block leading-snug">{course.name}</span>
                    <span className="text-slate-600">
                      {course.institution}
                      {course.hours ? ` (${course.hours})` : ''}
                    </span>
                    <span className="text-fuchsia-700 font-bold text-[10px] block">{course.year}</span>
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
