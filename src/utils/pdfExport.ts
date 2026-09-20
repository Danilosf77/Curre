import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Fallback instantiation to protect against varied ES/CommonJS resolution across Vite/Webpack/Node
function createJsPDFInstance(options: any): any {
  if (typeof jsPDF === 'function') {
    return new jsPDF(options);
  }
  const jsPDFClass = (jsPDF as any).jsPDF || (jsPDF as any).default;
  if (typeof jsPDFClass === 'function') {
    return new jsPDFClass(options);
  }
  throw new Error('Could not resolve jsPDF constructor');
}

async function renderCanvas(element: HTMLElement, options: any): Promise<HTMLCanvasElement> {
  const html2canvasFn = (html2canvas as any).default || html2canvas;
  if (typeof html2canvasFn === 'function') {
    return await html2canvasFn(element, options);
  }
  throw new Error('Could not resolve html2canvas function');
}

export async function exportResumeToPDF(elementId: string, candidateName: string = 'Curriculo'): Promise<boolean> {
  console.log("1. Função de PDF acionada para o ID:", elementId);
  let element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id ${elementId} not found, searching with fallback selectors...`);
    element = document.querySelector('[data-resume-preview]') || document.querySelector('.resume-paper');
  }

  if (!element) {
    console.error(`2. ERRO CRÍTICO: Elemento com id '${elementId}' não foi encontrado no DOM! Verifique o ID no componente React.`);
    alert(`Erro interno: Contêiner do currículo (${elementId}) não encontrado.`);
    return false;
  }

  console.log("3. Elemento encontrado, iniciando html2canvas...");

  // Guard original styles to restore in finally block
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;
  const originalBoxShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  const originalBorderRadius = element.style.borderRadius;
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalFlexShrink = element.style.flexShrink;
  const originalPaddingBottom = element.style.paddingBottom;
  const originalMarginBottom = element.style.marginBottom;

  try {
    // 2. LIMPEZA DE ESPAÇOS ANTES DA CAPTURA E CONFIGURAÇÕES DE DESKTOP
    console.log("4. Aplicando estilos temporários para renderização de alta qualidade...");
    element.classList.add('pdf-exporting');
    element.style.width = '794px';
    element.style.maxWidth = 'none';
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    element.style.borderRadius = '0px';
    element.style.transform = 'none';
    element.style.transformOrigin = 'initial';
    element.style.flexShrink = '0';
    element.style.paddingBottom = '0px';
    element.style.marginBottom = '0px';

    // 3. EXECUTA HTML2CANVAS COM SEGURANÇA E ZOOM DE DESKTOP
    console.log("5. Renderizando canvas com html2canvas...");
    const canvas = await renderCanvas(element, {
      scale: 2, // 2x resolution for high-quality, crisp vectors and text
      windowWidth: 794, // Lock desktop viewport width during render
      useCORS: true, // Support external image/photo assets
      logging: false,
      backgroundColor: '#ffffff',
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    console.log(`6. Canvas renderizado com sucesso. Dimensões: ${canvasWidth}x${canvasHeight}`);

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      console.error('7. ERRO: Cálculo de Fit Seguro falhou: Dimensões do canvas inválidas (<= 0)');
      return false;
    }

    const dataUrl = canvas.toDataURL('image/png');

    // Inicializa jsPDF de forma ultra robusta
    console.log("8. Instanciando jsPDF...");
    const pdf = createJsPDFInstance({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Altura proporcional calculada de forma segura
    let imgWidth = pdfWidth;
    let imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

    // Margem de tolerância de até 15% para caber em uma única página sem criar folha extra
    const maxSinglePageAllowedHeight = pdfHeight * 1.15; // 341.55mm
    let xOffset = 0;

    if (imgHeight > pdfHeight && imgHeight <= maxSinglePageAllowedHeight) {
      // Pequeno transbordo: Aplica escala proporcional sutil para ajustar em uma única página
      const scaleRatio = pdfHeight / imgHeight;
      imgWidth = pdfWidth * scaleRatio;
      imgHeight = pdfHeight;
      xOffset = (pdfWidth - imgWidth) / 2; // Centraliza a imagem horizontalmente
      console.log(`9. Aplicando compressão segura de ${Math.round((1 - scaleRatio) * 100)}% para ajustar em página única.`);
    }

    let heightLeft = imgHeight;
    let position = 0;

    // Adiciona a primeira página
    console.log("10. Adicionando imagem do canvas à página do PDF...");
    pdf.addImage(dataUrl, 'PNG', xOffset, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Páginas adicionais somente se o transbordo for substancial (> 25mm significativos)
    while (heightLeft > 25) {
      console.log(`11. Conteúdo extenso detectado. Adicionando página extra do PDF (restante: ${heightLeft}mm)...`);
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', xOffset, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // Normaliza o nome do candidato para salvar de forma limpa
    const sanitizedName = candidateName
      .trim()
      .replace(/[^a-zA-Z0-9À-ÿ]/g, '_')
      .replace(/_+/g, '_') || 'Curriculo';

    // 4. DOWNLOAD UNIVERSAL VIA BLOB (DESKTOP E MÓVEL)
    console.log("12. Iniciando processo de download universal por Blob...");
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Curriculo_${sanitizedName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('13. Exportação de PDF concluída com sucesso via download universal!');
    return true;
  } catch (error) {
    console.error('ERRO CRÍTICO na exportação do PDF:', error);
    // Print fallback do navegador em caso de erro extremo
    try {
      console.log("Tentando fallback de impressão do navegador (window.print)...");
      window.print();
      return true;
    } catch (printErr) {
      console.error('Print fallback falhou também:', printErr);
      return false;
    }
  } finally {
    // 5. RESTAURA IMEDIATAMENTE OS ESTILOS ORIGINAIS DO ELEMENTO
    console.log("14. Restaurando estilos originais do elemento...");
    element.classList.remove('pdf-exporting');
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.boxShadow = originalBoxShadow;
    element.style.border = originalBorder;
    element.style.borderRadius = originalBorderRadius;
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
    element.style.flexShrink = originalFlexShrink;
    element.style.paddingBottom = originalPaddingBottom;
    element.style.marginBottom = originalMarginBottom;
  }
}
