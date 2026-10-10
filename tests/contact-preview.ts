// Isolated UI test fixture. Never imported by the application or production server.
// Binds loopback only, uses fake providers and sends no email/Analytics events.
import express from 'express';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createContactHandler } from '../api/contact.ts';
import { contactHtml } from '../api/contactSeo.ts';
const app = express();
const origin = 'http://127.0.0.1:3014';
const config = { siteKey:'local-fixture', secret:'local-fixture', apiKey:'local-fixture', from:'sender@example.test', to:'owner@example.test', origins:[origin] };
app.use(express.json({limit:'32kb'}));
app.get('/api/contact/config',(_req,res)=>res.json({enabled:true,siteKey:config.siteKey}));
app.post('/api/contact',createContactHandler(()=>config,(async(url:any,options:any)=>{
 if(String(url).includes('siteverify')) return Response.json({success:true,action:'contact',hostname:'127.0.0.1'});
 const mail=JSON.parse(options.body);
 return mail.subject.includes('failure') ? Response.json({error:'simulated failure'},{status:503}) : Response.json({id:'test-only'});
}) as typeof fetch));
const vite=await createServer({server:{middlewareMode:true,hmr:false},appType:'spa'});
app.get('/contact',async(req,res)=>{
 const mock=`<script>window.turnstile={render:function(el,o){this.o=o;this.el=el;el.textContent='Verificação simulada — teste local';o.callback('test-'+Math.random());return 'fixture'},reset:function(){this.o.callback('test-'+Math.random())},remove:function(){this.el.textContent=''}};</script>`;
 res.type('html').send(await vite.transformIndexHtml(req.originalUrl,contactHtml(await readFile('index.html','utf8')).replace('</head>',mock+'</head>')));
});
app.use(vite.middlewares);
app.listen(3014,'127.0.0.1',()=>console.log('Contact UI fixture: http://127.0.0.1:3014/contact'));
