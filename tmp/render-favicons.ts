import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function render() {
  console.log('Starting Playwright for rendering SVG to PNG...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Load the SVG file directly as content
  const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  // We wrap the SVG in clean HTML to ensure perfect viewport sizing and transparency support
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: transparent;
        }
        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
    </head>
    <body>
      ${svgContent}
    </body>
    </html>
  `;

  await page.setContent(htmlContent);

  const sizes = [
    { name: 'favicon.png', size: 512 },
    { name: 'favicon-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-48.png', size: 48 },
    { name: 'favicon-32.png', size: 32 }
  ];

  for (const item of sizes) {
    console.log(`Rendering ${item.name} at ${item.size}x${item.size}...`);
    await page.setViewportSize({ width: item.size, height: item.size });
    const targetPath = path.join(process.cwd(), 'public', item.name);
    await page.screenshot({
      path: targetPath,
      omitBackground: true,
      type: 'png'
    });
    console.log(`Saved ${targetPath}`);
  }

  // Also write an ICO-like fallback (simply copying the 48px PNG as favicon.ico is standard for simple compliance)
  const icoPath = path.join(process.cwd(), 'public', 'favicon.ico');
  const png48Path = path.join(process.cwd(), 'public', 'favicon-48.png');
  fs.copyFileSync(png48Path, icoPath);
  console.log(`Saved favicon.ico fallback by copying 48px PNG`);

  await browser.close();
  console.log('All icons generated successfully!');
}

render().catch(console.error);
