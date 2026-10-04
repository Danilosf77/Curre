import { OptimizedResume } from '../types';
import { trackEvent } from './analytics';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PDFExportOptions {
  resume: OptimizedResume;
  template?: string;
  language?: string;
}

export function sanitizeFilename(fullName?: string): string {
  if (!fullName || typeof fullName !== 'string') return 'Curriculo';
  const clean = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .trim();
  return clean ? `Curriculo_${clean}` : 'Curriculo';
}

/**
 * Geração de PDF client-side em alta fidelidade usando html2canvas-pro e jsPDF.
 * Utilizado como fallback instantâneo ou quando o ambiente do servidor não possui Chromium disponível.
 */
export async function exportResumeClientSide(resume: OptimizedResume): Promise<void> {
  const element = document.getElementById('resume-document');
  if (!element) {
    throw new Error('Elemento do currículo (#resume-document) não encontrado para renderização no navegador.');
  }

  // Se o elemento estiver com escala aplicada para mobile viewport, salvamos o estilo para restaurar depois
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  element.style.transform = 'none';

  // Breve espera para o layout assentar sem transformação de escala
  await new Promise((r) => setTimeout(r, 60));

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x escala para alta resolução e nitidez visual em impressão A4
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 2) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const filename = `${sanitizeFilename(resume.personal?.fullName)}.pdf`;
    pdf.save(filename);
    console.log(`[CURRÊ PDF] Exportação client-side (fallback jsPDF) concluída com sucesso: ${filename}`);

    trackEvent('download_curriculo', {modelo:resume.templateStyle,idioma:resume.language,metodo:resume.isAiGenerated === false ? 'basico' : 'ia',metodo_geracao:'fallback_navegador'});
  } finally {
    // Restaura escala original do container de preview
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
  }
}

/**
 * Exporta currículo em PDF com fluxo em duas camadas:
 * 1. Tenta a renderização vetorial no servidor via Chromium Headless (/api/generate-pdf).
 * 2. Em caso de indisponibilidade ou falha do servidor, ativa imediatamente o fallback client-side via html2canvas-pro + jsPDF.
 */
export async function exportResumeToPDF(options: PDFExportOptions): Promise<void> {
  const { resume, template = 'liquid-modern', language = 'pt' } = options;

  console.log('[CURRÊ PDF] Iniciando processo de download do currículo...');

  let serverErrorDetails: string | null = null;

  // 1. Camada Primária: Servidor Playwright Headless Chromium (PDF 100% vetorial nativo)
  try {
    console.log('[CURRÊ PDF] Solicitando PDF vetorial no servidor via /api/generate-pdf...');
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume,
        template,
        language,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      if (blob && blob.size > 0) {
        let filename = `${sanitizeFilename(resume.personal?.fullName)}.pdf`;
        const disposition = response.headers.get('Content-Disposition');
        if (disposition && disposition.includes('filename=')) {
          const matches = disposition.match(/filename="?([^";]+)"?/);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(downloadUrl);

        console.log(`[CURRÊ PDF] Download direto (servidor Playwright) concluído: ${filename} (${blob.size} bytes)`);

        trackEvent('download_curriculo', {modelo:template,idioma:language,metodo:resume.isAiGenerated === false ? 'basico' : 'ia',metodo_geracao:'servidor_playwright'});

        return;
      }
    }

    // Se o servidor retornou erro, extrai os detalhes para log e diagnóstico
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.error) errorMsg = errData.error;
      if (errData.details) errorMsg += ` (${errData.details})`;
    } catch {
      // Ignora erro de JSON
    }
    serverErrorDetails = errorMsg;
    console.warn('[CURRÊ PDF] Servidor retornou erro:', errorMsg);
  } catch (netErr: any) {
    serverErrorDetails = netErr?.message || 'Falha de conexão com a API';
    console.warn('[CURRÊ PDF] Falha na comunicação com o servidor de PDF:', netErr);
  }

  // 2. Camada Secundária: Fallback robusto no navegador usando jsPDF + html2canvas-pro
  console.log('[CURRÊ PDF] Ativando fallback de geração direta no navegador (jsPDF + html2canvas-pro)...');
  try {
    await exportResumeClientSide(resume);
  } catch (clientErr: any) {
    console.error('[CURRÊ PDF] Falha também no fallback do navegador:', clientErr);
    const finalError = serverErrorDetails
      ? `Falha no servidor (${serverErrorDetails}). O fallback no navegador também falhou: ${clientErr?.message}`
      : `Não foi possível gerar o PDF: ${clientErr?.message}`;
    throw new Error(finalError);
  }
}
