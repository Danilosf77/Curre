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

// Robust parser to extract components from an oklch(...) color string
function parseOklch(str: string) {
  const clean = str.replace(/oklch\((.*)\)/i, '$1').trim();
  const parts = clean.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  let L = parseFloat(parts[0]);
  if (parts[0].includes('%')) L /= 100;

  let C = parseFloat(parts[1]);
  if (parts[1].includes('%')) C /= 100;

  let H = parseFloat(parts[2]);
  if (parts[2].includes('deg')) H = parseFloat(parts[2].replace('deg', ''));
  if (parts[2].includes('rad')) H = (parseFloat(parts[2].replace('rad', '')) * 180) / Math.PI;
  if (parts[2].includes('grad')) H = (parseFloat(parts[2].replace('grad', '')) * 180) / 200;
  if (parts[2].includes('turn')) H = parseFloat(parts[2].replace('turn', '')) * 360;

  let A = 1;
  if (parts.length >= 4) {
    A = parseFloat(parts[3]);
    if (parts[3].includes('%')) A /= 100;
  }

  return { L, C, H, A };
}

// Convert oklch color strings to standard, parseable rgb() or rgba() colors
function convertOklchToRgb(colorStr: string): string {
  if (!colorStr.includes('oklch(')) return colorStr;

  return colorStr.replace(/oklch\([^)]+\)/gi, (match) => {
    try {
      const parsed = parseOklch(match);
      if (!parsed) return match;
      const { L, C, H, A } = parsed;

      // OKLCH to OKLAB
      const l_ = L;
      const hRad = (H * Math.PI) / 180;
      const a_ = C * Math.cos(hRad);
      const b_ = C * Math.sin(hRad);

      // OKLAB to LMS
      const l_p = l_ + 0.3963377774 * a_ + 0.2158037573 * b_;
      const m_p = l_ - 0.1055613458 * a_ - 0.0638541728 * b_;
      const s_p = l_ - 0.0894841775 * a_ - 1.2914855480 * b_;

      const l = l_p * l_p * l_p;
      const m = m_p * m_p * m_p;
      const s = s_p * s_p * s_p;

      // LMS to Linear RGB
      const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      // Linear RGB to sRGB
      const lrgb_to_srgb = (c: number) => {
        if (c <= 0.0031308) {
          return c * 12.92;
        } else {
          return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
        }
      };

      const R = Math.max(0, Math.min(255, Math.round(lrgb_to_srgb(r) * 255)));
      const G = Math.max(0, Math.min(255, Math.round(lrgb_to_srgb(g) * 255)));
      const B = Math.max(0, Math.min(255, Math.round(lrgb_to_srgb(b) * 255)));

      if (A === 1) {
        return `rgb(${R}, ${G}, ${B})`;
      } else {
        return `rgba(${R}, ${G}, ${B}, ${A})`;
      }
    } catch (e) {
      console.error('Error parsing oklch match:', match, e);
      return match;
    }
  });
}

// Robust parser to extract components from an oklab(...) color string
function parseOklab(str: string) {
  const clean = str.replace(/oklab\((.*)\)/i, '$1').trim();
  const parts = clean.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  let L = parseFloat(parts[0]);
  if (parts[0].includes('%')) L /= 100;

  let a = parseFloat(parts[1]);
  if (parts[1].includes('%')) a /= 100;

  let b = parseFloat(parts[2]);
  if (parts[2].includes('%')) b /= 100;

  let A = 1;
  if (parts.length >= 4) {
    A = parseFloat(parts[3]);
    if (parts[3].includes('%')) A /= 100;
  }

  return { L, a, b, A };
}

// Convert oklab color strings to standard, parseable rgb() or rgba() colors
function convertOklabToRgb(colorStr: string): string {
  if (!colorStr.includes('oklab(')) return colorStr;

  return colorStr.replace(/oklab\([^)]+\)/gi, (match) => {
    try {
      const parsed = parseOklab(match);
      if (!parsed) return match;
      const { L, a, b, A } = parsed;

      // OKLAB to LMS
      const l_p = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_p = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_p = L - 0.0894841775 * a - 1.2914855480 * b;

      const l = l_p * l_p * l_p;
      const m = m_p * m_p * m_p;
      const s = s_p * s_p * s_p;

      // LMS to Linear RGB
      const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const b_ch = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      // Linear RGB to sRGB
      const lrgb_to_srgb = (c: number) => {
        if (c <= 0.0031308) {
          return c * 12.92;
        } else {
          return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
        }
      };

      const R = Math.max(0, Math.min(255, Math.round(lrgb_to_srgb(r) * 255)));
      const G = Math.max(0, Math.min(255, Math.round(lrgb_to_srgb(g) * 255)));
      const B = Math.max(0, Math.min(255, Math.round(lrgb_to_srgb(b_ch) * 255)));

      if (A === 1) {
        return `rgb(${R}, ${G}, ${B})`;
      } else {
        return `rgba(${R}, ${G}, ${B}, ${A})`;
      }
    } catch (e) {
      console.error('Error parsing oklab match:', match, e);
      return match;
    }
  });
}

// Convert both oklch and oklab colors to standard rgb/rgba
function convertModernColorsToRgb(colorStr: string): string {
  let res = colorStr;
  if (res.includes('oklch(')) {
    res = convertOklchToRgb(res);
  }
  if (res.includes('oklab(')) {
    res = convertOklabToRgb(res);
  }
  return res;
}

// Temporary style tag and containers are managed inside the export function
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
  console.log(`[CURRÊ PDF] Dimensões do elemento original: ${element.clientWidth}px x ${element.clientHeight}px`);

  // Track the current stage for fine diagnostics
  let currentStage = 'INITIALIZATION';
  let computedCanvasWidth = 0;
  let computedCanvasHeight = 0;
  let calculatedPagesCount = 0;

  // Variables for cleanup in the finally block
  let tempContainer: HTMLDivElement | null = null;
  let tempStyleTag: HTMLStyleElement | null = null;
  const disabledSheets: { sheet: CSSStyleSheet; wasDisabled: boolean }[] = [];

  try {
    currentStage = 'CLONE_CREATION';
    
    // 1. Create a deep clone of the element to preserve all classes and original structure
    const clone = element.cloneNode(true) as HTMLElement;
    clone.id = 'resume-document-clone';
    console.log("[CURRÊ PDF] CLONE_CREATED");

    // 2. Set identical layout width of 820px on the clone and neutralize mobile scaling
    clone.style.width = '820px';
    clone.style.maxWidth = 'none';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.borderRadius = '0px';
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'initial';
    clone.style.flexShrink = '0';
    clone.style.paddingBottom = '0px';
    clone.style.marginBottom = '0px';

    // 3. Place clone in a temporary off-screen container in the body to allow rendering
    tempContainer = document.createElement('div');
    tempContainer.id = 'pdf-export-temp-container';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '820px';
    tempContainer.style.height = 'auto';
    tempContainer.style.overflow = 'visible';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.boxSizing = 'border-box';
    
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    currentStage = 'COLOR_COMPAT_START';
    console.log("[CURRÊ PDF] COLOR_COMPAT_START");

    // 4. First-pass inline style conversion on cloned elements
    const clonedElements = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];
    clonedElements.forEach((el) => {
      if (el.style) {
        const styleAttr = el.getAttribute('style');
        if (styleAttr && (styleAttr.includes('oklch(') || styleAttr.includes('oklab('))) {
          el.setAttribute('style', convertModernColorsToRgb(styleAttr));
        }
      }
    });

    // 5. Create a clean empty style tag for pseudo-elements overrides only (appended to document head)
    tempStyleTag = document.createElement('style');
    tempStyleTag.id = 'pdf-temp-styles';
    tempStyleTag.textContent = '';
    document.head.appendChild(tempStyleTag);

    // 6. Advanced self-healing override of computed styles and pseudo-elements
    let oklchReplacements = 0;
    let oklabReplacements = 0;

    clonedElements.forEach((el, idx) => {
      try {
        const computed = window.getComputedStyle(el);
        const propertiesToFix = [
          'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
          'outlineColor', 'textDecorationColor', 'boxShadow', 'textShadow', 'fill', 'stroke'
        ];
        propertiesToFix.forEach(prop => {
          const val = (computed as any)[prop];
          if (val && typeof val === 'string' && (val.includes('oklch(') || val.includes('oklab('))) {
            if (val.includes('oklch(')) oklchReplacements++;
            if (val.includes('oklab(')) oklabReplacements++;
            const converted = convertModernColorsToRgb(val);
            (el.style as any)[prop] = converted;
          }
        });

        // Resolve custom properties via style.setProperty
        const commonCustomProps = [
          '--tw-bg-opacity', '--tw-text-opacity', '--tw-border-opacity', '--tw-shadow', '--tw-ring-color'
        ];
        commonCustomProps.forEach(prop => {
          const val = computed.getPropertyValue(prop);
          if (val && (val.includes('oklch(') || val.includes('oklab('))) {
            if (val.includes('oklch(')) oklchReplacements++;
            if (val.includes('oklab(')) oklabReplacements++;
            const converted = convertModernColorsToRgb(val);
            el.style.setProperty(prop, converted);
          }
        });

        // Resolve pseudo-elements styles by writing direct rules to the temp style sheet
        ['::before', '::after'].forEach(pseudo => {
          const computedPseudo = window.getComputedStyle(el, pseudo);
          const propertiesToFixPseudo = [
            'color', 'background-color', 'border-color', 'outline-color', 'box-shadow', 'text-shadow', 'fill', 'stroke'
          ];
          let hasPseudoIssue = false;
          let pseudoStyleRules = '';

          propertiesToFixPseudo.forEach(prop => {
            const val = computedPseudo.getPropertyValue(prop);
            if (val && (val.includes('oklch(') || val.includes('oklab('))) {
              hasPseudoIssue = true;
              if (val.includes('oklch(')) oklchReplacements++;
              if (val.includes('oklab(')) oklabReplacements++;
              const converted = convertModernColorsToRgb(val);
              pseudoStyleRules += `${prop}: ${converted} !important;\n`;
            }
          });

          if (hasPseudoIssue) {
            const uniqueIdAttr = `pdf-pseudo-target-${idx}`;
            el.setAttribute('data-pdf-pseudo-id', uniqueIdAttr);
            const rule = `[data-pdf-pseudo-id="${uniqueIdAttr}"]${pseudo} {\n${pseudoStyleRules}}\n`;
            tempStyleTag!.textContent += '\n' + rule;
          }
        });
      } catch (e) {
        // ignore computed style errors during fixing
      }
    });

    console.log("[CURRÊ PDF] COLOR_COMPAT_APPLIED");

    // 7. Verify all modern colors on the clone are fully neutralized for html2canvas
    console.log("[CURRÊ PDF] COLOR_SCAN_START");
    
    let remainingModernColors = 0;
    const remainingIssuesList: { selector: string; property: string; value: string }[] = [];

    function getElementSelector(el: HTMLElement): string {
      if (el.id) return `#${el.id}`;
      let selector = el.tagName.toLowerCase();
      if (el.className) {
        const classes = el.className.split(/\s+/).filter(Boolean).slice(0, 3).join('.');
        if (classes) selector += `.${classes}`;
      }
      return selector;
    }

    clonedElements.forEach((el) => {
      try {
        const computed = window.getComputedStyle(el);
        const propertiesToTest = [
          'color', 'background-color', 'border-color', 'outline-color', 'box-shadow', 'text-shadow', 'fill', 'stroke'
        ];
        propertiesToTest.forEach(prop => {
          const val = computed.getPropertyValue(prop);
          if (val && (val.includes('oklch(') || val.includes('oklab('))) {
            remainingModernColors++;
            remainingIssuesList.push({
              selector: getElementSelector(el),
              property: prop,
              value: val
            });
          }
        });

        ['::before', '::after'].forEach(pseudo => {
          const computedPseudo = window.getComputedStyle(el, pseudo);
          propertiesToTest.forEach(prop => {
            const val = computedPseudo.getPropertyValue(prop);
            if (val && (val.includes('oklch(') || val.includes('oklab('))) {
              remainingModernColors++;
              remainingIssuesList.push({
                selector: `${getElementSelector(el)}${pseudo}`,
                property: prop,
                value: val
              });
            }
          });
        });
      } catch (e) {
        // ignore scanning read errors
      }
    });

    console.log(`[CURRÊ PDF] OKLCH_REPLACEMENTS: ${oklchReplacements}`);
    console.log(`[CURRÊ PDF] OKLAB_REPLACEMENTS: ${oklabReplacements}`);
    console.log(`[CURRÊ PDF] REMAINING_MODERN_COLORS: ${remainingModernColors}`);

    if (remainingModernColors > 0) {
      console.warn("[CURRÊ PDF] MODERN_COLOR_REMAINING DETECTED! Printing detailed logs:");
      remainingIssuesList.forEach(issue => {
        console.warn(`[CURRÊ PDF] MODERN_COLOR_REMAINING\n- selector: ${issue.selector}\n- property: ${issue.property}\n- value: ${issue.value}`);
      });
      throw new Error(`Abort canvas capture: ${remainingModernColors} modern colors remaining in clone DOM`);
    }

    currentStage = 'CANVAS_CAPTURE';
    console.log("[CURRÊ PDF] CANVAS_START");

    const canvas = await renderCanvas(clone, {
      scale: 2, // Resolução perfeita sem sobrecarregar a memória
      windowWidth: 820, // Força a largura de viewport interna para bater com o layout desktop de 820px
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc: Document) => {
        console.log("[CURRÊ PDF] Cloned DOM ready inside html2canvas iframe, resolving styles...");
        // Convert any custom style tag elements inside the cloned iframe to standard RGB
        const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
        styleTags.forEach(tag => {
          if (tag.textContent) {
            tag.textContent = convertModernColorsToRgb(tag.textContent);
          }
        });
      }
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
    console.log("[CURRÊ PDF] Restaurando estilos e removendo elementos temporários...");
    
    // 1. Re-enable all disabled original style sheets
    for (const item of disabledSheets) {
      try {
        item.sheet.disabled = item.wasDisabled;
      } catch (e) {
        console.error("[CURRÊ PDF] Error re-enabling style sheet:", e);
      }
    }

    // 2. Remove temporary style tag
    if (tempStyleTag && tempStyleTag.parentNode) {
      try {
        tempStyleTag.parentNode.removeChild(tempStyleTag);
        console.log("[CURRÊ PDF] Temporary style sheet removed.");
      } catch (e) {
        console.error("[CURRÊ PDF] Error removing temporary style sheet:", e);
      }
    }

    // 3. Remove temporary container containing the clone
    if (tempContainer && tempContainer.parentNode) {
      try {
        tempContainer.parentNode.removeChild(tempContainer);
        console.log("[CURRÊ PDF] Temporary export container removed.");
      } catch (e) {
        console.error("[CURRÊ PDF] Error removing temporary container:", e);
      }
    }
  }
}
