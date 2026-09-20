import React from 'react';
import { PersonalData, EducationItem, CourseItem } from '../../types';
import { MapPin, Phone, Mail, Linkedin, Globe } from 'lucide-react';

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
 * Moderno Clean — O padrão de ouro buscado pelas principais empresas e startups de tecnologia.
 * Focado no princípio "Recruiter 6-Second Scan": legibilidade impecável, hierarquia tipográfica
 * precisa, espaçamento equilibrado e ausência de ruído ou poluição visual.
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
  return (
    <div className="w-full text-slate-800 font-sans leading-normal p-2 sm:p-4">
      {/* =========================================================================
          CLEAN HEADER — Direto, elegante e com alta legibilidade
      ========================================================================= */}
      <header className="pb-4 mb-5 border-b border-slate-200">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {personal.fullName}
            </h1>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-800">
              {targetRole}
            </p>

            {/* Linha de contato unificada e limpa com separadores sutis */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-800 pt-1.5 font-semibold">
              {personal.cityState && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="leading-none">{personal.cityState}</span>
                </span>
              )}
              {personal.cityState && personal.phone && <span className="text-slate-300 font-normal leading-none">•</span>}
              {personal.phone && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="leading-none">{personal.phone}</span>
                </span>
              )}
              {personal.phone && personal.email && <span className="text-slate-300 font-normal leading-none">•</span>}
              {personal.email && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="leading-none">{personal.email}</span>
                </span>
              )}
              {personal.linkedin && (
                <>
                  <span className="text-slate-300 font-normal leading-none">•</span>
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <Linkedin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="leading-none">{personal.linkedin}</span>
                  </span>
                </>
              )}
              {personal.portfolio && (
                <>
                  <span className="text-slate-300 font-normal leading-none">•</span>
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="leading-none">{personal.portfolio}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Foto opcional discreta e profissional */}
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Resumo Profissional
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
            Experiência Profissional
          </h2>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex flex-row items-baseline justify-between gap-1">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {exp.role}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 ml-1.5">
                      — {exp.company}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                {/* Bullets com marcadores elegantes e leitura clara */}
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
                      <span>Atuação no cumprimento e desenvolvimento de rotinas do setor.</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          COMPETÊNCIAS & FERRAMENTAS (Organização limpa e escaneável)
      ========================================================================= */}
      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Competências & Tecnologias
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {skills && skills.length > 0 && (
              <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1.5 text-[11px] uppercase tracking-wide">
                  Competências Principais
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {skills.join(' • ')}
                </p>
              </div>
            )}

            {tools && tools.length > 0 && (
              <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1.5 text-[11px] uppercase tracking-wide">
                  Ferramentas & Softwares
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {tools.join(' • ')}
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Formação Acadêmica
          </h2>

          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="flex flex-row items-baseline justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.course}</span>
                  <span className="text-slate-600 ml-1.5">• {edu.institution}</span>
                  <span className="text-slate-500 text-[11px] ml-1.5 font-medium">
                    ({edu.status})
                  </span>
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Cursos & Certificações
          </h2>

          <div className="space-y-1.5 text-xs">
            {courses.map((course, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900">{course.name}</span>
                  <span className="text-slate-600 ml-1">
                    — {course.institution} {course.hours ? `(${course.hours})` : ''}
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
