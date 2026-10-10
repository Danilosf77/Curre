import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { validateContact } from '../src/utils/contactValidation.js';
import { createConcurrencyLimit, createRateLimiter } from './resourceLimits.js';

type Config = { siteKey: string; secret: string; apiKey: string; to: string; from: string; origins: string[] };
export function contactConfig(): Config {
 const origins = (process.env.CONTACT_ALLOWED_ORIGINS || 'https://www.curreai.com,https://curreai.com,https://curre.onrender.com').split(',').map(x => x.trim()).filter(Boolean);
 return { siteKey: process.env.TURNSTILE_SITE_KEY || '', secret: process.env.TURNSTILE_SECRET_KEY || '', apiKey: process.env.RESEND_API_KEY || '', to: process.env.CONTACT_TO_EMAIL || '', from: process.env.CONTACT_FROM_EMAIL || '', origins };
}
export const contactReady = (c: Config) => Boolean(c.siteKey && c.secret && c.apiKey && c.to && c.from && c.origins.length);

export function createContactHandler(getConfig = contactConfig, request = fetch, now = Date.now) {
 const limit = createRateLimiter(5, 15 * 60 * 1000, now);
 const concurrency = createConcurrencyLimit(3);
 const used = new Map<string, number>();
 let sent = 0, day = '';
 return async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  let allowed = false;
  limit(req, res, () => { allowed = true; });
  if (!allowed) return;
  const c = getConfig();
  if (!c.origins.includes(req.get('origin') || '')) return res.status(403).json({ error: 'origin' });
  const { data, valid } = validateContact(req.body);
  if (!valid || typeof req.body?.website !== 'string' || req.body.website !== '' || typeof req.body?.token !== 'string' || req.body.token.length > 2048 || !req.body.token) return res.status(400).json({ error: 'validation' });
  if (!contactReady(c)) return res.status(503).json({ error: 'unavailable' });
  const today = new Date(now()).toISOString().slice(0, 10);
  if (today !== day) { day = today; sent = 0; }
  if (sent >= 100) return res.status(429).json({ error: 'limit' });
  for (const [key, expires] of used) if (expires <= now()) used.delete(key);
  if (used.size >= 10000) return res.status(503).json({ error: 'unavailable' });
  const hash = createHash('sha256').update(req.body.token).digest('hex');
  if (used.has(hash)) return res.status(409).json({ error: 'duplicate' });
  const release = concurrency.acquire();
  if (!release) return res.status(503).json({ error: 'unavailable' });
  used.set(hash, now() + 10 * 60 * 1000);
  sent++;
  try {
   const proofResponse = await request('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: c.secret, response: req.body.token }), signal: AbortSignal.timeout(10000) });
   const proof = await proofResponse.json();
   const hosts = c.origins.map(x => new URL(x).hostname);
   if (!proofResponse.ok || proof.success !== true || proof.action !== 'contact' || !hosts.includes(proof.hostname)) return res.status(400).json({ error: 'verification' });
   // Plain text only: no user-supplied HTML or raw SMTP headers. Recipient/from are server-controlled.
   const mailResponse = await request('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${c.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact-${hash}` }, body: JSON.stringify({ from: c.from, to: [c.to], reply_to: data.email, subject: `[CURRÊ contato] ${data.subject}`, text: `Nome: ${data.name}\nE-mail: ${data.email}\nAssunto: ${data.subject}\n\n${data.message}` }), signal: AbortSignal.timeout(15000) });
   const mail = await mailResponse.json();
   if (!mailResponse.ok || typeof mail.id !== 'string' || !mail.id) return res.status(502).json({ error: 'delivery' });
   return res.status(200).json({ ok: true });
  } catch { return res.status(502).json({ error: 'delivery' }); }
  finally { release(); }
 };
}
