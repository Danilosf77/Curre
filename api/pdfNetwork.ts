import type { BrowserContext, Route } from 'playwright';

export async function handlePdfRequest(route: Route) {
  const url = new URL(route.request().url());
  if (route.request().method() !== 'GET' || url.protocol !== 'https:' || url.port || !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.abort();
  try {
    const response = await route.fetch({ maxRedirects: 0, timeout: 5000 });
    if (response.status() >= 300 && response.status() < 400) return route.abort();
    await route.fulfill({ response });
  } catch { await route.abort().catch(() => {}); }
}

export async function restrictPdfNetwork(context: BrowserContext) {
  await context.route('**/*', handlePdfRequest);
}
