export function createRateLimiter(max: number, windowMs: number, now = Date.now) {
  const hits = new Map<string, { count: number; reset: number }>();
  let cleanupAt = 0;
  return (req: any, res: any, next: any) => {
    const time = now();
    if (time >= cleanupAt) {
      for (const [ip, hit] of hits) if (hit.reset <= time) hits.delete(ip);
      cleanupAt = time + windowMs;
    }
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    let hit = hits.get(ip);
    if (!hit || hit.reset <= time) {
      if (hits.size >= 10000) return res.status(503).json({ error: 'Serviço ocupado. Tente novamente em instantes.' });
      hit = { count: 0, reset: time + windowMs };
      hits.set(ip, hit);
    }
    if (hit.count >= max) {
      res.setHeader('Retry-After', String(Math.ceil((hit.reset - time) / 1000)));
      return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
    }
    hit.count++;
    next();
  };
}

export function createConcurrencyLimit(max: number) {
  let active = 0;
  return { acquire() {
    if (active >= max) return null;
    active++;
    let released = false;
    return () => { if (!released) { released = true; active--; } };
  } };
}
