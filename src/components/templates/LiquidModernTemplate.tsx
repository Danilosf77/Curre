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
 * TEMPLATE 1 — MODERN CLEAN
 * 
 * Perfil: Tecnologia, Startups, Marketing, Administrativo Moderno, Inovação.
 * Focado em:
 * - Leitura visual instantânea em 3 segundos
 * - Espaço em branco generoso e equilibrado
 * - Hierarquia tipográfica marcante: Cargo destacado e empresa subordinada
 * - Alinhamento determinístico e pixel-perfect dos dados de contato com SVGs inline
 */
export const LiquidModernTemplate: React.FC<TemplateProps> = ({
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
  return (
    <div className="w-full text-slate-800 font-sans leading-normal p-4 sm:p-6 select-text">
      {/* =========================================================================
          CABEÇALHO MODERNO LIMPO
      ========================================================================= */}
      <header className="pb-4 mb-5 border-b border-slate-200/90">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <h1 className="text-2xl sm:text-[30px] font-extrabold tracking-tight text-slate-950 leading-none">
              {personal.fullName}
            </h1>

            <p className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-sky-700">
              {targetRole}
            </p>

            {/* Linha de contatos determinística com ícones SVG inline */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-slate-700 pt-1 font-medium">
              {personal.cityState && (
                <ContactItem
                  icon={<MapPin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  text={personal.cityState}
                />
              )}

              {personal.cityState && personal.phone && (
                <span className="text-slate-300 font-normal leading-none select-none">•</span>
              )}

              {personal.phone && (
                <ContactItem
                  icon={<Phone size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  text={personal.phone}
                />
              )}

              {personal.phone && personal.email && (
                <span className="text-slate-300 font-normal leading-none select-none">•</span>
              )}

              {personal.email && (
                <ContactItem
                  icon={<Mail size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  text={personal.email}
                  href={`mailto:${personal.email}`}
                />
              )}

              {personal.linkedin && (
                <>
                  <span className="text-slate-300 font-normal leading-none select-none">•</span>
                  <ContactItem
                    icon={<Linkedin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    text={personal.linkedin}
                  />
                </>
              )}

              {personal.portfolio && (
                <>
                  <span className="text-slate-300 font-normal leading-none select-none">•</span>
                  <ContactItem
                    icon={<Globe size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    text={personal.portfolio}
                  />
                </>
              )}
            </div>
          </div>

          {/* Foto opcional discreta e geométrica */}
          {personal.hasPhoto && personal.photoUrl && (
            <div className="shrink-0">
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                crossOrigin="anonymous"
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          RESUMO PROFISSIONAL
      ========================================================================= */}
      {professionalSummary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
            {t('tmpl_summary')}
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* =========================================================================
          EXPERIÊNCIA PROFISSIONAL
      ========================================================================= */}
      {experiences && experiences.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-3">
            {t('tmpl_experience')}
          </h2>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                {/* Linha de Cargo e Metadados */}
                <div className="flex flex-row items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-950">
                      {exp.role}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 ml-1.5">
                      · {exp.company}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                {/* Bullets de Resultados e Responsabilidades */}
                <ul className="space-y-1 text-xs text-slate-700 leading-relaxed pl-1">
                  {exp.bullets && exp.bullets.length > 0 ? (
                    exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-slate-400 font-bold shrink-0 mt-0.5">•</span>
                        <span className="text-justify">{bullet}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{t('tmpl_default_bullet_modern')}</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          COMPETÊNCIAS & FERRAMENTAS (Palavras-chave em texto puro para ATS)
      ========================================================================= */}
      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2.5">
            {t('tmpl_skills')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {skills && skills.length > 0 && (
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1.5 text-[11px] uppercase tracking-wide">
                  {t('tmpl_skills_main')}
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {skills.join(' · ')}
                </p>
              </div>
            )}

            {tools && tools.length > 0 && (
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1.5 text-[11px] uppercase tracking-wide">
                  {t('tmpl_tools_soft')}
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {tools.join(' · ')}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          FORMAÇÃO ACADÊMICA
      ========================================================================= */}
      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2.5">
            {t('tmpl_education')}
          </h2>

          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex flex-row items-baseline justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.course}</span>
                  <span className="text-slate-700 ml-1.5">· {edu.institution}</span>
                  {edu.status && (
                    <span className="text-slate-500 text-[11px] ml-1.5 font-medium">
                      ({translateEduStatus(edu.status, t)})
                    </span>
                  )}
                </div>
                <span className="text-slate-500 font-medium whitespace-nowrap">
                  {edu.startYear} — {edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          CURSOS & CERTIFICAÇÕES
      ========================================================================= */}
      {courses && courses.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2.5">
            {t('tmpl_courses')}
          </h2>

          <div className="space-y-1.5 text-xs">
            {courses.map((course, idx) => (
              <div key={course.id || idx} className="flex justify-between items-baseline gap-2">
                <div>
                  <span className="font-bold text-slate-900">{course.name}</span>
                  <span className="text-slate-700 ml-1">
                    · {course.institution} {course.hours ? `(${course.hours})` : ''}
                  </span>
                </div>
                <span className="text-slate-500 font-medium whitespace-nowrap">{course.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
