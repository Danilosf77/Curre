import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { validateContact, CONTACT_LIMITS, type ContactFields } from '../utils/contactValidation';
import { trackEvent } from '../utils/analytics';
import { InstagramLink } from './InstagramLink';

const copy = {
 pt: ['Contato','Como podemos ajudar?','Envie sua dúvida, sugestão ou relato de problema. Nossa equipe receberá sua mensagem pelo formulário.','Nome','E-mail','Assunto / motivo','Mensagem','Enviar mensagem','Enviando…','Sua mensagem foi enviada. Obrigado por entrar em contato!','Não foi possível enviar. Tente novamente mais tarde.','Confira este campo e os limites indicados.','Conclua a verificação de segurança.','Contato temporariamente indisponível. Tente novamente mais tarde.','Você também pode nos encontrar nas redes sociais','Usaremos seus dados apenas para tratar e responder esta solicitação. Não envie senhas, documentos ou dados sensíveis.','Verificação de segurança','Voltar ao início','Muito obrigado!','Enviar outra mensagem'],
 en: ['Contact','How can we help?','Send a question, suggestion or issue. Our team will receive your message through this form.','Name','Email','Subject / reason','Message','Send message','Sending…','Your message has been sent. Thank you for contacting us!','Unable to send. Please try again later.','Check this field and the indicated limits.','Complete the security check.','Contact is temporarily unavailable. Please try again later.','You can also find us on social media','We use your details only to handle and reply to this request. Do not send passwords, documents or sensitive data.','Security check','Back to home','Thank you!','Send another message'],
 es: ['Contacto','¿Cómo podemos ayudarte?','Envía tu pregunta, sugerencia o problema. Nuestro equipo recibirá tu mensaje mediante este formulario.','Nombre','Correo electrónico','Asunto / motivo','Mensaje','Enviar mensaje','Enviando…','Tu mensaje se ha enviado. ¡Gracias por contactarnos!','No se pudo enviar. Inténtalo más tarde.','Revisa este campo y los límites indicados.','Completa la verificación de seguridad.','Contacto temporalmente no disponible. Inténtalo más tarde.','También puedes encontrarnos en las redes sociales','Usamos tus datos solo para gestionar y responder esta solicitud. No envíes contraseñas, documentos ni datos sensibles.','Verificación de seguridad','Volver al inicio','¡Gracias!','Enviar otro mensaje'],
 fr: ['Contact','Comment pouvons-nous vous aider ?','Envoyez une question, une suggestion ou un problème. Notre équipe recevra votre message via ce formulaire.','Nom','E-mail','Objet / motif','Message','Envoyer le message','Envoi…','Votre message a été envoyé. Merci de nous avoir contactés !','Envoi impossible. Réessayez plus tard.','Vérifiez ce champ et les limites indiquées.','Effectuez la vérification de sécurité.','Contact temporairement indisponible. Réessayez plus tard.','Retrouvez-nous aussi sur les réseaux sociaux','Vos données servent uniquement à traiter cette demande et y répondre. N’envoyez ni mots de passe, ni documents, ni données sensibles.','Vérification de sécurité','Retour à l’accueil','Merci !','Envoyer un autre message'],
};
type Turnstile = { render: (el: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id: string) => void };
const turnstile = () => (window as Window & { turnstile?: Turnstile }).turnstile;
const empty: ContactFields = { name: '', email: '', subject: '', message: '' };
export function ContactPage() {
 const { language } = useLanguage();
 const text = copy[language];
 const [fields, setFields] = useState(empty);
 const [errors, setErrors] = useState<Partial<Record<keyof ContactFields, string>>>({});
 const [state, setState] = useState<'loading' | 'ready' | 'sending' | 'success' | 'unavailable'>('loading');
 const [notice, setNotice] = useState('');
 const token = useRef('');
 const honeypot = useRef<HTMLInputElement>(null);
 const widget = useRef<HTMLDivElement>(null);
 const widgetId = useRef<string | undefined>(undefined);
 const locked = useRef(false);
 const status = useRef<HTMLDivElement>(null);

 useEffect(() => {
  document.title = `${text[0]} | CURRÊ`;
  for (const [selector, attribute, value] of [
   ['meta[name="description"]','content',text[2]],
   ['link[rel="canonical"]','href','https://www.curreai.com/contact'],
   ['meta[property="og:url"]','content','https://www.curreai.com/contact'],
   ['meta[property="og:title"]','content',`${text[0]} | CURRÊ`],
   ['meta[property="og:description"]','content',text[2]],
  ]) document.querySelector(selector)?.setAttribute(attribute,value);
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el=>el.remove());
 }, [language]);
 useEffect(() => { trackEvent('contact_view', { idioma: language }); }, []);
 useEffect(() => {
  let cancelled = false;
  const controller = new AbortController();
  let deadline: ReturnType<typeof setTimeout>;
  let script: HTMLScriptElement | undefined;
  const mount = () => {
   if (cancelled || !widget.current || !turnstile()) return;
   widgetId.current = turnstile()!.render(widget.current, { sitekey: siteKey, action: 'contact', size: 'flexible', callback: (value: string) => { token.current = value; }, 'expired-callback': () => { token.current = ''; }, 'error-callback': () => { token.current = ''; setNotice(text[12]); } });
   clearTimeout(deadline);
  };
  let siteKey = '';
  (async () => {
   try {
    const response = await fetch('/api/contact/config', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
    const config = await response.json();
    if (!response.ok || !config.enabled || typeof config.siteKey !== 'string') throw new Error();
    if (cancelled) return;
    siteKey = config.siteKey;
    setState('ready');
    // Config resolves before React commits the widget; mount on the next frame.
    requestAnimationFrame(() => {
     if (cancelled) return;
     if (turnstile()) { mount(); return; }
     script = document.createElement('script');
     script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
     script.async = true;
     script.onload = mount;
     script.onerror = () => { if (!cancelled) setState('unavailable'); };
     document.head.appendChild(script);
    });
    deadline = setTimeout(() => { if (!cancelled && !widgetId.current) setState('unavailable'); }, 15000);
   } catch { if (!cancelled) setState('unavailable'); }
  })();
  return () => { cancelled = true; controller.abort(); clearTimeout(deadline); if (widgetId.current) turnstile()?.remove(widgetId.current); script?.remove(); };
 }, []);

 async function submit(event: FormEvent) {
  event.preventDefault();
  if (locked.current || state !== 'ready') return;
  trackEvent('contact_submit', { idioma: language });
  const result = validateContact(fields);
  setErrors(result.errors);
  if (!result.valid) {
   setNotice(text[11]); trackEvent('contact_error', { categoria_erro: 'validacao' });
   document.getElementById(`contact-${Object.keys(result.errors)[0]}`)?.focus(); return;
  }
  if (!token.current) { setNotice(text[12]); trackEvent('contact_error', { categoria_erro: 'verificacao' }); return; }
  locked.current = true; setState('sending'); setNotice('');
  try {
   const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...result.data, token: token.current, website: honeypot.current?.value || '' }), signal: AbortSignal.timeout(30000) });
   const resultBody = await response.json();
   if (!response.ok || resultBody.ok !== true) throw new Error(`status-${response.status}`);
   setFields(empty); setState('success'); setNotice(text[9]);
   trackEvent('contact_success', { idioma: language });
   requestAnimationFrame(() => status.current?.focus());
  } catch (error) {
   setState('ready'); setNotice(text[10]);
   trackEvent('contact_error', { categoria_erro: error instanceof Error && error.message === 'status-429' ? 'limite' : 'rede_ou_resposta' });
  } finally { locked.current = false; token.current = ''; if (widgetId.current) turnstile()?.reset(widgetId.current); }
 }
 const inputClass = 'w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-slate-900 dark:text-slate-100 focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2 aria-invalid:border-rose-500 disabled:opacity-60';
 return <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
  <a href={`/${language}/`} className="inline-flex min-h-11 items-center text-sm font-semibold text-sky-700 dark:text-sky-300 rounded-lg focus-visible:outline-2 focus-visible:outline-sky-500">← {text[17]}</a>
  <div className="grid md:grid-cols-[1fr_1.35fr] gap-8 mt-5">
   <div><p className="text-sky-700 dark:text-sky-300 font-semibold mb-3">CURRÊ · {text[0]}</p><h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{text[1]}</h1><p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed">{text[2]}</p><div className="mt-8 flex gap-3 text-sm text-slate-600 dark:text-slate-300"><ShieldCheck className="shrink-0 text-sky-600" aria-hidden="true"/><p>{text[15]}</p></div><div className="mt-8"><p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{text[14]}</p><InstagramLink placement="contact_page"/></div></div>
   <div className="liquid-glass rounded-3xl p-5 sm:p-8">
    <div ref={status} tabIndex={-1} role={state === 'success' ? 'status' : 'alert'} aria-live="polite" className="rounded-xl focus-visible:outline-2 focus-visible:outline-sky-500">
     {state === 'success' && <CheckCircle2 className="text-emerald-600 mb-3" aria-hidden="true"/>}
     {notice && <p className={`mb-5 ${state === 'success' ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{notice}</p>}
    </div>
    {state === 'unavailable' && <p role="status" className="text-slate-700 dark:text-slate-200 mb-4">{text[13]}</p>}
    {state === 'loading' && <p role="status">{text[8]}</p>}
    <form onSubmit={submit} noValidate aria-busy={state === 'sending'} className="space-y-5">
     {(Object.keys(empty) as (keyof ContactFields)[]).map((key,i) => <div key={key}><label htmlFor={`contact-${key}`} className="block mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{text[i+3]} *</label>{key === 'message' ? <textarea id={`contact-${key}`} name={key} value={fields[key]} onChange={e=>setFields({...fields,[key]:e.target.value})} rows={6} required maxLength={CONTACT_LIMITS[key]} minLength={10} disabled={state !== 'ready'} aria-invalid={Boolean(errors[key])} aria-describedby={`contact-${key}-help`} className={`${inputClass} resize-y`}/> : <input id={`contact-${key}`} name={key} type={key === 'email' ? 'email' : 'text'} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : 'off'} value={fields[key]} onChange={e=>setFields({...fields,[key]:e.target.value})} required maxLength={CONTACT_LIMITS[key]} disabled={state !== 'ready'} aria-invalid={Boolean(errors[key])} aria-describedby={`contact-${key}-help`} className={inputClass}/>}<p id={`contact-${key}-help`} className={`text-xs mt-2 ${errors[key] ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-400'}`}>{errors[key] ? text[11] : `${key === 'message' ? '10–' : ''}${CONTACT_LIMITS[key]} max.`}</p></div>)}
     <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input ref={honeypot} id="contact-website" name="website" tabIndex={-1} autoComplete="off"/></div>
     <div ref={widget} aria-label={text[16]} className="w-full min-w-0 overflow-hidden"/>
     <button type="submit" disabled={state !== 'ready'} className="w-full min-h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"><Send size={18} aria-hidden="true"/>{state === 'sending' ? text[8] : text[7]}</button>
    </form>
    {state === 'success' && <a href="/contact" className="inline-flex min-h-11 items-center mt-4 text-sky-700 dark:text-sky-300 underline">{text[19]}</a>}
   </div>
  </div>
 </section>;
}
