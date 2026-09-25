import { chromium } from 'playwright';

async function testVisualContrast() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Inject test modal or switch mode
    const checkStyles = await page.evaluate(async () => {
      // Create a test container to render LoginModal in link_sent mode or test directly
      // First, let's toggle theme and inspect
      return new Promise((resolve) => {
        // Find existing modal or create element
        resolve(true);
      });
    });

    console.log('Page loaded');
  } finally {
    await browser.close();
  }
}

testVisualContrast().catch(console.error);
