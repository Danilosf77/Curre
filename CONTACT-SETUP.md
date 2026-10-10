# Área de contato CURRÊ

## Ativação no servidor

Configure `CONTACT_TO_EMAIL` com a caixa oficial que receberá as mensagens. Configure `CONTACT_FROM_EMAIL` com um remetente verificado no Resend e `RESEND_API_KEY` com uma chave restrita a envio. O endereço do visitante é apenas `reply_to`; nunca controla destinatário ou remetente. Não há endereço oficial presumido no código.

Crie um widget Turnstile para os hosts de produção e configure `TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY`. A chave de site é pública por definição; o segredo e a chave de e-mail permanecem no servidor. `CONTACT_ALLOWED_ORIGINS` aceita origens completas separadas por vírgula. Vazio usa os três hosts de produção já reconhecidos pelo projeto. Não inclua localhost em produção.

Configure `TRUST_PROXY` somente com os IPs/sub-redes reais do proxy da hospedagem. Não habilite confiança irrestrita em cabeçalhos enviados pelo visitante. Sem confiança no proxy, o limite pode agrupar todos os visitantes pelo IP do proxy.

Sem configuração completa, `/api/contact/config` informa indisponibilidade e o formulário bloqueia envio, sem falso sucesso. Quando configurado, a API verifica origem, payload, honeypot, Turnstile (hostname e action `contact`) e encaminha texto simples ao Resend. HTTP 200 depende da confirmação de aceitação e ID do provedor. Aceitação não garante entrega na caixa de entrada: monitorar rejeições/bounces no painel do Resend.

## Proteções e limites

- JSON até 32 KB; nome 2–100, e-mail até 254, assunto 3–120 e mensagem 10–5000 caracteres.
- Normalização Unicode, bloqueio de caracteres de controle e quebras em campos de cabeçalho. Mensagem enviada apenas como texto, sem interpolação em HTML.
- 5 tentativas por IP por 15 minutos; até 3 processamentos simultâneos; 100 tentativas de verificação por dia UTC por processo.
- Tokens de uso único, cache de hashes por 10 minutos, chave de idempotência no provedor, botão bloqueado durante envio, prazos de conexão.
- Não persistimos nem registramos conteúdo de mensagens em logs do aplicativo. O provedor de e-mail recebe os campos para realizar o envio; revisar sua retenção e política de privacidade junto à Cloudflare.
- Os limites em memória servem uma instância. Para múltiplas réplicas/serverless, adicionar armazenamento compartilhado ou regras de limite no gateway antes de escalar.

## Rotas, navegação e SEO

`/contact` é uma página real, com metadados também no HTML enviado pelo servidor, canonical único e sitemap. `/contact-us`, `/contact-us/` e `/contact/` redirecionam permanentemente para `/contact`, descartando parâmetros. O seletor de idioma preserva `/contact`; português, inglês, espanhol e francês estão disponíveis. O restante da navegação mantém os padrões existentes.

Instagram confirmado pelo proprietário: https://www.instagram.com/curreai/, presente na página e rodapé, com ícone, nome acessível e `noopener noreferrer`.

## Analytics

Eventos: `contact_view`, `contact_submit`, `contact_success`, `contact_error`, `instagram_click`. `contact_success` somente após resposta positiva do backend. `placement` admite apenas `footer` ou `contact_page`. Nenhum campo do formulário entra no GA4; parâmetros permitidos são idioma, local do clique e categorias fixas de erro. Na página de contato, URL e referrer são configurados sem query/hash; a atribuição de campanhas das demais páginas foi preservada. Localhost não carrega GA4. Recomenda-se marcar `contact_success` como evento principal após verificar um envio legítimo no ambiente publicado.

## Validação e pendências externas

`npm run lint` executa o typecheck. `npm test` executa regressões e testes de contato; `npm run test:pdf` cobre PDFs. Testes de envio usam respostas controladas dos provedores: não são prova de entrega real. A confirmação final de entrega depende da caixa oficial, domínio de remetente, chaves de produção e deploy. Não informar esses segredos no chat nem commitar `.env`.

O build foi validado em diretório separado para preservar os artefatos `dist` preexistentes. A hospedagem deve reconstruir a partir do código com `npm run build` antes de iniciar `npm start`.
