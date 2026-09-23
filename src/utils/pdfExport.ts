/**
 * Real Native Vector PDF Export via Browser Print (window.print)
 * 
 * Prepara o documento, assegura o carregamento completo de fontes e imagens,
 * ativa temporariamente a classe "curre-print-mode" no body e aciona window.print().
 * 
 * Isso preserva texto selecionável, curvas vetoriais nativas, ícones SVG nítidos
 * do Lucide e paginação natural de múltiplas páginas sem rasterização por canvas.
 */
export async function exportResumeToPDF(
  elementId: string = 'resume-document',
  candidateName: string = 'Curriculo'
): Promise<boolean> {
  console.log('[CURRÊ PDF] Iniciando exportação vetorial via impressão nativa...');

  try {
    // 1. Aguarda fontes estarem completamente carregadas e decodificadas
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('[CURRÊ PDF] Falha ao aguardar document.fonts.ready:', e);
      }
    }

    // 2. Localiza o elemento do currículo e decodifica eventuais imagens presentes
    let element = document.getElementById(elementId);
    if (!element) {
      element = document.querySelector('#resume-document') || document.querySelector('.resume-paper');
    }

    if (element) {
      const images = Array.from(element.querySelectorAll('img'));
      if (images.length > 0) {
        await Promise.all(
          images.map((img) => {
            if (img.complete) {
              return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
            }
            return new Promise<void>((resolve) => {
              img.onload = () => {
                if (img.decode) {
                  img.decode().then(resolve).catch(resolve);
                } else {
                  resolve();
                }
              };
              img.onerror = () => resolve();
            });
          })
        );
      }
    }

    // 3. Define temporariamente o título do documento para sugerir o nome correto do PDF
    const originalTitle = document.title;
    const sanitizedName = candidateName
      .trim()
      .replace(/[^a-zA-Z0-9À-ÿ]/g, '_')
      .replace(/_+/g, '_') || 'Curriculo';
    
    document.title = `Curriculo_${sanitizedName}`;

    // 4. Ativa classe temporária no elemento body
    document.body.classList.add('curre-print-mode');

    // 5. Gerenciamento seguro do encerramento do modo de impressão (afterprint + timeout)
    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      document.body.classList.remove('curre-print-mode');
      document.title = originalTitle;
      window.removeEventListener('afterprint', cleanup);
      if (safetyTimer) clearTimeout(safetyTimer);
      console.log('[CURRÊ PDF] Limpeza de modo de impressão concluída com sucesso.');
    };

    window.addEventListener('afterprint', cleanup);
    // Timeout de segurança caso afterprint não dispare (ex: cancelamento sem evento em alguns navegadores)
    const safetyTimer = setTimeout(cleanup, 12000);

    // 6. Pequeno intervalo para permitir a aplicação e recálculo do layout do modo de impressão
    await new Promise((resolve) => setTimeout(resolve, 80));

    // 7. Aciona a janela de impressão nativa do navegador
    window.print();

    return true;
  } catch (err) {
    console.error('[CURRÊ PDF] Erro ao disparar impressão nativa:', err);
    document.body.classList.remove('curre-print-mode');
    throw err;
  }
}
