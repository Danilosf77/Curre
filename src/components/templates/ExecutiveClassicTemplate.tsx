import React from 'react';
import { PersonalData, EducationItem, CourseItem } from '../../types';

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
 * Executivo Clássico — O padrão corporativo tradicional de alto nível.
 * Diagramação nobre com cabeçalho centralizado, tipografia serifada formal,
 * divisores duplos e estrutura cronológica tradicional. Preferido por diretorias,
 * conselhos, grandes corporações, finanças e consultorias estratégicas.
 */
export const ExecutiveClassicTemplate: React.FC<TemplateProps> = ({
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
    <div className="w-full text-slate-950 font-serif leading-normal p-2 sm:p-4">
      {/* =========================================================================
          CABEÇALHO NOBRE CENTRALIZADO — Tradição e Autoridade
      ========================================================================= */}
      <header className="text-center pb-3">
        {/* Foto centralizada opcional se o candidato anexou */}
        {personal.hasPhoto && personal.photoUrl && (
          <div className="flex justify-center mb-3">
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-900 shadow-sm"
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-[0.18em] text-slate-950">
          {personal.fullName}
        </h1>

        <p className="text-sm font-serif italic text-slate-800 font-semibold tracking-wider mt-1.5 uppercase">
          {targetRole}
        </p>

        {/* Linha de contato unificada com losangos clássicos */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-700 font-sans mt-3 font-medium">
          {personal.cityState && <span>{personal.cityState}</span>}
          {personal.cityState && personal.phone && <span className="text-slate-400">◆</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.phone && personal.email && <span className="text-slate-400">◆</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.email && personal.linkedin && <span className="text-slate-400">◆</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.portfolio && (
            <>
              <span className="text-slate-400">◆</span>
              <span>{personal.portfolio}</span>
            </>
          )}
        </div>

        {/* Linha divisória dupla tradicional */}
        <div className="border-t-2 border-b border-slate-950 py-[1.5px] mt-4 mb-6" />
      </header>

      {/* =========================================================================
          RESUMO EXECUTIVO DE QUALIFICAÇÕES
      ========================================================================= */}
      {professionalSummary && (
        <section className="mb-6">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            Resumo de Qualificações
          </h2>
          <p className="text-xs sm:text-[13px] font-serif text-slate-900 leading-relaxed text-justify">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* =========================================================================
          HISTÓRICO PROFISSIONAL EXECUTIVO
      ========================================================================= */}
      {experiences && experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-3.5">
            Experiência Profissional
          </h2>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                {/* Linha da Empresa e Período */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-serif gap-0.5">
                  <span className="text-sm font-black text-slate-950 uppercase tracking-wide">
                    {exp.company}
                  </span>
                  <span className="text-xs font-bold text-slate-700 italic whitespace-nowrap font-serif">
                    {exp.period}
                  </span>
                </div>

                {/* Cargo em itálico clássico */}
                <div className="text-xs font-serif font-bold italic text-slate-800 tracking-wide pb-0.5">
                  {exp.role}
                </div>

                {/* Marcadores clássicos formais com recuo */}
                <ul className="pl-4 space-y-1 text-xs font-serif text-slate-900 leading-relaxed list-disc">
                  {exp.bullets && exp.bullets.length > 0 ? (
                    exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify pl-1">
                        {bullet}
                      </li>
                    ))
                  ) : (
                    <li className="text-justify pl-1">
                      Condução e execução das responsabilidades do cargo de atuação.
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
        <section className="mb-6">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            Formação Acadêmica
          </h2>

          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs font-serif">
                <div>
                  <span className="font-bold text-slate-950 uppercase">{edu.course}</span>
                  <span className="text-slate-700 italic ml-1.5">— {edu.institution}</span>
                  <span className="text-slate-600 text-[11px] ml-1.5 font-sans">
                    ({edu.status})
                  </span>
                </div>
                <span className="text-slate-600 italic whitespace-nowrap">
                  {edu.startYear} — {edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          COMPETÊNCIAS & GESTÃO
      ========================================================================= */}
      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-6">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            Competências, Ferramentas & Liderança
          </h2>

          <div className="space-y-2 text-xs font-serif text-slate-900 leading-relaxed">
            {skills && skills.length > 0 && (
              <div>
                <strong className="text-slate-950 uppercase text-[11px] tracking-wide">
                  Principais Competências:
                </strong>{' '}
                <span className="text-slate-800">{skills.join(', ')}.</span>
              </div>
            )}

            {tools && tools.length > 0 && (
              <div>
                <strong className="text-slate-950 uppercase text-[11px] tracking-wide">
                  Sistemas, Softwares & Ferramentas:
                </strong>{' '}
                <span className="text-slate-800">{tools.join(', ')}.</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          CURSOS DE APERFEIÇOAMENTO & CERTIFICAÇÕES
      ========================================================================= */}
      {courses && courses.length > 0 && (
        <section>
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            Qualificação Complementar & Certificações
          </h2>

          <div className="space-y-1.5 text-xs font-serif">
            {courses.map((course, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-950">{course.name}</span>
                  <span className="text-slate-700 italic ml-1.5">
                    — {course.institution} {course.hours ? `(${course.hours})` : ''}
                  </span>
                </div>
                <span className="text-slate-600 italic whitespace-nowrap">{course.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
