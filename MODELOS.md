# Coleção Signature

A galeria agora tem 14 modelos. Os dez modelos anteriores continuam com seus componentes e regras de impressão originais.

Os quatro novos modelos são Global Classic (clássico, sem foto), Executive Signature (azul e dourado discreto), Nordic (verde mineral e cabeçalho suave) e Editorial (tipografia serifada e terracota). As descrições e o filtro da coleção estão disponíveis em português, inglês, espanhol e francês.

## Critérios

- Uma coluna de leitura, títulos de seção em texto e datas próximas de cada experiência.
- Fontes legíveis, contraste, margens A4 e conteúdo selecionável no PDF.
- Sem escalas gráficas de habilidades, experiências inventadas ou limites que cortem o currículo para caber em uma página.
- O Global Classic omite a foto deliberadamente; os demais respeitam a foto opcional preenchida pelo usuário.
- Os modelos apresentam os dados na ordem fornecida pela geração atual. A escolha do visual não refaz a otimização nem altera os dados.

Referências de princípios de apresentação: [Harvard](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/) e [Europass](https://europass.europa.eu/en/create-europass-cv). A coleção é original do CURRÊ, não é um modelo oficial dessas instituições. Países, empresas e plataformas têm exigências diferentes; não há certificação universal de ATS ou promessa de contratação.

## Futura monetização

O campo `collection: 'signature'` identifica os modelos especiais e permite organizar uma oferta futura. No momento, todos continuam disponíveis. Não há cobrança, bloqueio de download nem integração de pagamento.

Os eventos `modelo_selecionado` e `download_curriculo` aceitam os quatro novos identificadores no parâmetro `modelo`, permitindo acompanhar quais visuais são escolhidos e baixados.

## Verificação

`npm run test:pdf` exporta todos os modelos registrados e confere a presença do conteúdo. Também testa os quatro modelos novos nos quatro idiomas com conteúdo longo, múltiplas páginas, contatos extensos e ordem de leitura. A revisão visual foi realizada sobre imagens renderizadas dos PDFs reais, além da galeria em desktop e viewport de 390 × 844.

Para atualizar somente as quatro miniaturas novas após um build:

```sh
node --import tsx scripts/generate-template-previews.ts --signature-only
```
