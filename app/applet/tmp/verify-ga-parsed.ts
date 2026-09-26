import { chromium } from 'playwright';

interface ParsedGaEvent {
  eventName: string;
  location?: string;
  title?: string;
  referrer?: string;
}

function parseGaEvents(urlStr: string, postData?: string): ParsedGaEvent[] {
  const events: ParsedGaEvent[] = [];
  const u = new URL(urlStr);

  if (postData) {
    const lines = postData.split('\n').filter(Boolean);
    for (const line of lines) {
      const params = new URLSearchParams(line);
      const en = params.get('en') || u.searchParams.get('en');
      if (en) {
        events.push({
          eventName: en,
          location: params.get('dl') || u.searchParams.get('dl') || undefined,
          title: params.get('dt') || u.searchParams.get('dt') || undefined,
          referrer: params.get('dr') || u.searchParams.get('dr') || undefined,
        });
      }
    }
  } else {
    const en = u.searchParams.get('en');
    if (en) {
      events.push({
        eventName: en,
        location: u.searchParams.get('dl') || undefined,
        title: u.searchParams.get('dt') || undefined,
        referrer: u.searchParams.get('dr') || undefined,
      });
    }
  }

  return events;
}

async function verifyGa() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const allEvents: ParsedGaEvent[] = [];

  page.on('request', (req) => {
    const url = req.url();
    if ((url.includes('google-analytics.com') || url.includes('analytics.google.com')) && url.includes('/collect')) {
      const parsed = parseGaEvents(url, req.postData() || undefined);
      for (const ev of parsed) {
        allEvents.push(ev);
        console.log(`[REQ INTERCEPTED]: name=${ev.eventName} | loc=${ev.location} | title=${ev.title}`);
      }
    }
  });

  console.log('1. Direct load http://localhost:3000/pt/...');
  await page.goto('http://localhost:3000/pt/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // Wait longer for initial events to settle

  console.log('\n2. Switching: PT -> EN...');
  await page.click('#btn-language-selector');
  await page.waitForSelector('#btn-lang-en', { state: 'visible' });
  await page.click('#btn-lang-en');
  await page.waitForTimeout(5000); // Wait longer for batching

  console.log('\n3. Switching: EN -> ES...');
  await page.click('#btn-language-selector');
  await page.waitForSelector('#btn-lang-es', { state: 'visible' });
  await page.click('#btn-lang-es');
  await page.waitForTimeout(5000); // Wait longer for batching

  console.log('\n4. Switching: ES -> FR...');
  await page.click('#btn-language-selector');
  await page.waitForSelector('#btn-lang-fr', { state: 'visible' });
  await page.click('#btn-lang-fr');
  await page.waitForTimeout(10000); // Wait 10 seconds at the end to flush everything!

  console.log('\n=== FINAL GA PAGE_VIEW REPORT ===');
  const pageViews = allEvents.filter(e => e.eventName === 'page_view');
  console.log(`Total page_view events captured: ${pageViews.length}`);
  pageViews.forEach((pv, idx) => {
    console.log(`  [${idx + 1}] loc=${pv.location} | title=${pv.title}`);
  });

  await browser.close();
}

verifyGa().catch(console.error);
