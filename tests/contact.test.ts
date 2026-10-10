import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { readFileSync } from 'node:fs';
import { createContactHandler, contactReady } from '../api/contact.ts';
import { contactHtml } from '../api/contactSeo.ts';
import { validateContact } from '../src/utils/contactValidation.ts';
import { trackEvent } from '../src/utils/analytics.ts';

const config = { siteKey: 'test-site', secret: 'test-secret', apiKey: 'test-mail', from: 'sender@example.test', to: 'owner@example.test', origins: ['https://www.curreai.com'] };
const body = { name: 'Test Visitor', email: 'visitor@example.test', subject: 'Question', message: 'A valid test message.', token: 'test-token', website: '' };
async function harness(provider: typeof fetch, callback: (send: (payload?: unknown, origin?: string) => Promise<Response>) => Promise<void>, settings = config) {
 const app = express(); app.use(express.json({limit:'12kb'})); app.post('/api/contact',createContactHandler(()=>settings,provider));
 const server = app.listen(0,'127.0.0.1'); await new Promise<void>(resolve=>server.once('listening',resolve));
 const address=server.address() as {port:number};
 try { await callback((payload=body,origin=config.origins[0])=>fetch(`http://127.0.0.1:${address.port}/api/contact`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(payload)})); }
 finally { server.closeAllConnections(); await new Promise<void>(resolve=>server.close(()=>resolve())); }
}
test('contact validates malicious headers, missing fields, types and size',()=>{
 assert.equal(validateContact(body).valid,true);
 for (const patch of [{email:'invalid'},{name:42},{subject:'subject\r\nBcc: victim@example.test'},{message:'x'.repeat(5001)},{message:'\u0000message'},{message:'short'}]) assert.equal(validateContact({...body,...patch}).valid,false);
 assert.equal(contactReady({...config,secret:''}),false);
});
test('valid contact verifies action/host before email and rejects replay',async()=>{
 const calls: Array<{url:string;options:any}> = [];
 const provider = (async(url:any,options:any)=> {calls.push({url:String(url),options}); return Response.json(calls.length===1?{success:true,action:'contact',hostname:'www.curreai.com'}:{id:'provider-message-id'});}) as typeof fetch;
 await harness(provider,async send=>{
  const response=await send();assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});
  assert.equal((await send()).status,409);
 });
 assert.equal(calls.length,2);
 const mail=JSON.parse(calls[1].options.body);
 assert.deepEqual(mail.to,[config.to]);assert.equal(mail.from,config.from);assert.equal(mail.reply_to,body.email);assert.equal(mail.html,undefined);
 assert.match(calls[1].options.headers['Idempotency-Key'],/^contact-[a-f0-9]{64}$/);
});
test('spam, untrusted origin, invalid input and missing configuration never send email',async()=>{
 let calls=0;const provider=(async()=>{calls++;throw new Error('should not run');}) as typeof fetch;
 await harness(provider,async send=>{
  assert.equal((await send(body,'https://attacker.test')).status,403);
  assert.equal((await send({...body,website:'spam'})).status,400);
  assert.equal((await send({...body,email:'bad'})).status,400);
 });
 await harness(provider,async send=>assert.equal((await send()).status,503),{...config,apiKey:''});assert.equal(calls,0);
});
test('wrong Turnstile action/host and failed tokens never reach email provider',async()=>{
 for(const proof of [{success:false},{success:true,action:'other',hostname:'www.curreai.com'},{success:true,action:'contact',hostname:'attacker.test'}]){
  let calls=0;await harness((async()=>{calls++;return Response.json(proof);}) as typeof fetch,async send=>assert.equal((await send()).status,400));assert.equal(calls,1);
 }
});
test('provider failure and timeout return failure without leaking data or pretending success',async()=>{
 let calls=0;await harness((async()=>{calls++;return calls===1?Response.json({success:true,action:'contact',hostname:'www.curreai.com'}):Response.json({error:'private provider detail'},{status:403});}) as typeof fetch,async send=>{const r=await send();assert.equal(r.status,502);assert.deepEqual(await r.json(),{error:'delivery'});});
 await harness((async()=>{throw new Error('secret-key');}) as typeof fetch,async send=>assert.equal((await send()).status,502));
});
test('rate limiting stops the sixth request and returns Retry-After',async()=>{
 await harness((async()=>{throw new Error();}) as typeof fetch,async send=>{
  for(let i=0;i<5;i++)assert.equal((await send({...body,message:''})).status,400);
  const r=await send();assert.equal(r.status,429);assert.ok(Number(r.headers.get('Retry-After'))>0);
 });
});
test('contact analytics only exposes permitted nonpersonal fields on production hosts',()=>{
 const previous=(globalThis as any).window;const calls:any[]=[];
 try {
  (globalThis as any).window={location:{hostname:'www.curreai.com'},gtag:(...args:any[])=>calls.push(args)};
  for(const name of ['contact_view','contact_submit','contact_success','contact_error','instagram_click']) trackEvent(name as any,{idioma:'en',placement:'footer',name:body.name,email:body.email,subject:body.subject,message:body.message} as any);
  assert.equal(calls.length,5);assert.ok(calls.every(x=>JSON.stringify(x[2])===JSON.stringify({placement:'footer',idioma:'en'})));
  (globalThis as any).window.location.hostname='localhost';trackEvent('contact_success');assert.equal(calls.length,5);
 } finally {(globalThis as any).window=previous;}
});
test('contact HTML has unique title/canonical/description and no homepage language alternates',()=>{
 const html=contactHtml(readFileSync('index.html','utf8'));
 assert.match(html,/<title>Contato \| CURRÊ<\/title>/);assert.match(html,/<link rel="canonical" href="https:\/\/www.curreai.com\/contact"/);assert.match(html,/formulário de contato seguro/);assert.equal(html.includes('hreflang='),false);
});
