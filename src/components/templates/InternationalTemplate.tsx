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
 * TEMPLATE — INTERNATIONAL (Formato Global / Europass-inspired clean)
 *
 * Perfil: Vagas no exterior, multinacionais, programas de intercâmbio e mercados
 * anglo-saxônicos (onde fotos são desencorajadas/ilegais em processos seletivos).
 * Características únicas:
 * - Cabeçalho com barra lateral vertical azul-marinho à esquerda do nome
 * - Sem ícones, sem foto: contatos em linhas rotuladas ("Location:", "Email:")
 * - Títulos de seção em caixa alta com sublinhado grosso azul-marinho
 * - Experiências em blocos com borda esquerda fina e datas alinhadas à direita
 */
export const InternationalTemplate: React.FC<TemplateProps> = ({
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
    <h2 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#1e3a5f] border-b-[3px] border-[#1e3a5f] pb-1 mb-3">
      {children}
    </h2>
  );

  const contactRows: Array<[string, string]> = [
    [t('tmpl_contact_location'), personal.cityState],
    ['Email:', personal.email],
    ['Phone:', personal.phone],
    ['LinkedIn:', personal.linkedin],
    ['Portfolio:', personal.portfolio],
  ].filter((row): row is [string, string] => !!row[1]);

  return (
    <div className="w-full text-slate-800 font-sans leading-normal select-text bg-white px-9 py-8">
      {/* =========================================================================
          CABEÇALHO COM BARRA VERTICAL
      ========================================================================= */}
      <header className="flex items-stretch gap-4 pb-5 mb-6 border-b border-slate-200">
        <span className="w-1.5 rounded-full bg-[#1e3a5f] shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[30px] font-black tracking-tight text-[#1e3a5f] leading-none break-words">
            {personal.fullName}
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-1.5">{targetRole}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-3 text-[11px] text-slate-700">
            {contactRows.map(([label, value], i) => (
              <span key={i} className="truncate">
                <span className="font-bold text-[#1e3a5f]">{label} </span>
                {value}
              </span>
            ))}
          </div>
        </div>
      </header>

      {professionalSummary && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_summary')}</SectionTitle>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">{professionalSummary}</p>
        </section>
      )}

      {experiences && experiences.length > 0 && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_experience')}</SectionTitle>
          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="border-l-2 border-slate-200 pl-3.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[13px] font-extrabold text-[#1e3a5f]">{exp.role}</span>
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{exp.period}</span>
                </div>
                <span className="text-xs font-semibold italic text-slate-600">{exp.company}</span>
                <ul className="mt-1 space-y-1 text-xs text-slate-700 leading-relaxed">
                  {exp.bullets && exp.bullets.length > 0 ? (
                    exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-[#1e3a5f] font-bold shrink-0 mt-0.5">-</span>
                        <span className="text-justify">{bullet}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-[#1e3a5f] font-bold shrink-0 mt-0.5">-</span>
                      <span>{t('tmpl_default_bullet_corp')}</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_skills')}</SectionTitle>
          {skills && skills.length > 0 && (
            <p className="text-xs text-slate-700 leading-relaxed mb-1">
              <span className="font-bold text-[#1e3a5f]">{t('tmpl_skills_label')} </span>
              {skills.join(', ')}
            </p>
          )}
          {tools && tools.length > 0 && (
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-[#1e3a5f]">{t('tmpl_tools_label')} </span>
              {tools.join(', ')}
            </p>
          )}
        </section>
      )}

      {education && education.length > 0 && (
        <section className="mb-6">
          <SectionTitle>{t('tmpl_education')}</SectionTitle>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex items-baseline justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-[#1e3a5f]">{edu.course}</span>
                  <span className="text-slate-600">
                    {' '}
                    — {edu.institution}
                    {edu.status ? ` (${translateEduStatus(edu.status, t)})` : ''}
                  </span>
                </div>
                <span className="text-slate-500 font-semibold whitespace-nowrap">
                  {edu.startYear} – {edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {courses && courses.length > 0 && (
        <section>
          <SectionTitle>{t('tmpl_courses')}</SectionTitle>
          <div className="space-y-1 text-xs text-slate-700">
            {courses.map((course, idx) => (
              <div key={course.id || idx} className="flex items-baseline justify-between gap-2">
                <span>
                  <span className="font-bold text-[#1e3a5f]">{course.name}</span>
                  {course.institution ? ` — ${course.institution}` : ''}
                  {course.hours ? ` (${course.hours})` : ''}
                </span>
                <span className="text-slate-500 font-semibold whitespace-nowrap">{course.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
