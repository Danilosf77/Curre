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
  console.log("[CURRÊ PDF] Iniciando exportação para o ID:", elementId);
  let element = document.getElementById(elementId);
  if (!element) {
    console.warn(`[CURRÊ PDF] Elemento com id ${elementId} não encontrado, buscando com seletores alternativos...`);
    element = document.querySelector('[data-resume-preview]') || document.querySelector('.resume-paper');
  }

  if (!element) {
    console.error(`[CURRÊ PDF] ERRO CRÍTICO: Elemento com id '${elementId}' não foi encontrado no DOM através de nenhum seletor.`);
    alert(`Erro interno: Contêiner do currículo (${elementId}) não encontrado.`);
    return false;
  }

  console.log("[CURRÊ PDF] Elemento encontrado. Dimensões atuais:", element.clientWidth, "x", element.clientHeight);

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
    // 2. CONFIGURAÇÃO DE ESTILOS TEMPORÁRIOS PARA CAPTURA FIDELÍSSIMA
    console.log("[CURRÊ PDF] Aplicando estilos temporários para renderização de alta qualidade...");
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

    // 3. EXECUTA HTML2CANVAS COM SEGURANÇA
    console.log("[CURRÊ PDF] Capturando canvas com html2canvas...");
    const canvas = await renderCanvas(element, {
      scale: 2, // Resolução perfeita sem sobrecarregar a memória
      windowWidth: 820, // Força a largura de viewport interna para bater com o layout desktop de 820px
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    console.log(`[CURRÊ PDF] Canvas criado. Dimensões físicas: ${canvasWidth}px x ${canvasHeight}px`);

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      console.error('[CURRÊ PDF] ERRO: Dimensões do canvas inválidas (<= 0)');
      return false;
    }

    // Inicializa o jsPDF
    console.log("[CURRÊ PDF] Instanciando jsPDF em formato A4...");
    const pdf = createJsPDFInstance({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // 210mm padrão A4
    const pdfHeight = 297; // 297mm padrão A4

    // Altura teórica total em milímetros se mantivéssemos o aspecto original do canvas em largura A4
    const totalImgHeightMm = (canvasHeight * pdfWidth) / canvasWidth;
    console.log(`[CURRÊ PDF] Altura total projetada do currículo em mm: ${totalImgHeightMm.toFixed(2)}mm`);

    // Proporção de páginas fracionadas
    const floatPages = totalImgHeightMm / pdfHeight;
    const basePages = Math.floor(floatPages);
    const remainder = floatPages - basePages;

    let numPagesToCreate = 1;
    let pxPageHeightForSlicing = Math.floor(canvasWidth * (pdfHeight / pdfWidth)); // Altura correspondente de 1 página A4 em pixels
    let compressToFit = false;

    // Regra da tolerância de até 15% para evitar páginas adicionais quase vazias
    if (basePages === 0) {
      numPagesToCreate = 1;
      console.log("[CURRÊ PDF] Conteúdo curto detectado. Caberá em exatamente 1 página.");
    } else {
      if (remainder > 0 && remainder <= 0.15) {
        // Encaixa o conteúdo perfeitamente em exatamente 'basePages' páginas através de uma compressão sutil
        numPagesToCreate = basePages;
        compressToFit = true;
        // Divide o canvas igualmente para que cada página pegue exatamente 1 / basePages do conteúdo total
        pxPageHeightForSlicing = Math.ceil(canvasHeight / basePages);
        console.log(`[CURRÊ PDF] Aplica compressão segura de ${Math.round(remainder * 100)}% para ajustar em exatamente ${basePages} página(s) sem sobras.`);
      } else {
        // Sem compressão, usa o fluxo padrão de páginas
        numPagesToCreate = Math.ceil(floatPages);
        console.log(`[CURRÊ PDF] Sem compressão necessária. Gerando exatamente ${numPagesToCreate} página(s).`);
      }
    }

    console.log(`[CURRÊ PDF] Calculando paginação... Páginas a gerar: ${numPagesToCreate}`);

    for (let i = 0; i < numPagesToCreate; i++) {
      console.log(`[CURRÊ PDF] Processando página ${i + 1} de ${numPagesToCreate}...`);
      
      const yStart = i * pxPageHeightForSlicing;
      // Para a última página ou se ultrapassar o tamanho, limitamos à altura máxima restante do canvas
      const sliceHeight = Math.min(pxPageHeightForSlicing, canvasHeight - yStart);

      if (sliceHeight <= 0) {
        console.warn(`[CURRÊ PDF] Ignorando fatia vazia na página ${i + 1} (sliceHeight <= 0)`);
        continue;
      }

      console.log(`[CURRÊ PDF] Fatiando canvas para página ${i + 1}: yStart=${yStart}px, sliceHeight=${sliceHeight}px`);
      const slice = sliceCanvas(canvas, yStart, sliceHeight);

      // Adiciona nova página para os índices subsequentes
      if (i > 0) {
        pdf.addPage();
      }

      const sliceDataUrl = slice.toDataURL('image/png');

      if (compressToFit) {
        // Se estamos comprimindo para caber no limite, cada fatia preenche exatamente a página inteira
        pdf.addImage(sliceDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      } else {
        // Caso normal: a última página pode ter altura menor que 297mm (não estica)
        const sliceHeightMm = (sliceHeight * pdfWidth) / canvasWidth;
        pdf.addImage(sliceDataUrl, 'PNG', 0, 0, pdfWidth, sliceHeightMm, undefined, 'FAST');
      }
    }

    // Normaliza o nome do candidato para o arquivo de download
    const sanitizedName = candidateName
      .trim()
      .replace(/[^a-zA-Z0-9À-ÿ]/g, '_')
      .replace(/_+/g, '_') || 'Curriculo';

    console.log("[CURRÊ PDF] Gerando Blob do documento PDF...");
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    console.log("[CURRÊ PDF] Iniciando download universal...");
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

    console.log("[CURRÊ PDF] Exportação concluída com sucesso!");
    return true;
  } catch (error) {
    console.error('[CURRÊ PDF] ERRO CRÍTICO na geração do PDF:', error);
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
