import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportResumeToPDF(elementId: string, candidateName: string = 'Curriculo'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  // Store original styles to restore them in finally block
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;
  const originalBoxShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  const originalBorderRadius = element.style.borderRadius;
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalFlexShrink = element.style.flexShrink;

  try {
    // 1. Aplica temporariamente classe de exportação se houver regras CSS específicas
    element.classList.add('pdf-exporting');

    // 2. Altera temporariamente o estilo do elemento para forçar o layout de desktop A4 real
    element.style.width = '794px';
    element.style.maxWidth = 'none';
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    element.style.borderRadius = '0px';
    element.style.transform = 'none';
    element.style.transformOrigin = 'initial';
    element.style.flexShrink = '0';

    // 3. Executa html2canvas com configurações de desktop forçadas para garantir a renderização fiel e nítida
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for crisp high-dpi document printing
      windowWidth: 794, // Force desktop viewport logic (removes mobile/media queries scaling)
      useCORS: true, // Support loading external images/photos
      logging: false,
      backgroundColor: '#ffffff',
    });

    const dataUrl = canvas.toDataURL('image/png');

    // Standard A4 dimensions in mm: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    // Scale image to fit A4 width perfectly
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Additional pages if content spans across multiple A4 pages
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // Clean candidate name for file name
    const sanitizedName = candidateName
      .trim()
      .replace(/[^a-zA-Z0-9À-ÿ]/g, '_')
      .replace(/_+/g, '_') || 'Curriculo';

    pdf.save(`Curriculo_${sanitizedName}.pdf`);
    console.log('PDF export completed successfully');
    return true;
  } catch (error) {
    console.error('Error generating PDF with html2canvas:', error);
    // Fallback to browser print if rendering fails
    try {
      window.print();
      return true;
    } catch (printErr) {
      console.error('Print fallback failed:', printErr);
      return false;
    }
  } finally {
    // 4. Restaura imediatamente os estilos originais do elemento sem impactar o usuário móvel
    element.classList.remove('pdf-exporting');
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.boxShadow = originalBoxShadow;
    element.style.border = originalBorder;
    element.style.borderRadius = originalBorderRadius;
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
    element.style.flexShrink = originalFlexShrink;
  }
}
