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
 * Lateral Estruturado (2 Colunas) — Modelo de Alto Impacto Visual.
 * Diagramação em dois painéis: coluna lateral dedicada para dados de contato,
 * competências, ferramentas e formação; e coluna principal ampla focada na
 * narrativa de carreira, conquistas e resumo.
 * Altamente procurado por profissionais criativos, gerentes e especialistas.
 */
export const MinimalistAtsTemplate: React.FC<TemplateProps> = ({
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
    <div className="w-full text-slate-800 font-sans leading-normal flex flex-row min-h-full select-text bg-white box-border">
      {/* =========================================================================
          COLUNA LATERAL (34% da largura) — Contato, Competências, Ferramentas, Educação
      ========================================================================= */}
      <aside className="w-[34%] max-w-[250px] bg-slate-50/90 border-r border-slate-200/80 p-5 sm:p-6 flex flex-col gap-6 shrink-0 box-border">
        {/* Foto centralizada na coluna lateral se existir */}
        {personal.hasPhoto && personal.photoUrl && (
          <div className="flex justify-center mb-1">
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              crossOrigin="anonymous"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md"
            />
          </div>
        )}

        {/* Informações de Contato */}
        <div>
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            {t('tmpl_contact')}
          </h3>
          <div className="space-y-2 text-xs text-slate-800 font-semibold break-words">
            {personal.cityState && (
              <div className="block">
                <ContactItem
                  icon={<MapPin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.cityState}
                />
              </div>
            )}
            {personal.phone && (
              <div className="block">
                <ContactItem
                  icon={<Phone size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.phone}
                />
              </div>
            )}
            {personal.email && (
              <div className="block">
                <ContactItem
                  icon={<Mail size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.email}
                  href={`mailto:${personal.email}`}
                  textClassName="text-[11px] break-all"
                />
              </div>
            )}
            {personal.linkedin && (
              <div className="block">
                <ContactItem
                  icon={<Linkedin size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.linkedin}
                  textClassName="text-[11px] break-all"
                />
              </div>
            )}
            {personal.portfolio && (
              <div className="block">
                <ContactItem
                  icon={<Globe size={13} strokeWidth={2} className="block w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  text={personal.portfolio}
                  textClassName="text-[11px] break-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Competências Principais */}
        {skills && skills.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              {t('tmpl_skills_main')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-white text-slate-800 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ferramentas e Softwares */}
        {tools && tools.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-500" />
              {t('tmpl_tools_soft')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="bg-white text-slate-800 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formação Acadêmica na coluna lateral */}
        {education && education.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              {t('tmpl_education_short')}
            </h3>
            <div className="space-y-2.5 text-xs">
              {education.map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs">{edu.course}</div>
                  <div className="text-slate-600 text-[11px]">{edu.institution}</div>
                  <div className="text-slate-500 text-[10px] font-medium">
                    {edu.startYear} — {edu.endYear}{edu.status ? ` • ${translateEduStatus(edu.status, t)}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cursos e Certificações na coluna lateral */}
        {courses && courses.length > 0 && (
          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-500" />
              {t('tmpl_courses_short')}
            </h3>
            <div className="space-y-2 text-xs">
              {courses.map((course, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-[11px]">{course.name}</div>
                  <div className="text-slate-600 text-[10px]">
                    {course.institution} {course.hours ? `(${course.hours})` : ''} • {course.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* =========================================================================
          COLUNA PRINCIPAL (66% da largura) — Título, Resumo e Experiências
      ========================================================================= */}
      <main className="w-[66%] flex-1 min-w-0 p-5 sm:p-7 flex flex-col justify-start box-border">
        {/* Cabeçalho Principal com Nome e Cargo */}
        <header className="pb-4 mb-5 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            {personal.fullName}
          </h1>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-700 mt-1">
            {targetRole}
          </p>
        </header>

        {/* Resumo Profissional */}
        {professionalSummary && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {t('tmpl_profile')}
            </h2>
            <p className="text-[13px] text-slate-700 leading-relaxed text-justify">
              {professionalSummary}
            </p>
          </section>
        )}

        {/* Experiência Profissional */}
        {experiences && experiences.length > 0 && (
          <section className="mb-4 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              {t('tmpl_experience')}
            </h2>

            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-row items-baseline justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-900 break-words">
                        {exp.role}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 ml-1.5 break-words">
                        — {exp.company}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                      {exp.period}
                    </span>
                  </div>

                  {/* Bullets com recuo limpo */}
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
                        <span>{t('tmpl_default_bullet_ats')}</span>
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
