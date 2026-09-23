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
 * TEMPLATE 3 — ATS PROFESSIONAL
 * 
 * O modelo com arquitetura otimizada para sistemas de triagem automática (ATS)
 * e formulários de grandes empresas (Workday, Taleo, Greenhouse, Lever, SAP).
 * 
 * Princípios de Engenharia ATS:
 * - Diagramação estritamente linear em coluna única (Single Column)
 * - Ordem de leitura DOM 100% previsível (Nome -> Contato -> Resumo -> Experiência -> Formação -> Competências)
 * - Títulos de seções padronizados e semanticamente universais
 * - Texto real e selecionável; sem dados essenciais em tabelas complexas, pseudo-elementos ou imagens
 * - Competências em bloco contínuo de palavras-chave para máxima extração de termos técnicos
 */
export const AtsProfessionalTemplate: React.FC<TemplateProps> = ({
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
    <div className="w-full text-slate-900 font-sans leading-normal p-4 sm:p-6 select-text bg-white">
      {/* =========================================================================
          CABEÇALHO ATS — 100% Linear e Legível
      ========================================================================= */}
      <header className="pb-3 mb-4 border-b-2 border-slate-900">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-950">
          {personal.fullName}
        </h1>

        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mt-1">
          {targetRole}
        </p>

        {/* Informações de contato legíveis tanto por humanos quanto por parsers robóticos */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-800 mt-2 font-medium">
          {personal.cityState && (
            <ContactItem
              icon={<MapPin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-700 shrink-0" />}
              text={personal.cityState}
            />
          )}

          {personal.cityState && personal.phone && (
            <span className="text-slate-400 font-normal select-none">|</span>
          )}

          {personal.phone && (
            <ContactItem
              icon={<Phone size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-700 shrink-0" />}
              text={personal.phone}
            />
          )}

          {personal.phone && personal.email && (
            <span className="text-slate-400 font-normal select-none">|</span>
          )}

          {personal.email && (
            <ContactItem
              icon={<Mail size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-700 shrink-0" />}
              text={personal.email}
              href={`mailto:${personal.email}`}
            />
          )}

          {personal.linkedin && (
            <>
              <span className="text-slate-400 font-normal select-none">|</span>
              <ContactItem
                icon={<Linkedin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-700 shrink-0" />}
                text={personal.linkedin}
              />
            </>
          )}

          {personal.portfolio && (
            <>
              <span className="text-slate-400 font-normal select-none">|</span>
              <ContactItem
                icon={<Globe size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-700 shrink-0" />}
                text={personal.portfolio}
              />
            </>
          )}
        </div>
      </header>

      {/* =========================================================================
          RESUMO PROFISSIONAL
      ========================================================================= */}
      {professionalSummary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
            {t('tmpl_summary')}
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed text-justify">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* =========================================================================
          EXPERIÊNCIA PROFISSIONAL
      ========================================================================= */}
      {experiences && experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2.5">
            {t('tmpl_experience')}
          </h2>

          <div className="space-y-3.5">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                {/* Linha de Cargo e Empresa */}
                <div className="flex flex-row items-baseline justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-950 inline break-words">
                      {exp.role}
                    </h3>
                    <span className="text-xs font-semibold text-slate-800 ml-1.5 break-words">
                      · {exp.company}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    {exp.period}
                  </span>
                </div>

                {/* Bullets de Responsabilidades e Resultados */}
                <ul className="space-y-0.5 text-xs text-slate-800 leading-relaxed pl-1">
                  {exp.bullets && exp.bullets.length > 0 ? (
                    exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-slate-600 font-bold shrink-0 mt-0.5">•</span>
                        <span className="text-justify">{bullet}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>{t('tmpl_default_bullet_ats')}</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          FORMAÇÃO ACADÊMICA
      ========================================================================= */}
      {education && education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
            {t('tmpl_education')}
          </h2>

          <div className="space-y-1.5">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-950">{edu.course}</span>
                  <span className="text-slate-800 ml-1.5">· {edu.institution}</span>
                  {edu.status && (
                    <span className="text-slate-600 text-[11px] ml-1.5 font-medium">
                      ({translateEduStatus(edu.status, t)})
                    </span>
                  )}
                </div>
                <span className="text-slate-700 font-medium whitespace-nowrap">
                  {edu.startYear} — {edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          COMPETÊNCIAS & FERRAMENTAS (Estrutura Ideal para Parsing de Keywords)
      ========================================================================= */}
      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
            {t('tmpl_skills_tech_alt')}
          </h2>

          <div className="space-y-1.5 text-xs">
            {skills && skills.length > 0 && (
              <div>
                <span className="font-bold text-slate-950">{t('tmpl_skills_label')} </span>
                <span className="text-slate-800">{skills.join(' · ')}</span>
              </div>
            )}

            {tools && tools.length > 0 && (
              <div>
                <span className="font-bold text-slate-950">{t('tmpl_tools_label')} </span>
                <span className="text-slate-800">{tools.join(' · ')}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          CURSOS & CERTIFICAÇÕES
      ========================================================================= */}
      {courses && courses.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
            {t('tmpl_courses')}
          </h2>

          <div className="space-y-1 text-xs">
            {courses.map((course, idx) => (
              <div key={course.id || idx} className="flex justify-between items-baseline gap-2">
                <div>
                  <span className="font-bold text-slate-950">{course.name}</span>
                  <span className="text-slate-800 ml-1">
                    · {course.institution} {course.hours ? `(${course.hours})` : ''}
                  </span>
                </div>
                <span className="text-slate-700 font-medium whitespace-nowrap">{course.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
