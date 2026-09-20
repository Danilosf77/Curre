import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

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

// Helper to slice a vertical section of a canvas
function sliceCanvas(originalCanvas: HTMLCanvasElement, yStart: number, height: number): HTMLCanvasElement {
  const slice = document.createElement('canvas');
  slice.width = originalCanvas.width;
  slice.height = height;
  const ctx = slice.getContext('2d');
  if (ctx) {
    ctx.drawImage(
      originalCanvas,
      0, yStart, originalCanvas.width, height, // Source region
      0, 0, originalCanvas.width, height      // Destination region
    );
  }
  return slice;
}

export async function exportResumeToPDF(elementId: string, candidateName: string = 'Curriculo'): Promise<boolean> {
  console.log("[CURRÊ PDF] START");
  
  let element = document.getElementById(elementId);
  if (!element) {
    console.warn(`[CURRÊ PDF] Elemento com id ${elementId} não encontrado, buscando com seletores alternativos...`);
    element = document.querySelector('[data-resume-preview]') || document.querySelector('.resume-paper');
  }

  if (!element) {
    console.error(`[CURRÊ PDF] ERROR: Elemento com id '${elementId}' não foi encontrado no DOM.`);
    alert(`Erro interno: Contêiner do currículo (${elementId}) não encontrado.`);
    return false;
  }

  console.log("[CURRÊ PDF] ELEMENT_FOUND");
  console.log(`[CURRÊ PDF] Dimensões do elemento: ${element.clientWidth}px x ${element.clientHeight}px`);

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

  // Let's keep a track of the current stage for fine diagnostics
  let currentStage = 'INITIALIZATION';
  let computedCanvasWidth = 0;
  let computedCanvasHeight = 0;
  let calculatedPagesCount = 0;

  try {
    currentStage = 'APPLYING_STYLES';
    console.log("[CURRÊ PDF] STYLES_APPLIED");
    element.classList.add('pdf-exporting');
    
    // Força o tamanho padrão de preview para garantir que o layout fique exatamente igual ao desktop
    element.style.width = '820px';
    element.style.maxWidth = 'none';
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    element.style.borderRadius = '0px';
    element.style.transform = 'none';
    element.style.transformOrigin = 'initial';
    element.style.flexShrink = '0';
    element.style.paddingBottom = '0px';
    element.style.marginBottom = '0px';

    currentStage = 'CANVAS_CAPTURE';
    console.log("[CURRÊ PDF] CANVAS_START");
    
    const canvas = await renderCanvas(element, {
      scale: 2, // Resolução perfeita sem sobrecarregar a memória
      windowWidth: 820, // Força a largura de viewport interna para bater com o layout desktop de 820px
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    console.log("[CURRÊ PDF] CANVAS_SUCCESS");
    computedCanvasWidth = canvas.width;
    computedCanvasHeight = canvas.height;
    console.log(`[CURRÊ PDF] Tamanho físico do canvas: ${computedCanvasWidth}px x ${computedCanvasHeight}px`);

    if (computedCanvasWidth <= 0 || computedCanvasHeight <= 0) {
      throw new Error(`Dimensões inválidas do canvas gerado: ${computedCanvasWidth}x${computedCanvasHeight}`);
    }

    currentStage = 'PDF_INITIALIZATION';
    console.log("[CURRÊ PDF] PDF_START");
    
    const pdf = createJsPDFInstance({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // 210mm padrão A4
    const pdfHeight = 297; // 297mm padrão A4

    currentStage = 'PAGE_CALCULATION';
    console.log("[CURRÊ PDF] PAGE_CALCULATION");
    
    // Altura teórica total em milímetros se mantivéssemos o aspecto original do canvas em largura A4
    const totalImgHeightMm = (computedCanvasHeight * pdfWidth) / computedCanvasWidth;
    console.log(`[CURRÊ PDF] Altura total projetada do currículo em mm: ${totalImgHeightMm.toFixed(2)}mm`);

    // Proporção de páginas fracionadas
    const floatPages = totalImgHeightMm / pdfHeight;
    const basePages = Math.floor(floatPages);
    const remainder = floatPages - basePages;

    let numPagesToCreate = 1;
    let pxPageHeightForSlicing = Math.floor(computedCanvasWidth * (pdfHeight / pdfWidth)); // Altura de 1 página A4 em pixels
    let compressToFit = false;

    // Regra da tolerância estrita de até 2% para evitar páginas adicionais vazias por mínimos arredondamentos de pixels
    if (basePages === 0) {
      numPagesToCreate = 1;
    } else {
      if (remainder > 0 && remainder <= 0.02) {
        // Encaixa o conteúdo perfeitamente em exatamente 'basePages' páginas através de uma compressão sutil e imperceptível (máx 2%)
        numPagesToCreate = basePages;
        compressToFit = true;
        pxPageHeightForSlicing = Math.ceil(computedCanvasHeight / basePages);
        console.log(`[CURRÊ PDF] Tolerância de arredondamento ativada. Encaixando em exatamente ${basePages} página(s).`);
      } else {
        // Sem compressão forçada arbitrária, gera as páginas necessárias de forma natural para preservar a legibilidade
        numPagesToCreate = Math.ceil(floatPages);
      }
    }

    calculatedPagesCount = numPagesToCreate;
    console.log(`[CURRÊ PDF] Páginas totais a serem geradas: ${calculatedPagesCount}`);

    for (let i = 0; i < calculatedPagesCount; i++) {
      currentStage = `PAGINATING_PAGE_${i + 1}`;
      console.log(`[CURRÊ PDF] PAGE_CREATED (Página ${i + 1}/${calculatedPagesCount})`);
      
      const yStart = i * pxPageHeightForSlicing;
      // Para a última página ou se ultrapassar o tamanho, limitamos à altura máxima restante do canvas
      const sliceHeight = Math.min(pxPageHeightForSlicing, computedCanvasHeight - yStart);

      if (sliceHeight <= 0) {
        console.warn(`[CURRÊ PDF] Ignorando fatia vazia na página ${i + 1}`);
        continue;
      }

      const slice = sliceCanvas(canvas, yStart, sliceHeight);

      // Adiciona nova página para os índices subsequentes
      if (i > 0) {
        pdf.addPage();
      }

      currentStage = `ADDING_IMAGE_PAGE_${i + 1}`;
      console.log(`[CURRÊ PDF] IMAGE_ADDED (Página ${i + 1}/${calculatedPagesCount})`);

      // PASSAGEM DIRETA DO HTMLCanvasElement PARA O jsPDF.addImage()
      // Isso evita completamente o toDataURL() base64 gigantesco, poupando memória física e CPU!
      if (compressToFit) {
        // Se estamos comprimindo para caber no limite, cada fatia preenche exatamente a página inteira
        pdf.addImage(slice, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      } else {
        // Caso normal: a última página pode ter altura menor que 297mm (não estica verticalmente o conteúdo)
        const sliceHeightMm = (sliceHeight * pdfWidth) / computedCanvasWidth;
        pdf.addImage(slice, 'PNG', 0, 0, pdfWidth, sliceHeightMm, undefined, 'FAST');
      }
    }

    currentStage = 'BLOB_GENERATION';
    console.log("[CURRÊ PDF] BLOB_CREATED");
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    currentStage = 'DOWNLOAD_TRIGGER';
    console.log("[CURRÊ PDF] DOWNLOAD_STARTED");
    const sanitizedName = candidateName
      .trim()
      .replace(/[^a-zA-Z0-9À-ÿ]/g, '_')
      .replace(/_+/g, '_') || 'Curriculo';

    const link = document.createElement('a');
    link.href = url;
    link.download = `Curriculo_${sanitizedName}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Remove o link e evita revogação ultra-precoce para garantir o processamento em browsers mobile lentos
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("[CURRÊ PDF] Limpeza de objetos Blob concluída.");
    }, 5000);

    console.log("[CURRÊ PDF] SUCCESS");
    return true;
  } catch (error: any) {
    console.error("[CURRÊ PDF] ERROR");
    console.error(`  - Mensagem: ${error?.message}`);
    console.error(`  - Etapa do Erro: ${currentStage}`);
    console.error(`  - Canvas Width: ${computedCanvasWidth}px`);
    console.error(`  - Canvas Height: ${computedCanvasHeight}px`);
    console.error(`  - Páginas Calculadas: ${calculatedPagesCount}`);
    if (error?.stack) {
      console.error(`  - Stack: ${error.stack}`);
    }
    
    alert('Não foi possível gerar o PDF do currículo. Verifique os dados e tente novamente.');
    return false;
  } finally {
    console.log("[CURRÊ PDF] Restaurando estilos originais do elemento...");
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
