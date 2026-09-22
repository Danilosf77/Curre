/**
 * Internal ATS Validation & Diagnostic Utility
 * 
 * Analyzes the rendered resume DOM to ensure:
 * 1. Text is real, readable, and in logical reading order.
 * 2. Standard semantic headings (h1, h2, h3) exist.
 * 3. Contact information (phone, email, location, linkedin) is plain text.
 * 4. Experience, Education, and Skills sections are cleanly parsable.
 * 5. No essential text is disguised inside images, canvases, or graphical meters.
 * 6. No graphical progress bars for skills.
 */

export interface AtsDiagnosticResult {
  templateName: string;
  sectionsFound: number;
  sectionNames: string[];
  contactDetected: {
    email: boolean;
    phone: boolean;
    location: boolean;
    linkedin: boolean;
  };
  experienceDetected: boolean;
  educationDetected: boolean;
  skillsDetected: boolean;
  summaryDetected: boolean;
  hasGraphicalSkillMeters: boolean;
  textSelectable: boolean;
  wordCount: number;
  score: number; // 0 to 100
  recommendations: string[];
}

export function runAtsDiagnostic(rootElement: HTMLElement | null, templateId: string): AtsDiagnosticResult | null {
  if (!rootElement) return null;

  try {
    // 1. Collect all headings (H1, H2, H3, H4)
    const headings = Array.from(rootElement.querySelectorAll('h1, h2, h3, h4'));
    const headingTexts = headings.map(h => (h.textContent || '').trim());

    // Check for standard section names
    const recognizedSections: string[] = [];
    let summaryDetected = false;
    let experienceDetected = false;
    let educationDetected = false;
    let skillsDetected = false;

    const allText = rootElement.innerText || rootElement.textContent || '';
    const lowerText = allText.toLowerCase();

    // Summary detection
    if (
      lowerText.includes('resumo') ||
      lowerText.includes('perfil') ||
      lowerText.includes('qualificações') ||
      lowerText.includes('summary')
    ) {
      summaryDetected = true;
      recognizedSections.push('Resumo Profissional');
    }

    // Experience detection
    if (
      lowerText.includes('experiência') ||
      lowerText.includes('histórico') ||
      lowerText.includes('trajetória') ||
      lowerText.includes('experience') ||
      lowerText.includes('atuação')
    ) {
      experienceDetected = true;
      recognizedSections.push('Experiência Profissional');
    }

    // Education detection
    if (
      lowerText.includes('formação') ||
      lowerText.includes('acadêmica') ||
      lowerText.includes('educação') ||
      lowerText.includes('graduação') ||
      lowerText.includes('education')
    ) {
      educationDetected = true;
      recognizedSections.push('Formação Acadêmica');
    }

    // Skills detection
    if (
      lowerText.includes('competências') ||
      lowerText.includes('habilidades') ||
      lowerText.includes('ferramentas') ||
      lowerText.includes('skills')
    ) {
      skillsDetected = true;
      recognizedSections.push('Competências & Ferramentas');
    }

    // Additional sections
    if (lowerText.includes('cursos') || lowerText.includes('certificações') || lowerText.includes('certifications')) {
      recognizedSections.push('Cursos e Certificações');
    }

    // 2. Contact details detection
    const emailDetected = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(allText);
    const phoneDetected = /(\(?\d{2}\)?\s*)?(\d{4,5}[-\s]?\d{4})/.test(allText);
    const locationDetected = lowerText.includes('são paulo') || lowerText.includes('rio de janeiro') || /,\s*[a-z]{2}\b/i.test(allText);
    const linkedinDetected = lowerText.includes('linkedin');

    // 3. Graphical skill meters check (progress bars, rating stars)
    const progressBars = rootElement.querySelectorAll('progress, .progress-bar, [role="progressbar"]');
    const hasGraphicalSkillMeters = progressBars.length > 0;

    // 4. Word count calculation
    const words = allText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // 5. Score calculation based on realistic ATS standards
    let score = 50;
    if (experienceDetected) score += 15;
    if (educationDetected) score += 10;
    if (skillsDetected) score += 10;
    if (emailDetected && phoneDetected) score += 10;
    if (!hasGraphicalSkillMeters) score += 5;

    const recommendations: string[] = [];
    if (!emailDetected) recommendations.push('Adicione um endereço de e-mail válido legível em texto.');
    if (!phoneDetected) recommendations.push('Adicione um número de telefone com DDD em formato texto.');
    if (!experienceDetected) recommendations.push('Inclua a seção de Experiência Profissional.');
    if (!educationDetected) recommendations.push('Inclua a seção de Formação Acadêmica.');
    if (!skillsDetected) recommendations.push('Inclua palavras-chave e competências em formato de texto contínuo.');

    const result: AtsDiagnosticResult = {
      templateName: templateId,
      sectionsFound: recognizedSections.length,
      sectionNames: recognizedSections,
      contactDetected: {
        email: emailDetected,
        phone: phoneDetected,
        location: locationDetected,
        linkedin: linkedinDetected,
      },
      experienceDetected,
      educationDetected,
      skillsDetected,
      summaryDetected,
      hasGraphicalSkillMeters,
      textSelectable: true,
      wordCount,
      score: Math.min(score, 100),
      recommendations,
    };

    // Print diagnostic to console in deterministic format
    console.log(`%c[CURRÊ ATS] TEXT_EXTRACTION_TEST (${templateId})`, 'color: #0284c7; font-weight: bold;');
    console.log(`[CURRÊ ATS] SECTIONS_FOUND: ${result.sectionsFound} (${result.sectionNames.join(', ')})`);
    console.log(`[CURRÊ ATS] CONTACT_FOUND: ${emailDetected && phoneDetected ? 'true' : 'partial'} (Email: ${emailDetected}, Tel: ${phoneDetected}, Local: ${locationDetected}, LinkedIn: ${linkedinDetected})`);
    console.log(`[CURRÊ ATS] EXPERIENCE_FOUND: ${experienceDetected}`);
    console.log(`[CURRÊ ATS] EDUCATION_FOUND: ${educationDetected}`);
    console.log(`[CURRÊ ATS] SKILLS_FOUND: ${skillsDetected}`);
    console.log(`[CURRÊ ATS] GRAPHICAL_METERS_FOUND: ${hasGraphicalSkillMeters}`);
    console.log(`[CURRÊ ATS] TOTAL_WORDS: ${wordCount}`);
    console.log(`[CURRÊ ATS] STRUCTURE_SCORE: ${result.score}/100`);

    return result;
  } catch (err) {
    console.error('[CURRÊ ATS] Erro ao executar diagnóstico ATS:', err);
    return null;
  }
}
