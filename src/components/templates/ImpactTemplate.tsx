import React from 'react';
import { PersonalData, EducationItem, CourseItem } from '../../types';
import { MapPin, Phone, Mail, Linkedin, Globe, Award, GraduationCap, Wrench, Sparkles, Briefcase, User } from 'lucide-react';
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
 * TEMPLATE 4 — IMPACT
 * 
 * Perfil: Marketing, Vendas, Comunicação, Produto, Tecnologia e Líderes
 * que desejam presença visual memorável e posicionamento de alto valor.
 * 
 * Características:
 * - Diagramação em 2 colunas com painel lateral estruturado de alto contraste
 * - Identidade contemporânea com destaque para métricas e realizações
 * - Alinhamento determinístico de ícones e textos para PDF
 */
export const ImpactTemplate: React.FC<TemplateProps> = ({
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
    <div className="impact-resume-layout w-full text-slate-800 font-sans leading-normal flex flex-row min-h-full select-text bg-transparent template-impact">
      {/* =========================================================================
          COLUNA LATERAL DE IMPACTO (32% da largura) — Alto Contraste & Metadados
      ========================================================================= */}
      <aside className="impact-resume-sidebar w-[32%] bg-slate-900 text-slate-100 p-4 sm:p-5 flex flex-col gap-4 shrink-0 box-border">
        {/* Foto centralizada de destaque se o usuário enviou */}
        {personal.hasPhoto && personal.photoUrl && (
          <div className="flex justify-center mb-1">
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              crossOrigin="anonymous"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-400/40 shadow-lg"
            />
          </div>
        )}

        {/* Informações de Contato com SVG determinístico */}
        <div>
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2.5 flex items-center gap-1.5">
            <User size={13} strokeWidth={2.5} className="block shrink-0" />
            <span>{t('tmpl_contact')}</span>
          </h3>

          <div className="space-y-2 text-xs font-medium text-slate-200">
            {personal.cityState && (
              <div className="block">
                <ContactItem
                  icon={<MapPin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  text={personal.cityState}
                  textClassName="text-slate-200"
                />
              </div>
            )}

            {personal.phone && (
              <div className="block">
                <ContactItem
                  icon={<Phone size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  text={personal.phone}
                  textClassName="text-slate-200"
                />
              </div>
            )}

            {personal.email && (
              <div className="block">
                <ContactItem
                  icon={<Mail size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  text={personal.email}
                  href={`mailto:${personal.email}`}
                  textClassName="text-slate-200 text-[11px] break-all"
                />
              </div>
            )}

            {personal.linkedin && (
              <div className="block">
                <ContactItem
                  icon={<Linkedin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  text={personal.linkedin}
                  textClassName="text-slate-200 text-[11px] break-all"
                />
              </div>
            )}

            {personal.portfolio && (
              <div className="block">
                <ContactItem
                  icon={<Globe size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  text={personal.portfolio}
                  textClassName="text-slate-200 text-[11px] break-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Competências Principais */}
        {skills && skills.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5">
              <Sparkles size={13} strokeWidth={2.5} className="block shrink-0" />
              <span>{t('tmpl_skills_main')}</span>
            </h3>
            <ul className="space-y-1 text-xs text-slate-300 font-medium">
              {skills.map((skill, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ferramentas e Tecnologias */}
        {tools && tools.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5">
              <Wrench size={13} strokeWidth={2.5} className="block shrink-0" />
              <span>{t('tmpl_tools_soft')}</span>
            </h3>
            <div className="flex flex-wrap gap-1">
              {tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formação Acadêmica no Painel */}
        {education && education.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5">
              <GraduationCap size={13} strokeWidth={2.5} className="block shrink-0" />
              <span>{t('tmpl_education_short')}</span>
            </h3>
            <div className="space-y-2 text-xs">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <p className="font-bold text-white text-xs">{edu.course}</p>
                  <p className="text-slate-400 text-[11px]">{edu.institution}</p>
                  <p className="text-slate-500 text-[10px]">
                    {edu.startYear} — {edu.endYear} {edu.status ? `(${translateEduStatus(edu.status, t)})` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cursos e Certificações */}
        {courses && courses.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 border-b border-slate-700/80 pb-1 mb-2 flex items-center gap-1.5">
              <Award size={13} strokeWidth={2.5} className="block shrink-0" />
              <span>{t('tmpl_certifications')}</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-300">
              {courses.map((course, idx) => (
                <div key={course.id || idx} className="text-[11px]">
                  <p className="font-semibold text-slate-200">{course.name}</p>
                  <p className="text-slate-400 text-[10px]">
                    {course.institution} • {course.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* =========================================================================
          COLUNA PRINCIPAL (68% da largura) — Narrativa de Carreira & Resultados
      ========================================================================= */}
      <main className="impact-resume-content w-[68%] flex-1 min-w-0 p-5 sm:p-6 flex flex-col gap-5 box-border">
        {/* Cabeçalho de Impacto */}
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 leading-none">
            {personal.fullName}
          </h1>

          <div className="mt-2">
            <span className="inline-block px-2.5 py-1 rounded bg-sky-100 text-sky-900 font-extrabold text-xs tracking-wider uppercase">
              {targetRole}
            </span>
          </div>
        </header>

        {/* Resumo Profissional / Perfil */}
        {professionalSummary && (
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              {t('tmpl_profile')}
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify font-medium break-words">
              {professionalSummary}
            </p>
          </section>
        )}

        {/* Trajetória de Experiência e Resultados */}
        {experiences && experiences.length > 0 && (
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
              <Briefcase size={13} strokeWidth={2.5} className="text-sky-700 shrink-0" />
              <span>{t('tmpl_achievements')}</span>
            </h2>

            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex flex-row items-baseline justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-950 break-words">
                        {exp.role}
                      </span>
                      <span className="text-xs font-semibold text-sky-800 ml-1.5 break-words">
                        · {exp.company}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
                      {exp.period}
                    </span>
                  </div>

                  {/* Bullets de Resultados */}
                  <ul className="space-y-1 text-xs text-slate-700 leading-relaxed pl-1 font-normal">
                    {exp.bullets && exp.bullets.length > 0 ? (
                      exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-sky-600 font-bold shrink-0 mt-0.5">•</span>
                          <span className="text-justify">{bullet}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="text-sky-600 font-bold shrink-0 mt-0.5">•</span>
                        <span>{t('tmpl_default_bullet')}</span>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
