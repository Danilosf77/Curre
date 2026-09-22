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
 * TEMPLATE 2 — EXECUTIVE
 * 
 * Perfil: Administração, Gestão, Finanças, Direito, Consultoria, Cargos de Liderança.
 * Características:
 * - Diagramação clássica nobre com tipografia serifada formal
 * - Cabeçalho centralizado com divisor duplo de alta autoridade
 * - Domínio da experiência profissional com foco em realizações estratégicas
 * - Alinhamento determinístico e pixel-perfect no PDF
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
  const { t } = useLanguage();
  return (
    <div className="w-full text-slate-950 font-serif leading-normal p-4 sm:p-6 select-text">
      {/* =========================================================================
          CABEÇALHO EXECUTIVO CENTRALIZADO — Tradição e Autoridade
      ========================================================================= */}
      <header className="text-center pb-3">
        {/* Foto centralizada opcional se o candidato anexou */}
        {personal.hasPhoto && personal.photoUrl && (
          <div className="flex justify-center mb-3">
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              crossOrigin="anonymous"
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-900 shadow-sm"
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-[0.16em] text-slate-950">
          {personal.fullName}
        </h1>

        <p className="text-xs sm:text-sm font-serif italic text-slate-800 font-semibold tracking-wider mt-1.5 uppercase">
          {targetRole}
        </p>

        {/* Linha de contato determinística executiva */}
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-xs text-slate-800 font-sans mt-3 font-medium">
          {personal.cityState && (
            <ContactItem
              icon={<MapPin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
              text={personal.cityState}
            />
          )}

          {personal.cityState && personal.phone && (
            <span className="text-slate-400 font-normal select-none">◆</span>
          )}

          {personal.phone && (
            <ContactItem
              icon={<Phone size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
              text={personal.phone}
            />
          )}

          {personal.phone && personal.email && (
            <span className="text-slate-400 font-normal select-none">◆</span>
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
              <span className="text-slate-400 font-normal select-none">◆</span>
              <ContactItem
                icon={<Linkedin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                text={personal.linkedin}
              />
            </>
          )}

          {personal.portfolio && (
            <>
              <span className="text-slate-400 font-normal select-none">◆</span>
              <ContactItem
                icon={<Globe size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                text={personal.portfolio}
              />
            </>
          )}
        </div>

        {/* Linha divisória dupla tradicional executiva */}
        <div className="border-t-2 border-b border-slate-950 py-[1.5px] mt-4 mb-5" />
      </header>

      {/* =========================================================================
          RESUMO EXECUTIVO DE QUALIFICAÇÕES
      ========================================================================= */}
      {professionalSummary && (
        <section className="mb-5">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            {t('tmpl_qualifications')}
          </h2>
          <p className="text-xs sm:text-[13px] font-serif text-slate-900 leading-relaxed text-justify">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* =========================================================================
          TRAJETÓRIA PROFISSIONAL EXECUTIVA
      ========================================================================= */}
      {experiences && experiences.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-3">
            {t('tmpl_trajectory')}
          </h2>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                {/* Linha Principal com Cargo e Metadados */}
                <div className="flex flex-row items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs sm:text-sm font-serif font-bold text-slate-950">
                      {exp.role}
                    </span>
                    <span className="text-xs font-serif italic text-slate-800 ml-1.5">
                      — {exp.company}
                    </span>
                  </div>
                  <span className="text-xs font-sans font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                {/* Bullets de Conquistas Executivas */}
                <ul className="space-y-1 text-xs font-serif text-slate-900 leading-relaxed pl-1">
                  {exp.bullets && exp.bullets.length > 0 ? (
                    exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-slate-800 font-bold shrink-0 mt-0.5">▪</span>
                        <span className="text-justify">{bullet}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-slate-800 font-bold shrink-0 mt-0.5">▪</span>
                      <span>{t('tmpl_default_bullet_exec')}</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          FORMAÇÃO ACADÊMICA & EDUCAÇÃO EXECUTIVA
      ========================================================================= */}
      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            {t('tmpl_education')}
          </h2>

          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline gap-2 text-xs font-serif">
                <div>
                  <span className="font-bold text-slate-950">{edu.course}</span>
                  <span className="text-slate-800 italic ml-1.5">— {edu.institution}</span>
                  {edu.status && (
                    <span className="text-slate-600 text-[11px] ml-1.5 font-sans">
                      ({translateEduStatus(edu.status, t)})
                    </span>
                  )}
                </div>
                <span className="text-slate-700 font-sans font-medium whitespace-nowrap">
                  {edu.startYear} — {edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          COMPETÊNCIAS DIRETIVAS & GESTÃO ESTRATÉGICA
      ========================================================================= */}
      {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
        <section className="mb-5">
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            {t('tmpl_exec_skills')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
            {skills && skills.length > 0 && (
              <div className="border-l-2 border-slate-900 pl-3">
                <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-slate-950 block mb-1">
                  {t('tmpl_exec_mgmt')}
                </span>
                <p className="text-slate-900 leading-relaxed">
                  {skills.join(' · ')}
                </p>
              </div>
            )}

            {tools && tools.length > 0 && (
              <div className="border-l-2 border-slate-900 pl-3">
                <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-slate-950 block mb-1">
                  {t('tmpl_exec_systems')}
                </span>
                <p className="text-slate-900 leading-relaxed">
                  {tools.join(' · ')}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          CERTIFICAÇÕES & APERFEIÇOAMENTO
      ========================================================================= */}
      {courses && courses.length > 0 && (
        <section>
          <h2 className="text-xs font-serif font-black uppercase tracking-[0.15em] text-slate-950 border-b-2 border-slate-950 pb-1 mb-2.5">
            {t('tmpl_exec_cert')}
          </h2>

          <div className="space-y-1 text-xs font-serif">
            {courses.map((course, idx) => (
              <div key={course.id || idx} className="flex justify-between items-baseline gap-2">
                <div>
                  <span className="font-bold text-slate-950">{course.name}</span>
                  <span className="text-slate-800 italic ml-1">
                    — {course.institution} {course.hours ? `(${course.hours})` : ''}
                  </span>
                </div>
                <span className="text-slate-700 font-sans font-medium whitespace-nowrap">{course.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
