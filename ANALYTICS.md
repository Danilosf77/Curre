# Medição das etapas do CURRÊ

Nenhuma funcionalidade de pagamento foi adicionada.

## Eventos

- `inicio_curriculo`: início pelo botão de criar.
- `etapa_concluida`: avanço validado (etapas 1–7) e envio final validado (8). Revisar novamente uma etapa pode registrar novo avanço; compare usuários e sessões, não só contagens.
- `geracao_iniciada`: solicitação ao servidor, incluindo nova tentativa.
- `geracao_falhou`: falha de otimização, mesmo quando uma versão básica é entregue.
- `geracao_concluida`: resultado disponível, com `metodo` igual a `ia` ou `basico`.
- `preview_visualizado`: prévia montada; trocar apenas o modelo não repete esse evento.
- `modelo_selecionado`: mudança de modelo, pela galeria ou pelas setas.
- `download_curriculo`: evento existente, enviado após iniciar o download via servidor ou fallback. Não comprova que o usuário abriu ou salvou o arquivo no dispositivo.

Um fallback registra falha da IA e conclusão básica: esses eventos não são contraditórios. Saltar direto para revisão não registra etapas que a pessoa não percorreu. Reabrir um currículo salvo registra prévia, sem inventar nova geração.

## Privacidade e ambientes

A coleta funciona apenas em `www.curreai.com`, `curreai.com` e `curre.onrender.com`. Localhost, IPs locais e outros ambientes não carregam a tag. Não há modo debug local que envie dados à propriedade real.

Os parâmetros novos seguem uma lista permitida: número de etapa, idioma, origem da solicitação, modelo, método, duração e categoria de erro. Não são enviados nome, e-mail, telefone, textos do currículo ou da vaga, fotos, IDs do currículo ou mensagens brutas de erro. Os eventos automáticos continuam seguindo a configuração existente do GA4; evite dados pessoais em URLs e parâmetros UTM.

Bloqueadores e falta de conectividade podem impedir a coleta. Falha de Analytics nunca deve impedir criação ou download. Dados anteriores não podem ser reconstruídos com os eventos novos.

## Validação após deploy

1. Publicar no GitHub e aguardar o deploy do Render.
2. Usar uma sessão de teste no domínio publicado, de preferência com Tag Assistant/debug, sem dados pessoais reais.
3. Conferir no DebugView: início, avanços, geração, prévia, escolha de modelo e download.
4. Testar também fallback e nova tentativa. O método básico deve continuar permitindo download.
5. Para relatórios dos parâmetros, criar dimensões personalizadas de escopo Evento: `etapa`, `idioma`, `metodo`, `modelo`, `categoria_erro`, `origem`. `duracao_ms` pode ser uma métrica personalizada.
6. Criar uma exploração de funil com início → etapa 8 → geração concluída → prévia → download. Usar um funil separado de etapas 1–8 para abandono do formulário, respeitando os saltos para revisão.
7. Usar filtro de host para produção e identificar testes internos. Não interpretar todos os downloads como visitantes externos.

As dimensões e o funil do GA4 ainda não foram configurados por esta alteração de código. A entrega real dos eventos precisa ser validada no site publicado, pois localmente a coleta está intencionalmente desativada.
