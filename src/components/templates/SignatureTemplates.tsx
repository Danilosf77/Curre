import type { CSSProperties, ReactNode } from 'react';
import type { OptimizedResume } from '../../types';
import { useLanguage, translateEduStatus } from '../../i18n/LanguageContext';

export const SIGNATURE_IDS = ['global-classic', 'executive-signature', 'nordic', 'editorial'] as const;
export type SignatureStyle = typeof SIGNATURE_IDS[number];
type Props = Pick<OptimizedResume, 'personal' | 'targetRole' | 'professionalSummary' | 'experiences' | 'education' | 'skills' | 'tools' | 'courses'>;

// One reading column in every design. Decoration never contains candidate data.
export function SignatureTemplate({ style, ...resume }: Props & { style: SignatureStyle }) {
  const { t } = useLanguage();
  const classic = style === 'global-classic';
  const executive = style === 'executive-signature';
  const editorial = style === 'editorial';
  const accent = classic ? '#18181b' : executive ? '#253b50' : editorial ? '#7c3b2d' : '#23524e';
  const root: CSSProperties = { color: '#243140', background: '#fff', fontFamily: classic ? 'Georgia, serif' : 'Inter, Arial, sans-serif', fontSize: '12px', lineHeight: 1.65, padding: '28px 32px', overflowWrap: 'anywhere' };
  const heading: CSSProperties = { color: accent, fontSize: classic ? '12px' : '11px', fontWeight: 700, letterSpacing: classic ? '.04em' : '.16em', textTransform: 'uppercase', paddingBottom: '5px', borderBottom: classic ? '1px solid #27272a' : executive ? '1px solid #b19b70' : editorial ? '2px solid #7c3b2d' : '1px solid #b8cec8', margin: '0 0 10px', breakAfter: 'avoid' };
  const section = (title: string, content: ReactNode) => <section style={{ marginTop: '20px' }}><h2 style={heading}>{title}</h2>{content}</section>;
  const contact = [resume.personal.cityState, resume.personal.email, resume.personal.phone, resume.personal.linkedin, resume.personal.portfolio].filter(Boolean);
  const showPhoto = !classic && resume.personal.hasPhoto && resume.personal.photoUrl;
  return <div data-signature-template={style} style={root}>
    <header style={{ textAlign: classic ? 'center' : 'left', borderTop: executive ? '4px solid #253b50' : undefined, borderBottom: editorial ? '1px solid #d8c8c2' : undefined, padding: style === 'nordic' ? '20px' : undefined, background: style === 'nordic' ? '#edf4f1' : undefined, borderLeft: style === 'nordic' ? '3px solid #23524e' : undefined, paddingTop: executive ? '20px' : style === 'nordic' ? '20px' : '0', paddingBottom: editorial ? '18px' : style === 'nordic' ? '20px' : '0', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ color: accent, fontFamily: executive || editorial ? 'Georgia, serif' : undefined, fontWeight: classic ? 700 : 500, fontSize: editorial ? '38px' : '32px', lineHeight: 1.12, letterSpacing: classic ? '0' : '-.025em', margin: 0 }}>{resume.personal.fullName}</h1>
          {resume.targetRole && <p style={{ margin: '8px 0 0', fontSize: '13px', color: accent, fontWeight: 600, letterSpacing: executive ? '.06em' : '0' }}>{resume.targetRole}</p>}
        </div>
        {showPhoto && <img src={resume.personal.photoUrl} alt="" style={{ width: '66px', height: '80px', objectFit: 'cover', borderRadius: style === 'nordic' ? '12px' : '2px', flexShrink: 0 }} />}
      </div>
      <p style={{ margin: '12px 0 0', fontSize: '10.5px', lineHeight: 1.7, color: '#425466' }}>{contact.join('  ·  ')}</p>
    </header>
    {resume.professionalSummary && section(t('tmpl_summary'), <p style={{ margin: 0 }}>{resume.professionalSummary}</p>)}
    {!!resume.experiences.length && section(t('tmpl_experience'), resume.experiences.map((exp, index) => <article key={exp.id || index} style={{ marginTop: index ? '15px' : '0' }}>
      <div style={{ breakInside: 'avoid', breakAfter: 'avoid' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: accent, fontSize: '12.5px', fontWeight: 700 }}>{exp.role}</h3>
          <span style={{ color: '#475569', fontSize: '10.5px' }}>{exp.period}</span>
        </div>
        <p style={{ margin: '0 0 4px', fontStyle: classic ? 'italic' : 'normal', color: '#475569' }}>{exp.company}</p>
      </div>
      {!!exp.bullets?.length && <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>{exp.bullets.map((bullet, i) => <li key={i} style={{ paddingLeft: '2px', marginBottom: '3px', breakInside: 'avoid' }}>{bullet}</li>)}</ul>}
    </article>))}
    {!!resume.education.length && section(t('tmpl_education'), resume.education.map((edu, i) => <div key={edu.id || i} style={{ marginBottom: '8px', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <strong style={{ color: accent }}>{edu.course}</strong>
        <span style={{ fontSize: '10.5px', color: '#475569' }}>{[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}</span>
      </div>
      <p style={{ margin: 0 }}>{edu.institution}{edu.status ? ` · ${translateEduStatus(edu.status, t)}` : ''}</p>
    </div>))}
    {!!(resume.skills.length || resume.tools.length) && section(t('tmpl_skills'), <>
      {!!resume.skills.length && <p style={{ margin: '0 0 5px' }}><strong style={{ color: accent }}>{t('tmpl_skills_label')} </strong>{resume.skills.join(' · ')}</p>}
      {!!resume.tools.length && <p style={{ margin: 0 }}><strong style={{ color: accent }}>{t('tmpl_tools_label')} </strong>{resume.tools.join(' · ')}</p>}
    </>)}
    {!!resume.courses.length && section(t('tmpl_courses'), resume.courses.map((course, i) => <div key={course.id || i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px', marginBottom: '5px', breakInside: 'avoid' }}>
      <span><strong style={{ color: accent }}>{course.name}</strong>{course.institution ? ` · ${course.institution}` : ''}{course.hours ? ` (${course.hours})` : ''}</span><span style={{ fontSize: '10.5px', color: '#475569' }}>{course.year}</span>
    </div>))}
  </div>;
}

export const GlobalClassicTemplate = (props: Props) => <SignatureTemplate {...props} style="global-classic" />;
export const ExecutiveSignatureTemplate = (props: Props) => <SignatureTemplate {...props} style="executive-signature" />;
export const NordicTemplate = (props: Props) => <SignatureTemplate {...props} style="nordic" />;
export const EditorialTemplate = (props: Props) => <SignatureTemplate {...props} style="editorial" />;
export const SIGNATURE_COMPONENTS = { 'global-classic': GlobalClassicTemplate, 'executive-signature': ExecutiveSignatureTemplate, nordic: NordicTemplate, editorial: EditorialTemplate };
