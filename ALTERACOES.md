# Correções locais — 4 de outubro de 2026

Base: ZIP da branch `main` de Danilosf77/Curre baixado do GitHub. Esta pasta é a versão de trabalho; o site publicado ainda não recebeu estas alterações.

## Comportamento corrigido

- PDF: até 12 pedidos por IP a cada 15 minutos e no máximo duas gerações simultâneas por processo. Quando ocupado, retorna 503 com Retry-After. O processamento com Chromium tem prazo de 30 segundos e fecha os recursos ao terminar.
- Fotos no PDF: aceita apenas imagens PNG, JPEG e WebP em data URLs base64, com assinatura de formato e limite de tamanho. URLs externas e SVGs são rejeitados. A rede do navegador permite apenas os hosts de fontes do Google; redirecionamentos são bloqueados.
- Chromium: não é mais instalado durante uma requisição. A imagem Docker já inclui o navegador. Para desenvolvimento e testes locais, executar `npx playwright install chromium` previamente.
- API: valida idioma, textos, listas e estruturas aninhadas antes de chamar a IA e consumir a cota. Também valida a estrutura da resposta da IA. Erros internos não são enviados diretamente ao usuário.
- Compatibilidade: remove o mínimo artificial de 65–72%. O fallback calcula correspondência literal de palavras-chave, sem inventar habilidades encontradas, e a interface identifica a análise sem IA. Essa medida não é uma probabilidade de contratação.
- Currículo salvo: mantém os dados originais do formulário junto do resultado, sem duplicar a foto. Ao reabrir, editar, regenerar e adaptar usam esses dados. Currículos antigos recuperam o conteúdo disponível; informações originais que não foram salvas não podem ser recuperadas integralmente.
- Falhas de geração: a interface informa quando foi gerada uma versão básica. O cliente usa AbortController com prazo de 30 segundos; o SDK de IA tem timeout de 25 segundos. Um cancelamento local não garante cancelamento nem ausência de cobrança pelo provedor.
- Configuração: `.env.local` e `.env` são carregados, preservando prioridade das variáveis do ambiente.
- Dependências: correções compatíveis no lockfile; override da dependência transitiva gRPC para a linha corrigida, sem rebaixar Firebase.
- CI: TypeScript, testes, build e geração de PDFs nos dez modelos.

## Verificação

Executar na raiz desta pasta:

```sh
npm ci
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:pdf
npm audit
```

Os testes de PDF usam dados fictícios. Os testes de regressão não fazem chamadas pagas à IA nem gravam dados em contas reais.

## Implantação

Os limites de uso e o orçamento diário continuam locais a cada processo; reiniciar o servidor reinicia os contadores. Para múltiplas instâncias ou orçamento persistente, é necessário armazenamento compartilhado. Isso não foi acrescentado nesta etapa.

Para IPs corretos atrás de proxy, configurar `TRUST_PROXY` com os IPs/sub-redes confiáveis da infraestrutura, separados por vírgula. O padrão não confia em cabeçalhos encaminhados. Não habilitar confiança irrestrita sem verificar a topologia da hospedagem.

O build ainda avisa sobre o tamanho do bundle do frontend. Firebase login/Firestore reais e a chamada ao Gemini precisam de validação no ambiente de homologação; não foram exercitados com credenciais reais nesta execução.

As mudanças de fonte estão nesta pasta. Para publicá-las, enviar o código atualizado ao repositório e implantar pelo fluxo existente da hospedagem.

## Galeria de modelos

A lista extensa foi substituída por uma faixa com o estilo atual e o botão Trocar modelo. A galeria tem miniaturas, filtros por categoria e confirmação antes de aplicar. No celular abre como painel inferior com duas opções por linha. Cancelar ou pressionar Escape mantém a seleção anterior.

As miniaturas são imagens estáticas em public/template-previews. Para regenerá-las após mudanças futuras nos modelos: npm run build e npx tsx scripts/generate-template-previews.ts.

Nesta mudança de interface, os arquivos dos dez templates e da geração/exportação de PDF permaneceram idênticos, verificados por SHA256. Foram validados cancelamento, aplicação, filtros e layout desktop/mobile. TypeScript, build, nove testes de regressão e três testes de PDF passaram, incluindo PDFs reais dos dez modelos.

## Escolha visual e revisão do arquivo

A galeria agora aplica o modelo ao tocar na miniatura, com três colunas maiores no desktop e duas no mobile. A faixa mostra a miniatura atual e permite navegar pelos botões anterior/próximo. Não foi implementada cobrança: o preço e o provedor de pagamentos ainda não foram definidos.

A antiga nota estrutural e as afirmações não medidas foram removidas da tela. Verificar PDF gera um arquivo pelo endpoint existente, extrai seu texto com PDF.js no navegador e compara nome, contatos, resumo, experiências, formação, competências e cursos com os dados originais. Exibe o texto na ordem extraída para inspeção. Essa comparação não certifica leitura por ATS externos nem garante ordem correta de colunas. O fallback de download por imagem permanece intacto e não é certificado por essa verificação.

A revisão por IA é opcional e usa /api/review-resume, com validação, timeout, limites de chamadas compartilhados e resposta JSON validada. Envia apenas texto extraído e vaga; não envia a foto. O prompt exige evidência e ação concreta, proíbe invenção de experiências e notas ou probabilidades de contratação. A IA requer GEMINI_API_KEY no servidor. Sem chave ou em caso de falha, exibe indisponibilidade sem relatório fictício. A chamada real ao provedor não foi validada neste ambiente sem chave.

Os dez PDFs passaram também pela extração e comparação do conteúdo de teste. Todos os arquivos dos templates e da exportação/geração de PDF mantiveram seus hashes originais.

## Interface da tela de resultado

A prévia agora aparece antes da verificação, análise da vaga e salvamento na nuvem. A análise fica recolhida até ser aberta. Salvar e gerar novamente ficam em Mais opções. O download no desktop usa um botão compacto; no celular permanece na barra inferior, com fundo sólido e sem texto técnico repetido. O seletor mobile usa o rótulo Modelos para preservar espaço para o nome do estilo. Foram ajustados os contrastes do título, contador e aviso de versão básica.

TypeScript e build passaram. Desktop e mobile foram inspecionados. O markup completo da área do documento foi comparado ao ZIP anterior e permaneceu idêntico; os templates e arquivos da geração/exportação também mantiveram os hashes originais. Não há alteração de cobrança ou publicação.

## Falha na otimização por IA

O cliente exige isAiGenerated=true antes de apresentar e salvar uma nova geração. Falhas de rede, HTTP, timeout ou respostas de fallback mostram Tentar novamente e Revisar meus dados. Os dados ficam preservados no estado da sessão; nenhuma versão básica substitui o currículo anterior ou é salva automaticamente. O fluxo foi validado localmente sem chave de IA, incluindo o retorno à revisão com os campos preenchidos. TypeScript e build passaram. Templates e geração/exportação de PDF não foram alterados.

## Continuidade quando a IA falhar (comportamento final)

A orientação anterior de bloquear o resultado foi substituída: o fallback local/servidor continua disponível, com prévia e download. O aviso explica que a versão usa os dados preenchidos e oferece Tentar novamente com IA. Uma falha nessa tentativa mantém uma versão básica disponível. A implementação reaproveita os fluxos existentes e não altera templates ou exportação. Offline aqui significa alternativa sem IA; não é garantia de funcionamento sem conexão ou de PWA.
