import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export async function exportResumeToPDF(elementId: string, candidateName: string = 'Curriculo'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Aplica temporariamente classe sem cantos arredondados ou sombras para captura A4 perfeita
    element.classList.add('pdf-exporting');

    // Generate high-resolution PNG using browser-native SVG foreignObject
    // This fully supports modern CSS including Tailwind v4 oklch(), modern gradients, etc.
    const dataUrl = await toPng(element, {
      pixelRatio: 2, // 2x resolution for crisp high-dpi document printing
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        borderRadius: '0px',
        boxShadow: 'none',
        border: 'none',
        outline: 'none',
        margin: '0px',
      },
    });

    // Create an Image object to read the rendered dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
    });

    // Standard A4 dimensions in mm: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    // Scale image to fit A4 width
    const imgWidth = pdfWidth;
    const imgHeight = (img.height * pdfWidth) / img.width;

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
    return true;
  } catch (error) {
    console.error('Error generating PDF with html-to-image:', error);
    // Fallback to browser print if image generation encounters any device-specific constraint
    try {
      window.print();
      return true;
    } catch (printErr) {
      console.error('Print fallback failed:', printErr);
      return false;
    }
  } finally {
    element.classList.remove('pdf-exporting');
  }
}
