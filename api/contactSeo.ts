export function contactHtml(html: string) {
 const description = 'Fale com a equipe CURRÊ. Envie dúvidas, sugestões ou relatos de problemas pelo nosso formulário de contato seguro.';
 return html.replace(/<title>.*?<\/title>/s, '<title>Contato | CURRÊ</title>')
  .replace(/(<meta (?:name="description"|name="twitter:description"|property="og:description") content=")[^"]*("\s*\/>)/g, `$1${description}$2`)
  .replace(/(<meta (?:name="twitter:title"|property="og:title") content=")[^"]*("\s*\/>)/g, '$1Contato | CURRÊ$2')
  .replace(/(<link rel="canonical" href=")[^"]*("\s*\/>)/, '$1https://www.curreai.com/contact$2')
  .replace(/(<meta property="og:url" content=")[^"]*("\s*\/>)/, '$1https://www.curreai.com/contact$2')
  .replace(/\s*<link rel="alternate" hreflang="[^"]+"[^>]*>/g, '');
}
