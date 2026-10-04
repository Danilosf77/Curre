# Medição das etapas do CURRÊ

Nenhuma funcionalidade de pagamento foi adicionada.

## Eventos

- `inicio_curriculo`: início pelo botão de criar.
- `etapa_concluida`: avanço validado (etapas 1–7) e envio final validado (8). Revisar novamente uma etapa pode registrar novo avanço; compare usuários e sessões, não só contagens.
- `formulario_concluido`: envio final do formulário validado, antes de chamar a geração.
- `geracao_iniciada`: solicitação ao servidor, incluindo nova tentativa.
- `geracao_falhou`: falha de otimização, mesmo quando uma versão básica é entregue.
- `geracao_concluida`: resultado disponível, com `metodo` igual a `ia` ou `basico`.
- `preview_visualizado`: prévia montada; trocar apenas o modelo não repete esse evento.
- `modelo_selecionado`: mudança de modelo, pela galeria ou pelas setas.
- `download_curriculo`: evento existente, enviado após iniciar o download via servidor ou fallback. Não comprova que o usuário abriu ou salvou o arquivo no dispositivo.

Um fallback registra falha da IA e conclusão básica: esses eventos não são contraditórios. Saltar direto para revisão não registra etapas que a pessoa não percorreu. Reabrir um currículo salvo registra prévia, sem inventar nova geração.

## Privacidade e ambientes

A coleta funciona apenas em `www.curreai.com`, `curreai.com` e `curre.onrender.com`. Localhost, IPs locais e outros ambientes não carregam a tag. Não há modo debug local que envie dados à propriedade real. Isso inclui o evento de download. No domínio público, acrescente `?analytics_debug=1` apenas para validar no DebugView. A configuração de debug fica restrita àquela página; omitir o parâmetro desativa o modo.

Os parâmetros novos seguem uma lista permitida: número de etapa, idioma, origem da solicitação, modelo, método, duração e categoria de erro. Não são enviados nome, e-mail, telefone, textos do currículo ou da vaga, fotos, IDs do currículo ou mensagens brutas de erro. Os eventos automáticos continuam seguindo a configuração existente do GA4; evite dados pessoais em URLs e parâmetros UTM.

Bloqueadores e falta de conectividade podem impedir a coleta. Falha de Analytics nunca deve impedir criação ou download. Dados anteriores não podem ser reconstruídos com os eventos novos.

## Validação após deploy

1. Publicar no GitHub e aguardar o deploy do Render.
2. Usar uma sessão de teste no domínio publicado, de preferência com Tag Assistant/debug, sem dados pessoais reais.
3. Conferir no DebugView: início, avanços, geração, prévia, escolha de modelo e download.
4. Testar também fallback e nova tentativa. O método básico deve continuar permitindo download.
5. Para relatórios dos parâmetros, criar dimensões personalizadas de escopo Evento: `etapa`, `idioma`, `metodo`, `modelo`, `categoria_erro`, `origem`. `duracao_ms` pode ser uma métrica personalizada.
6. Criar uma exploração de funil com inicio_curriculo → formulario_concluido → geracao_concluida → preview_visualizado → download_curriculo. Usar um funil separado de etapas 1–8 para abandono do formulário, respeitando os saltos para revisão.
7. Usar filtro de host para produção e identificar testes internos. Não interpretar todos os downloads como visitantes externos.

A configuração e a validação do GA4 são feitas separadamente na propriedade, sem reconstruir dados anteriores. A entrega real dos eventos precisa ser validada no site publicado, pois localmente a coleta está intencionalmente desativada.

## Funil e divulgação

Usar funil fechado com cinco passos, seguidos indiretamente: Começou → Concluiu formulário → Gerou → Viu a prévia → Baixou. A exploração conta pessoas, não o total bruto de cliques. Inclui geração básica e IA; o parâmetro `metodo` permite distinguir ambas. O download mede a entrega iniciada pelo navegador, não a abertura do PDF pelo usuário.

Quebras: Categoria do dispositivo e Origem / mídia da sessão. Campanha da sessão identifica UTMs. Usar dados de produção e excluir as sessões de depuração com filtro de Tráfego do desenvolvedor no GA4. O filtro pode levar 24–36 horas para aplicar; testes antigos não desaparecem retroativamente.

Exemplo Instagram:
https://www.curreai.com/?utm_source=instagram&utm_medium=social&utm_campaign=curre_lancamento&utm_content=bio

Exemplo parceria:
https://www.curreai.com/?utm_source=parceiro_exemplo&utm_medium=referral&utm_campaign=parcerias_curriculo&utm_content=divulgacao

Manter UTMs em minúsculas, sem acentos ou dados pessoais. Não colocar `analytics_debug=1` em links de divulgação. O GA4 interpreta UTMs nativamente; não precisamos enviar esses parâmetros novamente como eventos.

## Economia de IA

Modelo padrão: `gemini-3.5-flash-lite`; configurável no servidor por `GEMINI_MODEL`. Alternativa para falhas temporárias: `GEMINI_FALLBACK_MODEL`, padrão `gemini-3.5-flash`. Não há ativação de cobrança. Cotas dependem do projeto no Google AI Studio.

Resultados bem-sucedidos de geração, análise de vaga e revisão são reutilizados por até 15 minutos quando os dados enviados não mudam. Cache apenas em memória da página, até dez respostas; atualizar a página limpa o cache. Alterar dados ou idioma pede nova análise. Falhas e resultados básicos não são armazenados no cache.

Mensagens de cota, chave e servidor ficam fora da interface do cliente. A versão básica mantém a visualização e o download, sem ser identificada como otimizada com IA. A revisão que falhar não exibe uma análise falsa.