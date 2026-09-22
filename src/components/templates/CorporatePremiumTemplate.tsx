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
 * TEMPLATE 5 — CORPORATE PREMIUM
 * 
 * Perfil: Grandes Empresas, Bancos de Investimento, Multinacionais,
 * Engenharia, Indústria e Consultorias Globais.
 * 
 * Características:
 * - Diagramação minimalista de altíssimo rigor corporativo
 * - Grid alinhado com espaçamento matemático e excelente densidade
 * - Alinhamento determinístico pixel-perfect para tela e PDF
 * - Ausência de decorações supérfluas, priorizando substância e clareza
 */
export const CorporatePremiumTemplate: React.FC<TemplateProps> = ({
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
          CABEÇALHO CORPORATIVO — Sóbrio, Preciso e Imponente
      ========================================================================= */}
      <header className="pb-3.5 mb-5 border-b-2 border-slate-900">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-slate-950 uppercase leading-none">
              {personal.fullName}
            </h1>

            <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-700 uppercase mt-1.5">
              {targetRole}
            </p>

            {/* Linha de contato unificada determinística */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2 font-medium">
              {personal.cityState && (
                <ContactItem
                  icon={<MapPin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.cityState}
                />
              )}

              {personal.cityState && personal.phone && (
                <span className="text-slate-300 font-normal select-none">/</span>
              )}

              {personal.phone && (
                <ContactItem
                  icon={<Phone size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.phone}
                />
              )}

              {personal.phone && personal.email && (
                <span className="text-slate-300 font-normal select-none">/</span>
              )}

              {personal.email && (
                <ContactItem
                  icon={<Mail size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.email}
                  href={`mailto:${personal.email}`}
                />
              )}

              {personal.linkedin && (
                <>
                  <span className="text-slate-300 font-normal select-none">/</span>
                  <ContactItem
                    icon={<Linkedin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                    text={personal.linkedin}
                  />
                </>
              )}

              {personal.portfolio && (
                <>
                  <span className="text-slate-300 font-normal select-none">/</span>
                  <ContactItem
                    icon={<Globe size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                    text={personal.portfolio}
                  />
                </>
              )}
            </div>
          </div>

          {/* Foto opcional discreta se existir */}
          {personal.hasPhoto && personal.photoUrl && (
            <div className="shrink-0">
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                crossOrigin="anonymous"
                className="w-20 h-20 rounded-lg object-cover border border-slate-300 shadow-sm"
              />
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          SÍNTESE EXECUTIVA DE QUALIFICAÇÕES
      ========================================================================= */}
      {professionalSummary && (
        <section className="mb-4.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            {t('tmpl_qualifications_synthesis')}
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed text-justify">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* =========================================================================
          HISTÓRICO PROFISSIONAL & PROJETOS
      ========================================================================= */}
      {experiences && experiences.length > 0 && (
        <section className="mb-4.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2.5">
            {t('tmpl_experience')}
          </h2>

          <div className="space-y-3.5">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                {/* Linha Estrutural de Metadados */}
                <div className="flex flex-row items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-950">
                      {exp.role}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 ml-1.5">
                      | {exp.company}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                {/* Conquistas e Responsabilidades */}
                <ul className="space-y-0.5 text-xs text-slate-800 leading-relaxed pl-1">
                  {exp.bullets && exp.bullets.length > 0 ? (
                    exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-slate-500 font-bold shrink-0 mt-0.5">–</span>
                        <span className="text-justify">{bullet}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-slate-500 font-bold shrink-0 mt-0.5">–</span>
                      <span>{t('tmpl_default_bullet_corp')}</span>
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
        <section className="mb-4.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
            {t('tmpl_education')}
          </h2>

          <div className="space-y-1.5">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-950">{edu.course}</span>
                  <span className="text-slate-700 ml-1.5">— {edu.institution}</span>
                  {edu.status && (
                    <span className="text-slate-500 text-[11px] ml-1.5">
                      ({translateEduStatus(edu.status, t)})
                    </span>
                  )}
                </div>
                <span className="text-slate-600 font-medium whitespace-nowrap">
                  {edu.startYear} — {edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          COMPETÊNCIAS ESSENCIAIS & TECNOLOGIAS CORPORATIVAS
      ========================================================================= */}
      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-4.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
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
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
            {t('tmpl_exec_cert')}
          </h2>

          <div className="space-y-1 text-xs">
            {courses.map((course, idx) => (
              <div key={course.id || idx} className="flex justify-between items-baseline gap-2">
                <div>
                  <span className="font-bold text-slate-950">{course.name}</span>
                  <span className="text-slate-700 ml-1">
                    — {course.institution} {course.hours ? `(${course.hours})` : ''}
                  </span>
                </div>
                <span className="text-slate-600 font-medium whitespace-nowrap">{course.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
